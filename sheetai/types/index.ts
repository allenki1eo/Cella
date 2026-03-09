export interface CellData {
  raw: string
  fmt?: CellFormat
}

export interface CellFormat {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  align?: 'left' | 'center' | 'right'
  color?: string
  bgColor?: string
  fontSize?: number
}

export interface SheetData {
  [cellRef: string]: CellData
}

export interface Sheet {
  id: string
  workbook_id: string
  name: string
  position: number
  data: SheetData
  col_widths: Record<string, number>
  frozen_rows: number
  frozen_cols: number
  created_at: string
  updated_at: string
}

export interface Workbook {
  id: string
  user_id: string
  name: string
  starred: boolean
  created_at: string
  updated_at: string
  sheets?: Sheet[]
}

export interface Profile {
  id: string
  name: string | null
  avatar_url: string | null
  company: string | null
  bio: string | null
  plan: 'free' | 'pro' | 'team'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  ai_requests_used: number
  ai_requests_reset_at: string
  openrouter_key?: string | null
  created_at: string
}

export interface AIMessage {
  id: string
  sheet_id: string
  role: 'user' | 'assistant'
  content: string
  model: string | null
  used_web_search: boolean
  cell_writes: CellWrite[] | null
  created_at: string
}

export interface CellWrite {
  cell: string
  value: string
}

export interface WorkbookShare {
  id: string
  workbook_id: string
  shared_with_email: string
  permission: 'view' | 'edit'
  created_at: string
}

export type Theme = 'dark' | 'light'

export interface AIModel {
  id: string
  label: string
  tag: string
  tier: 'free' | 'pro' | 'team'
}

export const PLAN_LIMITS: Record<string, number> = {
  free: 50,
  pro: 1000,
  team: 999999,
}
