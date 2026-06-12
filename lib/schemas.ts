import { z } from 'zod'

// Auth
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
})

// Respondent
export const respondentSchema = z.object({
  respondentCode: z.string().optional(),
  age: z.number().int().min(1).max(120),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  education: z.string().optional(),
  occupation: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  language: z.enum(['EN', 'HI', 'MR']).default('EN'),
})

export type RespondentInput = z.infer<typeof respondentSchema>

// Session
export const sessionStartSchema = z.object({
  respondentCode: z.string(),
  mppiOrder: z.enum(['BEFORE_GAD7', 'AFTER_GAD7']).default('BEFORE_GAD7'),
  practitionerId: z.string(),
})

// Item Response
export const itemResponseSchema = z.object({
  itemNumber: z.number().int().min(1).max(118),
  probe1Score: z.number().int().min(0).max(4),
  probe2Score: z.number().int().min(0).max(4),
  probe3Score: z.number().int().min(0).max(4),
})

export type ItemResponseInput = z.infer<typeof itemResponseSchema>

// GAD-7
export const gad7ResponseSchema = z.object({
  item1Score: z.number().int().min(0).max(3),
  item2Score: z.number().int().min(0).max(3),
  item3Score: z.number().int().min(0).max(3),
  item4Score: z.number().int().min(0).max(3),
  item5Score: z.number().int().min(0).max(3),
  item6Score: z.number().int().min(0).max(3),
  item7Score: z.number().int().min(0).max(3),
  impairmentScore: z.number().int().min(0).max(3).optional(),
})

export type GAD7ResponseInput = z.infer<typeof gad7ResponseSchema>
