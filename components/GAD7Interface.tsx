'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/lib/store'
import type { Language } from '@/lib/localization'
import { IMPAIRMENT_LABELS } from '@/lib/constants/prakriti'
import axios from 'axios'

const GAD7_ITEMS = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid as if something awful might happen',
]

const GAD7_OPTIONS = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
]

const IMPAIRMENT_OPTIONS = [
  { label: 'Not difficult at all', value: 0 },
  { label: 'Somewhat difficult', value: 1 },
  { label: 'Very difficult', value: 2 },
  { label: 'Extremely difficult', value: 3 },
]

interface Props {
  sessionId: string
  onComplete: () => void
}

export default function GAD7Interface({ sessionId, onComplete }: Props) {
  const router = useRouter()
  const { gad7Responses, setGAD7Response, setGAD7Impairment, language } = useSessionStore()

  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [showImpairment, setShowImpairment] = useState(false)

  const currentItem = GAD7_ITEMS[currentItemIndex]
  const currentScore = (gad7Responses as any)[`item${currentItemIndex + 1}`] as number | undefined
  const impairmentScore = gad7Responses.impairment as number | undefined

  const allItemsAnswered = Object.keys(gad7Responses).filter(
    (key) => key.startsWith('item')
  ).length === 7

  const handleNext = () => {
    if (!showImpairment && allItemsAnswered) {
      setShowImpairment(true)
    } else if (currentItemIndex < GAD7_ITEMS.length - 1 && !showImpairment) {
      setCurrentItemIndex(currentItemIndex + 1)
    }
  }

  const handleComplete = async () => {
    if (impairmentScore === undefined || impairmentScore === null) return

    setSaving(true)
    try {
      const scores = [
        gad7Responses.item1 || 0,
        gad7Responses.item2 || 0,
        gad7Responses.item3 || 0,
        gad7Responses.item4 || 0,
        gad7Responses.item5 || 0,
        gad7Responses.item6 || 0,
        gad7Responses.item7 || 0,
      ]

      const response = await axios.put(
        `/api/sessions/${sessionId}/gad7`,
        {
          item1Score: scores[0],
          item2Score: scores[1],
          item3Score: scores[2],
          item4Score: scores[3],
          item5Score: scores[4],
          item6Score: scores[5],
          item7Score: scores[6],
          impairmentScore,
        }
      )

      // Auto-redirect to results if scoring was triggered
      if (response.data.autoScored && response.data.redirectTo) {
        router.push(response.data.redirectTo)
      } else {
        onComplete()
      }
    } catch (error) {
      console.error('Failed to save GAD-7:', error)
    } finally {
      setSaving(false)
    }
  }

  const progressPercent = ((currentItemIndex + 1) / GAD7_ITEMS.length) * 100

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Progress Header */}
      <div className="bg-bg-surface border-b border-border-light sticky top-0 z-10">
        <div className="container-content px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-ui text-text-secondary">
              GAD-7 Assessment
            </span>
            <span className="text-sm font-ui text-text-secondary">
              {showImpairment ? 'Functional Impairment' : `Item ${currentItemIndex + 1} of 7`}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${showImpairment ? 100 : progressPercent}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container-content px-3 sm:px-4 py-4 sm:py-8">
        <div className="bg-bg-surface rounded-lg shadow-md p-4 sm:p-8 animate-slideInUp">
          <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-border-light">
            <div className="mb-3">
              <span className="text-xs font-ui uppercase text-text-tertiary">
                {showImpairment
                  ? 'Functional Impairment Assessment'
                  : `Item ${currentItemIndex + 1} of 7`}
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-display text-text-primary leading-snug">
              {showImpairment
                ? 'How difficult have these problems made it to do your work, take care of things at home, or get along with other people?'
                : `Over the last 2 weeks, how often have you been bothered by the following problem?\n\n${currentItem}`}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-2 sm:space-y-3">
            {(showImpairment
              ? IMPAIRMENT_OPTIONS.map((opt) => ({
                  ...opt,
                  label: IMPAIRMENT_LABELS[language as Language]?.[opt.value] || opt.label,
                }))
              : GAD7_OPTIONS
            ).map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  if (showImpairment) {
                    setGAD7Impairment(option.value)
                  } else {
                    setGAD7Response(currentItemIndex + 1, option.value)
                  }
                }}
                className={`w-full p-3 sm:p-4 rounded-lg border-2 transition text-left font-ui ${
                  (showImpairment ? impairmentScore : currentScore) === option.value
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'bg-bg-section border-border-light text-text-primary hover:border-primary-500'
                }`}
              >
                <div className="font-600 text-sm sm:text-base">{option.label}</div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-6 sm:mt-8">
            <button
              onClick={() => {
                if (showImpairment) {
                  setShowImpairment(false)
                  setCurrentItemIndex(GAD7_ITEMS.length - 1)
                } else if (currentItemIndex > 0) {
                  setCurrentItemIndex(currentItemIndex - 1)
                }
              }}
              disabled={saving}
              className="flex-1 px-3 sm:px-4 py-3 bg-bg-section text-text-primary font-ui font-600 rounded-lg hover:bg-border-light transition disabled:opacity-50 text-sm sm:text-base"
            >
              ← Previous
            </button>

            {!showImpairment || impairmentScore !== undefined ? (
              <button
                onClick={showImpairment ? handleComplete : handleNext}
                disabled={
                  (!showImpairment && currentScore === undefined) ||
                  (showImpairment && impairmentScore === undefined) ||
                  saving
                }
                className="flex-1 px-3 sm:px-4 py-3 bg-primary-500 text-white font-ui font-600 rounded-lg hover:bg-primary-600 transition disabled:opacity-50 text-sm sm:text-base"
              >
                {saving ? 'Saving...' : showImpairment ? 'Complete Assessment' : 'Next →'}
              </button>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}
