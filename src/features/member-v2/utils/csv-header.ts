import type { HeaderMap, MemberV2CsvField } from "../types/member-v2-migration.types"

export function normalizeHeader(header: string) {
  return header
    .toLowerCase()
    .trim()
    .replace(/[^\w\s%]/g, "")
    .replace(/\s+/g, " ")
}

const aliases: Record<MemberV2CsvField, string[]> = {
  date: ["date"],
  amount: ["amount", "credit"],
  name: ["name"],
  percent: ["%", "percent", "percentage"],
  phoneNo: ["mob no", "mobile", "mobile no", "phone", "phone no"],
  type: ["type"],
  jinsis: ["jinsis", "jinis"],
}

export function buildHeaderMap(headers: string[]): HeaderMap {
  const headerMap: HeaderMap = {}

  for (const field in aliases) {
    const appField = field as MemberV2CsvField

    const matchedHeader = headers.find((header) => {
      const cleanHeader = normalizeHeader(header)

      return aliases[appField].includes(cleanHeader)
    })

    if (matchedHeader) {
      headerMap[appField] = matchedHeader
    }
  }

  return headerMap
}