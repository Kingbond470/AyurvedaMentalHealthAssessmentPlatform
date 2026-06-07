'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

interface Item {
  id: string
  itemNumber: number
  section: number
  sectionName: string
  predictorSanskrit: string
  coreProbeEn?: string
  probe1QuestionEn?: string
}

export default function ItemsManagementPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('/api/admin/items')
        setItems(response.data)
      } catch (err) {
        console.error('Failed to fetch items:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  const filteredItems = items.filter(
    (item) =>
      item.itemNumber.toString().includes(filter) ||
      item.section.toString().includes(filter) ||
      item.predictorSanskrit.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="bg-bg-surface border-b border-border-light">
        <div className="container-dashboard px-4 py-6">
          <h1 className="text-3xl font-display text-text-primary mb-2">
            Item Bank Management
          </h1>
          <p className="text-sm text-text-secondary font-ui">
            Manage 118 MPPI items + 7 GAD-7 items
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-dashboard px-4 py-8">
        {/* Filter */}
        <div className="mb-6 flex gap-3">
          <input
            type="text"
            placeholder="Filter by item #, section, or name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 px-4 py-2 border border-border-light rounded-lg font-body"
          />
          <button className="px-6 py-2 bg-primary-500 text-white font-ui font-600 rounded-lg hover:bg-primary-600 transition">
            + Add Item
          </button>
        </div>

        {/* Items List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">Loading items...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.slice(0, 20).map((item) => (
              <div
                key={item.id}
                className="bg-bg-surface rounded-lg p-4 border border-border-light hover:shadow-md transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex gap-3 items-baseline mb-2">
                      <span className="text-sm font-ui font-600 text-text-tertiary">
                        Item {item.itemNumber} • Section {item.section}
                      </span>
                    </div>
                    <h3 className="text-lg font-display text-text-primary mb-1">
                      {item.predictorSanskrit}
                    </h3>
                    <p className="text-sm text-text-secondary font-ui line-clamp-2">
                      {item.coreProbeEn || 'Core probe not yet added'}
                    </p>
                    <p className="text-xs text-text-tertiary font-ui mt-1">
                      {item.probe1QuestionEn
                        ? '✓ Probes completed'
                        : '○ Probes pending'}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingId(item.id)}
                    className="px-3 py-1 bg-bg-section text-text-primary text-sm font-ui rounded hover:bg-border-light transition"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Info */}
        <div className="text-center mt-8 text-text-secondary font-ui text-sm">
          Showing {Math.min(20, filteredItems.length)} of {filteredItems.length} items
        </div>

        {/* Help Text */}
        <div className="mt-10 bg-accent-100 border border-accent-500 rounded-lg p-4">
          <h3 className="font-display text-text-primary mb-2">
            How to populate the item bank:
          </h3>
          <ul className="text-sm font-ui text-text-secondary space-y-1 list-disc list-inside">
            <li>
              Extract questions from provided PDFs: Scoring Format.pdf (MPPI) +
              GAD-7_Anxiety-updated_0.pdf
            </li>
            <li>
              Enter each item: Sanskrit name, Devanagari, interpretation, core probe,
              and 3 follow-up probes
            </li>
            <li>Provide translations in EN, HI, MR for each probe</li>
            <li>Configure Section 14 male/female variants separately</li>
            <li>Section 16 items marked as observer-rated</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
