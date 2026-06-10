'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

interface GAD7Item {
  id: string
  itemNumber: number
  questionEn: string
  questionHi?: string
  questionMr?: string
  option0En: string
  option0Hi?: string
  option0Mr?: string
  option1En: string
  option1Hi?: string
  option1Mr?: string
  option2En: string
  option2Hi?: string
  option2Mr?: string
  option3En: string
  option3Hi?: string
  option3Mr?: string
  isImpairmentItem: boolean
}

export default function GAD7Tab() {
  const [items, setItems] = useState<GAD7Item[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedItem, setExpandedItem] = useState<number | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const response = await axios.get('/api/admin/gad7-items')
        setItems(response.data || [])
      } catch (error) {
        console.error('Failed to fetch GAD-7 items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading GAD-7 items...</div>
  }

  const getLanguageStatus = (
    en: string,
    hi: string | undefined,
    mr: string | undefined
  ) => ({
    en: en ? '✓' : '✗',
    hi: hi ? '✓' : '✗',
    mr: mr ? '✓' : '✗',
  })

  return (
    <div className="space-y-4">
      <div className="bg-bg-surface rounded-lg shadow-sm p-4 mb-6">
        <h3 className="font-ui font-600 text-text-primary mb-2">Translation Status</h3>
        <div className="text-sm text-text-secondary space-y-1">
          <div>Questions: EN ✓ | HI {items.some((i) => i.questionHi) ? '◐' : '✗'} | MR {items.some((i) => i.questionMr) ? '◐' : '✗'}</div>
          <div>Options: EN ✓ | HI {items.some((i) => i.option0Hi) ? '◐' : '✗'} | MR {items.some((i) => i.option0Mr) ? '◐' : '✗'}</div>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const isExpanded = expandedItem === item.itemNumber
          const qStatus = getLanguageStatus(item.questionEn, item.questionHi, item.questionMr)

          return (
            <div
              key={item.id}
              className="bg-bg-surface rounded-lg shadow-sm overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() =>
                  setExpandedItem(isExpanded ? null : item.itemNumber)
                }
                className="w-full px-6 py-4 hover:bg-bg-section transition flex items-center justify-between"
              >
                <div className="text-left">
                  <h3 className="font-ui font-600 text-text-primary">
                    {item.isImpairmentItem
                      ? 'Impairment Question'
                      : `GAD-7 Item ${item.itemNumber}`}
                  </h3>
                  <p className="text-sm text-text-secondary font-body mt-1">
                    {item.questionEn.substring(0, 60)}...
                  </p>
                </div>

                <div className="flex items-center gap-4 ms-4">
                  <div className="text-xs font-ui">
                    EN: <span className="font-600 text-green-600">{qStatus.en}</span> | HI:{' '}
                    <span
                      className={
                        qStatus.hi === '✓'
                          ? 'font-600 text-green-600'
                          : 'text-text-tertiary'
                      }
                    >
                      {qStatus.hi}
                    </span>{' '}
                    | MR:{' '}
                    <span
                      className={
                        qStatus.mr === '✓'
                          ? 'font-600 text-green-600'
                          : 'text-text-tertiary'
                      }
                    >
                      {qStatus.mr}
                    </span>
                  </div>
                  <span className="text-xl text-text-secondary">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </div>
              </button>

              {/* Content */}
              {isExpanded && (
                <div className="border-t border-border-light px-6 py-4 bg-bg-section space-y-6">
                  {/* Question */}
                  <div>
                    <h4 className="text-sm font-ui font-600 text-text-primary mb-3">
                      Question
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-ui text-text-secondary">
                          English (EN)
                        </label>
                        <p className="text-sm font-body text-text-primary mt-1 p-3 bg-bg-primary rounded">
                          {item.questionEn}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-ui text-text-secondary">
                          Hindi (HI) {!item.questionHi && '- Not translated'}
                        </label>
                        <p className="text-sm font-body text-text-primary mt-1 p-3 bg-bg-primary rounded">
                          {item.questionHi || 'Not translated'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-ui text-text-secondary">
                          Marathi (MR) {!item.questionMr && '- Not translated'}
                        </label>
                        <p className="text-sm font-body text-text-primary mt-1 p-3 bg-bg-primary rounded">
                          {item.questionMr || 'Not translated'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div>
                    <h4 className="text-sm font-ui font-600 text-text-primary mb-3">
                      Response Options
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          score: 0,
                          en: item.option0En,
                          hi: item.option0Hi,
                          mr: item.option0Mr,
                        },
                        {
                          score: 1,
                          en: item.option1En,
                          hi: item.option1Hi,
                          mr: item.option1Mr,
                        },
                        {
                          score: 2,
                          en: item.option2En,
                          hi: item.option2Hi,
                          mr: item.option2Mr,
                        },
                        {
                          score: 3,
                          en: item.option3En,
                          hi: item.option3Hi,
                          mr: item.option3Mr,
                        },
                      ].map((opt) => {
                        const optStatus = getLanguageStatus(opt.en, opt.hi, opt.mr)
                        return (
                          <div
                            key={opt.score}
                            className="border border-border-light rounded-lg p-3"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-ui font-600 text-text-primary">
                                Option {opt.score}
                              </span>
                              <span className="text-xs font-ui">
                                EN: <span className="font-600 text-green-600">{optStatus.en}</span> | HI:{' '}
                                <span
                                  className={
                                    optStatus.hi === '✓'
                                      ? 'font-600 text-green-600'
                                      : 'text-text-tertiary'
                                  }
                                >
                                  {optStatus.hi}
                                </span>{' '}
                                | MR:{' '}
                                <span
                                  className={
                                    optStatus.mr === '✓'
                                      ? 'font-600 text-green-600'
                                      : 'text-text-tertiary'
                                  }
                                >
                                  {optStatus.mr}
                                </span>
                              </span>
                            </div>
                            <div className="text-sm text-text-secondary">
                              <div>EN: {opt.en}</div>
                              {opt.hi && <div className="text-text-primary">HI: {opt.hi}</div>}
                              {opt.mr && <div className="text-text-primary">MR: {opt.mr}</div>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div className="pt-4 border-t border-border-light">
                    <button className="px-4 py-2 bg-primary-500 text-white rounded-lg font-ui font-600 hover:bg-primary-600 transition">
                      Edit Question & Options
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
