export type MemberV2CsvField =
  | "date"
  | "amount"
  | "name"
  | "percent"
  | "phoneNo"
  | "type"
  | "jinsis"
  | "remarks"

export type CsvRawRow = Record<string, string>

export type HeaderMap = Partial<Record<MemberV2CsvField, string>>

export type MemberV2PreviewRow = {
  date?: string
  amount?: string
  name?: string
  percent?: string
  phoneNo?: string
  type?: string
  jinsis?: string
  remarks?: string
}