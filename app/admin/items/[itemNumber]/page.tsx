'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'

interface Item {
  id: string
  itemNumber: number
  section: number
  sectionName: string
  predictorSanskrit: string
  predictorDevanagari: string
  coreProbeEn?: string
  coreProbeHi?: string
  coreProbeMr?: string
  probe1QuestionEn?: string
  probe1QuestionHi?: string
  probe1QuestionMr?: string
  probe2QuestionEn?: string
  probe2QuestionHi?: string
  probe2QuestionMr?: string
  probe3QuestionEn?: string
  probe3QuestionHi?: string
  probe3QuestionMr?: string
  mappedSubtypes?: string[]
}

export default function EditItemPage() {
  const router = useRouter()
  const params = useParams()
  const itemNumber = params.itemNumber as string
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`/api/admin/items/${itemNumber}`)
        setItem(response.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load item')
      } finally {
        setLoading(false)
      }
    }

    if (itemNumber) {
      fetchItem()
    }
  }, [itemNumber])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <p className="text-text-secondary">Loading item...</p>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Item not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="bg-bg-surface border-b border-border-light">
        <div className="container-dashboard px-4 py-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-text-secondary hover:text-text-primary"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-display text-text-primary">
              Edit Item {item.itemNumber}
            </h1>
            <p className="text-sm text-text-secondary">Section {item.section}</p>
          </div>
        </div>
      </header>

      <main className="container-dashboard px-4 py-8">
        <div className="bg-bg-surface rounded-lg p-6 border border-border-light">
          <div className="space-y-6">
            {/* Predictor */}
            <div>
              <h3 className="font-display text-lg text-text-primary mb-2">Predictor</h3>
              <p className="font-body text-text-secondary mb-1">{item.predictorSanskrit}</p>
              <p className="font-body text-text-secondary">{item.predictorDevanagari}</p>
            </div>

            {/* Core Probe */}
            <div>
              <h3 className="font-display text-lg text-text-primary mb-3">Core Probe</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm text-text-secondary">English</label>
                  <p className="font-body text-text-primary">{item.coreProbeEn || '—'}</p>
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Hindi</label>
                  <p className="font-body text-text-primary">{item.coreProbeHi || '—'}</p>
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Marathi</label>
                  <p className="font-body text-text-primary">{item.coreProbeMr || '—'}</p>
                </div>
              </div>
            </div>

            {/* Probe 1 */}
            <div>
              <h3 className="font-display text-lg text-text-primary mb-3">Probe 1</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm text-text-secondary">English</label>
                  <p className="font-body text-text-primary">{item.probe1QuestionEn || '—'}</p>
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Hindi</label>
                  <p className="font-body text-text-primary">{item.probe1QuestionHi || '—'}</p>
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Marathi</label>
                  <p className="font-body text-text-primary">{item.probe1QuestionMr || '—'}</p>
                </div>
              </div>
            </div>

            {/* Probe 2 */}
            <div>
              <h3 className="font-display text-lg text-text-primary mb-3">Probe 2</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm text-text-secondary">English</label>
                  <p className="font-body text-text-primary">{item.probe2QuestionEn || '—'}</p>
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Hindi</label>
                  <p className="font-body text-text-primary">{item.probe2QuestionHi || '—'}</p>
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Marathi</label>
                  <p className="font-body text-text-primary">{item.probe2QuestionMr || '—'}</p>
                </div>
              </div>
            </div>

            {/* Probe 3 */}
            <div>
              <h3 className="font-display text-lg text-text-primary mb-3">Probe 3</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm text-text-secondary">English</label>
                  <p className="font-body text-text-primary">{item.probe3QuestionEn || '—'}</p>
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Hindi</label>
                  <p className="font-body text-text-primary">{item.probe3QuestionHi || '—'}</p>
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Marathi</label>
                  <p className="font-body text-text-primary">{item.probe3QuestionMr || '—'}</p>
                </div>
              </div>
            </div>

            {/* Mapped Subtypes */}
            {item.mappedSubtypes && item.mappedSubtypes.length > 0 && (
              <div>
                <h3 className="font-display text-lg text-text-primary mb-2">
                  Mapped Subtypes
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {item.mappedSubtypes.map((subtype) => (
                    <span
                      key={subtype}
                      className="px-3 py-1 bg-accent-100 text-accent-700 rounded text-sm"
                    >
                      {subtype}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => router.back()}
            className="mt-8 px-6 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
          >
            Done
          </button>
        </div>
      </main>
    </div>
  )
}
