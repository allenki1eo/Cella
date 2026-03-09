'use client'

import HyperFormula from 'hyperformula'
import { SheetData } from '@/types'

let hfInstance: HyperFormula | null = null

export function getHyperFormula(): HyperFormula {
  if (!hfInstance) {
    hfInstance = HyperFormula.buildEmpty({
      licenseKey: 'gpl-v3',
    })
  }
  return hfInstance
}

export function evaluateFormula(formula: string, sheetData: SheetData): string {
  if (!formula.startsWith('=')) return formula

  try {
    const hf = getHyperFormula()
    // Build a simple sheet context
    hf.addSheet('TempEval')
    const sheetId = hf.getSheetId('TempEval')
    if (sheetId === undefined) return '#ERROR!'

    // Populate cells
    Object.entries(sheetData).forEach(([ref, cell]) => {
      const parsed = parseCellRef(ref)
      if (parsed) {
        hf.setCellContents({ sheet: sheetId, col: parsed.col, row: parsed.row }, [[cell.raw]])
      }
    })

    const result = hf.getCellValue({ sheet: sheetId, col: 0, row: 0 })
    hf.removeSheet(sheetId)
    return String(result ?? '')
  } catch {
    return '#ERROR!'
  }
}

export function parseCellRef(ref: string): { col: number; row: number } | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/)
  if (!match) return null
  const colStr = match[1]
  const rowNum = parseInt(match[2], 10) - 1
  let col = 0
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 64)
  }
  return { col: col - 1, row: rowNum }
}

export function colIndexToLetter(index: number): string {
  let result = ''
  let n = index + 1
  while (n > 0) {
    const rem = (n - 1) % 26
    result = String.fromCharCode(65 + rem) + result
    n = Math.floor((n - 1) / 26)
  }
  return result
}

export function cellRefFromCoords(col: number, row: number): string {
  return `${colIndexToLetter(col)}${row + 1}`
}
