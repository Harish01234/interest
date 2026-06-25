import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RotateCcw } from 'lucide-react'
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

export function StartFreshCalculationButton() {
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
      toast.success('All calculations reset')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to reset')
    },
  })

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={resetMutation.isPending}
        onClick={() => setOpen(true)}
      >
        <RotateCcw className="size-4" />
        Start fresh
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start fresh?</AlertDialogTitle>
            <AlertDialogDescription>
              This clears the main calculation (TOBIL, Jinish chara) and the
              period calculation (Total to bill, manual Asol/Interest/Dewa, cash
              inputs, and period start). Member records are not changed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={resetMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                resetMutation.mutate()
              }}
            >
              {resetMutation.isPending ? <Spinner className="size-4" /> : null}
              Start fresh
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
