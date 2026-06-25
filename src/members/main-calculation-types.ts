export type SaveMainCalculationInput = {
  totalToBill: number
  jinisChara: number
}

export type MainCalculationDto = {
  id: number | null

  /** TOBIL — user enters */
  totalToBill: number
  /** SUDH — from period calculation interest (live) */
  interest: number
  /** LAPTOP / Bandak — sum(credit) of active members (live) */
  bandak: number
  /** Jinish chara — user enters */
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
