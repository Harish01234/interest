import type {
    CsvRawRow,
    HeaderMap,
    MemberV2PreviewRow,
  } from "../types/member-v2-migration.types"
  
  export function mapCsvRowToPreviewRow(
    rawRow: CsvRawRow,
    headerMap: HeaderMap
  ): MemberV2PreviewRow {
    return {
      date: headerMap.date ? rawRow[headerMap.date] : undefined,
      amount: headerMap.amount ? rawRow[headerMap.amount] : undefined,
      name: headerMap.name ? rawRow[headerMap.name] : undefined,
      percent: headerMap.percent ? rawRow[headerMap.percent] : undefined,
      phoneNo: headerMap.phoneNo ? rawRow[headerMap.phoneNo] : undefined,
      type: headerMap.type ? rawRow[headerMap.type] : undefined,
      jinsis: headerMap.jinsis ? rawRow[headerMap.jinsis] : undefined,
      remarks: headerMap.remarks ? rawRow[headerMap.remarks] : undefined,
    }
  }