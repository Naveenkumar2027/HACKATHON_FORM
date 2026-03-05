import { put, list } from '@vercel/blob';

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

const USN_PREFIX = '1VA24';
const PHONE_DIGITS_LENGTH = 10;

type RegistrationDoc = {
  teamName: string;
  leadName: string;
  leadUSN: string;
  leadPhone: string;
  leadEmail: string;
  members: Array<{ name: string; usn: string }>;
  createdAt: string;
};

function isValidEmail(email: string): boolean {
  const e = String(email).trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function isValidUSN(usn: string): boolean {
  const u = String(usn).trim().toUpperCase();
  return u.length >= 5 && u.startsWith(USN_PREFIX);
}

function normalizePhone(phone: string): string {
  return String(phone).replace(/\D/g, '');
}

export async function POST(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: jsonHeaders,
    });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: jsonHeaders,
      });
    }
    const { teamName, leadName, leadUSN, leadPhone, leadEmail, members } = body;

    if (
      !String(teamName ?? '').trim() ||
      !String(leadName ?? '').trim() ||
      !String(leadUSN ?? '').trim() ||
      !String(leadPhone ?? '').trim() ||
      !String(leadEmail ?? '').trim()
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: teamName, leadName, leadUSN, leadPhone, leadEmail' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const emailTrimmed = String(leadEmail).trim();
    if (!isValidEmail(emailTrimmed)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address.' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const doc: RegistrationDoc = {
      teamName: String(teamName).trim(),
      leadName: String(leadName).trim(),
      leadUSN: String(leadUSN).trim().toUpperCase(),
      leadPhone: normalizePhone(String(leadPhone)),
      leadEmail: emailTrimmed,
      members: Array.isArray(members)
        ? members
            .filter((m: { name?: string; usn?: string }) => m && (m.name?.trim() || m.usn?.trim()))
            .map((m: { name?: string; usn?: string }) => ({
              name: String(m?.name ?? '').trim(),
              usn: String(m?.usn ?? '').trim().toUpperCase(),
            }))
        : [],
      createdAt: new Date().toISOString(),
    };

    // USN: only 1VA24* (fourth semester)
    if (!isValidUSN(doc.leadUSN)) {
      return new Response(
        JSON.stringify({ error: 'You are not a fourth semester student.' }),
        { status: 400, headers: jsonHeaders }
      );
    }
    for (const m of doc.members) {
      if (m.usn && !isValidUSN(m.usn)) {
        return new Response(
          JSON.stringify({ error: 'You are not a fourth semester student. All USNs must start with 1VA24.' }),
          { status: 400, headers: jsonHeaders }
        );
      }
    }

    // Phone: exactly 10 digits
    if (doc.leadPhone.length !== PHONE_DIGITS_LENGTH) {
      return new Response(
        JSON.stringify({ error: 'Phone number must be exactly 10 digits.' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const rawToken = process.env.BLOB_READ_WRITE_TOKEN || '';
    const token = rawToken.trim().replace(/^["']|["']$/g, '');

    if (!token) {
      return new Response(
        JSON.stringify({
          error:
            'Blob not configured. In Vercel: Project → Settings → Environment Variables → add BLOB_READ_WRITE_TOKEN with your blob token (no quotes). Apply to Production + Preview, then Redeploy.',
        }),
        { status: 503, headers: jsonHeaders }
      );
    }

    // Duplicate check: list existing registrations
    let existingPhones: Set<string> = new Set();
    let existingNamesNormalized: Set<string> = new Set();
    try {
      const { blobs } = await list({ prefix: 'wiredweekend-form/registrations/', token, limit: 500 });
      for (const b of blobs) {
        try {
          const res = await fetch(b.url);
          if (!res.ok) continue;
          const existing = (await res.json()) as RegistrationDoc;
          existingPhones.add(normalizePhone(existing.leadPhone));
          existingNamesNormalized.add(existing.leadName.trim().toLowerCase());
          for (const m of existing.members || []) {
            if (m.name?.trim()) existingNamesNormalized.add(m.name.trim().toLowerCase());
          }
        } catch {
          // skip failed fetch
        }
      }
    } catch {
      // list failed, allow submission (e.g. first registration)
    }

    if (existingPhones.has(doc.leadPhone)) {
      return new Response(
        JSON.stringify({ error: 'This phone number is already registered as a team lead. A team lead cannot register again.' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const newNames = [doc.leadName.trim().toLowerCase()];
    for (const m of doc.members) {
      if (m.name?.trim()) newNames.push(m.name.trim().toLowerCase());
    }
    const alreadyRegistered = newNames.filter((n) => existingNamesNormalized.has(n));
    if (alreadyRegistered.length > 0) {
      return new Response(
        JSON.stringify({
          error:
            'One or more team members (or the team lead) are already registered in another team. Each person can only be in one team. Use full names.',
        }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const safeName = (doc.teamName || 'team').replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 30);
    const blobPath = `wiredweekend-form/registrations/${Date.now()}-${safeName}.json`;

    const blob = await put(blobPath, JSON.stringify(doc, null, 2), {
      access: 'public',
      addRandomSuffix: true,
      token,
    });

    // Trigger n8n webhook for confirmation email (fire-and-forget; don't block response)
    const n8nWebhookUrl = (process.env.N8N_WEBHOOK_URL || '').trim();
    if (n8nWebhookUrl) {
      fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'registration.completed',
          registration: doc,
          blobId: blob.url?.split('/').pop() || blobPath,
        }),
      }).catch((err) => console.error('n8n webhook error:', err));
    }

    return new Response(
      JSON.stringify({
        ok: true,
        id: blob.url?.split('/').pop() || blobPath,
        message: 'Registration saved',
      }),
      { status: 201, headers: jsonHeaders }
    );
  } catch (err) {
    console.error('Register API error:', err);
    const message = err instanceof Error ? err.message : 'Server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
}
