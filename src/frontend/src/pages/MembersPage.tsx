import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  ChevronDown,
  Edit,
  Loader2,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Member, Variant_faculty_student_external } from "../backend.d";
import {
  useAddMember,
  useAllBooks,
  useAllMembers,
  useIsAdmin,
  useMemberBorrowHistory,
  useRemoveMember,
  useUpdateMember,
} from "../hooks/useQueries";
import { formatDate, formatFine, formatMemberType } from "../utils/format";

const memberTypeVariants: Record<Variant_faculty_student_external, string> = {
  faculty: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  student: "bg-primary/15 text-primary border-primary/30",
  external: "bg-muted text-muted-foreground border-border",
};

interface MemberFormData {
  name: string;
  email: string;
  memberType: Variant_faculty_student_external;
}

const defaultForm: MemberFormData = {
  name: "",
  email: "",
  memberType: "student" as Variant_faculty_student_external,
};

function MemberFormFields({
  form,
  onChange,
}: {
  form: MemberFormData;
  onChange: (field: keyof MemberFormData, value: string) => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="member-name" className="text-xs">
          Full Name *
        </Label>
        <Input
          id="member-name"
          data-ocid="add_member.name.input"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="e.g. Dr. Priya Sharma"
          className="h-9 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="member-email" className="text-xs">
          Email Address *
        </Label>
        <Input
          id="member-email"
          data-ocid="add_member.email.input"
          type="email"
          value={form.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="priya.sharma@university.edu"
          className="h-9 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Member Type *</Label>
        <Select
          value={form.memberType}
          onValueChange={(v) => onChange("memberType", v)}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="faculty">Faculty</SelectItem>
            <SelectItem value="external">External</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function AddMemberDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<MemberFormData>(defaultForm);
  const { mutateAsync, isPending } = useAddMember();

  const handleChange = (field: keyof MemberFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValid = form.name.trim() && form.email.trim();

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      await mutateAsync({
        name: form.name.trim(),
        email: form.email.trim(),
        memberType: form.memberType,
      });
      toast.success("Member added successfully!");
      setForm(defaultForm);
      setOpen(false);
    } catch {
      toast.error("Failed to add member.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 h-8" data-ocid="members.add_button">
          <Plus className="w-3.5 h-3.5" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent data-ocid="add_member.dialog" className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="font-display">
            Register New Member
          </DialogTitle>
          <DialogDescription>
            Enter the member's details to register them.
          </DialogDescription>
        </DialogHeader>
        <MemberFormFields form={form} onChange={handleChange} />
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            data-ocid="add_member.submit_button"
            disabled={!isValid || isPending}
            onClick={handleSubmit}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
            ) : null}
            {isPending ? "Adding..." : "Add Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditMemberDialog({ member }: { member: Member }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<MemberFormData>({
    name: member.name,
    email: member.email,
    memberType: member.memberType,
  });
  const { mutateAsync, isPending } = useUpdateMember();

  const handleChange = (field: keyof MemberFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await mutateAsync({
        id: member.id,
        name: form.name.trim(),
        email: form.email.trim(),
        memberType: form.memberType,
      });
      toast.success("Member updated!");
      setOpen(false);
    } catch {
      toast.error("Failed to update member.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Edit className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Member</DialogTitle>
          <DialogDescription>Update member information.</DialogDescription>
        </DialogHeader>
        <MemberFormFields form={form} onChange={handleChange} />
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" disabled={isPending} onClick={handleSubmit}>
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
            ) : null}
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteMemberDialog({ member, idx }: { member: Member; idx: number }) {
  const { mutateAsync, isPending } = useRemoveMember();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          data-ocid={`members.delete_button.${idx}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{member.name}</strong>? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-ocid="delete.cancel_button">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            data-ocid="delete.confirm_button"
            onClick={() =>
              mutateAsync(member.id)
                .then(() => toast.success(`${member.name} removed.`))
                .catch(() => toast.error("Failed to remove member."))
            }
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
            ) : null}
            Remove Member
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function MemberHistorySheet({
  member,
  open,
  onOpenChange,
}: {
  member: Member | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: history = [], isLoading } = useMemberBorrowHistory(
    member?.id ?? null,
  );
  const { data: books = [] } = useAllBooks();
  const bookMap = useMemo(
    () => new Map(books.map((b) => [Number(b.id), b])),
    [books],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[520px]">
        <SheetHeader>
          <SheetTitle className="font-display">Borrow History</SheetTitle>
          <SheetDescription>
            {member
              ? `All borrow records for ${member.name}`
              : "Select a member"}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No borrow history</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-160px)]">
              <div className="space-y-2 pr-3">
                {history.map((record) => {
                  const book = bookMap.get(Number(record.bookId));
                  const isReturned = record.returnDate !== undefined;
                  return (
                    <div
                      key={Number(record.id)}
                      className="p-3 rounded-lg border border-border/60 bg-card/60"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {book?.title ?? `Book #${Number(record.bookId)}`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Borrowed: {formatDate(record.borrowDate)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Due: {formatDate(record.dueDate)}
                          </p>
                          {isReturned && (
                            <p className="text-xs text-muted-foreground">
                              Returned: {formatDate(record.returnDate!)}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <Badge
                            className={
                              isReturned
                                ? "bg-success/15 text-success border-success/30 text-[10px]"
                                : "bg-primary/15 text-primary border-primary/30 text-[10px]"
                            }
                            variant="outline"
                          >
                            {isReturned ? "Returned" : "Active"}
                          </Badge>
                          {Number(record.fineAmount) > 0 && (
                            <span className="text-[10px] font-mono-code text-destructive">
                              Fine: {formatFine(record.fineAmount)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { data: members = [], isLoading } = useAllMembers();
  const { data: isAdmin = false } = useIsAdmin();

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.memberType.toLowerCase().includes(q),
    );
  }, [members, searchQuery]);

  const handleRowClick = (member: Member) => {
    setSelectedMember(member);
    setHistoryOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono-code text-muted-foreground uppercase tracking-widest">
              DBMS Module
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold">Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? "Loading..." : `${members.length} registered members`}
          </p>
        </div>
        {isAdmin && <AddMemberDialog />}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          data-ocid="members.search_input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or type..."
          className="pl-9 h-9 text-sm pr-8"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Members Table */}
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <Table data-ocid="members.table">
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/60">
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Name
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Email
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Type
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Joined
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right w-28">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <TableRow key={i} className="border-b border-border/30">
                  <TableCell>
                    <Skeleton className="h-3.5 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-24" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-16"
                  data-ocid="members.empty_state"
                >
                  <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? `No members matching "${searchQuery}"`
                      : "No members registered yet"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member, idx) => (
                <TableRow
                  key={Number(member.id)}
                  data-ocid={`members.item.${idx + 1}`}
                  className="border-b border-border/30 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(member)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-bold text-primary">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {member.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {member.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium ${memberTypeVariants[member.memberType]}`}
                    >
                      {formatMemberType(member.memberType)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground font-mono-code">
                      {formatDate(member.joinDate)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center justify-end gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs px-2 text-muted-foreground"
                      >
                        <ChevronDown className="h-3 w-3" />
                        History
                      </Button>
                      {isAdmin && (
                        <>
                          <span data-ocid={`members.edit_button.${idx + 1}`}>
                            <EditMemberDialog member={member} />
                          </span>
                          <DeleteMemberDialog member={member} idx={idx + 1} />
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredMembers.length > 0 && !isLoading && (
        <p className="text-xs text-muted-foreground font-mono-code">
          Showing {filteredMembers.length} of {members.length} members · Click a
          row to view borrow history
        </p>
      )}

      {/* Member History Sheet */}
      <MemberHistorySheet
        member={selectedMember}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />
    </div>
  );
}
