export function parseCredit(value: string) {
  const normalized = value
    .replace(/\s/g, '')
    .replace(/,/g, '')
    .replace(/[^\d.-]/g, '')

  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

/** Strip formatting so "₹ 5,000.00" and "5000" share comparable digit strings. */
export function normalizeCreditDigits(value: string) {
  return value.replace(/\s/g, '').replace(/,/g, '').replace(/[^\d.]/g, '')
}

export function matchesCreditFilter(memberCredit: string, query: string) {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return true
  }

  const lowerCredit = memberCredit.toLowerCase()
  const lowerQuery = trimmedQuery.toLowerCase()

  if (lowerCredit.includes(lowerQuery)) {
    return true
  }

  const queryDigits = normalizeCreditDigits(trimmedQuery)
  if (!queryDigits) {
    return lowerCredit.includes(lowerQuery)
  }

  const creditDigits = normalizeCreditDigits(memberCredit)
  if (creditDigits.includes(queryDigits)) {
    return true
  }

  const creditWhole = creditDigits.split('.')[0] ?? creditDigits
  return creditWhole.includes(queryDigits)
}

export function parseSlNo(value: string) {
  const parsed = Number.parseInt(value.replace(/,/g, '').trim(), 10)
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER
}

export function formatCreditTotal(total: number) {
  return `₹ ${total.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function compareMembersBySlNo(
  a: { slNo: string; id: number },
  b: { slNo: string; id: number },
) {
  const slNoDiff = parseSlNo(a.slNo) - parseSlNo(b.slNo)
  return slNoDiff !== 0 ? slNoDiff : a.id - b.id
}
