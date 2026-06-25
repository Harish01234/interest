export type CashToPerson = {
  name: string
  amount: number
}

/** A member contributing to a period-scoped total (Asol/Interest or Dewa). */
export type CalculationMemberRow = {
  id: number
  slNo: string
  name: string
  fatherName: string
  credit: number
  interest: number
}

export type SaveCalculationInput = {
  totalToBill: number
  cashInHome: number
  cashInShop: number
  cashToPersons: CashToPerson[]
}

export type CalculationDto = {
  id: number | null

  // manual inputs
  totalToBill: number
  cashInHome: number
  cashInShop: number
  cashToPersons: CashToPerson[]

  // period anchor
  periodStartedAt: Date | null

  // derived (period-scoped)
  asol: number
  interest: number
  dewa: number

  // member breakdown behind the derived numbers
  settledMembers: CalculationMemberRow[] // Asol + Interest source
  addedMembers: CalculationMemberRow[] // Dewa source

  // reconciliation
  leftTotal: number // totalToBill + asol + interest - dewa
  rightTotal: number // cashInHome + cashInShop + sum(cashToPersons)
  difference: number // leftTotal - rightTotal
  isBalanced: boolean
}
