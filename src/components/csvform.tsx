import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { FileSpreadsheet, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { readMemberCsvFromFile, type MemberRecord } from '@/lib/read-csv'
import { migrateMembers } from '@/members/migration'
import { membersQueryKey } from '@/members/queries'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

export function CsvForm() {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<MemberRecord[]>([])
  const [isMigrating, setIsMigrating] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [migratedCount, setMigratedCount] = useState(0)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null

    if (selected && !selected.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file.')
      event.target.value = ''
      setFile(null)
      setRows([])
      return
    }

    setFile(selected)
    setRows([])
  }

  const handleMigrate = async () => {
    if (!file) {
      toast.error('Upload a CSV file before migrating.')
      return
    }

    setIsMigrating(true)

    try {
      const data = await readMemberCsvFromFile(file)

      if (data.length === 0) {
        toast.error('No member rows found in CSV')
        setRows([])
        return
      }

      setRows(data)

      const result = await migrateMembers({ data: { members: data } })
      setMigratedCount(result.count)
      setSuccessOpen(true)
      await queryClient.invalidateQueries({ queryKey: membersQueryKey })
      toast.success(`Migrated ${result.count} member${result.count === 1 ? '' : 's'}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to migrate members',
      )
      setRows([])
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <>
      <Card className="surface-card gap-0 py-0">
      <CardHeader className="gap-3">
        <div className="icon-tile icon-tile-chart-2 mb-1">
          <FileSpreadsheet className="size-4.5" />
        </div>
        <CardTitle className="text-base font-semibold">CSV import</CardTitle>
        <CardDescription>
          Upload a CSV file and run migration when you are ready.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pb-2">
        <div className="space-y-2">
          <Label htmlFor="csv-upload">CSV file</Label>
          <Input
            ref={inputRef}
            id="csv-upload"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="cursor-pointer file:mr-3"
          />
        </div>

        {file ? (
          <div className="surface-muted flex items-center gap-3 px-4 py-3 text-sm">
            <Upload className="size-4 shrink-0 text-chart-2" aria-hidden />
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No file selected yet.
          </p>
        )}

        {rows.length > 0 ? (
          <p className="text-sm text-chart-2">
            {rows.length} member row{rows.length === 1 ? '' : 's'} parsed
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="border-t border-border bg-muted/40 py-4">
        <Button
          type="button"
          className="btn-primary-glow w-full sm:w-auto"
          disabled={isMigrating}
          onClick={handleMigrate}
        >
          {isMigrating ? <Spinner className="size-4" /> : null}
          Migrate
        </Button>
      </CardFooter>
      </Card>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Migration complete</DialogTitle>
            <DialogDescription>
              Your CSV data has been imported into the database.
            </DialogDescription>
          </DialogHeader>

          <div className="surface-muted rounded-lg border border-border px-4 py-3 text-sm">
            <p className="font-medium text-foreground">
              {migratedCount} member{migratedCount === 1 ? '' : 's'} added
            </p>
            <p className="mt-1 text-muted-foreground">
              The members list below has been refreshed automatically.
            </p>
          </div>

          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </>
  )
}
