import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AuthPage from './AuthPage.jsx'
import ResetPassword from './ResetPassword.jsx'
import JoinTeam from './JoinTeam.jsx'
import { supabase } from './supabase.js'

function Root() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isReset, setIsReset] = useState(false)
  const [isInvite, setIsInvite] = useState(false)
  const [inviteTeamId, setInviteTeamId] = useState(null)

  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(window.location.search)

    // Check for team invite (from our send-invite.js)
    const teamId = params.get('team')

    // Check for password recovery
    if (hash.includes('type=recovery')) {
      setIsReset(true)
      setLoading(false)
      return
    }

    // Check for invite (Supabase sets type=invite in hash)
    if (hash.includes('type=invite') || teamId) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          // User is logged in from invite link
          setIsInvite(true)
          setInviteTeamId(teamId || extractTeamFromMeta(session))
          setSession(session)
        }
        setLoading(false)
      })
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') { setIsReset(true); return; }
      if (event === 'USER_UPDATED') { setIsReset(false); }
      if (event === 'SIGNED_IN' && window.location.hash.includes('type=invite')) {
        setIsInvite(true)
        setInviteTeamId(session?.user?.user_metadata?.team_id || null)
      }
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const extractTeamFromMeta = (session) => {
    return session?.user?.user_metadata?.team_id || null
  }

  if (loading) return (
    <div style={{
      height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'#0a0d12',color:'#38bdf8',
      fontFamily:'JetBrains Mono, monospace',fontSize:13,letterSpacing:1
    }}>
      LOADING...
    </div>
  )

  if (isReset) return <ResetPassword onDone={() => {
    setIsReset(false)
    window.history.replaceState({}, document.title, '/')
  }} />

  if (isInvite && session) return <JoinTeam
    teamId={inviteTeamId}
    onDone={() => {
      setIsInvite(false)
      window.history.replaceState({}, document.title, '/')
    }}
  />

  return session ? <App session={session} /> : <AuthPage />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
