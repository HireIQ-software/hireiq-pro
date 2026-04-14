export default async function handler(req, res) {
  // Simple keepalive endpoint - pings Supabase to prevent it from sleeping
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    await fetch(`${supabaseUrl}/rest/v1/profiles?select=id&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    return res.status(200).json({ status: 'ok', ts: new Date().toISOString() });
  } catch(err) {
    return res.status(200).json({ status: 'ok', ts: new Date().toISOString() });
  }
}
