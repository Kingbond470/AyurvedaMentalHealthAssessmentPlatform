'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('/api/admin/auth/login', {
        username,
        password,
      })

      if (response.status === 200) {
        router.push('/admin/manage')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center p-4">
      <div className="bg-bg-surface rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-display text-text-primary mb-2">
            Admin Access
          </h1>
          <p className="text-sm text-text-secondary font-body">
            Manas Prakriti & Anxiety Assessment Platform
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-600/10 border border-red-600/20 rounded-lg">
            <p className="text-sm font-ui text-red-600">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-ui font-600 text-text-primary mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              disabled={loading}
              className="w-full px-4 py-3 border border-border-light rounded-lg font-body focus:outline-none focus:border-primary-500 disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-ui font-600 text-text-primary mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
              className="w-full px-4 py-3 border border-border-light rounded-lg font-body focus:outline-none focus:border-primary-500 disabled:opacity-50"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-primary-500 text-white rounded-lg font-ui font-600 hover:bg-primary-600 disabled:opacity-50 transition mt-6"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border-light">
          <p className="text-xs text-text-tertiary text-center font-ui">
            Authorized personnel only.<br />
            All access is logged.
          </p>
        </div>
      </div>
    </div>
  )
}
