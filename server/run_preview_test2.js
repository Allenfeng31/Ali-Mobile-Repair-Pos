require('dotenv').config();
const PREVIEW_URL = "https://ali-mobile-repair-pos-tqd-git-1fdff0-allenfeng31-1023s-projects.vercel.app";
const BYPASS_SECRET = "K7NRVqpZjC8TMwDyqJ64fV7sYgwO1iuu";
const HEADERS = { 'Content-Type': 'application/json', 'x-vercel-protection-bypass': BYPASS_SECRET };

async function run() {
  const bookRes = await fetch(`${PREVIEW_URL}/api/book-repair`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      customer_name: "Preview Bypass User", phone: "0411222333", devices: [{ brand: "Apple", model: "iPhone 14", services: [{name: "Screen Replacement", price: 150}] }], total: 150, datetime: "2026-06-03T10:00:00.000Z", notes: "Preview Bypass Automated Test"
    })
  });
  const bookData = await bookRes.json();
  const apptId = bookData.appointment.id;
  
  console.log("Appointment ID:", apptId);

  const statusRes = await fetch(`${PREVIEW_URL}/api/appointments/${apptId}/status`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ status: 'Arrival' })
  });
  
  console.log("Status Res:", statusRes.status);
  console.log("Status Data:", await statusRes.text());
}
run();
