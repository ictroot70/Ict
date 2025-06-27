import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogout = async () => {
    const modals = document.querySelectorAll('[role="dialog"]')

    if (!window.confirm('Are you sure you want to log out?')) {
      return
    }
    if (modals.length > 0) {
      alert('Please close all modals before logging out')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/v1/auth/logout', {
        method: "DELETE",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!res.ok) throw new Error('Logout failed')

      localStorage.removeItem('authToken')
      router.push('/login')
    } catch (err) {
      setError('Logout failed. Please try again.')
      console.error('Logout error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleLogout}
        disabled={loading}
        style={{
          padding: '8px 16px',
          background: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          opacity: loading ? 0.7 : 1,
          minWidth: '100px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {loading ? (
          <>
            <span style={{
              display: 'inline-block',
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '8px',
            }} />
            Logging out
          </>
        ) : 'Log out'}
      </button>

      {error && (
        <p style={{
          color: 'red',
          marginTop: '8px',
          padding: '8px',
          background: '#ffeeee',
          borderRadius: '4px',
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1,
        }}>
          {error}
        </p>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}