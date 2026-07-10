import * as React from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  AlertCircle,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  TableProperties,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'

import { SectionCard } from '@/components/patterns/section-card'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { MemberV2Row } from '@/features/member-v2/components/member-v2-list-panel'
import type { ImportMembersV2Input } from '@/features/member-v2/member-v2.schema'
import type {
  MemberV2CsvField,
  MemberV2PreviewRow,
} from '@/features/member-v2/types/member-v2-migration.types'
import { buildCsvPreview } from '@/features/member-v2/utils/csv-preview'
import {
  formatMoney,
  getInterest,
} from '@/features/member-v2/utils/formatters'
import { mapPreviewRowsToMembers } from '@/features/member-v2/utils/map-csv-rows'
import { readMemberV2CsvFromFile } from '@/features/member-v2/utils/read-member-v2-csv'

type CsvPreviewState = ReturnType<typeof buildCsvPreview>

type ImportResult = {
  deletedCount: number
  importedCount: number
  members: MemberV2Row[]
}

type MemberV2CsvImportProps = {
  existingCount: number
  onImport: (input: ImportMembersV2Input) => Promise<ImportResult>
  onImportComplete: () => Promise<void>
}

const CSV_FIELD_LABELS: Record<MemberV2CsvField, string> = {
  name: 'Name',
  amount: 'Credit',
  phoneNo: 'Mobile No',
  percent: 'Percentage',
  date: 'Date',
  type: 'Type',
  jinsis: 'Jinsis',
  remarks: 'Remarks',
}

const PREVIEW_COLUMNS: Array<{
  key: keyof MemberV2PreviewRow
  label: string
}> = [
  { key: 'name', label: 'Name' },
  { key: 'amount', label: 'Credit' },
  { key: 'percent', label: '%' },
  { key: 'phoneNo', label: 'Mobile' },
  { key: 'remarks', label: 'Remarks' },
  { key: 'date', label: 'Date' },
]

