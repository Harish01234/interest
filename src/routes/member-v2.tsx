import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import {
  MemberV2AddForm,
  type MemberFormState,
} from '@/features/member-v2/components/member-v2-add-form'
import { MemberV2CsvImport } from '@/features/member-v2/components/member-v2-csv-import'
import { MemberV2DeleteDialog } from '@/features/member-v2/components/member-v2-delete-dialog'
import {
  MemberV2EditDialog,
  type EditFormState,
} from '@/features/member-v2/components/member-v2-edit-dialog'
import { MemberV2InfoPanel } from '@/features/member-v2/components/member-v2-info-panel'
import {
  MemberV2ListPanel,
  type MemberV2Row,
  type StatusFilter,
} from '@/features/member-v2/components/member-v2-list-panel'
import { MemberV2StatsGrid } from '@/features/member-v2/components/member-v2-stats-section'
import {
  createMemberV2,
  deleteAllMemberV2,
  deleteMemberV2,
  getMemberV2Summary,
  importMembersV2,
  listMemberV2,
  toggleMemberV2Active,
  updateMemberV2,
} from '@/features/member-v2/member-v2.functions'
import {
  getInterest,
  toDateInputValue,
  toNumber,
} from '@/features/member-v2/utils/formatters'

export const Route = createFileRoute('/member-v2')({
  component: MemberV2Page,
})

type MemberV2Summary = {
  totalMembers: number
  totalCredit: number
  totalInterest: number
}

const emptyForm: MemberFormState = {
  name: '',
  credit: '',
  percentage: '0',
  mobileNo: '',
  date: new Date().toISOString().slice(0, 10),
  remarks: '',
}

