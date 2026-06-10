import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  user: {
    id: string
    email: string
    name: string | null
    role: 'PRACTITIONER' | 'ADMIN'
  } | null
  setToken: (token: string) => void
  setUser: (user: AuthState['user']) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-store',
    }
  )
)

interface SessionState {
  sessionId: string | null
  respondentCode: string | null
  currentSection: number
  currentItem: number
  mppiOrder: 'BEFORE_GAD7' | 'AFTER_GAD7'
  language: 'EN' | 'HI' | 'MR'
  itemResponses: Record<number, { probe1: number; probe2: number; probe3: number }>
  gad7Responses: {
    item1?: number
    item2?: number
    item3?: number
    item4?: number
    item5?: number
    item6?: number
    item7?: number
    impairment?: number
  }
  isAssessmentPhaseGAD7: boolean

  setSessionId: (id: string) => void
  setRespondentCode: (code: string) => void
  setCurrentItem: (section: number, item: number) => void
  setMppiOrder: (order: 'BEFORE_GAD7' | 'AFTER_GAD7') => void
  setLanguage: (lang: 'EN' | 'HI' | 'MR') => void
  setItemResponse: (
    itemNumber: number,
    probe1: number,
    probe2: number,
    probe3: number
  ) => void
  setGAD7Response: (itemNumber: number, score: number) => void
  setGAD7Impairment: (score: number) => void
  setIsAssessmentPhaseGAD7: (isGAD7: boolean) => void
  resetSession: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionId: null,
      respondentCode: null,
      currentSection: 1,
      currentItem: 1,
      mppiOrder: 'BEFORE_GAD7',
      language: 'EN',
      itemResponses: {},
      gad7Responses: {},
      isAssessmentPhaseGAD7: false,

      setSessionId: (id) => set({ sessionId: id }),
      setRespondentCode: (code) => set({ respondentCode: code }),
      setCurrentItem: (section, item) =>
        set({ currentSection: section, currentItem: item }),
      setMppiOrder: (order) => set({ mppiOrder: order }),
      setLanguage: (lang) => set({ language: lang }),
      setItemResponse: (itemNumber, probe1, probe2, probe3) =>
        set((state) => ({
          itemResponses: {
            ...state.itemResponses,
            [itemNumber]: { probe1, probe2, probe3 },
          },
        })),
      setGAD7Response: (itemNumber, score) =>
        set((state) => ({
          gad7Responses: {
            ...state.gad7Responses,
            [`item${itemNumber}`]: score,
          },
        })),
      setGAD7Impairment: (score) =>
        set((state) => ({
          gad7Responses: {
            ...state.gad7Responses,
            impairment: score,
          },
        })),
      setIsAssessmentPhaseGAD7: (isGAD7) =>
        set({ isAssessmentPhaseGAD7: isGAD7 }),
      resetSession: () =>
        set({
          sessionId: null,
          respondentCode: null,
          currentSection: 1,
          currentItem: 1,
          itemResponses: {},
          gad7Responses: {},
          isAssessmentPhaseGAD7: false,
        }),
    }),
    {
      name: 'session-store',
    }
  )
)

interface ThemeState {
  theme: 'default' | 'sapphire' | 'emerald' | 'charcoal'
  setTheme: (theme: ThemeState['theme']) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'default',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-store',
    }
  )
)
