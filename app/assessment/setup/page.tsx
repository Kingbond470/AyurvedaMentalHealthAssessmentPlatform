'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/lib/store'
import axios from 'axios'

export default function AssessmentSetupPage() {
  const router = useRouter()
  const { setSessionId, setRespondentCode, setMppiOrder, setLanguage } =
    useSessionStore()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Practitioner Info + Respondent Info
  const [practitionerName, setPractitionerName] = useState('')
  const [respondentCode, setRespondentCodeLocal] = useState('')
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

  // Step 2: Session Config
  const [mppiOrder, setMppiOrderLocal] = useState('BEFORE_GAD7')

  const handleStep1Submit = () => {
    setError('')
    if (!practitionerName || !age || !gender) {
      setError('Practitioner name, age, and gender are required')
      return
    }
    setStep(2)
  }

  const handleStep2Submit = async () => {
    setLoading(true)
    setError('')

    try {
      // Create respondent first
      const respondentRes = await axios.post(
        '/api/respondents',
        {
          respondentCode: respondentCode || `RESP-${Date.now()}`,
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

      // Create session
      const sessionRes = await axios.post(
        '/api/sessions',
        {
          respondentCode: respondent.respondentCode,
          practitionerName,
          mppiOrder,
        }
      )

      const session = sessionRes.data

      // Update store
      setSessionId(session.id)
      setRespondentCode(respondent.respondentCode)
      setMppiOrder(mppiOrder as 'BEFORE_GAD7' | 'AFTER_GAD7')
      setLanguage(language as 'EN' | 'HI' | 'MR')

      // Redirect to assessment
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
            New Assessment
          </h1>
          <p className="text-sm text-text-secondary font-ui">
            Step {step} of 2
          </p>
        </div>
      </header>

      <main className="container-content px-4 py-12">
        <div className="bg-bg-surface rounded-lg shadow-md p-8 max-w-md mx-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm font-ui">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-display text-text-primary mb-6">
                Assessment Setup
              </h2>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  Practitioner Name *
                </label>
                <input
                  type="text"
                  value={practitionerName}
                  onChange={(e) => setPractitionerName(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body"
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="border-t border-border-light pt-4 mt-4">
                <h3 className="text-sm font-ui font-600 text-text-primary mb-4">
                  Respondent Information
                </h3>
              </div>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  Respondent Code (Optional)
                </label>
                <input
                  type="text"
                  value={respondentCode}
                  onChange={(e) => setRespondentCodeLocal(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body"
                  placeholder="Auto-generated if blank"
                />
              </div>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body"
                />
              </div>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  Gender *
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
                  Education
                </label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body"
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
                  Occupation
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body"
                />
              </div>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body"
                />
              </div>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body"
                />
              </div>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body"
                />
              </div>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg font-body"
                />
              </div>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-1">
                  Language
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
                      {lang === 'EN' ? 'English' : lang === 'HI' ? 'Hindi' : 'Marathi'}
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStep1Submit}
                className="w-full bg-primary-500 text-white font-ui font-600 py-2 rounded-lg hover:bg-primary-600 transition mt-6"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-display text-text-primary mb-6">
                Assessment Configuration
              </h2>

              <div>
                <label className="block text-sm font-ui text-text-primary mb-3">
                  Which assessment first?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'BEFORE_GAD7', label: 'MPPI then GAD-7' },
                    { value: 'AFTER_GAD7', label: 'GAD-7 then MPPI' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="mppiOrder"
                        value={option.value}
                        checked={mppiOrder === option.value}
                        onChange={(e) => setMppiOrderLocal(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="font-ui">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-bg-section text-text-primary font-ui font-600 py-2 rounded-lg hover:bg-border-light transition"
                >
                  Back
                </button>
                <button
                  onClick={handleStep2Submit}
                  disabled={loading}
                  className="flex-1 bg-primary-500 text-white font-ui font-600 py-2 rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
                >
                  {loading ? 'Starting...' : 'Begin Assessment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
