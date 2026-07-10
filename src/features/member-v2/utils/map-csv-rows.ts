import type { CreateMemberV2Input } from '../member-v2.schema'
import type { MemberV2PreviewRow } from '../types/member-v2-migration.types'
import { normalizeMemberV2DateInput } from './parse-member-v2-date'

function parseInteger(value?: string) {
  if (!value?.trim()) {
    return null
  }

  const parsed = Number(value.replace(/,/g, ''))
  if (!Number.isFinite(parsed)) {
    return null
  }

  return Math.round(parsed)
}

function parseNumber(value?: string) {
  if (!value?.trim()) {
    return null
  }

  const parsed = Number(value.replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}

export function mapPreviewRowsToMembers(rows: MemberV2PreviewRow[]) {
  const members: CreateMemberV2Input[] = []
  let skipped = 0

  for (const row of rows) {
    const name = row.name?.trim()
    const credit = parseInteger(row.amount)

    if (!name || credit === null) {
      skipped += 1
      continue
    }

    members.push({
      name,
      credit,
      percentage: parseNumber(row.percent) ?? 0,
      mobileNo: row.phoneNo?.trim() || undefined,
      remarks: row.remarks?.trim() || undefined,
      date: normalizeMemberV2DateInput(row.date),
    })
  }

  return { members, skipped }
}
