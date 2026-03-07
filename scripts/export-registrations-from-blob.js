/**
 * Export all registration JSON blobs from Vercel Blob to CSV (for pasting into Google Sheets).
 * Requires BLOB_READ_WRITE_TOKEN in .env or environment.
 * Usage: node scripts/export-registrations-from-blob.js
 * Output: CSV to stdout. Redirect to file or copy from terminal and paste into Sheets.
 */

import 'dotenv/config';
import { list } from '@vercel/blob';

const PREFIX = 'wiredweekend-form/registrations/';

function escapeCsv(s) {
  const t = String(s ?? '').trim();
  if (t.includes('"') || t.includes(',') || t.includes('\n')) return `"${t.replace(/"/g, '""')}"`;
  return t;
}

async function main() {
  const token = (process.env.BLOB_READ_WRITE_TOKEN || '').trim().replace(/^["']|["']$/g, '');
  if (!token) {
    console.error('Missing BLOB_READ_WRITE_TOKEN in .env or environment.');
    process.exit(1);
  }

  const { blobs } = await list({ prefix: PREFIX, token, limit: 500 });
  const rows = [];

  for (const b of blobs) {
    try {
      const res = await fetch(b.url);
      if (!res.ok) continue;
      const doc = await res.json();
      rows.push(doc);
    } catch {
      // skip
    }
  }

  rows.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const header = 'Team Name,Lead Name,Lead USN,Lead Phone,Lead Email,Members,Created At';
  const csvRows = rows.map((r) => {
    const membersStr = (r.members || [])
      .map((m) => `${m.name || ''} (${m.usn || ''})`)
      .join('; ');
    return [
      escapeCsv(r.teamName ?? ''),
      escapeCsv(r.leadName ?? ''),
      escapeCsv(r.leadUSN ?? ''),
      escapeCsv(r.leadPhone ?? ''),
      escapeCsv(r.leadEmail ?? ''),
      escapeCsv(membersStr),
      escapeCsv(r.createdAt ?? ''),
    ].join(',');
  });

  const csv = [header, ...csvRows].join('\n');
  console.log(csv);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
