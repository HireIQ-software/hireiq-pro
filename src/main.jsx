import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AuthPage from './AuthPage.jsx'
import ResetPassword from './ResetPassword.jsx'
import { supabase } from './supabase.js'

function Root() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isReset, setIsReset] = useState(false)

  useEffect(() => {
    // Check if this is a password reset redirect
    const hash = window.location.hash
    if (hash.includes('type=recovery')) {
      setIsReset(true)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsReset(true)
        setLoading(false)
        return
      }
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{
      height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'#0a0d12',color:'#38bdf8',
      fontFamily:'JetBrains Mono, monospace',fontSize:13,letterSpacing:1
    }}>
      LOADING...
    </div>
  )

  if (isReset) return <ResetPassword onDone={() => { setIsReset(false); window.location.hash = ''; }} />
  return session ? <App session={session} /> : <AuthPage />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
