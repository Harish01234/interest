import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CalendarClock,
  Coins,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'

import type { MemberType } from '@/lib/read-csv'
import { MetricCard } from '@/components/patterns/metric-card'
import { SectionCard } from '@/components/patterns/section-card'
import {
  MembersFilterPanel,
  pageSizeOptions,
  typeFilterOptions,
  type TypeFilter,
} from '@/components/members-filter-panel'
import {
  createMember,
  deleteMember,
  updateMember,
} from '@/members/member'
import type { MemberDto } from '@/members/types'
import { deleteAllMembers } from '@/members/migration'
import {
  creditSumQueryKey,
  creditSumQueryOptions,
  membersQueryKey,
  membersQueryOptions,
} from '@/members/queries'
import { calculationQueryKey } from '@/members/calculation-queries'
import { mainCalculationQueryKey } from '@/members/main-calculation-queries'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const typeBadgeClass: Record<MemberType, string> = {
  gold: 'badge-type-gold',
  silver: 'badge-type-silver',
  both: 'badge-type-both',
  unknown: 'badge-type-unknown',
}

function MemberTypeBadge({ type }: { type: MemberType }) {
  return (
    <Badge variant="outline" className={cn('capitalize', typeBadgeClass[type])}>
      {type}
    </Badge>
  )
}

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items: Array<number | 'ellipsis'> = [1]

  if (currentPage > 3) {
    items.push('ellipsis')
  }

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let page = start; page <= end; page += 1) {
    items.push(page)
  }

  if (currentPage < totalPages - 2) {
    items.push('ellipsis')
  }

  items.push(totalPages)
  return items
}

type MemberFormState = {
  slNo: string
  name: string
  fatherName: string
  credit: string
  date: string
  phoneNo: string
  type: MemberType
  jinsis: string
}

function emptyMemberForm(): MemberFormState {
  return {
    slNo: '',
    name: '',
    fatherName: '',
    credit: '',
    date: '',
    phoneNo: '',
    type: 'unknown',
    jinsis: '',
  }
}

const memberFormFields = [
  { key: 'slNo' as const, label: 'Sl no', required: true },
  { key: 'name' as const, label: 'Name', required: true },
  { key: 'fatherName' as const, label: "Father's name", required: true },
  { key: 'phoneNo' as const, label: 'Phone', required: true },
  { key: 'credit' as const, label: 'Credit', required: true },
  { key: 'date' as const, label: 'Date', required: true },
  { key: 'jinsis' as const, label: 'Jinsis', required: false },
]

function AddMemberDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [form, setForm] = useState<MemberFormState>(emptyMemberForm())

  useEffect(() => {
    if (open) {
      setForm(emptyMemberForm())
    }
  }, [open])

  const createMutation = useMutation({
    mutationFn: () =>
      createMember({
        data: {
          slNo: form.slNo.trim(),
          name: form.name.trim(),
          fatherName: form.fatherName.trim(),
          credit: form.credit.trim(),
          date: form.date.trim(),
          phoneNo: form.phoneNo.trim(),
          type: form.type,
          jinsis: form.jinsis.trim() || undefined,
        },
      }),
    onSuccess: () => {
      toast.success('Member added')
      onCreated()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add member')
    },
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (createMutation.isPending) {
      return
    }

    const missing = memberFormFields
      .filter((field) => field.required && !form[field.key].trim())
      .map((field) => field.label)

    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(', ')}`)
      return
    }

    createMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>
            Create a new member record manually.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">Type</Label>
            <Select
              value={form.type}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  type: value as MemberType,
                }))
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeFilterOptions
                  .filter((option) => option.value !== 'all')
                  .map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="form-field-grid divide-y">
            {memberFormFields.map((field) => (
              <div key={field.key} className="form-field-row">
                <Label htmlFor={`add-${field.key}`} className="form-field-label">
                  {field.label}
                  {field.required ? (
                    <span className="form-field-required"> *</span>
                  ) : null}
                </Label>
                <Input
                  id={`add-${field.key}`}
                  value={form[field.key]}
                  disabled={createMutation.isPending}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                  placeholder={
                    field.key === 'credit' ? 'e.g. ₹ 5,000.00' : undefined
                  }
                />
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} aria-busy={createMutation.isPending}>
              {createMutation.isPending ? <Spinner className="size-4" /> : null}
              {createMutation.isPending ? 'Adding…' : 'Add member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function memberToForm(member: MemberDto): MemberFormState {
  return {
    slNo: member.slNo,
    name: member.name,
    fatherName: member.fatherName,
    credit: member.credit,
    date: member.date,
    phoneNo: member.phoneNo,
    type: member.type,
    jinsis: member.jinsis ?? '',
  }
}

function formatDateTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function MemberDetailDialog({
  member,
  open,
  onOpenChange,
  onUpdated,
  onDeleted,
}: {
  member: MemberDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: () => void
  onDeleted: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteInterest, setDeleteInterest] = useState('')
  const [form, setForm] = useState<MemberFormState | null>(null)

  useEffect(() => {
    if (member) {
      setForm(memberToForm(member))
      setIsEditing(false)
      setDeleteOpen(false)
      setDeleteInterest('')
    }
  }, [member])

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!member || !form) {
        throw new Error('Member form is not ready.')
      }

      return updateMember({
        data: {
          id: member.id,
          slNo: form.slNo,
          name: form.name,
          fatherName: form.fatherName,
          credit: form.credit,
          date: form.date,
          phoneNo: form.phoneNo,
          type: form.type,
          jinsis: form.jinsis || undefined,
        },
      })
    },
    onSuccess: () => {
      toast.success('Member updated')
      setIsEditing(false)
      onUpdated()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update member')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!member) {
        throw new Error('Member not found.')
      }

      const interestValue = Number.parseInt(deleteInterest.trim() || '0', 10)

      return deleteMember({
        data: {
          id: member.id,
          interest: Number.isFinite(interestValue) ? Math.max(0, interestValue) : 0,
        },
      })
    },
    onSuccess: () => {
      toast.success('Member deleted')
      setDeleteOpen(false)
      onDeleted()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete member')
    },
  })

  if (!member || !form) {
    return null
  }

  const fields = memberFormFields

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit member' : member.name}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update member details and save changes.'
                : `Member details for sl no ${member.slNo}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Type</span>
              {isEditing ? (
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm((current) =>
                      current
                        ? { ...current, type: value as MemberType }
                        : current,
                    )
                  }
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeFilterOptions
                      .filter((option) => option.value !== 'all')
                      .map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <MemberTypeBadge type={member.type} />
              )}
            </div>

            <div className="form-field-grid divide-y">
              {fields.map((field) => (
                <div key={field.key} className="form-field-row">
                  <Label className="form-field-label">{field.label}</Label>
                  {isEditing ? (
                    <Input
                      value={form[field.key]}
                      disabled={updateMutation.isPending}
                      onChange={(event) =>
                        setForm((current) =>
                          current
                            ? { ...current, [field.key]: event.target.value }
                            : current,
                        )
                      }
                    />
                  ) : (
                    <span className="text-sm wrap-break-word text-foreground">
                      {form[field.key] || '—'}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {!isEditing ? (
              <div className="member-audit">
                <div className="member-audit-row">
                  <UserRound className="size-4 text-muted-foreground" aria-hidden />
                  <span className="text-muted-foreground">Added by</span>
                  <span className="font-medium text-foreground">
                    {member.createdBy?.name ?? 'Unknown'}
                  </span>
                  {member.createdBy?.email ? (
                    <span className="text-xs text-muted-foreground">
                      ({member.createdBy.email})
                    </span>
                  ) : null}
                </div>
                <div className="member-audit-row">
                  <CalendarClock
                    className="size-4 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="text-muted-foreground">Added on</span>
                  <span className="font-medium text-foreground">
                    {formatDateTime(member.createdAt)}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setForm(memberToForm(member))
                      setIsEditing(false)
                    }}
                  >
                    Cancel edit
                  </Button>
                  <Button
                    type="button"
                    disabled={updateMutation.isPending}
                    onClick={() => updateMutation.mutate()}
                  >
                    {updateMutation.isPending ? <Spinner className="size-4" /> : null}
                    Save changes
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="size-4" />
                    Edit member
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="size-4" />
                    Delete member
                  </Button>
                </>
              )}
            </div>
            {!isEditing ? <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button> : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Settle &amp; delete this member?</AlertDialogTitle>
            <AlertDialogDescription>
              {member.name} (sl no {member.slNo}) will be removed from the list and
              excluded from credit totals. Enter the interest collected at
              settlement — this counts toward the current period.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-1">
            <Label htmlFor="delete-interest">Interest collected</Label>
            <Input
              id="delete-interest"
              type="number"
              inputMode="numeric"
              min={0}
              value={deleteInterest}
              disabled={deleteMutation.isPending}
              onChange={(event) => setDeleteInterest(event.target.value)}
              placeholder="0"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  deleteMutation.mutate()
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank for 0. Member credit ({member.credit}) becomes Asol.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                deleteMutation.mutate()
              }}
            >
              {deleteMutation.isPending ? <Spinner className="size-4" /> : null}
              Settle &amp; delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function MembersPanel() {
  const queryClient = useQueryClient()
  const [slNoFilter, setSlNoFilter] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [fatherNameFilter, setFatherNameFilter] = useState('')
  const [creditFilter, setCreditFilter] = useState('')
  const [debouncedFilters, setDebouncedFilters] = useState({
    slNo: '',
    name: '',
    fatherName: '',
    credit: '',
  })
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [activeFilter, setActiveFilter] = useState(true)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<(typeof pageSizeOptions)[number]>(10)
  const [selectedMember, setSelectedMember] = useState<MemberDto | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedFilters({
        slNo: slNoFilter,
        name: nameFilter,
        fatherName: fatherNameFilter,
        credit: creditFilter,
      })
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [slNoFilter, nameFilter, fatherNameFilter, creditFilter])

  const queryParams = useMemo(
    () => ({
      page,
      pageSize,
      slNo: debouncedFilters.slNo,
      name: debouncedFilters.name,
      fatherName: debouncedFilters.fatherName,
      credit: debouncedFilters.credit,
      type: typeFilter,
      active: activeFilter,
    }),
    [page, pageSize, debouncedFilters, typeFilter,activeFilter],
  )

  const { data, isLoading, isFetching, error, refetch } = useQuery(
    membersQueryOptions(queryParams),
  )

  const { data: creditData, isLoading: isCreditLoading } = useQuery(
    creditSumQueryOptions,
  )

  const invalidateMembers = () => {
    queryClient.invalidateQueries({ queryKey: membersQueryKey })
    queryClient.invalidateQueries({ queryKey: creditSumQueryKey })
    queryClient.invalidateQueries({ queryKey: calculationQueryKey })
    queryClient.invalidateQueries({ queryKey: mainCalculationQueryKey })
  }

  const deleteAllMutation = useMutation({
    mutationFn: () => deleteAllMembers(),
    onSuccess: (result) => {
      toast.success(`Deleted ${result.count} member${result.count === 1 ? '' : 's'}`)
      invalidateMembers()
      setDeleteAllOpen(false)
      setPage(1)
    },
    onError: (deleteError) => {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to delete members',
      )
    },
  })

  const members = data?.members ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const allMembersCount = creditData?.count ?? total
  const pageCreditFormatted = data?.pageCreditFormatted ?? '0'
  const filteredCreditFormatted = data?.filteredCreditFormatted ?? '0'
  const paginationItems = getPaginationItems(page, totalPages)

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  const activeFilterCount = [
    debouncedFilters.slNo.trim(),
    debouncedFilters.name.trim(),
    debouncedFilters.fatherName.trim(),
    debouncedFilters.credit.trim(),
  ].filter(Boolean).length

  const hasSearchFilters = activeFilterCount > 0
  const hasAnyFilters = hasSearchFilters || typeFilter !== 'all'

  const clearSearchFilters = () => {
    setSlNoFilter('')
    setNameFilter('')
    setFatherNameFilter('')
    setCreditFilter('')
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        icon={Coins}
        iconVariant="chart1"
        title="Grand total credit"
        description="Sum of all member credits across the full database."
      >
        <MetricCard
          label="Total credit balance"
          value={creditData?.formatted ?? '₹ 0.00'}
          hint={`Across ${creditData?.count ?? 0} member${(creditData?.count ?? 0) === 1 ? '' : 's'}`}
          loading={isCreditLoading}
        />
      </SectionCard>

      <SectionCard
        icon={Users}
        iconVariant="primary"
        title="Members"
        description="Browse, search, edit, and manage imported member records."
        actions={
          <Button
            type="button"
            className="btn-primary-glow shrink-0"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-4" />
            Add member
          </Button>
        }
        footer={
          <Button
            type="button"
            variant="destructive"
            disabled={allMembersCount === 0 || deleteAllMutation.isPending}
            aria-busy={deleteAllMutation.isPending}
            onClick={() => setDeleteAllOpen(true)}
          >
            <Trash2 className="size-4" />
            Delete all members
          </Button>
        }
        footerAlign="between"
        bodyClassName="space-y-4"
      >
        <MembersFilterPanel
          active={activeFilter}
          slNo={slNoFilter}
          name={nameFilter}
          fatherName={fatherNameFilter}
          credit={creditFilter}
          type={typeFilter}
          pageSize={pageSize}
          onSlNoChange={setSlNoFilter}
          onNameChange={setNameFilter}
          onFatherNameChange={setFatherNameFilter}
          onCreditChange={setCreditFilter}
          onTypeChange={(value) => {
            setTypeFilter(value)
            setPage(1)
          }}
          onPageSizeChange={(value) => {
            setPageSize(value)
            setPage(1)
          }}
          onClearFilters={clearSearchFilters}
          onActiveChange={(value) => {
            setActiveFilter(value)
            setPage(1)
          }}
        />

        <div className="meta-bar">
          <span className="text-muted-foreground">
            Showing {rangeStart}–{rangeEnd} of {total} members
            {activeFilterCount > 0 ? (
              <span className="text-foreground/80">
                {' '}
                · {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'}{' '}
                applied
              </span>
            ) : null}
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="meta-stat">
              Filtered subtotal:{' '}
              <span className="meta-stat-value">{filteredCreditFormatted}</span>
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isFetching}
              aria-busy={isFetching}
              onClick={() => refetch()}
            >
              {isFetching ? (
                <Spinner className="size-4" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Refresh list
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-panel" role="status" aria-label="Loading members">
            <Spinner className="size-6 text-primary" />
          </div>
        ) : error ? (
          <Empty className="surface-muted border border-dashed py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>Could not load members</EmptyTitle>
              <EmptyDescription>
                {error instanceof Error
                  ? error.message
                  : 'Something went wrong while fetching members.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : members.length === 0 ? (
          <Empty className="surface-muted border border-dashed py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>
                {total === 0 && !hasAnyFilters
                  ? 'No members yet'
                  : 'No matches found'}
              </EmptyTitle>
              <EmptyDescription>
                {total === 0 && !hasAnyFilters
                  ? 'Import a CSV file or add a member manually to get started.'
                  : 'Try different sl no, name, father\'s name, or credit filters.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="data-table-wrap">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sl no</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Father&apos;s name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Added by</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                  >
                    <TableCell className="font-medium">{member.slNo}</TableCell>
                    <TableCell>{member.name}</TableCell>
                    <TableCell className="max-w-48 truncate">
                      {member.fatherName}
                    </TableCell>
                    <TableCell>{member.phoneNo}</TableCell>
                    <TableCell>
                      <MemberTypeBadge type={member.type} />
                    </TableCell>
                    <TableCell className="max-w-40 truncate text-muted-foreground">
                      {member.createdBy?.name ?? 'Unknown'}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {member.credit}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label={`View details for ${member.name}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelectedMember(member)
                        }}
                      >
                        <Eye className="size-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6}>Page subtotal</TableCell>
                  <TableCell className="text-right text-chart-1 tabular-nums">
                    {pageCreditFormatted}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}

        {totalPages > 1 ? (
          <Pagination className="justify-center pt-1" aria-label="Members pagination">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()
                    if (page > 1) setPage(page - 1)
                  }}
                  className={cn(page <= 1 && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>

              {paginationItems.map((item, index) =>
                item === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href="#"
                      isActive={item === page}
                      onClick={(event) => {
                        event.preventDefault()
                        setPage(item)
                      }}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()
                    if (page < totalPages) setPage(page + 1)
                  }}
                  className={cn(
                    page >= totalPages && 'pointer-events-none opacity-50',
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </SectionCard>

      <AddMemberDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={invalidateMembers}
      />

      <MemberDetailDialog
        member={selectedMember}
        open={selectedMember !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMember(null)
          }
        }}
        onUpdated={invalidateMembers}
        onDeleted={() => {
          invalidateMembers()
          if (members.length === 1 && page > 1) {
            setPage(page - 1)
          }
        }}
      />

      <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all members?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete every member record from the database,
              including any previously removed ones. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAllMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteAllMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                deleteAllMutation.mutate()
              }}
            >
              {deleteAllMutation.isPending ? <Spinner className="size-4" /> : null}
              Delete all members
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
