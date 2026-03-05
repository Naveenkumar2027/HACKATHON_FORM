/**
 * Test the n8n registration webhook with a sample payload.
 * Usage: node scripts/test-n8n-webhook.js <WEBHOOK_URL>
 * Example: node scripts/test-n8n-webhook.js http://localhost:5678/webhook/YOUR_PATH
 *
 * Get WEBHOOK_URL from n8n: open your workflow → click the Webhook node → copy "Production Webhook URL".
 */

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/test-n8n-webhook.js <WEBHOOK_URL>');
  console.error('Example: node scripts/test-n8n-webhook.js http://localhost:5678/webhook/your-path');
  process.exit(1);
}

const payload = {
  event: 'registration.completed',
  registration: {
    teamName: 'Test Team',
    leadName: 'Naveen Kumar',
    leadUSN: '1VA24CS001',
    leadPhone: '9876543210',
    leadEmail: 'm.naveenkumar6360@gmail.com',
    members: [
      { name: 'Naveen Kumar', usn: '1VA24CS001' },
      { name: 'Member 2', usn: '1VA24CS002' },
      { name: 'Member 3', usn: '1VA24CS003' },
    ],
    createdAt: new Date().toISOString(),
  },
  blobId: 'test-blob-' + Date.now(),
};

async function run() {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('Status:', res.status, res.statusText);
    const text = await res.text();
    if (text) console.log('Response:', text);
    if (res.ok) {
      console.log('\nWebhook accepted. Check m.naveenkumar6360@gmail.com for the confirmation email.');
    } else {
      console.log('\nRequest failed. In n8n: open the Webhook node and use the exact "Production Webhook URL".');
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

run();
