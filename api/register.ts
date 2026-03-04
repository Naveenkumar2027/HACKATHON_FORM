import { getDb, type RegistrationDoc } from './_db';

export async function POST(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { teamName, leadName, leadUSN, leadPhone, members } = body;

    if (!teamName?.trim() || !leadName?.trim() || !leadUSN?.trim() || !leadPhone?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: teamName, leadName, leadUSN, leadPhone' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const doc: RegistrationDoc = {
      teamName: String(teamName).trim(),
      leadName: String(leadName).trim(),
      leadUSN: String(leadUSN).trim(),
      leadPhone: String(leadPhone).trim(),
      members: Array.isArray(members)
        ? members
            .filter((m: { name?: string; usn?: string }) => m && (m.name?.trim() || m.usn?.trim()))
            .map((m: { name?: string; usn?: string }) => ({
              name: String(m?.name ?? '').trim(),
              usn: String(m?.usn ?? '').trim(),
            }))
        : [],
      createdAt: new Date(),
    };

    const db = await getDb();
    const collection = db.collection<RegistrationDoc>('registrations');
    const result = await collection.insertOne(doc);

    return new Response(
      JSON.stringify({
        ok: true,
        id: result.insertedId.toString(),
        message: 'Registration saved',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Register API error:', err);
    const message = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
