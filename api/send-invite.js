export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, teamName, inviterName, teamId } = req.body;
  if (!email || !teamName) return res.status(400).json({ error: "Missing fields" });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const appUrl = 'https://hireiq-inky.vercel.app';

  try {
    if (!serviceKey) {
      // No service key — return manual invite link
      return res.status(200).json({
        success: true,
        inviteLink: `${appUrl}?team=${teamId}`,
        manual: true
      });
    }

    // First check if user already exists
    const listRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
      {
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
        }
      }
    );
    const listData = await listRes.json();
    const existingUser = listData?.users?.find(u => u.email === email);

    if (existingUser) {
      // User already exists — just add them to the team directly
      // Update their team_id in profiles
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${existingUser.id}`, {
        method: 'PATCH',
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ team_id: teamId })
      });

      // Add to team_members
      await fetch(`${supabaseUrl}/rest/v1/team_members`, {
        method: 'POST',
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          team_id: teamId,
          user_id: existingUser.id,
          role: 'member',
          status: 'active'
        })
      });

      return res.status(200).json({
        success: true,
        existing: true,
        message: `${email} already has a HireIQ account and has been added to your team directly.`
      });
    }

    // New user — send invite email
    const inviteRes = await fetch(`${supabaseUrl}/auth/v1/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        email,
        data: {
          team_id: teamId,
          team_name: teamName,
          invited_by: inviterName
        }
      })
    });

    const inviteData = await inviteRes.json();

    if (inviteData.error || inviteData.msg) {
      const errMsg = inviteData.error?.message || inviteData.msg || "Unknown error";

      // Rate limited — return manual link as fallback
      if (errMsg.includes('rate') || errMsg.includes('already') || inviteRes.status === 422) {
        return res.status(200).json({
          success: true,
          inviteLink: `${appUrl}?team=${teamId}`,
          manual: true,
          reason: errMsg
        });
      }
      throw new Error(errMsg);
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Send invite error:', err);
    // Always return a usable invite link as fallback
    return res.status(200).json({
      success: true,
      inviteLink: `${appUrl}?team=${teamId}`,
      manual: true,
      error: err.message
    });
  }
}