function MemberV2Page() {
  const queryClient = useQueryClient()

  const listFn = useServerFn(listMemberV2)
  const summaryFn = useServerFn(getMemberV2Summary)
  const createFn = useServerFn(createMemberV2)
  const updateFn = useServerFn(updateMemberV2)
  const deleteFn = useServerFn(deleteMemberV2)
  const toggleFn = useServerFn(toggleMemberV2Active)
  const importFn = useServerFn(importMembersV2)
  const deleteAllFn = useServerFn(deleteAllMemberV2)

  const [form, setForm] = React.useState<MemberFormState>(emptyForm)
  const [editForm, setEditForm] = React.useState<EditFormState | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<MemberV2Row | null>(
    null,
  )
  const [search, setSearch] = React.useState('')
  const [status, setStatus] = React.useState<StatusFilter>('all')

  const membersQuery = useQuery({
    queryKey: ['member-v2'],
    queryFn: async () => {
      return (await listFn()) as MemberV2Row[]
    },
  })

  const summaryQuery = useQuery({
    queryKey: ['member-v2-summary'],
    queryFn: async () => {
      return (await summaryFn()) as MemberV2Summary
    },
  })

  async function refreshData() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['member-v2'] }),
      queryClient.invalidateQueries({ queryKey: ['member-v2-summary'] }),
    ])
  }

  const createMutation = useMutation({
    mutationFn: async (values: MemberFormState) => {
      return await createFn({
        data: {
          name: values.name,
          credit: toNumber(values.credit),
          percentage: toNumber(values.percentage),
          mobileNo: values.mobileNo,
          remarks: values.remarks,
          date: values.date || undefined,
        },
      })
    },
    onSuccess: async () => {
      setForm(emptyForm)
      toast.success('Member added successfully')
      await refreshData()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add member')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (values: EditFormState) => {
      return await updateFn({
        data: {
          id: values.id,
          name: values.name,
          credit: toNumber(values.credit),
          percentage: toNumber(values.percentage),
          mobileNo: values.mobileNo,
          remarks: values.remarks,
          date: values.date || undefined,
        },
      })
    },
    onSuccess: async () => {
      setEditForm(null)
      toast.success('Member updated successfully')
      await refreshData()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update member')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await deleteFn({ data: { id } })
    },
    onSuccess: async () => {
      setDeleteTarget(null)
      toast.success('Member deleted successfully')
      await refreshData()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete member')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async (values: { id: number; active: boolean }) => {
      return await toggleFn({ data: values })
    },
    onSuccess: async () => {
      await refreshData()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status')
    },
  })

  const members = membersQuery.data ?? []

  const filteredMembers = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return members.filter((member) => {
      const matchesSearch =
        !normalizedSearch ||
        member.name.toLowerCase().includes(normalizedSearch) ||
        member.mobileNo?.toLowerCase().includes(normalizedSearch) ||
        member.remarks?.toLowerCase().includes(normalizedSearch)

      const matchesStatus =
        status === 'all' ||
        (status === 'active' && member.active) ||
        (status === 'inactive' && !member.active)

      return matchesSearch && matchesStatus
    })
  }, [members, search, status])

  const localSummary = React.useMemo(() => {
    const activeMembers = members.filter((member) => member.active)

    const totalCredit = activeMembers.reduce((sum, member) => {
      return sum + member.credit
    }, 0)

    const totalInterest = activeMembers.reduce((sum, member) => {
      return sum + getInterest(member.credit, member.percentage)
    }, 0)

    const averagePercentage =
      activeMembers.length === 0
        ? 0
        : activeMembers.reduce((sum, member) => {
            return sum + member.percentage
          }, 0) / activeMembers.length

    return {
      totalMembers: activeMembers.length,
      totalCredit,
      totalInterest,
      averagePercentage,
    }
  }, [members])

  const summary = {
    totalMembers: summaryQuery.data?.totalMembers ?? localSummary.totalMembers,
    totalCredit: summaryQuery.data?.totalCredit ?? localSummary.totalCredit,
    totalInterest:
      summaryQuery.data?.totalInterest ?? Math.round(localSummary.totalInterest),
    averagePercentage: localSummary.averagePercentage,
  }

  const filteredTotalCredit = filteredMembers.reduce((sum, member) => {
    return sum + member.credit
  }, 0)

  const filteredTotalInterest = filteredMembers.reduce((sum, member) => {
    return sum + getInterest(member.credit, member.percentage)
  }, 0)

  const isLoading = membersQuery.isLoading || summaryQuery.isLoading
  const isRefreshing = membersQuery.isFetching || summaryQuery.isFetching

  function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }

    createMutation.mutate(form)
  }

  function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editForm) {
      return
    }

    if (!editForm.name.trim()) {
      toast.error('Name is required')
      return
    }

    updateMutation.mutate(editForm)
  }

  function openEdit(member: MemberV2Row) {
    setEditForm({
      id: member.id,
      name: member.name,
      credit: String(member.credit),
      percentage: String(member.percentage),
      mobileNo: member.mobileNo ?? '',
      date: toDateInputValue(member.date),
      remarks: member.remarks ?? '',
    })
  }

  function resetFilters() {
    setSearch('')
    setStatus('all')
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="page-glow" aria-hidden />

      <div className="page-container relative z-10 page-section">
        <PageHeader
          badge="Prime members"
          badgeVariant="primary"
          title="Member V2 management"
          description="Credit-only member system. Import CSV, add members manually, and manage credit, percentage, and status."
          actions={
            <Button
              type="button"
              variant="outline"
              onClick={() => refreshData()}
              disabled={isRefreshing}
            >
              <RefreshCcw
                className={`mr-2 size-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          }
        />

        <MemberV2StatsGrid summary={summary} />

        <MemberV2CsvImport
          existingCount={members.length}
          onImport={(input) => importFn({ data: input })}
          onDeleteAll={() => deleteAllFn()}
          onImportComplete={refreshData}
        />

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.35fr]">
          <MemberV2AddForm
            form={form}
            onChange={setForm}
            onSubmit={handleCreateSubmit}
            isPending={createMutation.isPending}
          />

          <MemberV2ListPanel
            members={filteredMembers}
            search={search}
            status={status}
            isLoading={isLoading}
            isTogglePending={toggleMutation.isPending}
            filteredTotalCredit={filteredTotalCredit}
            filteredTotalInterest={filteredTotalInterest}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onResetFilters={resetFilters}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onToggleActive={(values) => toggleMutation.mutate(values)}
          />
        </section>

        <MemberV2InfoPanel />
      </div>

      <MemberV2EditDialog
        editForm={editForm}
        isPending={updateMutation.isPending}
        onClose={() => setEditForm(null)}
        onChange={setEditForm}
        onSubmit={handleEditSubmit}
      />

      <MemberV2DeleteDialog
        target={deleteTarget}
        isPending={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) {
            return
          }

          deleteMutation.mutate(deleteTarget.id)
        }}
      />
    </main>
  )
}
