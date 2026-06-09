'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSessionStore } from '@/lib/store'
import axios from 'axios'
import AssessmentInterface from '@/components/AssessmentInterface'
import GAD7Interface from '@/components/GAD7Interface'

type Phase = 'MPPI' | 'GAD7' | 'COMPLETE'

export default function AssessmentPage() {
  const router = useRouter()
  const params = useParams()
  const {
    mppiOrder,
    isAssessmentPhaseGAD7,
    setIsAssessmentPhaseGAD7,
    resetSession,
  } = useSessionStore()

  const sessionId = params.sessionId as string
  const [phase, setPhase] = useState<Phase>('MPPI')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const determinePhase = async () => {
      try {
        await axios.get(
          `/api/sessions/${sessionId}`
        )

        if (mppiOrder === 'AFTER_GAD7' && !isAssessmentPhaseGAD7) {
          setPhase('GAD7')
          setIsAssessmentPhaseGAD7(true)
        } else {
          setPhase('MPPI')
        }
      } finally {
        setLoading(false)
      }
    }

    determinePhase()
  }, [sessionId, mppiOrder, isAssessmentPhaseGAD7, setIsAssessmentPhaseGAD7])

  const handleMppiComplete = () => {
    if (mppiOrder === 'BEFORE_GAD7') {
      setPhase('GAD7')
      setIsAssessmentPhaseGAD7(true)
    } else {
      handleAssessmentComplete()
    }
  }

  const handleGAD7Complete = () => {
    handleAssessmentComplete()
  }

  const handleAssessmentComplete = async () => {
    try {
      setLoading(true)

      // Trigger scoring calculation
      await axios.post(
        `/api/sessions/${sessionId}/calculate`,
        {}
      )

      // Redirect to results
      resetSession()
      router.push(`/results/${sessionId}`)
    } catch (error) {
      console.error('Failed to complete assessment:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-text-secondary font-body">Loading assessment...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {phase === 'MPPI' && (
        <AssessmentInterface sessionId={sessionId} onComplete={handleMppiComplete} />
      )}
      {phase === 'GAD7' && (
        <GAD7Interface sessionId={sessionId} onComplete={handleGAD7Complete} />
      )}
    </>
  )
}
