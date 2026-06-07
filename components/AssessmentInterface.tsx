'use client'

import { useEffect, useState } from 'react'
import { useSessionStore } from '@/lib/store'
import axios from 'axios'

interface ItemData {
  id: string
  itemNumber: number
  section: number
  sectionName: string
  predictorSanskrit: string
  predictorDevanagari: string
  interpretation: string
  coreProbeEn?: string
  probe1QuestionEn?: string
  probe2QuestionEn?: string
  probe3QuestionEn?: string
  isObserverRated: boolean
}

const SECTION_ITEMS: Record<number, [number, number]> = {
  1: [1, 8],
  2: [9, 18],
  3: [19, 29],
  4: [30, 38],
  5: [39, 41],
  6: [42, 46],
  7: [47, 52],
  8: [53, 57],
  9: [58, 64],
  10: [65, 68],
  11: [69, 74],
  12: [75, 89],
  13: [90, 100],
  14: [101, 104],
  15: [105, 109],
  16: [110, 118],
}

const SECTION_NAMES = {
  1: 'Lifestyle & Sensory Preferences',
  2: 'Social Harmony & Compassion',
  3: 'Cognitive Strengths, Learning & Intellectual Functioning',
  4: 'Leadership, Courage & Resilience',
  5: 'Prosperity & Material Orientation',
  6: 'Spirituality, Dharma & Values',
  7: 'Morality, Ethics & Self-Discipline',
  8: 'Emotional Regulation & Personality Balance',
  9: 'Fearfulness & Emotional Vulnerability',
  10: 'Reduced Adaptive Cognitive Functioning',
  11: 'Social Withdrawal & Rigidity',
  12: 'Aggression, Hostility & Antisocial Reactivity',
  13: 'Lifestyle Dysregulation & Lethargy',
  14: 'Sexuality & Intimacy',
  15: 'Moral/Spiritual Deviation',
  16: 'Observer-Rated Traits',
}

interface Props {
  sessionId: string
  onComplete: () => void
}

