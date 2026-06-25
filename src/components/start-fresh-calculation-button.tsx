import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { resetAllCalculations } from '@/members/calculation'
import { calculationQueryOptions } from '@/members/calculation-queries'
import { mainCalculationQueryOptions } from '@/members/main-calculation-queries'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export function ClearAllCalculationsButton() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const resetMutation = useMutation({
    mutationFn: () => resetAllCalculations(),
    onSuccess: ({ calculation, mainCalculation }) => {
      queryClient.setQueryData(calculationQueryOptions.queryKey, calculation)
      queryClient.setQueryData(
        mainCalculationQueryOptions.queryKey,
        mainCalculation,
      )
      setOpen(false)
      toast.success('All calculations cleared')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to clear')
    },
  })

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={resetMutation.isPending}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
        Clear all calculations
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all calculations?</AlertDialogTitle>
            <AlertDialogDescription>
              This resets the period sheet (TOBILL, cash, manual Asol/Sudh/Dewa)
              and the main sheet (TOBIL, Jinish chara). The active period will
              end. Member records are not changed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetMutation.isPending}>
              Keep current data
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={resetMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                resetMutation.mutate()
              }}
            >
              {resetMutation.isPending ? <Spinner className="size-4" /> : null}
              Yes, clear everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/** @deprecated Use ClearAllCalculationsButton */
export const StartFreshCalculationButton = ClearAllCalculationsButton
