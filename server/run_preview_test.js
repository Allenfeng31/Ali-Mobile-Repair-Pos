require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const PREVIEW_URL = "https://ali-mobile-repair-pos-tqd-git-1fdff0-allenfeng31-1023s-projects.vercel.app";
const BYPASS_SECRET = "K7NRVqpZjC8TMwDyqJ64fV7sYgwO1iuu";

const HEADERS = {
  'Content-Type': 'application/json',
  'x-vercel-protection-bypass': BYPASS_SECRET
};

async function run() {
  console.log("=== VERCEL PREVIEW SMOKE TEST (PROTECTION BYPASSED) ===");
  console.log("Test Time:", new Date().toISOString());

  // STEP 1: CREATE BOOKING
  console.log("\n[1] Submitting booking to /api/book-repair...");
  const bookRes = await fetch(`${PREVIEW_URL}/api/book-repair`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      customer_name: "Preview Bypass User",
      phone: "0411222333",
      devices: [{ brand: "Apple", model: "iPhone 14", services: [{name: "Screen Replacement", price: 150}] }],
      total: 150,
      datetime: "2026-06-03T10:00:00.000Z",
      notes: "Preview Bypass Automated Test"
    })
  });
  
  const bookData = await bookRes.json();
  if (!bookData.success) {
    console.error("Booking failed:", bookData);
    return;
  }
  const apptId = bookData.appointment.id;
  console.log("-> Frontend booking returned:", bookRes.status);
  console.log("-> Appointment ID created:", apptId);

  // STEP 2: TRIGGER ARRIVAL
  console.log(`\n[2] Triggering check-in (arrived) for appointment ${apptId}...`);
  const statusRes = await fetch(`${PREVIEW_URL}/api/appointments/${apptId}/status`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ status: 'arrived' })
  });
  
  const statusData = await statusRes.json();
  console.log("-> Check-in Status Updated:", statusData.success ? "Success" : statusData);
  
  // WAIT FOR ASYNC SYNC 
  console.log("\n[3] Waiting 4 seconds for non-blocking Outbox sync (Google API)...");
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  // STEP 3: CHECK DB LOGS
  console.log("\n[4] Querying Supabase failed_sync_logs directly...");
  const { data: logs, error } = await supabase
    .from('failed_sync_logs')
    .select('*')
    .eq('sync_payload->>phone', '0411222333')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !logs || logs.length === 0) {
    console.log("-> [FAIL] 未找到日志记录！");
  } else {
    const log = logs[0];
    console.log("-> [SUCCESS] 发现 failed_sync_logs 记录：");
    console.log(`   Customer ID: ${log.customer_id}`);
    console.log(`   Booking (Repair) ID: ${log.booking_id}`);
    console.log(`   Status: ${log.status}`);
    
    // STEP 4: TEST RETRY ENDPOINT
    console.log(`\n[5] Testing POST /api/admin/sync-contacts/retry on Preview URL...`);
    
    // Without Token
    const r1 = await fetch(`${PREVIEW_URL}/api/admin/sync-contacts/retry`, { 
      method: 'POST',
      headers: { ...HEADERS } // No Authorization header
    });
    console.log("-> Without Bearer Token:", r1.status, await r1.text());
    
    // With Token 
    const adminSecret = process.env.ADMIN_SYNC_SECRET || 'test_admin_secret_12345';
    const r2 = await fetch(`${PREVIEW_URL}/api/admin/sync-contacts/retry`, { 
      method: 'POST',
      headers: { ...HEADERS, 'Authorization': `Bearer ${adminSecret}` }
    });
    console.log(`-> With Bearer Token:`, r2.status, await r2.text());
    
    // Verify Final Update
    const { data: updatedLogs } = await supabase
      .from('failed_sync_logs')
      .select('status, attempts, error_reason')
      .eq('id', log.id)
      .single();
      
    console.log("\n[6] Final DB Status after Retry:");
    console.log(updatedLogs);
    
    // CLEANUP
    await supabase.from('failed_sync_logs').delete().eq('id', log.id);
  }
  
  await supabase.from('appointments').delete().eq('id', apptId);
}

run();
