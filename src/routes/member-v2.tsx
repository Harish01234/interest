import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  IndianRupee,
  MoreHorizontal,
  Pencil,
  Percent,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  UserRound,
  UsersRound,
  WalletCards,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  createMemberV2,
  deleteMemberV2,
  getMemberV2Summary,
  listMemberV2,
  toggleMemberV2Active,
  updateMemberV2,
} from '@/features/member-v2/member-v2.functions';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export const Route = createFileRoute('/member-v2')({
  component: MemberV2Page,
});

type MemberV2Row = {
  id: number;
  name: string;
  credit: number;
  percentage: number;
  remarks: string | null;
  mobileNo: string | null;
  date: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

type MemberV2Summary = {
  totalMembers: number;
  totalCredit: number;
  totalInterest: number;
};

type StatusFilter = 'all' | 'active' | 'inactive';

type MemberFormState = {
  name: string;
  credit: string;
  percentage: string;
  mobileNo: string;
  date: string;
  remarks: string;
};

type EditFormState = MemberFormState & {
  id: number;
};

const emptyForm: MemberFormState = {
  name: '',
  credit: '',
  percentage: '0',
  mobileNo: '',
  date: new Date().toISOString().slice(0, 10),
  remarks: '',
};

function MemberV2Page() {
  const queryClient = useQueryClient();

  const listFn = useServerFn(listMemberV2);
  const summaryFn = useServerFn(getMemberV2Summary);
  const createFn = useServerFn(createMemberV2);
  const updateFn = useServerFn(updateMemberV2);
  const deleteFn = useServerFn(deleteMemberV2);
  const toggleFn = useServerFn(toggleMemberV2Active);

  const [form, setForm] = React.useState<MemberFormState>(emptyForm);
  const [editForm, setEditForm] = React.useState<EditFormState | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<MemberV2Row | null>(
    null,
  );
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<StatusFilter>('all');

  const membersQuery = useQuery({
    queryKey: ['member-v2'],
    queryFn: async () => {
      return (await listFn()) as MemberV2Row[];
    },
  });

  const summaryQuery = useQuery({
    queryKey: ['member-v2-summary'],
    queryFn: async () => {
      return (await summaryFn()) as MemberV2Summary;
    },
  });

  async function refreshData() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['member-v2'] }),
      queryClient.invalidateQueries({ queryKey: ['member-v2-summary'] }),
    ]);
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
      });
    },
    onSuccess: async () => {
      setForm(emptyForm);
      toast.success('Member added successfully');
      await refreshData();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add member');
    },
  });

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
      });
    },
    onSuccess: async () => {
      setEditForm(null);
      toast.success('Member updated successfully');
      await refreshData();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update member');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await deleteFn({
        data: { id },
      });
    },
    onSuccess: async () => {
      setDeleteTarget(null);
      toast.success('Member deleted successfully');
      await refreshData();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete member');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (values: { id: number; active: boolean }) => {
      return await toggleFn({
        data: values,
      });
    },
    onSuccess: async () => {
      await refreshData();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  const members = membersQuery.data ?? [];

  const filteredMembers = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        !normalizedSearch ||
        member.name.toLowerCase().includes(normalizedSearch) ||
        member.mobileNo?.toLowerCase().includes(normalizedSearch) ||
        member.remarks?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        status === 'all' ||
        (status === 'active' && member.active) ||
        (status === 'inactive' && !member.active);

      return matchesSearch && matchesStatus;
    });
  }, [members, search, status]);

  const localSummary = React.useMemo(() => {
    const activeMembers = members.filter((member) => member.active);

    const totalCredit = activeMembers.reduce((sum, member) => {
      return sum + member.credit;
    }, 0);

    const totalInterest = activeMembers.reduce((sum, member) => {
      return sum + getInterest(member.credit, member.percentage);
    }, 0);

    const averagePercentage =
      activeMembers.length === 0
        ? 0
        : activeMembers.reduce((sum, member) => {
            return sum + member.percentage;
          }, 0) / activeMembers.length;

    return {
      totalMembers: activeMembers.length,
      totalCredit,
      totalInterest,
      averagePercentage,
    };
  }, [members]);

  const summary = {
    totalMembers: summaryQuery.data?.totalMembers ?? localSummary.totalMembers,
    totalCredit: summaryQuery.data?.totalCredit ?? localSummary.totalCredit,
    totalInterest:
      summaryQuery.data?.totalInterest ?? Math.round(localSummary.totalInterest),
    averagePercentage: localSummary.averagePercentage,
  };

  const filteredTotalCredit = filteredMembers.reduce((sum, member) => {
    return sum + member.credit;
  }, 0);

  const filteredTotalInterest = filteredMembers.reduce((sum, member) => {
    return sum + getInterest(member.credit, member.percentage);
  }, 0);

  const isLoading = membersQuery.isLoading || summaryQuery.isLoading;

  function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }

    createMutation.mutate(form);
  }

  function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editForm) {
      return;
    }

    if (!editForm.name.trim()) {
      toast.error('Name is required');
      return;
    }

    updateMutation.mutate(editForm);
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
    });
  }

  function resetFilters() {
    setSearch('');
    setStatus('all');
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="page-glow" />

      <div className="page-container relative z-10 page-section">
        <section className="surface-card overflow-hidden">
          <div className="accent-bar" />

          <div className="section-card-header section-card-header-split">
            <div className="section-card-intro">
              <div className="icon-tile icon-tile-primary">
                <UsersRound className="size-5" />
              </div>

              <div className="min-w-0">
                <Badge className="badge-accent mb-3">Prime Members</Badge>

                <h1 className="text-gradient-brand text-3xl font-bold tracking-tight sm:text-4xl">
                  Member V2 Management
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Credit-only member system. No jinis field. Manage name,
                  credit, percentage, mobile number, date, remarks, and active
                  status.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => refreshData()}
              disabled={membersQuery.isFetching || summaryQuery.isFetching}
            >
              <RefreshCcw
                className={`mr-2 size-4 ${
                  membersQuery.isFetching || summaryQuery.isFetching
                    ? 'animate-spin'
                    : ''
                }`}
              />
              Refresh
            </Button>
          </div>

          <div className="section-card-body">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Active Members"
                value={formatPlainNumber(summary.totalMembers)}
                helper="Currently active"
                icon={<UsersRound className="size-5" />}
                className="stat-tile-chart-1"
              />

              <StatCard
                title="Total Credit"
                value={formatMoney(summary.totalCredit)}
                helper="Active members only"
                icon={<WalletCards className="size-5" />}
                className="stat-tile-chart-2"
              />

              <StatCard
                title="Total Interest"
                value={formatMoney(summary.totalInterest)}
                helper="Credit × percentage"
                icon={<IndianRupee className="size-5" />}
                className="stat-tile-chart-3"
              />

              <StatCard
                title="Avg Percentage"
                value={`${formatPlainNumber(summary.averagePercentage)}%`}
                helper="Across active members"
                icon={<Percent className="size-5" />}
                className="stat-tile-chart-1"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.35fr]">
          <Card className="surface-card">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="icon-tile icon-tile-accent">
                  <Plus className="size-5" />
                </div>

                <div>
                  <CardTitle>Add Prime Member</CardTitle>
                  <CardDescription>
                    Add a new credit-only member with percentage.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <FormField label="Name" required>
                  <Input
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Enter member name"
                  />
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Credit" required>
                    <Input
                      type="number"
                      min="0"
                      value={form.credit}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          credit: event.target.value,
                        }))
                      }
                      placeholder="0"
                    />
                  </FormField>

                  <FormField label="Percentage">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={form.percentage}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          percentage: event.target.value,
                        }))
                      }
                      placeholder="0"
                    />
                  </FormField>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Mobile No">
                    <Input
                      value={form.mobileNo}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          mobileNo: event.target.value,
                        }))
                      }
                      placeholder="Enter mobile no"
                    />
                  </FormField>

                  <FormField label="Date">
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          date: event.target.value,
                        }))
                      }
                    />
                  </FormField>
                </div>

                <FormField label="Remarks">
                  <Textarea
                    value={form.remarks}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        remarks: event.target.value,
                      }))
                    }
                    placeholder="Optional remarks"
                    rows={3}
                  />
                </FormField>

                <Button
                  type="submit"
                  className="btn-primary-glow w-full"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Saving...' : 'Add Member'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="surface-card overflow-hidden">
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="icon-tile icon-tile-secondary">
                      <UserRound className="size-5" />
                    </div>

                    <div>
                      <CardTitle>Prime Members List</CardTitle>
                      <CardDescription>
                        Search, filter, edit, activate, deactivate, or delete
                        members.
                      </CardDescription>
                    </div>
                  </div>

                  <Badge variant="outline" className="badge-primary-soft">
                    {filteredMembers.length} shown
                  </Badge>
                </div>

                <div className="data-toolbar">
                  <div className="search-field">
                    <Search className="search-field-icon" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by name, mobile, remarks..."
                      className="search-field-input"
                    />
                  </div>

                  <Tabs
                    value={status}
                    onValueChange={(value) => setStatus(value as StatusFilter)}
                  >
                    <TabsList className="grid w-full grid-cols-3 lg:w-[270px]">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="inactive">Inactive</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <Button type="button" variant="outline" onClick={resetFilters}>
                    <X className="mr-2 size-4" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <MembersSkeleton />
              ) : filteredMembers.length === 0 ? (
                <EmptyState onReset={resetFilters} />
              ) : (
                <div className="data-table-wrap">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Credit</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Interest</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[70px] text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredMembers.map((member) => {
                        const interest = getInterest(
                          member.credit,
                          member.percentage,
                        );

                        return (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="flex min-w-[180px] flex-col gap-1">
                                <span className="font-semibold">
                                  {member.name}
                                </span>

                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                  {member.mobileNo ? (
                                    <span className="inline-flex items-center gap-1">
                                      <Phone className="size-3" />
                                      {member.mobileNo}
                                    </span>
                                  ) : null}

                                  {member.remarks ? (
                                    <span className="line-clamp-1">
                                      {member.remarks}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="font-semibold">
                              {formatMoney(member.credit)}
                            </TableCell>

                            <TableCell>{member.percentage}%</TableCell>

                            <TableCell className="font-semibold text-primary">
                              {formatMoney(interest)}
                            </TableCell>

                            <TableCell>
                              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                <CalendarDays className="size-3.5" />
                                {formatDate(member.date)}
                              </span>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={member.active}
                                  disabled={toggleMutation.isPending}
                                  onCheckedChange={(checked) =>
                                    toggleMutation.mutate({
                                      id: member.id,
                                      active: checked,
                                    })
                                  }
                                />

                                <Badge
                                  variant="outline"
                                  className={
                                    member.active
                                      ? 'badge-accent'
                                      : 'badge-type-unknown'
                                  }
                                >
                                  {member.active ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </TableCell>

                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="icon" variant="ghost">
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                  <DropdownMenuItem
                                    onSelect={() => openEdit(member)}
                                  >
                                    <Pencil className="mr-2 size-4" />
                                    Edit
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onSelect={() => setDeleteTarget(member)}
                                  >
                                    <Trash2 className="mr-2 size-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>

                    <TableFooter>
                      <TableRow>
                        <TableCell>Filtered Total</TableCell>
                        <TableCell>{formatMoney(filteredTotalCredit)}</TableCell>
                        <TableCell />
                        <TableCell>
                          {formatMoney(Math.round(filteredTotalInterest))}
                        </TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell />
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="surface-card p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <MiniInfo
              title="Formula"
              value="Credit × Percentage ÷ 100"
              description="Interest is calculated from member credit and percentage."
            />

            <MiniInfo
              title="Data Type"
              value="Prime / MemberV2"
              description="This is only for credit members. No jinis is included."
            />

            <MiniInfo
              title="Safety"
              value="User Scoped"
              description="Every query is filtered by logged-in userId from your auth session."
            />
          </div>
        </section>
      </div>

      <Dialog
        open={!!editForm}
        onOpenChange={(open) => {
          if (!open) {
            setEditForm(null);
          }
        }}
      >
        <DialogContent className="surface-glass-modal sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Prime Member</DialogTitle>
            <DialogDescription>
              Update member details. This will only update the selected member.
            </DialogDescription>
          </DialogHeader>

          {editForm ? (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <FormField label="Name" required>
                <Input
                  value={editForm.name}
                  onChange={(event) =>
                    setEditForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            name: event.target.value,
                          }
                        : prev,
                    )
                  }
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Credit" required>
                  <Input
                    type="number"
                    min="0"
                    value={editForm.credit}
                    onChange={(event) =>
                      setEditForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              credit: event.target.value,
                            }
                          : prev,
                      )
                    }
                  />
                </FormField>

                <FormField label="Percentage">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={editForm.percentage}
                    onChange={(event) =>
                      setEditForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              percentage: event.target.value,
                            }
                          : prev,
                      )
                    }
                  />
                </FormField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Mobile No">
                  <Input
                    value={editForm.mobileNo}
                    onChange={(event) =>
                      setEditForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              mobileNo: event.target.value,
                            }
                          : prev,
                      )
                    }
                  />
                </FormField>

                <FormField label="Date">
                  <Input
                    type="date"
                    value={editForm.date}
                    onChange={(event) =>
                      setEditForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              date: event.target.value,
                            }
                          : prev,
                      )
                    }
                  />
                </FormField>
              </div>

              <FormField label="Remarks">
                <Textarea
                  value={editForm.remarks}
                  onChange={(event) =>
                    setEditForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            remarks: event.target.value,
                          }
                        : prev,
                    )
                  }
                  rows={3}
                />
              </FormField>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditForm(null)}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Member'}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent className="surface-glass-modal">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <span className="font-semibold text-foreground">
                {deleteTarget?.name}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (!deleteTarget) {
                  return;
                }

                deleteMutation.mutate(deleteTarget.id);
              }}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function StatCard({
  title,
  value,
  helper,
  icon,
  className,
}: {
  title: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`stat-tile text-left ${className ?? ''}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="icon-tile">{icon}</div>
      </div>

      <p className="text-xs font-medium text-muted-foreground">{title}</p>

      <p className="stat-value mt-1 text-2xl font-bold tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

function MiniInfo({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="surface-muted p-4">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 font-semibold">{value}</p>

      <Separator className="my-3" />

      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>
        {label}
        {required ? <span className="form-field-required"> *</span> : null}
      </Label>

      {children}
    </div>
  );
}

function MembersSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="surface-muted flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      <div className="icon-tile icon-tile-accent">
        <Search className="size-5" />
      </div>

      <div>
        <h3 className="font-semibold">No members found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try changing your search or filter.
        </p>
      </div>

      <Button type="button" variant="outline" onClick={onReset}>
        Reset filters
      </Button>
    </div>
  );
}

function toNumber(value: string) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function getInterest(credit: number, percentage: number) {
  return Math.round(credit * (percentage / 100));
}

function formatMoney(value: number) {
  return `₹${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

function formatPlainNumber(value: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function toDateInputValue(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}