import { list } from '@vercel/blob';

const PREFIX = 'wiredweekend-form/registrations/';

type RegistrationDoc = {
  teamName: string;
  leadName: string;
  leadUSN: string;
  leadPhone: string;
  leadEmail: string;
  members: Array<{ name: string; usn: string }>;
  createdAt: string;
};

function escapeCsv(s: string): string {
  const t = String(s ?? '').trim();
  if (t.includes('"') || t.includes(',') || t.includes('\n')) return `"${t.replace(/"/g, '""')}"`;
  return t;
}

export async function GET(): Promise<Response> {
  try {
    const rawToken = process.env.BLOB_READ_WRITE_TOKEN || '';
    const token = rawToken.trim().replace(/^["']|["']$/g, '');
    if (!token) {
      return new Response(JSON.stringify({ error: 'Blob not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { blobs } = await list({ prefix: PREFIX, token, limit: 500 });
    const rows: RegistrationDoc[] = [];

    for (const b of blobs) {
      try {
        const res = await fetch(b.url);
        if (!res.ok) continue;
        const doc = (await res.json()) as RegistrationDoc;
        rows.push(doc);
      } catch {
        // skip
      }
    }

    // Sort by createdAt descending
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
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="wired-weekend-registrations.csv"',
      },
    });
  } catch (err) {
    console.error('Export registrations error:', err);
    return new Response(JSON.stringify({ error: 'Export failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
