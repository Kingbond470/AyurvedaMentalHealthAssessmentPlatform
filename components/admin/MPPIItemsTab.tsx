'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
}

const ITEMS_PER_PAGE = 25

export default function MPPIItemsTab() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSection, setSelectedSection] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const response = await axios.get('/api/admin/items')
        // Filter to MPPI items only (1-118)
        const mppiItems = response.data.filter((item: Item) => item.itemNumber <= 118)
        setItems(mppiItems.sort((a: Item, b: Item) => a.itemNumber - b.itemNumber))
      } catch (error) {
        console.error('Failed to fetch items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  // Filter items
  const filtered = items.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      item.predictorSanskrit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.predictorDevanagari.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemNumber.toString().includes(searchTerm)

    const matchesSection = selectedSection === null || item.section === selectedSection

    return matchesSearch && matchesSection
  })

  // Paginate
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedItems = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  const handleReset = () => {
    setSearchTerm('')
    setSelectedSection(null)
    setCurrentPage(1)
  }

  // Language completion status
  const getStatus = (item: Item) => ({
    en: item.coreProbeEn ? '✓' : '✗',
    hi: item.coreProbeHi ? '✓' : '✗',
    mr: item.coreProbeMr ? '✓' : '✗',
  })

  if (loading) {
    return <div className="text-center py-8">Loading items...</div>
  }

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="bg-bg-surface rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-ui font-600 text-text-primary mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by item #, Sanskrit name, or Devanagari..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-border-light rounded-lg font-body focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-ui font-600 text-text-primary mb-2">
                Section
              </label>
              <select
                value={selectedSection === null ? '' : selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value === '' ? null : parseInt(e.target.value))
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border border-border-light rounded-lg font-body focus:outline-none focus:border-primary-500"
              >
                <option value="">All Sections</option>
                {Array.from({ length: 16 }, (_, i) => i + 1).map((sec) => (
                  <option key={sec} value={sec}>
                    Section {sec}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleReset}
                className="w-full px-4 py-2 bg-bg-section border border-border-light rounded-lg font-ui font-600 text-text-primary hover:bg-border-light transition"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-text-secondary font-ui">
        Showing {paginatedItems.length === 0 ? 0 : startIdx + 1}-
        {Math.min(startIdx + ITEMS_PER_PAGE, filtered.length)} of {filtered.length} items
      </div>

      {/* Table */}
      <div className="bg-bg-surface rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-section border-b border-border-light">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-ui font-600 text-text-primary">
                  Item #
                </th>
                <th className="px-6 py-3 text-left text-sm font-ui font-600 text-text-primary">
                  Predictor (Sanskrit)
                </th>
                <th className="px-6 py-3 text-left text-sm font-ui font-600 text-text-primary">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-sm font-ui font-600 text-text-primary">
                  EN
                </th>
                <th className="px-6 py-3 text-left text-sm font-ui font-600 text-text-primary">
                  HI
                </th>
                <th className="px-6 py-3 text-left text-sm font-ui font-600 text-text-primary">
                  MR
                </th>
                <th className="px-6 py-3 text-left text-sm font-ui font-600 text-text-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-text-secondary">
                    No items found
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const status = getStatus(item)
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-bg-section transition border-b border-border-light last:border-b-0"
                    >
                      <td className="px-6 py-4 text-sm font-ui font-600 text-text-primary">
                        {item.itemNumber}
                      </td>
                      <td className="px-6 py-4 text-sm font-body text-text-primary">
                        <div>{item.predictorSanskrit}</div>
                        <div className="text-xs text-text-secondary font-devanagari">
                          {item.predictorDevanagari}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-ui text-text-secondary">
                        {item.section}
                      </td>
                      <td className="px-6 py-4 text-sm font-ui font-600 text-center">
                        <span
                          className={
                            status.en === '✓' ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          {status.en}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-ui font-600 text-center">
                        <span
                          className={
                            status.hi === '✓'
                              ? 'text-green-600'
                              : 'text-text-tertiary'
                          }
                        >
                          {status.hi}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-ui font-600 text-center">
                        <span
                          className={
                            status.mr === '✓'
                              ? 'text-green-600'
                              : 'text-text-tertiary'
                          }
                        >
                          {status.mr}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-ui">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/items/${item.itemNumber}`}
                            className="px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 transition"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              // TODO: Implement view/preview
                            }}
                            className="px-3 py-1 bg-bg-section text-text-primary border border-border-light rounded hover:bg-border-light transition"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-bg-section border border-border-light rounded-lg font-ui disabled:opacity-50 hover:bg-border-light transition"
          >
            ← Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show current page and ±2 pages
                return Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages
              })
              .map((page, idx, arr) => {
                // Add ellipsis if gap
                if (idx > 0 && arr[idx - 1] !== page - 1) {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 py-2 text-text-secondary">
                      ...
                    </span>
                  )
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-ui transition ${
                      currentPage === page
                        ? 'bg-primary-500 text-white'
                        : 'bg-bg-section border border-border-light hover:bg-border-light'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-bg-section border border-border-light rounded-lg font-ui disabled:opacity-50 hover:bg-border-light transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
