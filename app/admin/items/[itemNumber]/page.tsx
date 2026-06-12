'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'

interface ProbeProps {
  probeNum: 1 | 2 | 3
  lang: 'en' | 'hi' | 'mr'
  formData: Partial<Item>
  handleInputChange: (field: string, value: string) => void
}

function ProbeSection({ probeNum, lang, formData, handleInputChange }: ProbeProps) {
  const langSuffix = lang === 'en' ? 'En' : lang === 'hi' ? 'Hi' : 'Mr';
  const questionKey = `probe${probeNum}Question${langSuffix}` as keyof Item;
  const questionValue = (formData as any)[questionKey] || '';

  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg text-text-primary">Probe {probeNum}</h3>
      <input
        type="text"
        placeholder={`Question (${lang.toUpperCase()})`}
        value={questionValue}
        onChange={(e) => handleInputChange(questionKey, e.target.value)}
        className="w-full px-4 py-2 border border-border-light rounded-lg font-body focus:outline-none focus:border-primary-500 bg-[var(--bg-secondary)] text-[var(--text-primary)]"
      />
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3, 4].map((score) => {
          const scoreKey = `probe${probeNum}Score${score}${langSuffix}` as keyof Item;
          const scoreValue = (formData as any)[scoreKey] || '';
          return (
            <input
              key={score}
              type="text"
              placeholder={`Score ${score}`}
              value={scoreValue}
              onChange={(e) => handleInputChange(scoreKey, e.target.value)}
              className={`px-3 py-2 border border-border-light rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] ${
                score === 4 ? 'col-span-2' : ''
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

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
  const [activeLang, setActiveLang] = useState<'en' | 'hi' | 'mr'>('en')

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
        <div className="bg-bg-surface rounded-lg border border-border-light max-w-4xl">
          {/* Tabs */}
          <div className="flex gap-1 px-6 pt-4 border-b border-border-light">
            {[
              { code: 'en' as const, label: 'English' },
              { code: 'hi' as const, label: 'Hindi' },
              { code: 'mr' as const, label: 'Marathi' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setActiveLang(lang.code)}
                className={`px-4 py-3 font-ui font-600 border-b-2 transition ${
                  activeLang === lang.code
                    ? 'border-primary-500 text-text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6 max-w-2xl">
            {/* Core Probe */}
            <div>
              <label className="block text-sm font-ui font-600 text-text-primary mb-2">
                Core Probe ({activeLang.toUpperCase()})
              </label>
              <textarea
                value={
                  activeLang === 'en'
                    ? (formData.coreProbeEn || '')
                    : activeLang === 'hi'
                      ? (formData.coreProbeHi || '')
                      : (formData.coreProbeMr || '')
                }
                onChange={(e) =>
                  handleInputChange(`coreProbe${activeLang.toUpperCase()}`, e.target.value)
                }
                rows={3}
                className="w-full px-4 py-2 border border-border-light rounded-lg font-body focus:outline-none focus:border-primary-500 bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              />
            </div>

            {/* Probe 1 */}
            <ProbeSection
              probeNum={1}
              lang={activeLang}
              formData={formData}
              handleInputChange={handleInputChange}
            />

            {/* Probe 2 */}
            <ProbeSection
              probeNum={2}
              lang={activeLang}
              formData={formData}
              handleInputChange={handleInputChange}
            />

            {/* Probe 3 */}
            <ProbeSection
              probeNum={3}
              lang={activeLang}
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 p-6 pt-6 border-t border-border-light">
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
