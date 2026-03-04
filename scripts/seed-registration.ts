/**
 * Inserts one sample registration into MongoDB. Loads .env from project root.
 * Run: npx tsx scripts/seed-registration.ts (from HACKATHON_FORM directory)
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import type { RegistrationDoc } from '../api/_db.js';

config({ path: resolve(process.cwd(), '.env') });

const { getDb } = await import('../api/_db.js');

const sampleDoc: RegistrationDoc = {
  teamName: 'Quantum Bugs',
  leadName: 'Sample Lead',
  leadUSN: '1DS24CS001',
  leadPhone: '+919876543210',
  members: [
    { name: 'Member One', usn: '1DS24CS002' },
    { name: 'Member Two', usn: '1DS24CS003' },
  ],
  createdAt: new Date(),
};

async function main() {
  console.log('Connecting to MongoDB...');
  const db = await getDb();
  const collection = db.collection<RegistrationDoc>('registrations');
  const result = await collection.insertOne(sampleDoc);
  console.log('Sample registration inserted. _id:', result.insertedId.toString());
  console.log('Check your Atlas cluster: thequantumbugs_db_user → registrations');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
