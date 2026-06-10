'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import MPPIItemsTab from '@/components/admin/MPPIItemsTab'
import GAD7Tab from '@/components/admin/GAD7Tab'
import ReportsTab from '@/components/admin/ReportsTab'
import SettingsTab from '@/components/admin/SettingsTab'

type TabName = 'mppi' | 'gad7' | 'reports' | 'settings'

export default function AdminManagePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabName>('mppi')

  const handleLogout = async () => {
    try {
      await axios.post('/api/admin/auth/logout')
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const tabs: { name: TabName; label: string; icon: string }[] = [
    { name: 'mppi', label: 'MPPI Items (118)', icon: '📋' },
    { name: 'gad7', label: 'GAD-7', icon: '😟' },
    { name: 'reports', label: 'Reports', icon: '📊' },
    { name: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="bg-bg-surface border-b border-border-light sticky top-0 z-20">
        <div className="container-content px-4 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-display text-text-primary mb-2">
                Admin Management
              </h1>
              <p className="text-sm text-text-secondary">
                Manage assessment items, reports, and system configuration
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-lg font-ui font-600 text-red-600 hover:bg-red-600/20 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-bg-surface border-b border-border-light sticky top-[80px] z-10">
        <div className="container-content px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`px-6 py-4 font-ui font-600 border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.name
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <span className="me-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="container-content px-4 py-8">
        {activeTab === 'mppi' && <MPPIItemsTab />}
        {activeTab === 'gad7' && <GAD7Tab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  )
}
