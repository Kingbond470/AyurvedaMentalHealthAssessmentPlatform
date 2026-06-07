'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import axios from 'axios'

export default function LoginPage() {
  const router = useRouter()
  const { setToken, setUser } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      })

      const { accessToken, user } = response.data

      setToken(accessToken)
      setUser(user)

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-md">
        <div className="bg-bg-surface rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-display text-center mb-2 text-text-primary">
            MPAAP
          </h1>
          <p className="text-center text-text-secondary mb-8 font-ui">
            Practitioner Login
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm font-ui">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-ui text-text-primary mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-border-light rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-ui text-text-primary mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border-light rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 text-white font-ui font-600 py-2 rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-text-tertiary text-sm font-ui mt-6">
            Demo: Use test credentials provided by admin
          </p>
        </div>
      </div>
    </main>
  )
}
