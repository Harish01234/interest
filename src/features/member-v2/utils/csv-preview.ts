import type {
    CsvRawRow,
    HeaderMap,
    MemberV2CsvField,
    MemberV2PreviewRow,
  } from "../types/member-v2-migration.types"
  
  import { buildHeaderMap } from "./csv-header"
  import { mapCsvRowToPreviewRow } from "./csv-row"
  
  const requiredFields: MemberV2CsvField[] = ["name", "amount"]
  
  function getMissingFields(headerMap: HeaderMap) {
    return requiredFields.filter((field) => !headerMap[field])
  }
  
  export function buildCsvPreview(headers: string[], rawRows: CsvRawRow[]) {
    const headerMap = buildHeaderMap(headers)
  
    const missingFields = getMissingFields(headerMap)
  
    const rows: MemberV2PreviewRow[] = rawRows.map((row) =>
      mapCsvRowToPreviewRow(row, headerMap)
    )
  
    return {
      headers,
      headerMap,
      missingFields,
      previewRows: rows.slice(0, 5),
      allRows: rows,
      totalRows: rows.length,
    }
  }