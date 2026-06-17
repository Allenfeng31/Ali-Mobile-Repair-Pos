import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath, revalidateTag } from 'next/cache';
import { invalidateRepairResultScopes } from '@/lib/repair-results-cache';
import { createServiceRoleClient } from '@/utils/supabase/service-role';
import {
  PUBLIC_REPAIR_RESULT_SELECT,
  REPAIR_RESULT_BUCKET,
  type PublicRepairResult,
  type RepairResultStatus,
} from '@/lib/repair-results';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = new Set<RepairResultStatus>(['draft', 'approved', 'published', 'archived']);
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3002',
  'http://127.0.0.1:3002',
  'https://pos.alimobile.com.au',
]);

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

async function createSessionClient() {
  const cookieStore = await cookies();

  return createRouteHandlerClient({
    cookies: (() => cookieStore) as unknown as typeof cookies,
  });
}

async function assertAuthenticated(supabase: ReturnType<typeof createRouteHandlerClient>) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('[repair-results] Failed to read admin session:', error);
  }

  return Boolean(session?.user);
}

function buildCorsHeaders(request: Request, extraHeaders?: HeadersInit) {
  const headers = new Headers(extraHeaders);
  const origin = request.headers.get('origin') || '';

  headers.set('Access-Control-Allow-Methods', 'PATCH,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Vary', 'Origin');

  if (ALLOWED_ORIGINS.has(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }

  return headers;
}

function jsonWithCors(request: Request, body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: buildCorsHeaders(request, init?.headers),
  });
}

async function assertBearerAuthenticated(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  const token = tokenMatch?.[1];

  if (!token) return false;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return false;

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await authClient.auth.getUser(token);
  if (error) {
    console.error('[repair-results] Failed to read bearer session:', error);
  }

  return Boolean(data.user);
}

async function isAuthorizedRequest(request: Request) {
  if (await assertBearerAuthenticated(request)) {
    return true;
  }

  const sessionClient = await createSessionClient();
  return assertAuthenticated(sessionClient);
}

import { randomUUID } from 'crypto';

async function copyToApprovedPath(
  supabase: SupabaseClient,
  currentPath: string,
  id: string,
  side: 'before' | 'after'
) {
  if (currentPath.startsWith('approved/')) return currentPath;
  if (!currentPath.startsWith(`raw/${id}/`)) {
    throw new Error(`Unexpected ${side} image path.`);
  }

  const baseName = currentPath.split('/').pop() || `${side}.webp`;
  const approvedPath = `approved/${id}/${baseName}`;
  const { error } = await supabase.storage
    .from(REPAIR_RESULT_BUCKET)
    .copy(currentPath, approvedPath);

  if (error && !error.message.toLowerCase().includes('already exists')) {
    throw error;
  }

  return approvedPath;
}

async function uploadReplacementImage(
  supabase: SupabaseClient,
  id: string,
  side: 'before' | 'after',
  file: File,
  privacyChecked: boolean
) {
  const prefix = privacyChecked ? 'approved' : 'raw';
  const path = `${prefix}/${id}/${side}-${randomUUID()}.webp`;
  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage.from(REPAIR_RESULT_BUCKET).upload(path, arrayBuffer, {
    cacheControl: privacyChecked ? '31536000' : '3600',
    contentType: 'image/webp',
    upsert: false,
  });

  if (error) {
    throw error;
  }

  return path;
}

