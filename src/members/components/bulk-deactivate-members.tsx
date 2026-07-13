import { useState } from 'react'
import { Loader2, UserRoundX } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { deactivateMembersBySlNos } from '@/members/member'

export function BulkDeactivateMembers() {
  const [input, setInput] = useState('')
  const [isPending, setIsPending] = useState(false)

  function getSlNos() {
    return [
      ...new Set(
        input
          .split(/[\n,;]+/)
          .map((slNo) => slNo.trim())
          .filter(Boolean),
      ),
    ]
  }

  async function handleDeactivate() {
    const slNos = getSlNos()

    if (slNos.length === 0) {
      toast.error('Please enter at least one serial number')
      return
    }

    setIsPending(true)

    try {
      const result = await deactivateMembersBySlNos({
        data: {
          slNos,
        },
      })

      toast.success(
        `${result.deactivatedCount} member${
          result.deactivatedCount === 1 ? '' : 's'
        } deactivated`,
      )

      setInput('')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to deactivate members',
      )
    } finally {
      setIsPending(false)
    }
  }

  const slNoCount = getSlNos().length

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Bulk Deactivate Members</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sl-nos">Member serial numbers</Label>

          <Textarea
            id="sl-nos"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={`Enter one serial number per line:\n\n101\n102\n103\n\nYou can also use commas: 101, 102, 103`}
            className="min-h-48"
            disabled={isPending}
          />

          <p className="text-sm text-muted-foreground">
            {slNoCount} unique serial number
            {slNoCount === 1 ? '' : 's'} detected.
          </p>
        </div>

        <Button
          type="button"
          variant="destructive"
          onClick={handleDeactivate}
          disabled={isPending || slNoCount === 0}
          className="gap-2"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UserRoundX className="size-4" />
          )}

          {isPending
            ? 'Deactivating...'
            : `Deactivate ${slNoCount || ''} Members`}
        </Button>
      </CardContent>
    </Card>
  )
}