import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  MoreHorizontal,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCurrentAdmin, useResourceList } from "@/lib/admin/admin-hooks";
import {
  createResource,
  deleteResource,
  formatResourceValue,
  getRecordId,
  listResource,
  parseResourceValue,
  resourceKeys,
  updateResource,
  type AdminResourceRecord,
  type ResourceField,
  type ResourceListParams,
  type ResourceModule,
  type ResourceValue,
  type SortDirection,
} from "@/lib/admin/admin-resource-api";
import { createUploadId, sanitizeFileName } from "@/lib/slug";
import { storageBuckets, uploadAdminFile } from "@/lib/supabase/storage";

type PageMode = "list" | "create" | "edit" | "view";
type FormValues = Record<string, string | boolean>;
type PendingConfirmation =
  | { title: string; description: string; confirmLabel: string; variant: "default" | "destructive"; onConfirm: () => void }
  | null;

const archiveStatusPriority = ["archived", "inactive", "disabled", "blocked", "expired", "closed"];
const restoreStatusPriority = ["active", "draft", "pending", "unread", "in_stock", "requested"];
const pageSizeOptions = [10, 25, 50];
const virtualRowHeight = 64;
const virtualOverscan = 6;

export function AdminResourcePage({ module }: { module: ResourceModule }) {
  const queryClient = useQueryClient();
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<PageMode>("list");
  const [activeRecord, setActiveRecord] = useState<AdminResourceRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string>(defaultSortKey(module));
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkUpdateField, setBulkUpdateField] = useState("");
  const [bulkUpdateValue, setBulkUpdateValue] = useState("");
  const [confirmation, setConfirmation] = useState<PendingConfirmation>(null);

  const admin = useCurrentAdmin();
  const canWrite = !module.readOnly && ["owner", "manager"].includes(admin.data?.role ?? "");
  const exactFilterFields = module.fields.filter((field) => field.type === "select" || field.type === "boolean");
  const statusField = module.fields.find((field) => field.key === "status" && field.type === "select");
  const archiveStatus = getPreferredStatus(statusField, archiveStatusPriority);
  const restoreStatus = getPreferredStatus(statusField, restoreStatusPriority);
  const supportsArchive = Boolean(statusField && archiveStatus && restoreStatus && canWrite);
  const sortableFields = useMemo(() => getSortableFields(module), [module]);
  const searchKeys = useMemo(() => getSearchKeys(module), [module]);
  const displayFields = useMemo(() => visibleFields(module), [module]);
  const listParams = useMemo<ResourceListParams>(
    () => ({
      page,
      pageSize,
      sortKey,
      sortDirection,
      search: debouncedSearchTerm,
      searchKeys,
      filters,
    }),
    [debouncedSearchTerm, filters, page, pageSize, searchKeys, sortDirection, sortKey],
  );

  const records = useResourceList(module.table, listParams);

  const rows = records.data?.rows ?? [];
  const totalCount = records.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const visibleIds = useMemo(() => rows.map(getRecordId), [rows]);
  const selectedVisibleCount = useMemo(
    () => visibleIds.filter((id) => selectedIds.has(id)).length,
    [selectedIds, visibleIds],
  );
  const selectedCount = selectedIds.size;

  const createMutation = useMutation({
    mutationFn: (input: AdminResourceRecord) => createResource(module.table, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "resource", module.table] });
      const previous = queryClient.getQueryData<{ rows: AdminResourceRecord[]; count: number }>(
        resourceKeys.list(module.table, listParams),
      );
      const optimistic: AdminResourceRecord = {
        id: `optimistic-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...input,
      };
      queryClient.setQueryData(resourceKeys.list(module.table, listParams), {
        rows: [optimistic, ...(previous?.rows ?? [])].slice(0, pageSize),
        count: (previous?.count ?? 0) + 1,
      });
      return { previous };
    },
    onError: (error, _input, context) => {
      queryClient.setQueryData(resourceKeys.list(module.table, listParams), context?.previous);
      toast.error(error.message);
    },
    onSuccess: () => toast.success("Record created"),
    onSettled: invalidateResourceQueries,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: AdminResourceRecord }) =>
      updateResource(module.table, id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "resource", module.table] });
      const previous = queryClient.getQueryData<{ rows: AdminResourceRecord[]; count: number }>(
        resourceKeys.list(module.table, listParams),
      );
      queryClient.setQueryData(resourceKeys.list(module.table, listParams), {
        rows: (previous?.rows ?? []).map((record) =>
          getRecordId(record) === id ? { ...record, ...input, updated_at: new Date().toISOString() } : record,
        ),
        count: previous?.count ?? 0,
      });
      return { previous };
    },
    onError: (error, _input, context) => {
      queryClient.setQueryData(resourceKeys.list(module.table, listParams), context?.previous);
      toast.error(error.message);
    },
    onSuccess: () => toast.success("Record updated"),
    onSettled: invalidateResourceQueries,
  });

  const deleteMutation = useMutation({
    mutationFn: async (recordsToDelete: AdminResourceRecord[]) => {
      await Promise.all(recordsToDelete.map((record) => deleteResource(module.table, getRecordId(record))));
      return recordsToDelete;
    },
    onMutate: async (recordsToDelete) => {
      const ids = recordsToDelete.map(getRecordId);
      await queryClient.cancelQueries({ queryKey: ["admin", "resource", module.table] });
      const previous = queryClient.getQueryData<{ rows: AdminResourceRecord[]; count: number }>(
        resourceKeys.list(module.table, listParams),
      );
      queryClient.setQueryData(resourceKeys.list(module.table, listParams), {
        rows: (previous?.rows ?? []).filter((record) => !ids.includes(getRecordId(record))),
        count: Math.max(0, (previous?.count ?? 0) - ids.length),
      });
      setSelectedIds((current) => withoutIds(current, ids));
      return { previous, deleted: recordsToDelete };
    },
    onError: (error, _records, context) => {
      queryClient.setQueryData(resourceKeys.list(module.table, listParams), context?.previous);
      toast.error(error.message);
    },
    onSuccess: (deleted) => {
      toast.success(`${deleted.length} record${deleted.length === 1 ? "" : "s"} deleted`, {
        action: {
          label: "Undo",
          onClick: () => restoreDeletedRecords(deleted),
        },
      });
    },
    onSettled: invalidateResourceQueries,
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, input }: { ids: string[]; input: AdminResourceRecord }) => {
      await Promise.all(ids.map((id) => updateResource(module.table, id, input)));
    },
    onMutate: async ({ ids, input }) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "resource", module.table] });
      const previous = queryClient.getQueryData<{ rows: AdminResourceRecord[]; count: number }>(
        resourceKeys.list(module.table, listParams),
      );
      queryClient.setQueryData(resourceKeys.list(module.table, listParams), {
        rows: (previous?.rows ?? []).map((record) =>
          ids.includes(getRecordId(record)) ? { ...record, ...input, updated_at: new Date().toISOString() } : record,
        ),
        count: previous?.count ?? 0,
      });
      setSelectedIds(new Set());
      return { previous };
    },
    onError: (error, _input, context) => {
      queryClient.setQueryData(resourceKeys.list(module.table, listParams), context?.previous);
      toast.error(error.message);
    },
    onSuccess: () => toast.success("Bulk update complete"),
    onSettled: invalidateResourceQueries,
  });

  const importMutation = useMutation({
    mutationFn: async (items: AdminResourceRecord[]) => {
      await Promise.all(items.map((item) => createResource(module.table, item)));
    },
    onError: (error) => toast.error(error.message),
    onSuccess: (_data, items) => {
      toast.success(`${items.length} CSV row${items.length === 1 ? "" : "s"} imported`);
    },
    onSettled: invalidateResourceQueries,
  });

  const writePending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    bulkUpdateMutation.isPending ||
    importMutation.isPending;
  const error = records.error ?? admin.error;

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [module.table, debouncedSearchTerm, filters, sortKey, sortDirection, pageSize]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) {
        return;
      }
      if (event.key === "/" || (event.ctrlKey && event.key.toLowerCase() === "k")) {
        event.preventDefault();
        document.getElementById(`${module.slug}-search`)?.focus();
      }
      if (event.key.toLowerCase() === "n" && canWrite) {
        event.preventDefault();
        openCreate();
      }
      if (event.key === "Escape") closeDetail();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canWrite, module.slug]);

  function invalidateResourceQueries() {
    return queryClient.invalidateQueries({ queryKey: ["admin", "resource", module.table] });
  }

  function prefetchPage(targetPage: number) {
    if (targetPage < 1 || targetPage > totalPages || targetPage === page) return;
    const nextParams = { ...listParams, page: targetPage };
    void queryClient.prefetchQuery({
      queryKey: resourceKeys.list(module.table, nextParams),
      queryFn: () => listResource(module.table, nextParams),
      staleTime: 30_000,
    });
  }

  function openCreate() {
    setActiveRecord(null);
    setMode("create");
  }

  function openEdit(record: AdminResourceRecord) {
    setActiveRecord(record);
    setMode("edit");
  }

  function openView(record: AdminResourceRecord) {
    setActiveRecord(record);
    setMode("view");
  }

  function closeDetail() {
    setActiveRecord(null);
    setMode("list");
  }

  function runUpdate(record: AdminResourceRecord, input: AdminResourceRecord) {
    updateMutation.mutate({ id: getRecordId(record), input });
  }

  function deleteRecords(recordsToDelete: AdminResourceRecord[]) {
    setConfirmation({
      title: "Delete records",
      description: `This will delete ${recordsToDelete.length} record${recordsToDelete.length === 1 ? "" : "s"}. You can undo immediately from the toast.`,
      confirmLabel: "Delete",
      variant: "destructive",
      onConfirm: () => {
        deleteMutation.mutate(recordsToDelete);
        closeDetail();
      },
    });
  }

  function restoreDeletedRecords(recordsToRestore: AdminResourceRecord[]) {
    Promise.all(recordsToRestore.map((record) => createResource(module.table, stripOptimisticId(record))))
      .then(() => {
        toast.success("Delete undone");
        return invalidateResourceQueries();
      })
      .catch((restoreError: unknown) => {
        toast.error(restoreError instanceof Error ? restoreError.message : "Undo failed");
      });
  }

  function runBulkUpdate(fieldKey: string, value: string) {
    const field = module.fields.find((item) => item.key === fieldKey);
    if (!field || selectedIds.size === 0) return;
    setConfirmation({
      title: "Update selected records",
      description: `This will update ${selectedIds.size} selected record${selectedIds.size === 1 ? "" : "s"}.`,
      confirmLabel: "Update",
      variant: "default",
      onConfirm: () => {
        bulkUpdateMutation.mutate({
          ids: [...selectedIds],
          input: { [field.key]: parseResourceValue(field, field.type === "boolean" ? value === "true" : value) },
        });
      },
    });
  }

  function exportCsv() {
    const csv = recordsToCsv(module, rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${module.slug}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  async function importCsv(file: File) {
    try {
      await uploadAdminFile(
        storageBuckets.adminImports,
        `csv/${module.table}/${Date.now()}-${sanitizeFileName(file.name)}`,
        file,
      );
      const text = await file.text();
      const parsed = csvToRecords(module, text);
      if (parsed.length === 0) {
        toast.error("CSV has no importable rows");
        return;
      }
      setConfirmation({
        title: "Import CSV",
        description: `This will create ${parsed.length} record${parsed.length === 1 ? "" : "s"} from the CSV file.`,
        confirmLabel: "Import",
        variant: "default",
        onConfirm: () => importMutation.mutate(parsed),
      });
    } catch (csvError) {
      toast.error(csvError instanceof Error ? csvError.message : "CSV import failed");
    } finally {
      if (importInputRef.current) importInputRef.current.value = "";
    }
  }

  function toggleAllVisible(checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const id of visibleIds) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow={module.eyebrow}
        title={module.title}
        description={module.description}
        actions={
          <div className="flex flex-wrap justify-end gap-2">
            {!canWrite ? (
              <Badge variant="outline" className="h-10 rounded-md px-3 py-2 uppercase tracking-[0.16em] text-muted-foreground">
                Read only
              </Badge>
            ) : null}
            <Button type="button" variant="outline" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            {canWrite ? (
              <>
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void importCsv(file);
                  }}
                />
                <Button type="button" variant="outline" onClick={() => importInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
                <Button type="button" onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </>
            ) : null}
          </div>
        }
      />

      {error ? (
        <div className="mb-4 border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error.message}
        </div>
      ) : null}

      {mode === "create" || mode === "edit" ? (
        <ResourceForm
          key={`${mode}-${activeRecord ? getRecordId(activeRecord) : "new"}`}
          module={module}
          record={mode === "edit" ? activeRecord : null}
          isSaving={writePending}
          onCancel={closeDetail}
          onSubmit={(input) => {
            if (!canWrite) return;
            if (mode === "edit" && activeRecord) runUpdate(activeRecord, input);
            else createMutation.mutate(input);
            closeDetail();
          }}
        />
      ) : null}

      {mode === "view" && activeRecord ? (
        <ResourceDetails
          module={module}
          record={activeRecord}
          canWrite={canWrite}
          canArchive={supportsArchive}
          archiveStatus={archiveStatus}
          restoreStatus={restoreStatus}
          isPending={writePending}
          onClose={closeDetail}
          onEdit={() => openEdit(activeRecord)}
          onArchive={() => archiveStatus && runUpdate(activeRecord, { status: archiveStatus })}
          onRestore={() => restoreStatus && runUpdate(activeRecord, { status: restoreStatus })}
          onDelete={() => deleteRecords([activeRecord])}
        />
      ) : null}

      <Card className="rounded-lg shadow-none">
        <ResourceToolbar
          module={module}
          searchInputId={`${module.slug}-search`}
          searchTerm={searchTerm}
          filterFields={exactFilterFields}
          filters={filters}
          sortFields={sortableFields}
          sortKey={sortKey}
          sortDirection={sortDirection}
          pageSize={pageSize}
          selectedCount={selectedCount}
          bulkUpdateField={bulkUpdateField}
          bulkUpdateValue={bulkUpdateValue}
          canWrite={canWrite}
          supportsArchive={supportsArchive}
          isPending={writePending}
          onSearchChange={setSearchTerm}
          onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
          onSortKeyChange={setSortKey}
          onSortDirectionChange={setSortDirection}
          onPageSizeChange={setPageSize}
          onBulkUpdateFieldChange={(value) => {
            setBulkUpdateField(value);
            setBulkUpdateValue("");
          }}
          onBulkUpdateValueChange={setBulkUpdateValue}
          onBulkUpdate={() => runBulkUpdate(bulkUpdateField, bulkUpdateValue)}
          onBulkArchive={() => archiveStatus && bulkUpdateMutation.mutate({ ids: [...selectedIds], input: { status: archiveStatus } })}
          onBulkRestore={() => restoreStatus && bulkUpdateMutation.mutate({ ids: [...selectedIds], input: { status: restoreStatus } })}
          onBulkDelete={() => deleteRecords(rows.filter((record) => selectedIds.has(getRecordId(record))))}
        />

        {records.isLoading || admin.isLoading ? (
          <ResourceLoading />
        ) : (
          <>
            <ResourceDesktopTable
              module={module}
              rows={rows}
              displayFields={displayFields}
              canWrite={canWrite}
              canArchive={supportsArchive}
              selectedIds={selectedIds}
              visibleIds={visibleIds}
              selectedVisibleCount={selectedVisibleCount}
              isPending={writePending}
              archiveStatus={archiveStatus}
              restoreStatus={restoreStatus}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onToggleAllVisible={toggleAllVisible}
              onSort={setSortKey}
              onDirection={setSortDirection}
              onSelect={(record, checked) => {
                const id = getRecordId(record);
                setSelectedIds((current) => {
                  const next = new Set(current);
                  if (checked) next.add(id);
                  else next.delete(id);
                  return next;
                });
              }}
              onView={openView}
              onEdit={openEdit}
              onArchive={(record) => archiveStatus && runUpdate(record, { status: archiveStatus })}
              onRestore={(record) => restoreStatus && runUpdate(record, { status: restoreStatus })}
              onDelete={(record) => deleteRecords([record])}
            />

            <div className="divide-y md:hidden">
              {rows.map((record) => (
                <ResourceMobileCard
                  key={getRecordId(record)}
                  module={module}
                  record={record}
                  canWrite={canWrite}
                  canArchive={supportsArchive}
                  selected={selectedIds.has(getRecordId(record))}
                  isPending={writePending}
                  archiveStatus={archiveStatus}
                  restoreStatus={restoreStatus}
                  onSelect={(checked) => {
                    const id = getRecordId(record);
                    setSelectedIds((current) => {
                      const next = new Set(current);
                      if (checked) next.add(id);
                      else next.delete(id);
                      return next;
                    });
                  }}
                  onView={() => openView(record)}
                  onEdit={() => openEdit(record)}
                  onArchive={() => archiveStatus && runUpdate(record, { status: archiveStatus })}
                  onRestore={() => restoreStatus && runUpdate(record, { status: restoreStatus })}
                  onDelete={() => deleteRecords([record])}
                />
              ))}
            </div>

            {rows.length === 0 ? (
              <ResourceEmpty filtered={totalCount > 0 || searchTerm.trim().length > 0 || hasActiveFilters(filters)} />
            ) : (
              <ResourcePagination
                page={page}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                onPrevious={() => setPage((current) => Math.max(1, current - 1))}
                onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
                onPrefetchPrevious={() => prefetchPage(page - 1)}
                onPrefetchNext={() => prefetchPage(page + 1)}
              />
            )}
          </>
        )}
      </Card>

      <ConfirmationDialog confirmation={confirmation} onClose={() => setConfirmation(null)} />
    </div>
  );
}

function ResourceToolbar({
  module,
  searchInputId,
  searchTerm,
  filterFields,
  filters,
  sortFields,
  sortKey,
  sortDirection,
  pageSize,
  selectedCount,
  bulkUpdateField,
  bulkUpdateValue,
  canWrite,
  supportsArchive,
  isPending,
  onSearchChange,
  onFilterChange,
  onSortKeyChange,
  onSortDirectionChange,
  onPageSizeChange,
  onBulkUpdateFieldChange,
  onBulkUpdateValueChange,
  onBulkUpdate,
  onBulkArchive,
  onBulkRestore,
  onBulkDelete,
}: {
  module: ResourceModule;
  searchInputId: string;
  searchTerm: string;
  filterFields: ResourceField[];
  filters: Record<string, string>;
  sortFields: Array<{ key: string; label: string }>;
  sortKey: string;
  sortDirection: SortDirection;
  pageSize: number;
  selectedCount: number;
  bulkUpdateField: string;
  bulkUpdateValue: string;
  canWrite: boolean;
  supportsArchive: boolean;
  isPending: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: string, value: string) => void;
  onSortKeyChange: (value: string) => void;
  onSortDirectionChange: (value: SortDirection) => void;
  onPageSizeChange: (value: number) => void;
  onBulkUpdateFieldChange: (value: string) => void;
  onBulkUpdateValueChange: (value: string) => void;
  onBulkUpdate: () => void;
  onBulkArchive: () => void;
  onBulkRestore: () => void;
  onBulkDelete: () => void;
}) {
  const selectedBulkField = module.fields.find((field) => field.key === bulkUpdateField);

  return (
    <div className="space-y-3 border-b p-4">
      <div className="grid gap-3 xl:grid-cols-[minmax(220px,1fr)_auto_auto_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={searchInputId}
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={`Search ${module.title.toLowerCase()} (/ or Ctrl+K)`}
            className="h-10 pl-9"
          />
        </label>

        <label className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Sort</span>
          <Select value={sortKey} onValueChange={onSortKeyChange}>
            <SelectTrigger className="h-10 min-w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortFields.map((field) => (
                <SelectItem key={field.key} value={field.key}>{field.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortDirection} onValueChange={(value) => onSortDirectionChange(value as SortDirection)}>
            <SelectTrigger className="h-10 w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Asc</SelectItem>
              <SelectItem value="desc">Desc</SelectItem>
            </SelectContent>
          </Select>
        </label>

        <label className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Rows</span>
          <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="h-10 w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      {filterFields.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {filterFields.map((field) => (
            <label key={field.key} className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={filters[field.key] ?? "all"}
                onValueChange={(value) => onFilterChange(field.key, value)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {field.label.toLowerCase()}</SelectItem>
                  {field.type === "boolean" ? (
                    <>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </>
                  ) : (
                    (field.options ?? []).map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)
                  )}
                </SelectContent>
              </Select>
            </label>
          ))}
        </div>
      ) : null}

      {canWrite && selectedCount > 0 ? (
        <div className="grid gap-2 border bg-muted/30 p-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <span className="self-center text-sm text-muted-foreground">{selectedCount} selected</span>
          <div className="flex flex-wrap gap-2">
            <Select value={bulkUpdateField || "__none"} onValueChange={(value) => onBulkUpdateFieldChange(value === "__none" ? "" : value)}>
              <SelectTrigger className="h-9 min-w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Bulk update field</SelectItem>
                {module.fields.map((field) => <SelectItem key={field.key} value={field.key}>{field.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <BulkValueInput field={selectedBulkField} value={bulkUpdateValue} onChange={onBulkUpdateValueChange} />
            <Button type="button" variant="outline" size="sm" disabled={isPending || !bulkUpdateField || !bulkUpdateValue} onClick={onBulkUpdate}>
              Update
            </Button>
          </div>
          {supportsArchive ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={onBulkArchive}>
                <Archive className="h-4 w-4" />
                Archive
              </Button>
              <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={onBulkRestore}>
                <RotateCcw className="h-4 w-4" />
                Restore
              </Button>
            </div>
          ) : <span />}
          <Button type="button" variant="destructive" size="sm" disabled={isPending} onClick={onBulkDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function BulkValueInput({ field, value, onChange }: { field: ResourceField | undefined; value: string; onChange: (value: string) => void }) {
  if (!field) return <Input disabled placeholder="Value" className="h-9 min-w-36" />;
  if (field.type === "select") {
    return (
      <Select value={value || "__none"} onValueChange={(next) => onChange(next === "__none" ? "" : next)}>
        <SelectTrigger className="h-9 min-w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none">Value</SelectItem>
          {(field.options ?? []).map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
        </SelectContent>
      </Select>
    );
  }
  if (field.type === "boolean") {
    return (
      <Select value={value || "__none"} onValueChange={(next) => onChange(next === "__none" ? "" : next)}>
        <SelectTrigger className="h-9 min-w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none">Value</SelectItem>
          <SelectItem value="true">True</SelectItem>
          <SelectItem value="false">False</SelectItem>
        </SelectContent>
      </Select>
    );
  }
  return <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Value" className="h-9 min-w-36" />;
}

function SortableHeader({ label, sortKey, activeKey, direction, onSort, onDirection }: { label: string; sortKey: string; activeKey: string; direction: SortDirection; onSort: (key: string) => void; onDirection: (direction: SortDirection) => void }) {
  const active = activeKey === sortKey;
  return (
    <TableHead className="px-5 py-3">
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-foreground"
        onClick={() => {
          if (active) onDirection(direction === "asc" ? "desc" : "asc");
          else onSort(sortKey);
        }}
      >
        {label}
        <span className="text-[10px]">{active ? (direction === "asc" ? "ASC" : "DESC") : "SORT"}</span>
      </button>
    </TableHead>
  );
}

function ResourceDesktopTable({
  module,
  rows,
  displayFields,
  canWrite,
  canArchive,
  selectedIds,
  visibleIds,
  selectedVisibleCount,
  isPending,
  archiveStatus,
  restoreStatus,
  sortKey,
  sortDirection,
  onToggleAllVisible,
  onSort,
  onDirection,
  onSelect,
  onView,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: {
  module: ResourceModule;
  rows: AdminResourceRecord[];
  displayFields: ResourceField[];
  canWrite: boolean;
  canArchive: boolean;
  selectedIds: Set<string>;
  visibleIds: string[];
  selectedVisibleCount: number;
  isPending: boolean;
  archiveStatus: string | undefined;
  restoreStatus: string | undefined;
  sortKey: string;
  sortDirection: SortDirection;
  onToggleAllVisible: (checked: boolean) => void;
  onSort: (key: string) => void;
  onDirection: (direction: SortDirection) => void;
  onSelect: (record: AdminResourceRecord, checked: boolean) => void;
  onView: (record: AdminResourceRecord) => void;
  onEdit: (record: AdminResourceRecord) => void;
  onArchive: (record: AdminResourceRecord) => void;
  onRestore: (record: AdminResourceRecord) => void;
  onDelete: (record: AdminResourceRecord) => void;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const viewportHeight = 560;
  const totalHeight = rows.length * virtualRowHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / virtualRowHeight) - virtualOverscan);
  const visibleCount = Math.ceil(viewportHeight / virtualRowHeight) + virtualOverscan * 2;
  const endIndex = Math.min(rows.length, startIndex + visibleCount);
  const virtualRows = rows.slice(startIndex, endIndex);
  const topPadding = startIndex * virtualRowHeight;
  const bottomPadding = Math.max(0, totalHeight - topPadding - virtualRows.length * virtualRowHeight);
  const columnCount = displayFields.length + (canWrite ? 4 : 3);

  return (
    <div className="hidden overflow-x-auto md:block">
      <div className="max-h-[560px] overflow-y-auto" onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}>
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted text-xs uppercase tracking-[0.16em]">
            <TableRow>
              {canWrite ? (
                <TableHead className="w-12 px-5 py-3">
                  <Checkbox
                    aria-label="Select all visible records"
                    checked={visibleIds.length > 0 && selectedVisibleCount === visibleIds.length}
                    onCheckedChange={(checked) => onToggleAllVisible(checked === true)}
                  />
                </TableHead>
              ) : null}
              <SortableHeader label={module.primaryLabel} sortKey={module.primaryLabel} activeKey={sortKey} direction={sortDirection} onSort={onSort} onDirection={onDirection} />
              {displayFields.map((field) => (
                <SortableHeader key={field.key} label={field.label} sortKey={field.key} activeKey={sortKey} direction={sortDirection} onSort={onSort} onDirection={onDirection} />
              ))}
              <SortableHeader label="Updated" sortKey="updated_at" activeKey={sortKey} direction={sortDirection} onSort={onSort} onDirection={onDirection} />
              <TableHead className="px-5 py-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topPadding > 0 ? (
              <TableRow aria-hidden="true">
                <TableCell colSpan={columnCount} style={{ height: topPadding, padding: 0 }} />
              </TableRow>
            ) : null}
            {virtualRows.map((record) => (
              <ResourceTableRow
                key={getRecordId(record)}
                module={module}
                record={record}
                canWrite={canWrite}
                canArchive={canArchive}
                selected={selectedIds.has(getRecordId(record))}
                isPending={isPending}
                archiveStatus={archiveStatus}
                restoreStatus={restoreStatus}
                onSelect={(checked) => onSelect(record, checked)}
                onView={() => onView(record)}
                onEdit={() => onEdit(record)}
                onArchive={() => onArchive(record)}
                onRestore={() => onRestore(record)}
                onDelete={() => onDelete(record)}
              />
            ))}
            {bottomPadding > 0 ? (
              <TableRow aria-hidden="true">
                <TableCell colSpan={columnCount} style={{ height: bottomPadding, padding: 0 }} />
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

const ResourceTableRow = memo(function ResourceTableRow({
  module,
  record,
  canWrite,
  canArchive,
  selected,
  isPending,
  archiveStatus,
  restoreStatus,
  onSelect,
  onView,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: ResourceRowActions & { selected: boolean; onSelect: (checked: boolean) => void }) {
  const archived = archiveStatus ? record.status === archiveStatus : false;
  return (
    <TableRow>
      {canWrite ? (
        <TableCell className="px-5 py-4">
          <Checkbox aria-label={`Select ${recordTitle(module, record)}`} checked={selected} onCheckedChange={(checked) => onSelect(checked === true)} />
        </TableCell>
      ) : null}
      <TableCell className="px-5 py-4 font-medium">
        <button type="button" className="text-left hover:underline" onClick={onView}>{recordTitle(module, record)}</button>
      </TableCell>
      {visibleFields(module).map((field) => (
        <TableCell key={field.key} className="max-w-xs truncate px-5 py-4 text-muted-foreground">
          {field.key === "status" ? <StatusBadge value={formatResourceValue(record[field.key])} /> : formatResourceValue(record[field.key])}
        </TableCell>
      ))}
      <TableCell className="px-5 py-4 text-muted-foreground">{formatResourceValue(record.updated_at ?? record.created_at)}</TableCell>
      <TableCell className="px-5 py-4">
        <div className="flex justify-end gap-2">
          <ResourceActionButtons canWrite={canWrite} canArchive={canArchive} archived={archived} isPending={isPending} restoreStatus={restoreStatus} onView={onView} onEdit={onEdit} onArchive={onArchive} onRestore={onRestore} onDelete={onDelete} />
        </div>
      </TableCell>
    </TableRow>
  );
});

interface ResourceRowActions {
  module: ResourceModule;
  record: AdminResourceRecord;
  canWrite: boolean;
  canArchive: boolean;
  isPending: boolean;
  archiveStatus: string | undefined;
  restoreStatus: string | undefined;
  onView: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
}

const ResourceMobileCard = memo(function ResourceMobileCard(props: ResourceRowActions & { selected: boolean; onSelect: (checked: boolean) => void }) {
  const { module, record, canWrite, selected, onSelect, onView } = props;
  return (
    <Card className="rounded-none border-0 border-b shadow-none">
      <CardContent className="p-4">
      <div className="flex items-start gap-3">
        {canWrite ? (
          <Checkbox
            aria-label={`Select ${recordTitle(module, record)}`}
            checked={selected}
            onCheckedChange={(checked) => onSelect(checked === true)}
            className="mt-1"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <button type="button" className="font-medium hover:underline" onClick={onView}>{recordTitle(module, record)}</button>
          <dl className="mt-3 grid gap-2 text-sm">
            {visibleFields(module).map((field) => (
              <div key={field.key} className="grid grid-cols-[7rem,1fr] gap-3">
                <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{field.label}</dt>
                <dd className="min-w-0 truncate">
                  {field.key === "status" ? <StatusBadge value={formatResourceValue(record[field.key])} /> : formatResourceValue(record[field.key]) || "None"}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <ResourceActionButtons {...props} archived={props.archiveStatus ? record.status === props.archiveStatus : false} />
          </div>
        </div>
      </div>
      </CardContent>
    </Card>
  );
});

function ResourceActionButtons({
  canWrite,
  canArchive,
  archived,
  isPending,
  restoreStatus,
  onView,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: {
  canWrite: boolean;
  canArchive: boolean;
  archived: boolean;
  isPending: boolean;
  restoreStatus: string | undefined;
  onView: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="icon" aria-label="Open row actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Actions</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView}>
          <Eye className="h-4 w-4" />
          View
        </DropdownMenuItem>
        {canWrite ? (
          <>
            <DropdownMenuItem disabled={isPending} onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {canArchive && archived && restoreStatus ? (
              <DropdownMenuItem disabled={isPending} onClick={onRestore}>
                <RotateCcw className="h-4 w-4" />
                Restore
              </DropdownMenuItem>
            ) : null}
            {canArchive && !archived ? (
              <DropdownMenuItem disabled={isPending} onClick={onArchive}>
                <Archive className="h-4 w-4" />
                Archive
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={isPending} onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ResourceDetails({
  module,
  record,
  canWrite,
  canArchive,
  archiveStatus,
  restoreStatus,
  isPending,
  onClose,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: {
  module: ResourceModule;
  record: AdminResourceRecord;
  canWrite: boolean;
  canArchive: boolean;
  archiveStatus: string | undefined;
  restoreStatus: string | undefined;
  isPending: boolean;
  onClose: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  const archived = archiveStatus ? record.status === archiveStatus : false;
  const allKeys = uniqueKeys([...module.fields.map((field) => field.key), "id", "key", "user_id", "created_at", "updated_at"]).filter((key) => record[key] !== undefined);
  return (
    <Card className="mb-6 rounded-lg shadow-none">
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-4 space-y-0 border-b p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Details</p>
          <CardTitle className="mt-1 font-display text-2xl">{recordTitle(module, record)}</CardTitle>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onClose}><X className="h-4 w-4" />Close</Button>
          {canWrite ? <Button type="button" variant="outline" disabled={isPending} onClick={onEdit}><Pencil className="h-4 w-4" />Edit</Button> : null}
          {canWrite && canArchive && archived && restoreStatus ? <Button type="button" variant="outline" disabled={isPending} onClick={onRestore}><RotateCcw className="h-4 w-4" />Restore</Button> : null}
          {canWrite && canArchive && !archived ? <Button type="button" variant="outline" disabled={isPending} onClick={onArchive}><Archive className="h-4 w-4" />Archive</Button> : null}
          {canWrite ? <Button type="button" variant="destructive" disabled={isPending} onClick={onDelete}><Trash2 className="h-4 w-4" />Delete</Button> : null}
        </div>
      </CardHeader>
      <dl className="grid gap-px bg-border md:grid-cols-2 xl:grid-cols-3">
        {allKeys.map((key) => (
          <CardContent key={key} className="bg-background p-4">
            <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{fieldLabel(module, key)}</dt>
            <dd className="mt-2 whitespace-pre-wrap break-words text-sm">
              {key === "status" ? <StatusBadge value={formatResourceValue(record[key])} /> : formatResourceValue(record[key]) || "None"}
            </dd>
          </CardContent>
        ))}
      </dl>
    </Card>
  );
}

function ResourceForm({ module, record, isSaving, onCancel, onSubmit }: { module: ResourceModule; record: AdminResourceRecord | null; isSaving: boolean; onCancel: () => void; onSubmit: (input: AdminResourceRecord) => void }) {
  const schema = useMemo(() => buildFormSchema(module.fields), [module.fields]);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: buildDefaultValues(module.fields, record),
  });

  useEffect(() => {
    form.reset(buildDefaultValues(module.fields, record));
  }, [form, module.fields, record]);

  return (
    <Card className="mb-6 rounded-lg shadow-none">
      <form onSubmit={form.handleSubmit((values) => onSubmit(valuesToRecord(module.fields, values)))}>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="font-display text-2xl">{record ? `Edit ${module.title}` : `New ${module.title}`}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Saved directly to the Supabase `{module.table}` table.</p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}><X className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {module.fields.map((field) => (
          <ResourceInput key={field.key} field={field} value={form.watch(field.key)} error={form.formState.errors[field.key]?.message} register={form.register} setValue={form.setValue} />
        ))}
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
      </CardFooter>
      </form>
    </Card>
  );
}

function ResourceInput({ field, value, error, register, setValue }: { field: ResourceField; value: string | boolean | undefined; error: string | undefined; register: ReturnType<typeof useForm<FormValues>>["register"]; setValue: ReturnType<typeof useForm<FormValues>>["setValue"] }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const label = <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{field.label}</Label>;
  const errorNode = error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null;
  if (field.type === "textarea" || field.type === "json") {
    return (
      <div className="md:col-span-2 xl:col-span-3">
        {label}
        <Textarea {...register(field.key)} value={typeof value === "string" ? value : ""} className="mt-2 min-h-24" />
        {errorNode}
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <div>
        {label}
        <Select
          value={typeof value === "string" && value ? value : "__none"}
          onValueChange={(next) => setValue(field.key, next === "__none" ? "" : next, { shouldDirty: true, shouldValidate: true })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none">Select</SelectItem>
            {(field.options ?? []).map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
          </SelectContent>
        </Select>
        {errorNode}
      </div>
    );
  }
  if (field.type === "boolean") {
    return (
      <div className="flex h-10 items-end gap-2 text-sm">
        <Checkbox checked={Boolean(value)} onCheckedChange={(checked) => setValue(field.key, checked === true, { shouldDirty: true, shouldValidate: true })} />
        <Label>{field.label}</Label>
        {errorNode}
      </div>
    );
  }
  if (isStorageUrlField(field)) {
    return (
      <div>
        {label}
        <div className="mt-2 flex gap-2">
          <Input {...register(field.key)} value={typeof value === "string" ? value : ""} className="h-10" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,application/pdf"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setUploading(true);
              uploadAdminFile(storageBucketForField(field), `${field.key}/${createUploadId()}-${sanitizeFileName(file.name)}`, file)
                .then((url) => {
                  setValue(field.key, url, { shouldDirty: true, shouldValidate: true });
                  toast.success("File uploaded");
                })
                .catch((uploadError: unknown) => {
                  toast.error(uploadError instanceof Error ? uploadError.message : "Upload failed");
                })
                .finally(() => {
                  setUploading(false);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                });
            }}
          />
          <Button type="button" variant="outline" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading" : "Upload"}
          </Button>
        </div>
        {errorNode}
      </div>
    );
  }
  return (
    <div>
      {label}
      <Input {...register(field.key)} value={typeof value === "string" ? value : ""} type={field.type === "number" ? "number" : field.type === "datetime" ? "datetime-local" : "text"} className="mt-2 h-10" />
      {errorNode}
    </div>
  );
}

function isStorageUrlField(field: ResourceField): boolean {
  return field.type === "text" && ["image_url", "logo_url", "url"].includes(field.key);
}

function storageBucketForField(field: ResourceField) {
  return field.key === "url" ? storageBuckets.cmsMedia : storageBuckets.productMedia;
}

function ConfirmationDialog({ confirmation, onClose }: { confirmation: PendingConfirmation; onClose: () => void }) {
  return (
    <Dialog open={Boolean(confirmation)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{confirmation?.title}</DialogTitle>
          <DialogDescription>{confirmation?.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            type="button"
            variant={confirmation?.variant === "destructive" ? "destructive" : "default"}
            onClick={() => {
              confirmation?.onConfirm();
              onClose();
            }}
          >
            {confirmation?.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResourceLoading() {
  return <div className="space-y-3 p-4">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-14 rounded-md" />)}</div>;
}

function ResourceEmpty({ filtered }: { filtered: boolean }) {
  return (
    <CardContent className="px-5 py-12 text-center">
      <p className="font-medium">{filtered ? "No matching records" : "No records yet"}</p>
      <p className="mt-1 text-sm text-muted-foreground">{filtered ? "Adjust search or filters to widen the result set." : "Create a record to populate this module."}</p>
    </CardContent>
  );
}

function ResourcePagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPrevious,
  onNext,
  onPrefetchPrevious,
  onPrefetchNext,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPrevious: () => void;
  onNext: () => void;
  onPrefetchPrevious: () => void;
  onPrefetchNext: () => void;
}) {
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(totalCount, page * pageSize);
  return (
    <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t p-4 text-sm text-muted-foreground">
      <span>Showing {start}-{end} of {totalCount}</span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onMouseEnter={onPrefetchPrevious}
          onFocus={onPrefetchPrevious}
          onClick={onPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="px-2">Page {page} of {totalPages}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onMouseEnter={onPrefetchNext}
          onFocus={onPrefetchNext}
          onClick={onNext}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </CardFooter>
  );
}

function visibleFields(module: ResourceModule): ResourceField[] {
  return module.fields.filter((field) => field.key !== module.primaryLabel).slice(0, 4);
}

function recordTitle(module: ResourceModule, record: AdminResourceRecord): string {
  return formatResourceValue(record[module.primaryLabel]) || formatResourceValue(record.name) || formatResourceValue(record.title) || formatResourceValue(record.key) || formatResourceValue(record.id) || "Untitled";
}

function fieldLabel(module: ResourceModule, key: string): string {
  return module.fields.find((field) => field.key === key)?.label ?? key.replaceAll("_", " ");
}

function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const variant = ["archived", "inactive", "disabled", "blocked", "failed", "rejected", "cancelled"].includes(normalized)
    ? "destructive"
    : ["active", "paid", "approved", "published", "in_stock"].includes(normalized)
      ? "default"
      : "secondary";
  return <Badge variant={variant}>{value || "None"}</Badge>;
}

function getPreferredStatus(field: ResourceField | undefined, candidates: string[]): string | undefined {
  const options = field?.options ?? [];
  return candidates.find((candidate) => options.includes(candidate));
}

function withoutIds(current: Set<string>, ids: string[]): Set<string> {
  const next = new Set(current);
  for (const id of ids) next.delete(id);
  return next;
}

function uniqueKeys(keys: string[]): string[] {
  return [...new Set(keys)];
}

function defaultSortKey(module: ResourceModule): string {
  return module.fields.some((field) => field.key === "updated_at") ? "updated_at" : module.primaryLabel;
}

function getSortableFields(module: ResourceModule): Array<{ key: string; label: string }> {
  return uniqueKeys([module.primaryLabel, ...module.fields.map((field) => field.key), "created_at", "updated_at"]).map((key) => ({
    key,
    label: fieldLabel(module, key),
  }));
}

function getSearchKeys(module: ResourceModule): string[] {
  return uniqueKeys([module.primaryLabel, ...module.fields.filter((field) => ["text", "textarea", "select", "datetime"].includes(field.type)).map((field) => field.key)]);
}

function hasActiveFilters(filters: Record<string, string>): boolean {
  return Object.values(filters).some((value) => value && value !== "all");
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debounced;
}

function buildDefaultValues(fields: ResourceField[], record: AdminResourceRecord | null): FormValues {
  const values: FormValues = {};
  for (const field of fields) {
    const current = record?.[field.key];
    values[field.key] = field.type === "boolean" ? Boolean(current) : formatInputValue(field, current);
  }
  return values;
}

function buildFormSchema(fields: ResourceField[]): z.ZodObject<z.ZodRawShape> {
  const shape: z.ZodRawShape = {};
  for (const field of fields) {
    if (field.type === "boolean") {
      shape[field.key] = z.boolean();
      continue;
    }
    let schema: z.ZodTypeAny = field.required
      ? z.string().min(1, `${field.label} is required`)
      : z.string();
    if (field.type === "number") schema = schema.refine((value) => value === "" || Number.isFinite(Number(value)), `${field.label} must be a number`);
    if (field.type === "json") {
      schema = schema.refine((value) => {
        if (!value.trim()) return true;
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      }, `${field.label} must be valid JSON`);
    }
    shape[field.key] = schema;
  }
  return z.object(shape);
}

function valuesToRecord(fields: ResourceField[], values: FormValues): AdminResourceRecord {
  const input: AdminResourceRecord = {};
  for (const field of fields) input[field.key] = parseResourceValue(field, values[field.key] ?? "");
  return input;
}

function formatInputValue(field: ResourceField, value: ResourceValue | undefined): string {
  if (field.type === "datetime" && typeof value === "string" && value) return value.slice(0, 16);
  return formatResourceValue(value);
}

function stripOptimisticId(record: AdminResourceRecord): AdminResourceRecord {
  if (!record.id?.startsWith("optimistic-")) return record;
  const { id: _id, ...rest } = record;
  return rest;
}

function recordsToCsv(module: ResourceModule, records: AdminResourceRecord[]): string {
  const headers = uniqueKeys([...module.fields.map((field) => field.key), "id", "key", "user_id", "created_at", "updated_at"]).filter((key) => records.some((record) => record[key] !== undefined));
  const lines = [headers.join(",")];
  for (const record of records) {
    lines.push(headers.map((header) => csvEscape(formatResourceValue(record[header]))).join(","));
  }
  return lines.join("\n");
}

function csvToRecords(module: ResourceModule, text: string): AdminResourceRecord[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0] ?? [];
  return rows.slice(1).filter((row) => row.some((cell) => cell.trim())).map((row) => {
    const record: AdminResourceRecord = {};
    for (const field of module.fields) {
      const index = headers.indexOf(field.key);
      if (index >= 0) record[field.key] = parseResourceValue(field, field.type === "boolean" ? row[index] === "true" : row[index] ?? "");
    }
    return record;
  });
}

function csvEscape(value: string): string {
  if (!/[",\n]/.test(value)) return value;
  return `"${value.replaceAll("\"", "\"\"")}"`;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted && char === "\"" && next === "\"") {
      cell += "\"";
      index += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  rows.push(row);
  return rows;
}