async function cleanupOnlyProvablyUnreferencedCreatedPaths(
  supabase: SupabaseClient,
  replacementId: string,
  createdPathsThisAttempt: string[],
  oldRecord: any
) {
  if (!createdPathsThisAttempt || createdPathsThisAttempt.length === 0) return;
  const uniquePaths = Array.from(new Set(createdPathsThisAttempt));

  try {
    const { data: dbRow, error: dbError } = await supabase
      .from('repair_results')
      .select('before_image_path, after_image_path')
      .eq('id', replacementId)
      .in('status', ['draft', 'approved', 'published', 'archived'])
      .maybeSingle();

    if (dbError) throw dbError;

    const protectedPaths = new Set([
      oldRecord.before_image_path,
      oldRecord.after_image_path
    ]);

    if (dbRow) {
      if (dbRow.before_image_path) protectedPaths.add(dbRow.before_image_path);
      if (dbRow.after_image_path) protectedPaths.add(dbRow.after_image_path);
    }

    const pathsToDelete = uniquePaths.filter(p => !protectedPaths.has(p));

    if (pathsToDelete.length > 0) {
      const { error: removeError } = await supabase.storage.from(REPAIR_RESULT_BUCKET).remove(pathsToDelete);
      if (removeError) {
        console.warn('[repair-results] Nonfatal storage cleanup warning:', removeError);
      }
    }
  } catch (err) {
    console.warn('[repair-results] Failed to verify paths before cleanup. Failing closed to preserve files:', err);
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(request),
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const authorized = await isAuthorizedRequest(request);

    if (!authorized) {
      return jsonWithCors(request, { error: 'Unauthorized' }, { status: 401 });
    }

    let body: Record<string, any> = {};
    let beforeImage: File | null = null;
    let afterImage: File | null = null;

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        if (key === 'before_image' && value instanceof File) {
          beforeImage = value;
        } else if (key === 'after_image' && value instanceof File) {
          afterImage = value;
        } else if (typeof value === 'string') {
          if (value === 'true' || value === 'false') body[key] = value === 'true';
          else if (/^\d+$/.test(value)) body[key] = parseInt(value, 10);
          else body[key] = value;
        }
      });
    } else {
      body = await request.json().catch(() => ({}));
    }

    const nextStatus = typeof body.status === 'string' ? body.status.trim() as RepairResultStatus : undefined;
    const nextPrivacyChecked = typeof body.privacy_checked === 'boolean' ? body.privacy_checked : undefined;
    const nextFeaturedOnHomepage = typeof body.featured_on_homepage === 'boolean' ? body.featured_on_homepage : undefined;

    if (nextStatus && !VALID_STATUSES.has(nextStatus)) {
      return jsonWithCors(request, { error: 'Invalid status.' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const { data: existing, error: fetchError } = await supabase
      .from('repair_results')
      .select(PUBLIC_REPAIR_RESULT_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) {
      return jsonWithCors(request, { error: 'Repair result not found.' }, { status: 404 });
    }

    const record = existing as unknown as PublicRepairResult;
    const privacyChecked = nextPrivacyChecked ?? record.privacy_checked;
    const status = nextStatus ?? record.status;

    if (status === 'published' && !privacyChecked) {
      return jsonWithCors(request, { error: 'Privacy confirmation is required before publishing.' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      privacy_checked: privacyChecked,
      status,
      published_at: status === 'published' ? (record.published_at || new Date().toISOString()) : record.published_at,
    };

    if (nextFeaturedOnHomepage !== undefined) {
      updates.featured_on_homepage = nextFeaturedOnHomepage;
    }

    // Process generic content edits if provided
    const stringFields = ['title', 'short_description', 'image_pair_alt_text', 'related_repair_url'];
    for (const field of stringFields) {
      if (typeof body[field] === 'string') updates[field] = body[field];
    }

    const hasImageReplacement = Boolean(beforeImage || afterImage);
    const createdPathsThisAttempt: string[] = [];
    let imagesPersisted = false;
    
    try {
      if (!hasImageReplacement) {
        // --- 1. METADATA ONLY EDIT ---
        if (privacyChecked) {
          updates.before_image_path = await copyToApprovedPath(supabase, record.before_image_path, id, 'before');
          if (updates.before_image_path !== record.before_image_path) createdPathsThisAttempt.push(updates.before_image_path as string);
          
          updates.after_image_path = await copyToApprovedPath(supabase, record.after_image_path, id, 'after');
          if (updates.after_image_path !== record.after_image_path) createdPathsThisAttempt.push(updates.after_image_path as string);
        }

        const { data, error } = await supabase
          .from('repair_results')
          .update(updates)
          .eq('id', id)
          .select(PUBLIC_REPAIR_RESULT_SELECT)
          .single();

        if (error) throw error;
        imagesPersisted = true;

        let warningMessage = '';
        try {
          invalidateRepairResultScopes(record as any); 
          invalidateRepairResultScopes(data as any);   
        } catch (cacheError) {
          console.warn('[repair-results] Cache invalidation failed after successful PATCH DB save:', cacheError);
          warningMessage = 'Record updated successfully, but Storefront cache refresh failed. Please refresh the page manually or update to retry.';
        }

        // NO old images deleted ever.
        return jsonWithCors(request, { 
          status: 'SUCCESS', 
          data,
          ...(warningMessage ? { warning: warningMessage } : {})
        }, { status: 200 });

      } else {
        // --- 2. REPLACEMENT VERSION WORKFLOW ---
        let replacementId = typeof body.replacement_id === 'string' ? body.replacement_id : undefined;
        if (!replacementId || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(replacementId)) {
          return jsonWithCors(request, { error: 'Valid replacement_id UUID is required for image replacement.' }, { status: 400 });
        }

        // Check if staged replacement row already exists
        const { data: stagedRecord, error: stagedError } = await supabase
          .from('repair_results')
          .select('*')
          .eq('id', replacementId)
          .maybeSingle();

        if (stagedError) throw stagedError;

        let newRecord = stagedRecord;

        if (!newRecord) {
          let newBeforePath = record.before_image_path;
          if (beforeImage) {
            newBeforePath = await uploadReplacementImage(supabase, replacementId, 'before', beforeImage, privacyChecked);
            createdPathsThisAttempt.push(newBeforePath);
          } else if (privacyChecked) {
            newBeforePath = await copyToApprovedPath(supabase, record.before_image_path, replacementId, 'before');
            if (newBeforePath !== record.before_image_path) {
              createdPathsThisAttempt.push(newBeforePath);
            }
          } else {
             newBeforePath = record.before_image_path;
          }

          let newAfterPath = record.after_image_path;
          if (afterImage) {
            newAfterPath = await uploadReplacementImage(supabase, replacementId, 'after', afterImage, privacyChecked);
            createdPathsThisAttempt.push(newAfterPath);
          } else if (privacyChecked) {
            newAfterPath = await copyToApprovedPath(supabase, record.after_image_path, replacementId, 'after');
            if (newAfterPath !== record.after_image_path) {
              createdPathsThisAttempt.push(newAfterPath);
            }
          } else {
            newAfterPath = record.after_image_path;
          }

          const newRecordData = {
            ...record,
            id: replacementId,
            ...updates,
            replaces_result_id: id,
            status: 'draft',
            featured_on_homepage: false,
            before_image_path: newBeforePath,
            after_image_path: newAfterPath,
            created_at: undefined,
            updated_at: undefined
          };

          const { data: insertedRecord, error: insertError } = await supabase
            .from('repair_results')
            .insert(newRecordData as any)
            .select('*')
            .single();

          if (insertError) {
            if (insertError.code === '23505') {
              const { data: existingDraft } = await supabase
                .from('repair_results')
                .select('*')
                .eq('replaces_result_id', id)
                .in('status', ['draft', 'approved'])
                .maybeSingle();

              if (existingDraft) {
                newRecord = existingDraft;
                replacementId = existingDraft.id;

                const uniquePaths = Array.from(new Set(createdPathsThisAttempt));
                for (const path of uniquePaths) {
                  if (path !== existingDraft.before_image_path &&
                      path !== existingDraft.after_image_path &&
                      path !== record.before_image_path &&
                      path !== record.after_image_path) {
                    try {
                      await supabase.storage.from('repair-results').remove([path]);
                    } catch (cleanupErr) {
                      console.warn(`[repair-results] Nonfatal storage cleanup warning for orphaned file ${path}:`, cleanupErr);
                    }
                  }
                }
                createdPathsThisAttempt.length = 0;
              } else {
                throw insertError;
              }
            } else {
              throw insertError;
            }
          } else {
            newRecord = insertedRecord;
          }
        } 
        imagesPersisted = true;
        
        if (newRecord.status === 'archived') {
          return jsonWithCors(request, { error: 'Replacement record is archived and cannot be modified.' }, { status: 409 });
        }
        
        if (newRecord.status === 'published') {
          if (newRecord.replaces_result_id !== id || newRecord.id !== replacementId) {
             return jsonWithCors(request, { error: 'Invalid replacement identity mismatch.' }, { status: 409 });
          }
          return jsonWithCors(request, { 
            status: 'SUCCESS', 
            data: newRecord,
            idempotentReplay: true,
            oldRecordId: id
          }, { status: 200 });
        }

        if (updates.status === 'published') {
          // Now call the atomic activation RPC only when explicitly publishing
          const { data: rpcData, error: rpcError } = await supabase.rpc('activate_repair_result_replacement', {
            old_id: id,
            new_id: replacementId,
            req_status: 'published',
            req_featured: updates.featured_on_homepage ?? record.featured_on_homepage
          });

          if (rpcError) {
            console.error('[repair-results] RPC Activation failed:', rpcError);
            // Retain old public row unchanged, retain new row as draft, retain all historical images
            return jsonWithCors(request, {
              status: 'ERROR',
              error: 'Replacement record staged, but atomic activation failed.',
              details: rpcError.message
            }, { status: 500 });
          }

          newRecord = rpcData.new_record;
        } else if (updates.status && updates.status !== newRecord.status || Object.keys(updates).length > 0) {
           // Safely transition Draft/Approved or update metadata without archiving old record
           const { data: updatedRecord, error: updateError } = await supabase
             .from('repair_results')
             .update({
               ...updates,
               status: updates.status || newRecord.status,
               featured_on_homepage: updates.featured_on_homepage ?? newRecord.featured_on_homepage
             })
             .eq('id', newRecord.id)
             .select('*')
             .single();

           if (updateError) throw updateError;
           newRecord = updatedRecord;
        }

        const activatedRecord = newRecord;

        let warningMessage = '';
        try {
          invalidateRepairResultScopes(record as any); 
          invalidateRepairResultScopes(activatedRecord as any);   
        } catch (cacheError) {
          console.warn('[repair-results] Cache invalidation failed after successful replacement workflow:', cacheError);
          warningMessage = 'Replacement record activated, but cache refresh failed. Please refresh the page manually or update to retry.';
        }

        return jsonWithCors(request, { 
          status: 'SUCCESS', 
          data: activatedRecord,
          oldRecordId: id,
          ...(warningMessage ? { warning: warningMessage } : {})
        }, { status: 200 });
      }
      
    } catch (error) {
      if (!imagesPersisted && createdPathsThisAttempt && createdPathsThisAttempt.length > 0) {
        const replacementIdToClean = typeof body?.replacement_id === 'string' ? body.replacement_id : id;
        await cleanupOnlyProvablyUnreferencedCreatedPaths(supabase, replacementIdToClean, createdPathsThisAttempt, record);
      }
      throw error;
    }
  } catch (error) {
    console.error('[repair-results] PATCH failed:', error);
    return jsonWithCors(request, { error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