export function MemberV2CsvImport({
  existingCount,
  onImport,
  onImportComplete,
}: MemberV2CsvImportProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<
    (CsvPreviewState & { headerRow: number }) | null
  >(null)
  const [isParsing, setIsParsing] = React.useState(false)
  const [replaceExisting, setReplaceExisting] = React.useState(true)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [importResult, setImportResult] = React.useState<ImportResult | null>(
    null,
  )

  const importMutation = useMutation({
    mutationFn: async (input: ImportMembersV2Input) => {
      return await onImport(input)
    },
    onSuccess: async (result) => {
      setImportResult(result)
      setConfirmOpen(false)
      setFile(null)
      setPreview(null)
      if (inputRef.current) {
        inputRef.current.value = ''
      }

      toast.success(
        result.deletedCount > 0
          ? `Deleted ${result.deletedCount} and imported ${result.importedCount} members`
          : `Imported ${result.importedCount} members`,
      )

      await onImportComplete()
    },
    onError: (error) => {
      setConfirmOpen(false)
      toast.error(error.message || 'Failed to import members')
    },
  })

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null

    if (selected && !selected.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file.')
      event.target.value = ''
      setFile(null)
      setPreview(null)
      setImportResult(null)
      return
    }

    setFile(selected)
    setPreview(null)
    setImportResult(null)

    if (!selected) {
      return
    }

    setIsParsing(true)

    try {
      const { headers, rawRows, headerRow } =
        await readMemberV2CsvFromFile(selected)

      if (headers.length === 0) {
        toast.error('No headers found in CSV')
        return
      }

      if (rawRows.length === 0) {
        toast.error('No data rows found in CSV')
        return
      }

      setPreview({
        ...buildCsvPreview(headers, rawRows),
        headerRow,
      })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to read CSV file',
      )
      setFile(null)
      event.target.value = ''
    } finally {
      setIsParsing(false)
    }
  }

  const mappedMembers = preview
    ? mapPreviewRowsToMembers(preview.allRows)
    : null

  const canImport =
    preview !== null &&
    preview.missingFields.length === 0 &&
    mappedMembers !== null &&
    mappedMembers.members.length > 0 &&
    !importMutation.isPending

  function handleImportClick() {
    if (!mappedMembers || mappedMembers.members.length === 0) {
      toast.error('No valid rows to import')
      return
    }

    if (replaceExisting && existingCount > 0) {
      setConfirmOpen(true)
      return
    }

    runImport()
  }

  function runImport() {
    if (!mappedMembers) {
      return
    }

    importMutation.mutate({
      replaceExisting,
      members: mappedMembers.members,
    })
  }

  return (
    <>
      <SectionCard
        icon={FileSpreadsheet}
        iconVariant="chart2"
        title="CSV import & migrate"
        description="Upload a CSV, review all mapped rows, then import to the database. Optionally delete existing members first."
        footer={
          preview ? (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-3 text-sm">
                <Switch
                  checked={replaceExisting}
                  onCheckedChange={setReplaceExisting}
                  disabled={importMutation.isPending}
                />
                <span>
                  Delete all existing members before import
                  {existingCount > 0 ? (
                    <span className="text-muted-foreground">
                      {' '}
                      ({existingCount} currently in database)
                    </span>
                  ) : null}
                </span>
              </label>

              <Button
                type="button"
                className="btn-primary-glow w-full sm:w-auto"
                disabled={!canImport}
                aria-busy={importMutation.isPending}
                onClick={handleImportClick}
              >
                {importMutation.isPending ? <Spinner className="size-4" /> : null}
                {importMutation.isPending
                  ? 'Migrating…'
                  : replaceExisting
                    ? `Delete all & import ${mappedMembers?.members.length ?? 0}`
                    : `Import ${mappedMembers?.members.length ?? 0} members`}
              </Button>
            </div>
          ) : null
        }
        footerAlign="between"
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="member-v2-csv-upload" className="form-field-label">
              CSV file
            </Label>
            <Input
              ref={inputRef}
              id="member-v2-csv-upload"
              type="file"
              accept=".csv,text/csv"
              disabled={isParsing || importMutation.isPending}
              onChange={handleFileChange}
              className="cursor-pointer file:mr-3"
            />
            <p className="text-xs text-muted-foreground">
              Supports row-1 or legacy row-5 headers. Required columns: name and
              credit.
            </p>
          </div>

          {file ? (
            <div className="file-drop-hint surface-muted">
              <Upload className="size-4 shrink-0 text-chart-2" aria-hidden />
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {isParsing
                    ? 'Parsing file…'
                    : `${(file.size / 1024).toFixed(1)} KB · ${preview?.totalRows ?? 0} rows detected${preview ? ` · header on row ${preview.headerRow}` : ''}`}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No file selected yet. Choose a CSV to preview all rows before
              migrating to the database.
            </p>
          )}

          {preview ? (
            <div className="space-y-4">
              <CsvDetectedHeaders headers={preview.headers} />

              <CsvHeaderMap headerMap={preview.headerMap} />

              <CsvMissingFields missingFields={preview.missingFields} />

              {mappedMembers ? (
                <CsvImportSummary
                  totalRows={preview.totalRows}
                  validRows={mappedMembers.members.length}
                  skippedRows={mappedMembers.skipped}
                />
              ) : null}

              <CsvAllRowsTable rows={preview.allRows} />
            </div>
          ) : null}

          {importResult ? (
            <ImportedMembersTable result={importResult} />
          ) : null}
        </div>
      </SectionCard>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="surface-glass-modal">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all and import?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <span className="font-semibold text-foreground">
                {existingCount} existing member{existingCount === 1 ? '' : 's'}
              </span>{' '}
              and replace them with{' '}
              <span className="font-semibold text-foreground">
                {mappedMembers?.members.length ?? 0} members
              </span>{' '}
              from your CSV. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={importMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={importMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                runImport()
              }}
            >
              {importMutation.isPending ? (
                <>
                  <Spinner className="size-4" />
                  Migrating…
                </>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  Delete all & import
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function CsvImportSummary({
  totalRows,
  validRows,
  skippedRows,
}: {
  totalRows: number
  validRows: number
  skippedRows: number
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="stat-tile stat-tile-chart-1 text-left">
        <p className="text-xs font-medium text-muted-foreground">CSV rows</p>
        <p className="stat-value mt-1 text-xl font-bold">{totalRows}</p>
      </div>
      <div className="stat-tile stat-tile-chart-2 text-left">
        <p className="text-xs font-medium text-muted-foreground">Ready to import</p>
        <p className="stat-value mt-1 text-xl font-bold">{validRows}</p>
      </div>
      <div className="stat-tile stat-tile-chart-3 text-left">
        <p className="text-xs font-medium text-muted-foreground">Skipped</p>
        <p className="stat-value mt-1 text-xl font-bold">{skippedRows}</p>
      </div>
    </div>
  )
}

function CsvDetectedHeaders({ headers }: { headers: string[] }) {
  return (
    <div className="surface-muted space-y-3 p-4">
      <div className="flex items-center gap-2">
        <TableProperties className="size-4 text-chart-2" aria-hidden />
        <p className="text-sm font-semibold text-foreground">Detected headers</p>
        <Badge variant="outline" className="badge-primary-soft ml-auto">
          {headers.length} columns
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {headers.map((header) => (
          <Badge key={header} variant="outline" className="font-normal">
            {header || '(empty)'}
          </Badge>
        ))}
      </div>
    </div>
  )
}

function CsvHeaderMap({
  headerMap,
}: {
  headerMap: CsvPreviewState['headerMap']
}) {
  const mappedFields = (
    Object.entries(CSV_FIELD_LABELS) as Array<[MemberV2CsvField, string]>
  ).map(([field, label]) => ({
    field,
    label,
    csvHeader: headerMap[field],
  }))

  return (
    <div className="data-table-wrap">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>App field</TableHead>
            <TableHead>CSV column</TableHead>
            <TableHead className="w-[100px] text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mappedFields.map(({ field, label, csvHeader }) => (
            <TableRow key={field}>
              <TableCell className="font-medium">{label}</TableCell>
              <TableCell className="text-muted-foreground">
                {csvHeader ?? '—'}
              </TableCell>
              <TableCell className="text-right">
                {csvHeader ? (
                  <Badge variant="outline" className="badge-accent">
                    Mapped
                  </Badge>
                ) : (
                  <Badge variant="outline" className="badge-type-unknown">
                    Missing
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function CsvMissingFields({
  missingFields,
}: {
  missingFields: MemberV2CsvField[]
}) {
  if (missingFields.length === 0) {
    return (
      <div className="recon-banner recon-banner-ok">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          <p className="text-sm font-medium">
            All required fields are mapped. Ready to migrate.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="recon-banner recon-banner-bad">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="text-sm font-medium">Missing required fields</p>
            <p className="mt-0.5 text-xs opacity-90">
              Import is disabled until these columns are detected in your CSV.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {missingFields.map((field) => (
            <Badge key={field} variant="outline" className="recon-badge">
              {CSV_FIELD_LABELS[field]}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

function CsvAllRowsTable({ rows }: { rows: MemberV2PreviewRow[] }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">All CSV rows</p>
        <p className="text-xs text-muted-foreground">{rows.length} rows total</p>
      </div>

      <div className="data-table-wrap csv-preview-table-wrap csv-import-scroll">
        <Table className="csv-preview-table">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[3rem]">#</TableHead>
              {PREVIEW_COLUMNS.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="text-muted-foreground tabular-nums">
                  {index + 1}
                </TableCell>
                {PREVIEW_COLUMNS.map((column) => (
                  <TableCell
                    key={column.key}
                    className="csv-preview-cell align-top"
                    title={row[column.key]?.trim() || undefined}
                  >
                    {row[column.key]?.trim() || '—'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function ImportedMembersTable({ result }: { result: ImportResult }) {
  const totalCredit = result.members.reduce((sum, member) => {
    return sum + member.credit
  }, 0)

  const totalInterest = result.members.reduce((sum, member) => {
    return sum + getInterest(member.credit, member.percentage)
  }, 0)

  return (
    <div className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--glass-border-subtle)] bg-[var(--glass-bg-strong)] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="icon-tile icon-tile-accent">
            <Database className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Imported to database</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.deletedCount > 0
                ? `Deleted ${result.deletedCount} existing · `
                : null}
              Imported {result.importedCount} member
              {result.importedCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <Badge variant="outline" className="badge-accent">
          {result.importedCount} saved
        </Badge>
      </div>

      <div className="data-table-wrap csv-preview-table-wrap csv-import-scroll">
        <Table className="csv-preview-table">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[3rem]">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Credit</TableHead>
              <TableHead>%</TableHead>
              <TableHead>Interest</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.members.map((member, index) => (
              <TableRow key={member.id}>
                <TableCell className="text-muted-foreground tabular-nums">
                  {index + 1}
                </TableCell>
                <TableCell className="font-semibold">{member.name}</TableCell>
                <TableCell className="tabular-nums">
                  {formatMoney(member.credit)}
                </TableCell>
                <TableCell className="tabular-nums">{member.percentage}%</TableCell>
                <TableCell className="font-semibold text-primary tabular-nums">
                  {formatMoney(getInterest(member.credit, member.percentage))}
                </TableCell>
                <TableCell>{member.mobileNo || '—'}</TableCell>
                <TableCell className="max-w-[180px] truncate">
                  {member.remarks || '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="tabular-nums">{formatMoney(totalCredit)}</TableCell>
              <TableCell />
              <TableCell className="tabular-nums">
                {formatMoney(Math.round(totalInterest))}
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}
