export function parseCredit(value: string) {
  const normalized = value
    .replace(/\s/g, '')
    .replace(/,/g, '')
    .replace(/[^\d.-]/g, '')

  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
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
