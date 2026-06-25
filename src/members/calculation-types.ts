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
  manualAsol: number
  manualInterest: number
  manualDewa: number
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

  /** User-entered base for Asol */
  manualAsol: number
  /** User-entered base for Interest */
  manualInterest: number
  /** User-entered base for Dewa */
  manualDewa: number

  // period anchor
  periodStartedAt: Date | null

  /** From settled members this period */
  memberAsol: number
  /** From settled members this period */
  memberInterest: number
  /** From added members this period */
  memberDewa: number

  /** manual + member totals */
  asol: number
  interest: number
  dewa: number

  // member breakdown behind the derived numbers
  settledMembers: CalculationMemberRow[]
  addedMembers: CalculationMemberRow[]

  // reconciliation
  leftTotal: number
  rightTotal: number
  difference: number
  isBalanced: boolean
}
