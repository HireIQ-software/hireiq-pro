import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AuthPage from './AuthPage.jsx'
import ResetPassword from './ResetPassword.jsx'
import JoinTeam from './JoinTeam.jsx'
import UsernameSetup from './UsernameSetup.jsx'
import { supabase } from './supabase.js'

function Root() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('normal')
  const [loadingTooLong, setLoadingTooLong] = useState(false)

  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(window.location.search)
    const isRecovery = hash.includes('type=recovery')
    const isInviteHash = hash.includes('type=invite')
    const hasTeamParam = params.get('team')

    // Show "taking too long" after 4 seconds
    const slowTimer = setTimeout(() => setLoadingTooLong(true), 4000)
    // Force show auth page after 10 seconds no matter what
    const hardTimeout = setTimeout(() => {
      setLoading(false)
      clearTimeout(slowTimer)
    }, 10000)

    if (isRecovery) {
      clearTimeout(slowTimer)
      clearTimeout(hardTimeout)
      setMode('reset')
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(slowTimer)
      clearTimeout(hardTimeout)
      setSession(session)

      if (session && (isInviteHash || hasTeamParam)) {
        setMode('invite')
      } else if (session) {
        try {
          const { data: profile } = await supabase
            .from('profiles').select('username').eq('id', session.user.id).maybeSingle()
          if (!profile?.username) setMode('username-setup')
        } catch(e) {
          console.error('Profile check error:', e)
        }
      }
      setLoading(false)
    }).catch(err => {
      clearTimeout(slowTimer)
      clearTimeout(hardTimeout)
      console.error('Session error:', err)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') { setMode('reset'); setSession(session); return }
      if (event === 'USER_UPDATED' && mode === 'reset') setMode('normal')
      if (event === 'SIGNED_IN') {
        const h = window.location.hash
        const p = new URLSearchParams(window.location.search)
        if (h.includes('type=invite') || p.get('team')) {
          setMode('invite')
        } else {
          try {
            const { data: profile } = await supabase
              .from('profiles').select('username').eq('id', session.user.id).maybeSingle()
            if (!profile?.username) setMode('username-setup')
          } catch(e) { console.error('Profile check error:', e) }
        }
      }
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(slowTimer)
      clearTimeout(hardTimeout)
    }
  }, [])

  const handleDone = () => {
    setMode('normal')
    window.history.replaceState({}, document.title, '/')
  }

  if (loading) return (
    <div style={{
      height:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      background:'#0a0d12', gap: 16
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9,
        background: 'linear-gradient(135deg,#38bdf8,#818cf8)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize: 18, marginBottom: 8
      }}>🎯</div>
      <div style={{
        color:'#38bdf8', fontFamily:'JetBrains Mono, monospace',
        fontSize:13, letterSpacing:1
      }}>
        {loadingTooLong ? 'CONNECTING...' : 'LOADING...'}
      </div>
      {loadingTooLong && (
        <div style={{
          fontSize:11, color:'#2e4257', maxWidth:260,
          textAlign:'center', lineHeight:1.7,
          fontFamily:'JetBrains Mono, monospace'
        }}>
          Taking longer than usual.{' '}
          <button onClick={()=>window.location.reload()} style={{
            background:'none', border:'none', color:'#38bdf8',
            cursor:'pointer', fontFamily:'JetBrains Mono', fontSize:11,
            textDecoration:'underline'
          }}>
            Refresh
          </button>
        </div>
      )}
    </div>
  )

  if (mode === 'reset') return <ResetPassword onDone={handleDone} />
  if (mode === 'invite' && session) return <JoinTeam onDone={handleDone} />
  if (mode === 'username-setup' && session) return <UsernameSetup session={session} onDone={handleDone} />
  return session ? <App session={session} /> : <AuthPage />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><Root /></React.StrictMode>
)
