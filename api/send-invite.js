export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, teamName, inviterName, teamId } = req.body;
  if (!email || !teamName) return res.status(400).json({ error: "Missing fields" });

  try {
    // Use Supabase Admin API to invite user
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!serviceKey) {
      // Fallback — no service key, just return the invite link
      const inviteLink = `${process.env.VITE_APP_URL || 'https://hireiq-inky.vercel.app'}?team=${teamId}`;
      return res.status(200).json({ success: true, inviteLink, note: "No service key — send link manually" });
    }

    // Try Supabase admin invite
    const response = await fetch(`${supabaseUrl}/auth/v1/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        email,
        data: { team_id: teamId, team_name: teamName, invited_by: inviterName }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message || data.msg);

    return res.status(200).json({ success: true });
  } catch (err) {
    // Return invite link as fallback
    const inviteLink = `https://hireiq-inky.vercel.app?team=${teamId}`;
    return res.status(200).json({
      success: true,
      inviteLink,
      note: err.message
    });
  }
}
