require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log("\n[TEST 1] 插入一条恶意 Payload 的 Pending 记录");
  const { data, error } = await supabase.from('failed_sync_logs').insert([{
    customer_id: 'smoke-test-cust',
    booking_id: 'smoke-test-booking',
    sync_payload: { id: 'smoke-test-cust', name: 'MOCK USER', phone: 'INVALID_PHONE_!@#' },
    status: 'pending'
  }]).select();
  
  if (error) { console.error(error); return; }
  const logId = data[0].id;
  console.log("-> 成功模拟脱水写入! ID:", logId);

  console.log("\n[TEST 2] 无密钥拦截测试 (Expect 401)");
  const res1 = await fetch('http://localhost:3001/api/admin/sync-contacts/retry', { method: 'POST' });
  console.log("-> 响应状态码:", res1.status);
  console.log("-> 响应内容:", await res1.text());

  console.log("\n[TEST 3] 合法密钥触发重试 (Expect 200, 但 Google 会报 Phone Error)");
  const res2 = await fetch('http://localhost:3001/api/admin/sync-contacts/retry', { 
    method: 'POST', 
    headers: { 'Authorization': 'Bearer test_admin_secret_12345' } 
  });
  console.log("-> 响应状态码:", res2.status);
  console.log("-> 响应内容:", await res2.text());

  console.log("\n[TEST 4] 验证 Supabase 回填状态");
  const { data: updatedLog } = await supabase.from('failed_sync_logs').select('*').eq('id', logId).single();
  console.log("-> 最新 Attempts 计数:", updatedLog.attempts);
  console.log("-> 最新 Status 状态:", updatedLog.status);
  console.log("-> Error Reason 回填:", updatedLog.error_reason);
  
  await supabase.from('failed_sync_logs').delete().eq('id', logId);
  console.log("\n[TEST 5] 测试清理完毕。");
}
run();
