import Papa from 'papaparse'
import { z } from 'zod'

export const memberTypeSchema = z.enum(['gold', 'silver', 'both', 'unknown'])

export type MemberType = z.infer<typeof memberTypeSchema>

export const memberRecordSchema = z.object({
  slNo: z.string(),
  name: z.string(),
  fatherName: z.string(),
  credit: z.string(),
  date: z.string(),
  phoneNo: z.string(),
  type: memberTypeSchema,
  jinsis: z.string().optional(),
})

export type MemberRecord = z.infer<typeof memberRecordSchema>

type CsvRow = Record<string, string>

const HEADER_ROW = 5

const SILVER_KEYWORDS = ['silver', 'slv', 'silv','SLV']
const GOLD_KEYWORDS = ['gold', 'gld', 'gldn', 'sona', 'SONA']

/**
 * Jinsi is one long string, e.g.:
 * - "SONA.RING1,GM.1.300"           → gold
 * - "SLV.BAG1,GM.102.0"             → silver
 * - "SONA.BESOR1,...,SLV.JRBAR,..." → both
 */
function hasKeyword(value: string, keywords: readonly string[]) {
  return keywords.some((word) => value.includes(word.toLowerCase()))
}

function deriveTypeFromJinsis(jinsis: string): MemberType {
  const value = jinsis.toLowerCase()

  const hasGold = hasKeyword(value, GOLD_KEYWORDS)
  const hasSilver = hasKeyword(value, SILVER_KEYWORDS)

  if (hasGold && hasSilver) return 'both'
  if (hasGold) return 'gold'
  if (hasSilver) return 'silver'
  return 'unknown'
}

/** Exact CSV column names from row 5 */
const CSV_HEADERS = {
  slNo: 'Sl no',
  name: 'NAME',
  fatherName: "Father's Name",
  credit: 'credit',
  date: 'Date',
  phoneNo: 'PHONE NO',
  jinsis: 'Dabite',
} as const

function mapRow(row: CsvRow): MemberRecord {
  const jinsis = row[CSV_HEADERS.jinsis]?.trim() ?? ''

  return memberRecordSchema.parse({
    slNo: row[CSV_HEADERS.slNo] ?? '',
    name: row[CSV_HEADERS.name] ?? '',
    fatherName: row[CSV_HEADERS.fatherName] ?? '',
    credit: row[CSV_HEADERS.credit] ?? '',
    date: row[CSV_HEADERS.date] ?? '',
    phoneNo: row[CSV_HEADERS.phoneNo] ?? '',
    jinsis: jinsis || undefined,
    type: deriveTypeFromJinsis(jinsis),
  })
}

function readRawCsv(file: File): Promise<CsvRow[]> {
  const headerIndex = HEADER_ROW - 1

  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      header: false,
      skipEmptyLines: false,
      complete: (result) => {
        if (result.errors.length > 0) {
          reject(result.errors[0])
          return
        }

        const rows = result.data

        if (rows.length <= headerIndex) {
          reject(new Error(`CSV must have at least ${HEADER_ROW} rows`))
          return
        }

        const headers = rows[headerIndex].map((h) => h?.trim() ?? '')

        const data = rows
          .slice(headerIndex + 1)
          .filter((row) => row.some((cell) => cell?.trim()))
          .map((row) =>
            Object.fromEntries(
              headers.map((header, i) => [header, row[i]?.trim() ?? '']),
            ),
          )

        resolve(data)
      },
      error: reject,
    })
  })
}

export async function readMemberCsvFromFile(file: File): Promise<MemberRecord[]> {
  const rawRows = await readRawCsv(file)

  return rawRows
    .map(mapRow)
    .filter((row) => row.slNo || row.name)
}
