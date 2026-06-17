import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Coins,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'

import type { MemberType } from '@/lib/read-csv'
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
import type { GetMembersParams } from '@/members/types'
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

const typeFilterOptions = [
  { value: 'all', label: 'All types' },
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'both', label: 'Both' },
  { value: 'unknown', label: 'Unknown' },
] as const

const pageSizeOptions = [10, 20, 50] as const

type TypeFilter = GetMembersParams['type']

const typeBadgeClass: Record<MemberType, string> = {
  gold: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  silver: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
  both: 'bg-primary/15 text-primary',
  unknown: 'bg-muted text-muted-foreground',
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

          <div className="surface-muted divide-y rounded-lg border border-border">
            {memberFormFields.map((field) => (
              <div
                key={field.key}
                className="grid gap-2 px-4 py-3 sm:grid-cols-[140px_1fr]"
              >
                <Label htmlFor={`add-${field.key}`} className="text-sm font-medium">
                  {field.label}
                  {field.required ? (
                    <span className="text-destructive"> *</span>
                  ) : null}
                </Label>
                <Input
                  id={`add-${field.key}`}
                  value={form[field.key]}
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
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Spinner className="size-4" /> : null}
              Add member
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
  const [form, setForm] = useState<MemberFormState | null>(null)

  useEffect(() => {
    if (member) {
      setForm(memberToForm(member))
      setIsEditing(false)
      setDeleteOpen(false)
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

      return deleteMember({ data: { id: member.id } })
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

            <div className="surface-muted divide-y rounded-lg border border-border">
              {fields.map((field) => (
                <div
                  key={field.key}
                  className="grid gap-2 px-4 py-3 sm:grid-cols-[140px_1fr]"
                >
                  <Label className="text-sm font-medium text-muted-foreground">
                    {field.label}
                  </Label>
                  {isEditing ? (
                    <Input
                      value={form[field.key]}
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
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="size-4" />
                    Delete
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
            <AlertDialogTitle>Delete this member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {member.name} (sl no {member.slNo}).
            </AlertDialogDescription>
          </AlertDialogHeader>
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
              Delete member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function MembersPanel() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<(typeof pageSizeOptions)[number]>(10)
  const [selectedMember, setSelectedMember] = useState<MemberDto | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [search])

  const queryParams = useMemo(
    () => ({
      page,
      pageSize,
      search: debouncedSearch,
      type: typeFilter,
    }),
    [page, pageSize, debouncedSearch, typeFilter],
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

  return (
    <>
      <Card className="surface-card gap-0 py-0">
        <CardHeader className="gap-3">
          <div className="icon-tile icon-tile-chart-1 mb-1">
            <Coins className="size-4.5" />
          </div>
          <CardTitle className="text-base font-semibold">Grand total credit</CardTitle>
          <CardDescription>
            Sum of all member credits across the full database.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="stat-tile stat-tile-chart-1 px-4 py-5">
            {isCreditLoading ? (
              <Spinner className="size-5 text-primary" />
            ) : (
              <>
                <p className="stat-value text-2xl font-semibold">
                  {creditData?.formatted ?? '0'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Across {creditData?.count ?? 0} member
                  {(creditData?.count ?? 0) === 1 ? '' : 's'}
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="surface-card gap-0 py-0">
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="icon-tile icon-tile-primary mb-1">
                <Users className="size-4.5" />
              </div>
              <CardTitle className="text-base font-semibold">Members</CardTitle>
              <CardDescription>
                Browse, search, edit, and manage imported member records.
              </CardDescription>
            </div>
            <Button
              type="button"
              className="btn-primary-glow shrink-0"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="size-4" />
              Add member
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-2">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, phone, sl no, credit..."
                className="pl-9"
              />
            </div>

            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value as TypeFilter)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full lg:w-44">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {typeFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value) as (typeof pageSizeOptions)[number])
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full lg:w-36">
                <SelectValue placeholder="Rows per page" />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              Showing {rangeStart}-{rangeEnd} of {total} members
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-medium text-foreground">
                Filtered subtotal:{' '}
                <span className="text-chart-1">{filteredCreditFormatted}</span>
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isFetching}
                onClick={() => refetch()}
              >
                {isFetching ? <Spinner className="size-4" /> : <RefreshCw className="size-4" />}
                Refresh
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner className="size-6 text-primary" />
            </div>
          ) : error ? (
            <Empty className="surface-muted border border-dashed">
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
            <Empty className="surface-muted border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users />
                </EmptyMedia>
                <EmptyTitle>
                  {total === 0 && !debouncedSearch && typeFilter === 'all'
                    ? 'No members yet'
                    : 'No matches found'}
                </EmptyTitle>
                <EmptyDescription>
                  {total === 0 && !debouncedSearch && typeFilter === 'all'
                    ? 'Import a CSV file to populate member records.'
                    : 'Try a different search term or type filter.'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="surface-muted rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sl no</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Father&apos;s name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Credit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow
                      key={member.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedMember(member)}
                    >
                      <TableCell className="font-medium">{member.slNo}</TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.fatherName}</TableCell>
                      <TableCell>{member.phoneNo}</TableCell>
                      <TableCell>
                        <MemberTypeBadge type={member.type} />
                      </TableCell>
                      <TableCell>{member.credit}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation()
                            setSelectedMember(member)
                          }}
                        >
                          <Eye className="size-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-muted/60 font-medium">
                    <TableCell colSpan={5}>Page subtotal</TableCell>
                    <TableCell className="text-chart-1">{pageCreditFormatted}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}

          {totalPages > 1 ? (
            <Pagination className="justify-center pt-2">
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
        </CardContent>

        <CardFooter className="border-t border-border bg-muted/40 py-4">
          <Button
            type="button"
            variant="destructive"
            disabled={allMembersCount === 0 || deleteAllMutation.isPending}
            onClick={() => setDeleteAllOpen(true)}
          >
            <Trash2 className="size-4" />
            Delete all members
          </Button>
        </CardFooter>
      </Card>

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
              This will permanently remove all {allMembersCount} member records from the
              database. This action cannot be undone.
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
              Delete all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
