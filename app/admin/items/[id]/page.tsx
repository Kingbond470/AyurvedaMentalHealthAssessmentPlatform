'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'

export default function EditItemPage() {
  const params = useParams()
  const router = useRouter()
  const itemNumber = parseInt(params.id as string)

  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchItem()
  }, [itemNumber])

  const fetchItem = async () => {
    try {
      const res = await axios.get(`/api/admin/items/${itemNumber}`)
      setItem(res.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load item')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await axios.put(`/api/admin/items/${itemNumber}`, item)
      alert('Item saved successfully')
      router.push('/admin/items')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!item) return <div className="p-8">Item not found</div>

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="bg-bg-surface border-b border-border-light">
        <div className="container-content px-4 py-4">
          <h1 className="text-2xl font-display">Edit Item {itemNumber}</h1>
        </div>
      </header>

      <main className="container-content px-4 py-8">
        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

        <div className="bg-bg-surface rounded-lg p-8 max-w-4xl">
          <div className="grid gap-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-ui font-600 mb-2">Section</label>
              <input
                type="number"
                value={item.section}
                onChange={(e) => setItem({ ...item, section: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-border-light rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-ui font-600 mb-2">Section Name</label>
              <input
                type="text"
                value={item.sectionName}
                onChange={(e) => setItem({ ...item, sectionName: e.target.value })}
                className="w-full px-4 py-2 border border-border-light rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-ui font-600 mb-2">Predictor Sanskrit</label>
              <input
                type="text"
                value={item.predictorSanskrit}
                onChange={(e) => setItem({ ...item, predictorSanskrit: e.target.value })}
                className="w-full px-4 py-2 border border-border-light rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-ui font-600 mb-2">Predictor Devanagari</label>
              <input
                type="text"
                value={item.predictorDevanagari}
                onChange={(e) => setItem({ ...item, predictorDevanagari: e.target.value })}
                className="w-full px-4 py-2 border border-border-light rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-ui font-600 mb-2">Interpretation</label>
              <textarea
                value={item.interpretation}
                onChange={(e) => setItem({ ...item, interpretation: e.target.value })}
                className="w-full px-4 py-2 border border-border-light rounded"
                rows={3}
              />
            </div>

            {/* Core Probe */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-600 mb-4">Core Probe</h3>
              <div className="grid gap-4">
                <input
                  type="text"
                  placeholder="Core Probe EN"
                  value={item.coreProbeEn || ''}
                  onChange={(e) => setItem({ ...item, coreProbeEn: e.target.value })}
                  className="w-full px-4 py-2 border border-border-light rounded"
                />
                <input
                  type="text"
                  placeholder="Core Probe HI"
                  value={item.coreProbeHi || ''}
                  onChange={(e) => setItem({ ...item, coreProbeHi: e.target.value })}
                  className="w-full px-4 py-2 border border-border-light rounded"
                />
                <input
                  type="text"
                  placeholder="Core Probe MR"
                  value={item.coreProbeMr || ''}
                  onChange={(e) => setItem({ ...item, coreProbeMr: e.target.value })}
                  className="w-full px-4 py-2 border border-border-light rounded"
                />
              </div>
            </div>

            {/* Probe 1 */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-600 mb-4">Probe 1</h3>
              <div className="grid gap-2 mb-4">
                <input placeholder="Question EN" value={item.probe1QuestionEn || ''} onChange={(e) => setItem({ ...item, probe1QuestionEn: e.target.value })} className="px-4 py-2 border border-border-light rounded" />
                <input placeholder="Question HI" value={item.probe1QuestionHi || ''} onChange={(e) => setItem({ ...item, probe1QuestionHi: e.target.value })} className="px-4 py-2 border border-border-light rounded" />
                <input placeholder="Question MR" value={item.probe1QuestionMr || ''} onChange={(e) => setItem({ ...item, probe1QuestionMr: e.target.value })} className="px-4 py-2 border border-border-light rounded" />
              </div>
              <div className="grid gap-2">
                {[0, 1, 2, 3, 4].map((score) => (
                  <input
                    key={score}
                    placeholder={`Score ${score}`}
                    value={item[`probe1Score${score}En`] || ''}
                    onChange={(e) => setItem({ ...item, [`probe1Score${score}En`]: e.target.value })}
                    className="px-4 py-2 border border-border-light rounded text-sm"
                  />
                ))}
              </div>
            </div>

            {/* Probe 2 */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-600 mb-4">Probe 2</h3>
              <div className="grid gap-2 mb-4">
                <input placeholder="Question EN" value={item.probe2QuestionEn || ''} onChange={(e) => setItem({ ...item, probe2QuestionEn: e.target.value })} className="px-4 py-2 border border-border-light rounded" />
                <input placeholder="Question HI" value={item.probe2QuestionHi || ''} onChange={(e) => setItem({ ...item, probe2QuestionHi: e.target.value })} className="px-4 py-2 border border-border-light rounded" />
                <input placeholder="Question MR" value={item.probe2QuestionMr || ''} onChange={(e) => setItem({ ...item, probe2QuestionMr: e.target.value })} className="px-4 py-2 border border-border-light rounded" />
              </div>
              <div className="grid gap-2">
                {[0, 1, 2, 3, 4].map((score) => (
                  <input
                    key={score}
                    placeholder={`Score ${score}`}
                    value={item[`probe2Score${score}En`] || ''}
                    onChange={(e) => setItem({ ...item, [`probe2Score${score}En`]: e.target.value })}
                    className="px-4 py-2 border border-border-light rounded text-sm"
                  />
                ))}
              </div>
            </div>

            {/* Probe 3 */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-600 mb-4">Probe 3</h3>
              <div className="grid gap-2 mb-4">
                <input placeholder="Question EN" value={item.probe3QuestionEn || ''} onChange={(e) => setItem({ ...item, probe3QuestionEn: e.target.value })} className="px-4 py-2 border border-border-light rounded" />
                <input placeholder="Question HI" value={item.probe3QuestionHi || ''} onChange={(e) => setItem({ ...item, probe3QuestionHi: e.target.value })} className="px-4 py-2 border border-border-light rounded" />
                <input placeholder="Question MR" value={item.probe3QuestionMr || ''} onChange={(e) => setItem({ ...item, probe3QuestionMr: e.target.value })} className="px-4 py-2 border border-border-light rounded" />
              </div>
              <div className="grid gap-2">
                {[0, 1, 2, 3, 4].map((score) => (
                  <input
                    key={score}
                    placeholder={`Score ${score}`}
                    value={item[`probe3Score${score}En`] || ''}
                    onChange={(e) => setItem({ ...item, [`probe3Score${score}En`]: e.target.value })}
                    className="px-4 py-2 border border-border-light rounded text-sm"
                  />
                ))}
              </div>
            </div>

            {/* Mapped Subtypes */}
            <div className="border-t pt-6">
              <label className="block text-sm font-ui font-600 mb-2">Mapped Subtypes (comma-separated)</label>
              <input
                type="text"
                value={item.mappedSubtypes?.join(', ') || ''}
                onChange={(e) => setItem({ ...item, mappedSubtypes: e.target.value.split(',').map((s: string) => s.trim()) })}
                className="w-full px-4 py-2 border border-border-light rounded"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary-500 text-white font-600 py-2 rounded hover:bg-primary-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Item'}
              </button>
              <button
                onClick={() => router.push('/admin/items')}
                className="flex-1 bg-bg-section text-text-primary font-600 py-2 rounded hover:bg-border-light"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
