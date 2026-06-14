'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { ITEM_SUBTYPE_MAP } from '@/lib/scoring'

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
  mappedSubtypes: string[]
  isVisible: boolean
}

const ITEMS_PER_PAGE = 25

// Category + color for each of 16 subtypes
const SUBTYPE_META: Record<string, { category: 'S' | 'R' | 'T'; bg: string; text: string }> = {
  BRAMHA:      { category: 'S', bg: '#d1fae5', text: '#065f46' },
  ARSHA:       { category: 'S', bg: '#d1fae5', text: '#065f46' },
  AINDRA:      { category: 'S', bg: '#d1fae5', text: '#065f46' },
  YAAMYA:      { category: 'S', bg: '#d1fae5', text: '#065f46' },
  VARUNA:      { category: 'S', bg: '#d1fae5', text: '#065f46' },
  KAUBERA:     { category: 'S', bg: '#d1fae5', text: '#065f46' },
  GANDHARVA:   { category: 'S', bg: '#d1fae5', text: '#065f46' },
  ASURA:       { category: 'R', bg: '#fef3c7', text: '#92400e' },
  RAKSHAS:     { category: 'R', bg: '#fef3c7', text: '#92400e' },
  PAISHACH:    { category: 'R', bg: '#fef3c7', text: '#92400e' },
  SARPA:       { category: 'R', bg: '#fef3c7', text: '#92400e' },
  PRETA:       { category: 'R', bg: '#fef3c7', text: '#92400e' },
  SHAKUNA:     { category: 'R', bg: '#fef3c7', text: '#92400e' },
  PASHAVA:     { category: 'T', bg: '#ede9fe', text: '#4c1d95' },
  MATSYA:      { category: 'T', bg: '#ede9fe', text: '#4c1d95' },
  VANASPATYA:  { category: 'T', bg: '#ede9fe', text: '#4c1d95' },
}

function PrakritiBadges({ subtypes }: { subtypes: string[] }) {
  if (!subtypes || subtypes.length === 0) return <span className="text-text-tertiary text-xs">—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {subtypes.map((s) => {
        const meta = SUBTYPE_META[s]
        return (
          <span
            key={s}
            style={{ backgroundColor: meta?.bg ?? '#e5e7eb', color: meta?.text ?? '#374151' }}
            className="text-xs px-1.5 py-0.5 rounded font-ui font-600"
            title={meta ? `${s} (${meta.category === 'S' ? 'Sattvika' : meta.category === 'R' ? 'Rajasika' : 'Tamasika'})` : s}
          >
            {s}
          </span>
        )
      })}
    </div>
  )
}