export default function AssessmentInterface({ sessionId, onComplete }: Props) {
  const {
    currentSection,
    currentItem,
    setCurrentItem,
    setItemResponse,
    itemResponses,
  } = useSessionStore()

  const [item, setItem] = useState<ItemData | null>(null)
  const [loading, setLoading] = useState(true)
  const [probe1, setProbe1] = useState<number | null>(null)
  const [probe2, setProbe2] = useState<number | null>(null)
  const [probe3, setProbe3] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const sectionRange = SECTION_ITEMS[currentSection]
  const totalItemsInSection = sectionRange[1] - sectionRange[0] + 1
  const itemInSectionIndex = currentItem - sectionRange[0] + 1
  const totalMppiItems = 118
  const progressPercent = (currentItem / totalMppiItems) * 100

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true)
        // In production, fetch from DB
        // For now, show placeholder
        setItem({
          id: `item-${currentItem}`,
          itemNumber: currentItem,
          section: currentSection,
          sectionName: SECTION_NAMES[currentSection as keyof typeof SECTION_NAMES] || '',
          predictorSanskrit: 'Predictor Name (Sanskrit)',
          predictorDevanagari: 'Predictor Name (Devanagari)',
          interpretation: 'Interpretation of this trait',
          coreProbeEn: 'Core probe question to read aloud to respondent',
          probe1QuestionEn: 'Follow-up probe 1 question?',
          probe2QuestionEn: 'Follow-up probe 2 question?',
          probe3QuestionEn: 'Follow-up probe 3 question?',
          isObserverRated: currentSection === 16,
        })

        // Load existing response if any
        const existing = itemResponses[currentItem]
        if (existing) {
          setProbe1(existing.probe1)
          setProbe2(existing.probe2)
          setProbe3(existing.probe3)
        } else {
          setProbe1(null)
          setProbe2(null)
          setProbe3(null)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [currentItem, currentSection, itemResponses])

  const canProceed = probe1 !== null && probe2 !== null && probe3 !== null

  const handleNext = async () => {
    if (!canProceed || !item) return

    setSaving(true)
    try {
      // Save response
      await axios.put(
        `/api/sessions/${sessionId}/items/${item.itemNumber}`,
        {
          itemNumber: item.itemNumber,
          probe1Score: probe1,
          probe2Score: probe2,
          probe3Score: probe3,
        }
      )

      // Update store
      setItemResponse(item.itemNumber, probe1!, probe2!, probe3!)

      // Move to next item
      if (currentItem < totalMppiItems) {
        setCurrentItem(currentSection, currentItem + 1)
      } else {
        // Assessment complete
        onComplete()
      }
    } catch (error) {
      console.error('Failed to save item:', error)
    } finally {
      setSaving(false)
    }
  }

  const handlePrevious = () => {
    if (currentItem > 1) {
      const prevItem = currentItem - 1
      const prevSection = Object.entries(SECTION_ITEMS).find(
        ([, range]) => prevItem >= range[0] && prevItem <= range[1]
      )?.[0]
      if (prevSection) {
        setCurrentItem(parseInt(prevSection), prevItem)
      }
    }
  }

  if (loading || !item) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Progress Header */}
      <div className="bg-bg-surface border-b border-border-light sticky top-0 z-10">
        <div className="container-content px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-ui text-text-secondary">
              Section {currentSection} of 16 • {SECTION_NAMES[currentSection as keyof typeof SECTION_NAMES]}
            </span>
            <span className="text-sm font-ui text-text-secondary">
              Item {currentItem} of 118
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-xs text-text-tertiary font-ui mt-2">
            {Math.round(progressPercent)}% Complete
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container-content px-4 py-8">
        <div className="bg-bg-surface rounded-lg shadow-md p-8 animate-slideInUp">
          {/* Item Header */}
          <div className="mb-8 pb-6 border-b border-border-light">
            <div className="mb-3">
              <span className="text-xs font-ui uppercase text-text-tertiary">
                Item {currentItem} of 118
              </span>
            </div>
            <h2 className="text-2xl font-display text-text-primary mb-2">
              {item.predictorSanskrit}
            </h2>
            <p className="text-sm font-devanagari text-text-secondary">
              {item.predictorDevanagari}
            </p>
            <p className="text-sm text-text-secondary italic mt-2">
              {item.interpretation}
            </p>
          </div>

          {/* Core Probe (Read Aloud) */}
          <div className="bg-bg-section border-l-4 border-accent-500 rounded-md p-5 mb-8">
            <div className="text-xs font-ui uppercase text-text-tertiary mb-2">
              Read to respondent (not scored)
            </div>
            <p className="font-body text-text-primary italic">
              {item.coreProbeEn || 'Core probe question...'}
            </p>
          </div>

          {/* Follow-up Probes */}
          <div className="space-y-6">
            {[
              { probe: 1, question: item.probe1QuestionEn, score: probe1, setter: setProbe1 },
              { probe: 2, question: item.probe2QuestionEn, score: probe2, setter: setProbe2 },
              { probe: 3, question: item.probe3QuestionEn, score: probe3, setter: setProbe3 },
            ].map(({ probe, question, score, setter }) => (
              <div key={probe}>
                <div className="mb-3">
                  <label className="text-sm font-ui text-text-primary font-600">
                    Follow-up Probe {probe}
                  </label>
                  <p className="text-sm font-body text-text-secondary mt-1">
                    {question || `Probe ${probe} question...`}
                  </p>
                </div>

                {/* Score Chips */}
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <button
                      key={s}
                      onClick={() => setter(s)}
                      className={`w-12 h-12 rounded-md font-ui font-600 transition ${
                        score === s
                          ? 'bg-primary-500 text-white border-2 border-primary-500'
                          : 'bg-bg-section border-2 border-border-light text-text-primary hover:border-primary-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {score !== null && (
                  <div className="text-xs text-text-tertiary font-ui mt-2">
                    Score: {score} / 4
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Item Total */}
          <div className="mt-8 p-4 bg-bg-section rounded-lg">
            <div className="text-center">
              <span className="text-sm font-ui text-text-secondary">Item Score</span>
              <div className="text-3xl font-display text-text-primary mt-1">
                {probe1 !== null && probe2 !== null && probe3 !== null
                  ? `${probe1 + probe2 + probe3} / 12`
                  : '— / 12'}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentItem === 1 || saving}
              className="flex-1 px-4 py-3 bg-bg-section text-text-primary font-ui font-600 rounded-lg hover:bg-border-light transition disabled:opacity-50"
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed || saving}
              className="flex-1 px-4 py-3 bg-primary-500 text-white font-ui font-600 rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : currentItem === totalMppiItems ? 'Complete MPPI' : 'Next Item →'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
