export type SaveMainCalculationInput = {
  totalToBill: number
}

export type MainCalculationDto = {
  id: number | null

  /** TOBIL — user enters */
  totalToBill: number
  /** SUDH — from period calculation interest (live) */
  interest: number
  /** LAPTOP / Bandak — sum(credit) of active v1 members (live) */
  bandak: number
  /** Jinish chara — sum(credit) of active MemberV2 records (live) */
  jinisChara: number
  /** CASH — from period left total (ToBill + Asol + Interest − Dewa) */
  cash: number

  /** VAL1 = totalToBill + interest */
  leftTotal: number
  /** VAL2 = bandak + jinisChara + cash */
  rightTotal: number
  difference: number
  isBalanced: boolean
}
