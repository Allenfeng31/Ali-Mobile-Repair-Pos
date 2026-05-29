require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const PREVIEW_URL = "https://ali-mobile-repair-pos-tqd-git-1fdff0-allenfeng31-1023s-projects.vercel.app";
const BYPASS_SECRET = "K7NRVqpZjC8TMwDyqJ64fV7sYgwO1iuu";
const ADMIN_SECRET = "ld2oKkvvQxJP37jhjl-Fh_AZPaTkQMmSWip8l0aIMyTFXudQpWOU2iJZJbGVuGWM";

const HEADERS = {
  'Content-Type': 'application/json',
  'x-vercel-protection-bypass': BYPASS_SECRET
};

async function run() {
  console.log("=== VERCEL PREVIEW FINAL VERIFICATION ===");

  // STEP 1: CREATE BOOKING & TRIGGER ARRIVAL
  console.log("\n[1] Submitting booking and triggering Arrival (to generate outbox log)...");
  const bookRes = await fetch(`${PREVIEW_URL}/api/book-repair`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      customer_name: "Final Verification User", phone: "0499888777", devices: [{ brand: "Apple", model: "iPhone 15 Pro", services: [{name: "Battery Replacement", price: 150}] }], total: 150, datetime: "2026-06-04T10:00:00.000Z", notes: "Final Check"
    })
  });
  const bookData = await bookRes.json();
  const apptId = bookData.appointment.id;

  await fetch(`${PREVIEW_URL}/api/appointments/${apptId}/status`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ status: 'arrived' })
  });
  
  // Wait for Google API Timeout to settle
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  const { data: logs } = await supabase.from('failed_sync_logs').select('*').eq('sync_payload->>phone', '0499888777').order('created_at', { ascending: false }).limit(1);
  const log = logs[0];
  console.log("-> 找到刚生成的日志！Status:", log.status);

  // STEP 2: TEST AUTHENTICATION GATES
  console.log(`\n[2] Testing Auth Gates on POST /api/admin/sync-contacts/retry...`);
  
  // TEST A: NO TOKEN
  const r1 = await fetch(`${PREVIEW_URL}/api/admin/sync-contacts/retry`, { 
    method: 'POST', headers: { ...HEADERS } 
  });
  console.log("-> TEST A (No Token):", r1.status, await r1.text());
  
  // TEST B: WRONG TOKEN
  const r2 = await fetch(`${PREVIEW_URL}/api/admin/sync-contacts/retry`, { 
    method: 'POST', headers: { ...HEADERS, 'Authorization': `Bearer INVALID_HACKER_TOKEN_123` }
  });
  console.log(`-> TEST B (Wrong Token):`, r2.status, await r2.text());

  // TEST C: CORRECT TOKEN
  const r3 = await fetch(`${PREVIEW_URL}/api/admin/sync-contacts/retry`, { 
    method: 'POST', headers: { ...HEADERS, 'Authorization': `Bearer ${ADMIN_SECRET}` }
  });
  console.log(`-> TEST C (Correct Token):`, r3.status, await r3.text());
  
  // STEP 3: VERIFY FINAL STATUS
  const { data: finalLog } = await supabase.from('failed_sync_logs').select('status, attempts, error_reason').eq('id', log.id).single();
    
  console.log("\n[3] Final DB Status after successful retry:");
  console.log(finalLog);
  
  // CLEANUP
  await supabase.from('failed_sync_logs').delete().eq('id', log.id);
  await supabase.from('appointments').delete().eq('id', apptId);
}
run();
