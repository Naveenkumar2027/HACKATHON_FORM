import { getDb, type RegistrationDoc } from './_db';

export async function GET(): Promise<Response> {
  try {
    const db = await getDb();
    const collection = db.collection<RegistrationDoc>('registrations');
    const list = await collection.find({}).sort({ createdAt: -1 }).toArray();

    const registrations = list.map((r) => ({
      id: r._id?.toString(),
      teamName: r.teamName,
      leadName: r.leadName,
      leadUSN: r.leadUSN,
      leadPhone: r.leadPhone,
      members: r.members,
      createdAt: r.createdAt,
    }));

    return new Response(JSON.stringify({ registrations }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Registrations API error:', err);
    const message = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
