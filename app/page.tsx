'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/assessment/setup')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-primary">
      <p className="text-text-secondary font-body">Redirecting...</p>
    </div>
  )
}
