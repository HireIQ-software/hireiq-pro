import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AuthPage from './AuthPage.jsx'
import ResetPassword from './ResetPassword.jsx'
import JoinTeam from './JoinTeam.jsx'
import SetupUsername from './SetupUsername.jsx'
import { supabase } from './supabase.js'

function Root() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('normal') // normal | reset | invite

  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(window.location.search)

    // Detect invite from hash (Supabase sets type=invite)
    const isInviteHash = hash.includes('type=invite')
    // Detect invite from our custom team param
    const hasTeamParam = params.get('team')

    // Detect password recovery
    const isRecovery = hash.includes('type=recovery')

    if (isRecovery) {
      setMode('reset')
      setLoading(false)
      return
    }

    // Get session - handles all cases including invite links
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)

      // If user is logged in AND we have invite signals, show join page
      if (session && (isInviteHash || hasTeamParam)) {
        setMode('invite')
      }

      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset')
        setSession(session)
        return
      }
      if (event === 'USER_UPDATED' && mode === 'reset') {
        setMode('normal')
      }
      if (event === 'SIGNED_IN') {
        const h = window.location.hash
        const p = new URLSearchParams(window.location.search)
        if (h.includes('type=invite') || p.get('team')) {
          setMode('invite')
        }
      }
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleDone = () => {
    setMode('normal')
    window.history.replaceState({}, document.title, '/')
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

  if (mode === 'reset') return <ResetPassword onDone={handleDone} />
  if (mode === 'invite' && session) return <JoinTeam onDone={handleDone} />
  if (session) return <SetupUsernameWrapper session={session} />
  return <AuthPage />
}

function SetupUsernameWrapper({ session }) {
  const [needsUsername, setNeedsUsername] = useState(null);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase
        .from('profiles').select('username').eq('id', session.user.id).single();
      setNeedsUsername(!data?.username);
    };
    check();
  }, [session]);

  if (needsUsername === null) return (
    <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0a0d12',color:'#38bdf8',fontFamily:'JetBrains Mono,monospace',fontSize:13}}>LOADING...</div>
  );
  if (needsUsername) return <SetupUsername session={session} onDone={() => setNeedsUsername(false)} />;
  return <App session={session} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
