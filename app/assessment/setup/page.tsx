'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/lib/store'
import { getLabel } from '@/lib/localization'
import axios from 'axios'

export default function AssessmentSetupPage() {
  const router = useRouter()
  const { setSessionId, setRespondentCode, setLanguage: setStoreLanguage } = useSessionStore()
  const uiLanguage = useSessionStore((state) => state.language)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Respondent Info
  const [practitionerName, setPractitionerName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('MALE')
  const [education, setEducation] = useState('')
  const [occupation, setOccupation] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [language, setLangSelection] = useState('EN')

  const handleSubmit = async () => {
    setError('')
    if (!practitionerName || !age || !gender) {
      setError('Practitioner name, age, and gender are required')
      return
    }

    setLoading(true)

    try {
      // Create respondent with auto-generated code
      const respondentRes = await axios.post(
        '/api/respondents',
        {
          respondentCode: `RESP-${Date.now()}`,
          age: parseInt(age),
          gender,
          education,
          occupation,
          name,
          phone,
          city,
          state,
          country,
          language,
        }
      )

      const respondent = respondentRes.data

      // Create session (fixed sequence: MPPI → GAD-7, no selection)
      const sessionRes = await axios.post(
        '/api/sessions',
        {
          respondentCode: respondent.respondentCode,
          practitionerName,
        }
      )

      const session = sessionRes.data

      // Update store
      setSessionId(session.id)
      setRespondentCode(respondent.respondentCode)
      setStoreLanguage(language as 'EN' | 'HI' | 'MR')

      // Redirect to assessment (always starts MPPI)
      router.push(`/assessment/${session.id}`)
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Failed to create session'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="bg-bg-surface border-b border-border-light">
        <div className="container-content px-4 py-4">
          <h1 className="text-2xl font-display text-text-primary">
            {getLabel('newAssessment', uiLanguage)}
          </h1>
          <p className="text-sm text-text-secondary font-ui">
            {getLabel('setupDescription', uiLanguage)}
          </p>
        </div>
      </header>

      <main className="container-content px-4 py-8 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="bg-bg-surface rounded-lg shadow-md w-full max-w-md sm:max-w-lg md:max-w-2xl flex flex-col max-h-[calc(100vh-160px)]">
          {/* Header */}
          <div className="px-6 sm:px-8 py-6 border-b border-border-light shrink-0">
            <h2 className="text-xl font-display text-text-primary mb-1">
              {getLabel('assessmentSetup', uiLanguage)}
            </h2>
            <p className="text-xs text-text-secondary font-ui">
              {getLabel('setupDescription', uiLanguage)}
            </p>
          </div>

          {/* Scrollable Form */}
          <div className="overflow-y-auto flex-1 px-6 sm:px-8 py-6 space-y-4 relative">
            {error && (
              <div className="mb-4 p-3 bg-red-600/20 border border-red-600/40 rounded text-red-500 text-sm font-ui sticky top-0 z-10">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  {getLabel('practitionerName', uiLanguage)} *
                </label>
                <input
                  type="text"
                  value={practitionerName}
                  onChange={(e) => setPractitionerName(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                  placeholder={getLabel('practitionerNamePlaceholder', uiLanguage)}
                  required
                />
              </div>

              <div className="border-t border-border-light pt-4 mt-4">
                <h3 className="text-sm font-ui font-600 text-text-primary mb-4">
                  {getLabel('respondentInformation', uiLanguage)}
                </h3>
              </div>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  {getLabel('name', uiLanguage)}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  {getLabel('age', uiLanguage)} *
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  {getLabel('gender', uiLanguage)} *
                </label>
                <div className="flex gap-3">
                  {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                    <label key={g} className="flex items-center gap-2 font-ui">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={gender === g}
                        onChange={(e) => setGender(e.target.value)}
                      />
                      {g.charAt(0) + g.slice(1).toLowerCase()}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  {getLabel('education', uiLanguage)}
                </label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                >
                  <option value="">Select...</option>
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Doctoral">Doctoral</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  {getLabel('occupation', uiLanguage)}
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  {getLabel('phone', uiLanguage)}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  {getLabel('city', uiLanguage)}
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  {getLabel('state', uiLanguage)}
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  {getLabel('country', uiLanguage)}
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  {getLabel('language', uiLanguage)}
                </label>
                <div className="flex gap-3">
                  {['EN', 'HI', 'MR'].map((lang) => (
                    <label key={lang} className="flex items-center gap-2 font-ui">
                      <input
                        type="radio"
                        name="language"
                        value={lang}
                        checked={language === lang}
                        onChange={(e) => setLangSelection(e.target.value)}
                      />
                      {lang === 'EN' ? getLabel('english', uiLanguage) : lang === 'HI' ? getLabel('hindi', uiLanguage) : getLabel('marathi', uiLanguage)}
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Sticky Footer with Button */}
          <div className="border-t border-border-light px-6 sm:px-8 py-4 shrink-0 bg-bg-section">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-primary-500 text-white font-ui font-600 py-3 rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
            >
              {loading ? getLabel('starting', uiLanguage) : getLabel('beginAssessment', uiLanguage)}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
