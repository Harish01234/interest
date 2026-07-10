import Papa from 'papaparse'

import type { CsvRawRow } from '../types/member-v2-migration.types'
import { buildHeaderMap } from './csv-header'

type CsvMatrixRow = string[]

const MAX_HEADER_SCAN_ROWS = 10

function scoreHeaderRow(headers: string[]) {
  const headerMap = buildHeaderMap(headers)
  const mappedCount = Object.keys(headerMap).length
  const hasCoreFields = Boolean(headerMap.name && headerMap.amount)

  return mappedCount + (hasCoreFields ? 10 : 0)
}

function findHeaderRowIndex(rows: CsvMatrixRow[]) {
  const scanLimit = Math.min(rows.length, MAX_HEADER_SCAN_ROWS)
  let bestIndex = 0
  let bestScore = -1

  for (let index = 0; index < scanLimit; index += 1) {
    const headers = rows[index].map((cell) => cell?.trim() ?? '')
    if (!headers.some(Boolean)) {
      continue
    }

    const score = scoreHeaderRow(headers)
    if (score > bestScore) {
      bestScore = score
      bestIndex = index
    }
  }

  return bestIndex
}

export async function readMemberV2CsvFromFile(file: File): Promise<{
  headers: string[]
  rawRows: CsvRawRow[]
  headerRow: number
}> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvMatrixRow>(file, {
      header: false,
      skipEmptyLines: false,
      complete: (result) => {
        if (result.errors.length > 0) {
          reject(new Error(result.errors[0]?.message ?? 'Failed to parse CSV'))
          return
        }

        const rows = result.data.filter((row) => row.some((cell) => cell?.trim()))

        if (rows.length === 0) {
          reject(new Error('CSV file is empty'))
          return
        }

        const headerIndex = findHeaderRowIndex(rows)
        const headers = rows[headerIndex].map((header) => header?.trim() ?? '')

        if (!headers.some(Boolean)) {
          reject(new Error('Could not detect a header row in CSV'))
          return
        }

        const rawRows = rows
          .slice(headerIndex + 1)
          .filter((row) => row.some((cell) => cell?.trim()))
          .map((row) =>
            Object.fromEntries(
              headers.map((header, index) => [header, row[index]?.trim() ?? '']),
            ),
          )

        resolve({
          headers,
          rawRows,
          headerRow: headerIndex + 1,
        })
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}
