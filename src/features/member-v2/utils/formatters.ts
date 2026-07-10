export function formatMoney(value: number) {
  return `₹${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value)}`
}

export function formatPlainNumber(value: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function toDateInputValue(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10)
  }

  return date.toISOString().slice(0, 10)
}

export function toNumber(value: string) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

export function getInterest(credit: number, percentage: number) {
  return Math.round(credit * (percentage / 100))
}
