/**
 * Parses member date strings from forms and CSV imports.
 * Accepts ISO, DD/MM/YYYY, DD-MM-YYYY, and other common formats.
 */
export function parseMemberV2Date(value?: string | null): Date | null {
  if (!value?.trim()) {
    return null
  }

  const text = value.trim()

  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    const year = Number(isoMatch[1])
    const month = Number(isoMatch[2]) - 1
    const day = Number(isoMatch[3])
    const date = new Date(year, month, day, 12, 0, 0, 0)

    if (!Number.isNaN(date.getTime())) {
      return date
    }
  }

  const dmyMatch = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/)
  if (dmyMatch) {
    const day = Number(dmyMatch[1])
    const month = Number(dmyMatch[2]) - 1
    let year = Number(dmyMatch[3])

    if (year < 100) {
      year += year < 50 ? 2000 : 1900
    }

    const date = new Date(year, month, day, 12, 0, 0, 0)

    if (!Number.isNaN(date.getTime())) {
      return date
    }
  }

  const native = new Date(text)
  if (!Number.isNaN(native.getTime())) {
    return native
  }

  return null
}

export function resolveMemberV2Date(value?: string | null): Date {
  return parseMemberV2Date(value) ?? new Date()
}

export function normalizeMemberV2DateInput(value?: string | null): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}
