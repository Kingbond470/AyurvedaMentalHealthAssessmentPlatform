'use client'

import { useState } from 'react'

export default function SettingsTab() {
  const [googleSheetsConnected, setGoogleSheetsConnected] = useState(true)
  const [spreadsheetId, setSpreadsheetId] = useState(
    '1BxiMVs0XRA5nFMKUVRtzZ6-2YcW4F3P7T8S...'
  )
  const [defaultLanguage, setDefaultLanguage] = useState('EN')
  const [requireDemographics, setRequireDemographics] = useState(true)
  const [autoGenerateCode, setAutoGenerateCode] = useState(true)
  const [maxSessions, setMaxSessions] = useState('50')
  const [sessionTimeout, setSessionTimeout] = useState('60')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTestConnection = () => {
    alert('Testing Google Sheets connection...\n\n✓ Connection successful!')
  }

  const handleDisconnect = () => {
    setGoogleSheetsConnected(false)
  }

  return (
    <div className="space-y-8">
      {/* Google Sheets Integration */}
      <div className="bg-bg-surface rounded-lg shadow-sm p-4 sm:p-8">
        <h3 className="text-base sm:text-lg font-display text-text-primary mb-4 sm:mb-6">
          Google Sheets Integration
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-3 h-3 rounded-full ${
                  googleSheetsConnected ? 'bg-green-600' : 'bg-red-600'
                }`}
              />
              <span className="text-sm font-ui font-600 text-text-primary">
                Status:{' '}
                {googleSheetsConnected
                  ? '✓ Connected'
                  : '✗ Disconnected'}
              </span>
              <span className="text-xs text-text-tertiary ms-auto">
                Last verified: 1h ago
              </span>
            </div>
          </div>

          {googleSheetsConnected && (
            <>
              <div>
                <label className="block text-sm font-ui font-600 text-text-primary mb-2">
                  Spreadsheet ID
                </label>
                <input
                  type="text"
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body text-sm focus:outline-none focus:border-primary-500"
                />
                <p className="text-xs text-text-tertiary mt-2">
                  Found in Google Sheets URL: docs.google.com/spreadsheets/d/
                  <span className="font-600">{spreadsheetId}</span>/edit
                </p>
              </div>

              <div>
                <label className="block text-sm font-ui font-600 text-text-primary mb-2">
                  Sessions Appended
                </label>
                <div className="px-4 py-2 bg-bg-section rounded-lg text-sm font-ui text-text-secondary">
                  42 sessions total
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleTestConnection}
                  className="px-4 sm:px-6 py-2 bg-bg-section border border-border-light rounded-lg font-ui font-600 text-text-primary hover:bg-border-light transition text-sm"
                >
                  Test Connection
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-4 sm:px-6 py-2 bg-red-600/10 border border-red-600/50 rounded-lg font-ui font-600 text-red-600 hover:bg-red-600/20 transition text-sm"
                >
                  Disconnect
                </button>
              </div>
            </>
          )}

          {!googleSheetsConnected && (
            <button className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-ui font-600 hover:bg-primary-600 transition">
              Reconnect Google Sheets
            </button>
          )}
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-bg-surface rounded-lg shadow-sm p-4 sm:p-8">
        <h3 className="text-base sm:text-lg font-display text-text-primary mb-4 sm:mb-6">
          System Settings
        </h3>

        <div className="space-y-6">
          {/* Default Language */}
          <div>
            <label className="block text-sm font-ui font-600 text-text-primary mb-2">
              Default Assessment Language
            </label>
            <select
              value={defaultLanguage}
              onChange={(e) => setDefaultLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-border-light rounded-lg font-body focus:outline-none focus:border-primary-500"
            >
              <option value="EN">English (EN)</option>
              <option value="HI">Hindi (HI)</option>
              <option value="MR">Marathi (MR)</option>
            </select>
          </div>

          {/* Require Demographics */}
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              id="requireDemographics"
              checked={requireDemographics}
              onChange={(e) => setRequireDemographics(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <label
              htmlFor="requireDemographics"
              className="text-sm font-ui font-600 text-text-primary cursor-pointer"
            >
              Require Demographics (Name, Age, Gender, etc.)
            </label>
          </div>

          {/* Auto-generate Codes */}
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              id="autoGenerateCode"
              checked={autoGenerateCode}
              onChange={(e) => setAutoGenerateCode(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <label
              htmlFor="autoGenerateCode"
              className="text-sm font-ui font-600 text-text-primary cursor-pointer"
            >
              Auto-generate Respondent Codes
            </label>
          </div>

          {/* Max Concurrent Sessions */}
          <div>
            <label className="block text-sm font-ui font-600 text-text-primary mb-2">
              Max Concurrent Sessions
            </label>
            <input
              type="number"
              value={maxSessions}
              onChange={(e) => setMaxSessions(e.target.value)}
              className="w-full px-4 py-2 border border-border-light rounded-lg font-body focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Session Timeout */}
          <div>
            <label className="block text-sm font-ui font-600 text-text-primary mb-2">
              Session Timeout (idle, in minutes)
            </label>
            <input
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="w-full px-4 py-2 border border-border-light rounded-lg font-body focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-border-light">
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg font-ui font-600 hover:bg-primary-600 disabled:opacity-50 transition"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {saved && (
                <span className="px-4 py-2 text-green-600 font-ui font-600">
                  ✓ Saved
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
