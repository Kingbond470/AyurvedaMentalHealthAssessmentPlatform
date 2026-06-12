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
  probe1Score0En?: string
  probe1Score1En?: string
  probe1Score2En?: string
  probe1Score3En?: string
  probe1Score4En?: string
  probe2QuestionEn?: string
  probe2QuestionHi?: string
  probe2QuestionMr?: string
  probe2Score0En?: string
  probe2Score1En?: string
  probe2Score2En?: string
  probe2Score3En?: string
  probe2Score4En?: string
  probe3QuestionEn?: string
  probe3QuestionHi?: string
  probe3QuestionMr?: string
  probe3Score0En?: string
  probe3Score1En?: string
  probe3Score2En?: string
  probe3Score3En?: string
  probe3Score4En?: string
  mappedSubtypes?: string[]
}

export default function EditItemPage() {
  const router = useRouter()
  const params = useParams()
  const itemNumber = params.itemNumber as string
  const [item, setItem] = useState<Item | null>(null)
  const [formData, setFormData] = useState<Partial<Item>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`/api/admin/items/${itemNumber}`)
        setItem(response.data)
        setFormData(response.data)
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSuccess(false)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      await axios.put(`/api/admin/items/${itemNumber}`, formData)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item')
    } finally {
      setSaving(false)
    }
  }

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
      <header className="bg-bg-surface border-b border-border-light sticky top-0 z-10">
        <div className="container-dashboard px-4 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-text-secondary hover:text-text-primary"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display text-text-primary">
                Edit Item {item?.itemNumber}
              </h1>
              <p className="text-sm text-text-secondary">Section {item?.section}</p>
            </div>
          </div>

          {success && <div className="text-sm text-green-500 font-ui">✓ Saved</div>}
          {error && <div className="text-sm text-red-500 font-ui">{error}</div>}
        </div>
      </header>

      <main className="container-dashboard px-4 py-8">
        <div className="bg-bg-surface rounded-lg p-6 border border-border-light space-y-6 max-w-2xl">
          {/* Core Probe - English */}
          <div>
            <label className="block text-sm font-ui font-600 text-text-primary mb-2">
              Core Probe (English)
            </label>
            <textarea
              value={formData.coreProbeEn || ''}
              onChange={(e) => handleInputChange('coreProbeEn', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-border-light rounded-lg font-body focus:outline-none focus:border-primary-500 bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            />
          </div>

          {/* Probe 1 */}
          <div className="space-y-3">
            <h3 className="font-display text-lg text-text-primary">Probe 1 - Question</h3>
            <input
              type="text"
              placeholder="English question"
              value={formData.probe1QuestionEn || ''}
              onChange={(e) => handleInputChange('probe1QuestionEn', e.target.value)}
              className="w-full px-4 py-2 border border-border-light rounded-lg font-body focus:outline-none focus:border-primary-500 bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Score 0"
                value={formData.probe1Score0En || ''}
                onChange={(e) => handleInputChange('probe1Score0En', e.target.value)}
                className="px-3 py-2 border border-border-light rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              />
              <input
                type="text"
                placeholder="Score 1"
                value={formData.probe1Score1En || ''}
                onChange={(e) => handleInputChange('probe1Score1En', e.target.value)}
                className="px-3 py-2 border border-border-light rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              />
              <input
                type="text"
                placeholder="Score 2"
                value={formData.probe1Score2En || ''}
                onChange={(e) => handleInputChange('probe1Score2En', e.target.value)}
                className="px-3 py-2 border border-border-light rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              />
              <input
                type="text"
                placeholder="Score 3"
                value={formData.probe1Score3En || ''}
                onChange={(e) => handleInputChange('probe1Score3En', e.target.value)}
                className="px-3 py-2 border border-border-light rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              />
              <input
                type="text"
                placeholder="Score 4"
                value={formData.probe1Score4En || ''}
                onChange={(e) => handleInputChange('probe1Score4En', e.target.value)}
                className="px-3 py-2 border border-border-light rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] col-span-2"
              />
            </div>
          </div>

          {/* Probe 2 */}
          <div className="space-y-3">
            <h3 className="font-display text-lg text-text-primary">Probe 2 - Question</h3>
            <input
              type="text"
              placeholder="English question"
              value={formData.probe2QuestionEn || ''}
              onChange={(e) => handleInputChange('probe2QuestionEn', e.target.value)}
              className="w-full px-4 py-2 border border-border-light rounded-lg font-body focus:outline-none focus:border-primary-500 bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Score 0"
                value={formData.probe2Score0En || ''}
                onChange={(e) => handleInputChange('probe2Score0En', e.target.value)}
                className="px-3 py-2 border border-border-light rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              />
              <input
                type="text"
                placeholder="Score 1"
                value={formData.probe2Score1En || ''}
                onChange={(e) => handleInputChange('probe2Score1En', e.target.value)}
                className="px-3 py-2 border border-border-light rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              />
              <input
                type="text"
                placeholder="Score 2"
                value={formData.probe2Score2En || ''}
                onChange={(e) => handleInputChange('probe2Score2En', e.target.value)}
                className="px-3 py-2 border border-border-light rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              />
              <input
                type="text"
                placeholder="Score 3"
                value={formData.probe2Score3En || ''}
                onChange={(e) => handleInputChange('probe2Score3En', e.target.value)}
                className="px-3 py-2 border border-border-light rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              />
              <input
                type="text"
                placeholder="Score 4"
                value={formData.probe2Score4En || ''}
                onChange={(e) => handleInputChange('probe2Score4En', e.target.value)}
                className="px-3 py-2 border border-border-light rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] col-span-2"
              />
            </div>
          </div>

          {/* Probe 3 */}
          <div className="space-y-3">
            <h3 className="font-display text-lg text-text-primary">Probe 3 - Question</h3>
            <input
              type="text"
              placeholder="English question"
              value={formData.probe3QuestionEn || ''}
              onChange={(e) => handleInputChange('probe3QuestionEn', e.target.value)}
              className="w-full px-4 py-2 border border-border-light rounded-lg font-body focus:outline-none focus:border-primary-500 bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Score 0"
                value={formData.probe3Score0En || ''}
                onChange={(e) => handleInputChange('probe3Score0En', e.target.value)}
                className="px-3 py-2 border border-border-light rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              />
              <input
                type="text"
                placeholder="Score 1"
                value={formData.probe3Score1En || ''}
                onChange={(e) => handleInputChange('probe3Score1En', e.target.value)}
                className="px-3 py-2 border border-border-light rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              />
              <input
                type="text"
                placeholder="Score 2"
                value={formData.probe3Score2En || ''}
                onChange={(e) => handleInputChange('probe3Score2En', e.target.value)}
                className="px-3 py-2 border border-border-light rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              />
              <input
                type="text"
                placeholder="Score 3"
                value={formData.probe3Score3En || ''}
                onChange={(e) => handleInputChange('probe3Score3En', e.target.value)}
                className="px-3 py-2 border border-border-light rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              />
              <input
                type="text"
                placeholder="Score 4"
                value={formData.probe3Score4En || ''}
                onChange={(e) => handleInputChange('probe3Score4En', e.target.value)}
                className="px-3 py-2 border border-border-light rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] col-span-2"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-border-light">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg font-ui font-600 hover:bg-primary-600 disabled:opacity-50 transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-bg-section text-text-primary border border-border-light rounded-lg font-ui font-600 hover:bg-border-light transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