export default function MPPIItemsTab() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSection, setSelectedSection] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewItem, setViewItem] = useState<Item | null>(null)
  const [viewLang, setViewLang] = useState<'en' | 'hi' | 'mr'>('en')
  const [togglingId, setTogglingId] = useState<number | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const response = await axios.get('/api/admin/items')
        const mppiItems = response.data
          .map((item: any) => ({
            id: item.id,
            itemNumber: item.item_number ?? item.itemNumber,
            section: item.section,
            sectionName: item.section_name ?? item.sectionName,
            predictorSanskrit: item.predictor_sanskrit ?? item.predictorSanskrit ?? '',
            predictorDevanagari: item.predictor_devanagari ?? item.predictorDevanagari ?? '',
            coreProbeEn: item.core_probe_en ?? item.coreProbeEn,
            coreProbeHi: item.core_probe_hi ?? item.coreProbeHi,
            coreProbeMr: item.core_probe_mr ?? item.coreProbeMr,
            // Always use ITEM_SUBTYPE_MAP (scoring engine source of truth) — DB field is unreliable
            mappedSubtypes: ITEM_SUBTYPE_MAP[item.item_number ?? item.itemNumber] ?? [],
            isVisible: item.is_visible ?? item.isVisible ?? true,
          }))
          .filter((item: Item) => item.itemNumber <= 118)
        setItems(mppiItems.sort((a: Item, b: Item) => a.itemNumber - b.itemNumber))
      } catch (error) {
        console.error('Failed to fetch items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  const handleToggleVisibility = async (itemNumber: number, current: boolean) => {
    setTogglingId(itemNumber)
    try {
      await axios.put(`/api/admin/items/${itemNumber}`, { isVisible: !current })
      setItems((prev) =>
        prev.map((it) => it.itemNumber === itemNumber ? { ...it, isVisible: !current } : it)
      )
    } catch (error) {
      console.error('Failed to toggle visibility:', error)
    } finally {
      setTogglingId(null)
    }
  }

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

  const getStatus = (item: Item) => ({
    en: item.coreProbeEn ? '✓' : '✗',
    hi: item.coreProbeHi ? '✓' : '✗',
    mr: item.coreProbeMr ? '✓' : '✗',
  })

  if (loading) {
    return <div className="text-center py-8">Loading items...</div>
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 px-6">
        <p className="text-text-secondary font-ui mb-2">No MPPI items loaded</p>
        <p className="text-xs text-text-tertiary mb-6">
          Run seed script to populate 118 MPPI items:
        </p>
        <code className="block bg-bg-section p-3 rounded text-xs mb-4 overflow-auto">
          npm run seed:items
        </code>
        <p className="text-xs text-text-tertiary">
          Seeds all items with English content. Add translations (HI/MR) in item editor.
        </p>
      </div>
    )
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="w-full px-4 py-2 border border-border-light rounded-lg font-body focus:outline-none focus:border-primary-500 bg-[var(--bg-secondary)] text-[var(--text-primary)]"
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

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs font-ui">
        <span className="px-2 py-1 rounded" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>S = Sattvika</span>
        <span className="px-2 py-1 rounded" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>R = Rajasika</span>
        <span className="px-2 py-1 rounded" style={{ backgroundColor: '#ede9fe', color: '#4c1d95' }}>T = Tamasika</span>
        <span className="text-text-tertiary">Toggle eye icon to show/hide item from respondents</span>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-text-secondary font-ui">
        Showing {paginatedItems.length === 0 ? 0 : startIdx + 1}-
        {Math.min(startIdx + ITEMS_PER_PAGE, filtered.length)} of {filtered.length} items
        {items.filter(i => !i.isVisible).length > 0 && (
          <span className="ml-2 text-amber-600">
            ({items.filter(i => !i.isVisible).length} hidden from respondents)
          </span>
        )}
      </div>

      {/* Table - Desktop */}
      <div className="bg-bg-surface rounded-lg shadow-sm overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-section border-b border-border-light">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-ui font-600 text-text-primary">Item #</th>
                <th className="px-4 py-3 text-left text-sm font-ui font-600 text-text-primary">Predictor</th>
                <th className="px-4 py-3 text-left text-sm font-ui font-600 text-text-primary">Sec</th>
                <th className="px-4 py-3 text-left text-sm font-ui font-600 text-text-primary">Prakriti</th>
                <th className="px-4 py-3 text-center text-sm font-ui font-600 text-text-primary">EN</th>
                <th className="px-4 py-3 text-center text-sm font-ui font-600 text-text-primary">HI</th>
                <th className="px-4 py-3 text-center text-sm font-ui font-600 text-text-primary">MR</th>
                <th className="px-4 py-3 text-center text-sm font-ui font-600 text-text-primary">Visible</th>
                <th className="px-4 py-3 text-left text-sm font-ui font-600 text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-text-secondary">
                    No items found
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const status = getStatus(item)
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-bg-section transition border-b border-border-light last:border-b-0 ${!item.isVisible ? 'opacity-50' : ''}`}
                    >
                      <td className="px-4 py-4 text-sm font-ui font-600 text-text-primary">
                        {item.itemNumber}
                      </td>
                      <td className="px-4 py-4 text-sm font-body text-text-primary">
                        <div>{item.predictorSanskrit}</div>
                        <div className="text-xs text-text-secondary font-devanagari">
                          {item.predictorDevanagari}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-ui text-text-secondary">
                        {item.section}
                      </td>
                      <td className="px-4 py-4 max-w-[200px]">
                        <PrakritiBadges subtypes={item.mappedSubtypes} />
                      </td>
                      <td className="px-4 py-4 text-sm font-ui font-600 text-center">
                        <span className={status.en === '✓' ? 'text-green-600' : 'text-red-600'}>
                          {status.en}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-ui font-600 text-center">
                        <span className={status.hi === '✓' ? 'text-green-600' : 'text-text-tertiary'}>
                          {status.hi}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-ui font-600 text-center">
                        <span className={status.mr === '✓' ? 'text-green-600' : 'text-text-tertiary'}>
                          {status.mr}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggleVisibility(item.itemNumber, item.isVisible)}
                          disabled={togglingId === item.itemNumber}
                          title={item.isVisible ? 'Visible to respondents — click to hide' : 'Hidden from respondents — click to show'}
                          className={`text-lg transition ${togglingId === item.itemNumber ? 'opacity-40' : 'hover:scale-110'}`}
                        >
                          {item.isVisible ? '👁' : '🚫'}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-sm font-ui">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/items/${item.itemNumber}`}
                            className="px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 transition"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setViewItem(item)}
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

      {/* Cards - Mobile */}
      <div className="space-y-3 md:hidden">
        {paginatedItems.length === 0 ? (
          <div className="text-center text-text-secondary py-8">No items found</div>
        ) : (
          paginatedItems.map((item) => {
            const status = getStatus(item)
            return (
              <div
                key={item.id}
                className={`bg-bg-surface rounded-lg p-4 border border-border-light space-y-3 ${!item.isVisible ? 'opacity-50' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-ui font-600 text-text-primary text-sm">Item #{item.itemNumber}</div>
                    <div className="text-xs text-text-secondary mt-1">{item.predictorSanskrit}</div>
                    <div className="text-xs text-text-secondary font-devanagari">{item.predictorDevanagari}</div>
                  </div>
                  <button
                    onClick={() => handleToggleVisibility(item.itemNumber, item.isVisible)}
                    disabled={togglingId === item.itemNumber}
                    title={item.isVisible ? 'Visible — tap to hide' : 'Hidden — tap to show'}
                    className="text-xl ml-2 shrink-0"
                  >
                    {item.isVisible ? '👁' : '🚫'}
                  </button>
                </div>
                <PrakritiBadges subtypes={item.mappedSubtypes} />
                <div className="flex gap-2 text-xs">
                  <span>Sec {item.section}</span>
                  <span className={status.en === '✓' ? 'text-green-600' : 'text-red-600'}>EN {status.en}</span>
                  <span className={status.hi === '✓' ? 'text-green-600' : 'text-text-tertiary'}>HI {status.hi}</span>
                  <span className={status.mr === '✓' ? 'text-green-600' : 'text-text-tertiary'}>MR {status.mr}</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/items/${item.itemNumber}`}
                    className="flex-1 px-3 py-2 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 transition text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setViewItem(item)}
                    className="flex-1 px-3 py-2 bg-bg-section text-text-primary border border-border-light rounded text-sm hover:bg-border-light transition"
                  >
                    View
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 overflow-x-auto">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-bg-section border border-border-light rounded-lg font-ui disabled:opacity-50 hover:bg-border-light transition whitespace-nowrap"
          >
            ← Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages)
              .map((page, idx, arr) => {
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
            className="px-4 py-2 bg-bg-section border border-border-light rounded-lg font-ui disabled:opacity-50 hover:bg-border-light transition whitespace-nowrap"
          >
            Next →
          </button>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-bg-section border-b border-border-light p-6 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-display text-text-primary">
                  Item #{viewItem.itemNumber}
                </h2>
                <div className="mt-2">
                  <PrakritiBadges subtypes={viewItem.mappedSubtypes} />
                </div>
              </div>
              <button
                onClick={() => setViewItem(null)}
                className="text-text-secondary hover:text-text-primary text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Language Tabs */}
            <div className="flex gap-1 px-6 pt-4 border-b border-border-light shrink-0">
              {[
                { code: 'en' as const, label: 'EN', probe: viewItem.coreProbeEn },
                { code: 'hi' as const, label: 'HI', probe: viewItem.coreProbeHi },
                { code: 'mr' as const, label: 'MR', probe: viewItem.coreProbeMr },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setViewLang(lang.code)}
                  disabled={!lang.probe}
                  className={`px-4 py-2 font-ui font-600 border-b-2 transition ${
                    viewLang === lang.code
                      ? 'border-primary-500 text-text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="font-ui font-600 text-text-primary mb-2">Predictor (Sanskrit)</h3>
                <p className="font-body text-text-secondary">{viewItem.predictorSanskrit}</p>
                <p className="font-devanagari text-text-secondary text-sm">{viewItem.predictorDevanagari}</p>
              </div>

              <div>
                <h3 className="font-ui font-600 text-text-primary mb-2">
                  Core Probe ({viewLang.toUpperCase()})
                </h3>
                <p className="font-body text-text-primary">
                  {viewLang === 'en'
                    ? viewItem.coreProbeEn || '—'
                    : viewLang === 'hi'
                      ? viewItem.coreProbeHi || '—'
                      : viewItem.coreProbeMr || '—'}
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-bg-section rounded-lg">
                <span className="font-ui text-sm text-text-secondary">Respondent visibility:</span>
                <span className={`font-ui font-600 text-sm ${viewItem.isVisible ? 'text-green-600' : 'text-red-500'}`}>
                  {viewItem.isVisible ? '👁 Visible' : '🚫 Hidden'}
                </span>
              </div>

              <div className="pt-4 border-t border-border-light">
                <Link
                  href={`/admin/items/${viewItem.itemNumber}`}
                  onClick={() => setViewItem(null)}
                  className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition inline-block"
                >
                  Edit Full Item
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
