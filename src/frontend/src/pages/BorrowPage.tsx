import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeftRight,
  BookCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { BorrowRecord } from "../backend.d";
import {
  useActiveBorrows,
  useAllBooks,
  useAllMembers,
  useBorrowBook,
  useIsAdmin,
  useReturnBook,
} from "../hooks/useQueries";
import { formatDate, formatFine, isOverdue } from "../utils/format";

export default function BorrowPage() {
  const { data: isAdmin = false } = useIsAdmin();
  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono-code text-muted-foreground uppercase tracking-widest">
            Circulation Module
          </span>
        </div>
        <h1 className="text-2xl font-display font-bold">Borrow / Return</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Issue books to members and process returns
        </p>
      </div>

      <Tabs defaultValue="issue">
        <TabsList className="h-9 bg-muted/40">
          <TabsTrigger
            value="issue"
            className="text-sm"
            data-ocid="borrow.issue.tab"
          >
            Issue Book
          </TabsTrigger>
          <TabsTrigger
            value="return"
            className="text-sm"
            data-ocid="borrow.return.tab"
          >
            Return Book
          </TabsTrigger>
        </TabsList>

        <TabsContent value="issue" className="mt-5">
          <IssueBookTab isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="return" className="mt-5">
          <ReturnBookTab isAdmin={isAdmin} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IssueBookTab({ isAdmin }: { isAdmin: boolean }) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [lastBorrowId, setLastBorrowId] = useState<bigint | null>(null);

  const { data: members = [], isLoading: membersLoading } = useAllMembers();
  const { data: books = [], isLoading: booksLoading } = useAllBooks();
  const { mutateAsync: borrowBook, isPending } = useBorrowBook();

  const availableBooks = useMemo(
    () => books.filter((b) => Number(b.availableQuantity) > 0),
    [books],
  );

  const handleIssue = async () => {
    if (!selectedMemberId || !selectedBookId) return;
    try {
      const borrowId = await borrowBook({
        memberId: BigInt(selectedMemberId),
        bookId: BigInt(selectedBookId),
      });
      setLastBorrowId(borrowId);
      setSelectedMemberId("");
      setSelectedBookId("");
      toast.success(
        `Book issued successfully! Borrow ID: #${Number(borrowId)}`,
      );
    } catch {
      toast.error("Failed to issue book. Please try again.");
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 rounded-lg border border-border/60 text-center">
        <ArrowLeftRight className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Admin access required to issue books.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="p-5 rounded-lg border border-border/60 bg-card/60 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-primary" />
          Issue Book to Member
        </h3>

        {/* Member Select */}
        <div className="space-y-1.5">
          <Label className="text-xs">Select Member *</Label>
          {membersLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select
              value={selectedMemberId}
              onValueChange={setSelectedMemberId}
            >
              <SelectTrigger
                className="h-9 text-sm"
                data-ocid="borrow.member.select"
              >
                <SelectValue placeholder="Choose a member..." />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={Number(m.id)} value={String(Number(m.id))}>
                    <span className="flex items-center gap-2">
                      <span>{m.name}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {m.memberType}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Book Select */}
        <div className="space-y-1.5">
          <Label className="text-xs">Select Book *</Label>
          {booksLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select value={selectedBookId} onValueChange={setSelectedBookId}>
              <SelectTrigger
                className="h-9 text-sm"
                data-ocid="borrow.book.select"
              >
                <SelectValue placeholder="Choose an available book..." />
              </SelectTrigger>
              <SelectContent>
                {availableBooks.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No books available
                  </SelectItem>
                ) : (
                  availableBooks.map((b) => (
                    <SelectItem key={Number(b.id)} value={String(Number(b.id))}>
                      <span className="flex items-center gap-2">
                        <span>{b.title}</span>
                        <span className="text-xs text-muted-foreground">
                          ({Number(b.availableQuantity)} left)
                        </span>
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
          {!booksLoading && availableBooks.length === 0 && (
            <p className="text-xs text-destructive">
              All books are currently checked out.
            </p>
          )}
        </div>

        <Button
          className="w-full"
          data-ocid="borrow.submit_button"
          disabled={!selectedMemberId || !selectedBookId || isPending}
          onClick={handleIssue}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <ArrowLeftRight className="h-4 w-4 mr-2" />
          )}
          {isPending ? "Issuing..." : "Issue Book"}
        </Button>

        {lastBorrowId !== null && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30 text-success animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p className="text-sm">
              Book issued! Borrow ID:{" "}
              <strong className="font-mono-code">
                #{Number(lastBorrowId)}
              </strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReturnRow({
  record,
  idx,
  memberName,
  bookTitle,
  isAdmin,
}: {
  record: BorrowRecord;
  idx: number;
  memberName: string;
  bookTitle: string;
  isAdmin: boolean;
}) {
  const { mutateAsync: returnBook, isPending } = useReturnBook();
  const overdue = isOverdue(record.dueDate, record.returnDate);

  const handleReturn = async () => {
    try {
      const fine = await returnBook(record.id);
      if (Number(fine) > 0) {
        toast.warning(`Book returned. Fine applied: ${formatFine(fine)}`);
      } else {
        toast.success("Book returned successfully!");
      }
    } catch {
      toast.error("Failed to process return.");
    }
  };

  return (
    <TableRow
      data-ocid={`return.item.${idx}`}
      className={cn(
        "border-b border-border/30 transition-colors",
        overdue ? "overdue-row" : "hover:bg-muted/20",
      )}
    >
      <TableCell>
        <span className="text-xs font-mono-code text-muted-foreground">
          #{Number(record.id)}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm font-medium text-foreground">
          {memberName}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-foreground">{bookTitle}</span>
      </TableCell>
      <TableCell>
        <span className="text-xs font-mono-code text-muted-foreground">
          {formatDate(record.borrowDate)}
        </span>
      </TableCell>
      <TableCell>
        <span
          className={cn(
            "text-xs font-mono-code",
            overdue
              ? "text-destructive font-semibold"
              : "text-muted-foreground",
          )}
        >
          {formatDate(record.dueDate)}
        </span>
      </TableCell>
      <TableCell>
        {overdue ? (
          <Badge
            className="bg-destructive/15 text-destructive border-destructive/30 text-[10px] gap-1"
            variant="outline"
          >
            <AlertTriangle className="w-2.5 h-2.5" />
            Overdue
          </Badge>
        ) : (
          <Badge
            className="bg-success/15 text-success border-success/30 text-[10px]"
            variant="outline"
          >
            Active
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        {isAdmin && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1.5"
            data-ocid={`return.button.${idx}`}
            disabled={isPending}
            onClick={handleReturn}
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <BookCheck className="h-3 w-3" />
            )}
            Return
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

function ReturnBookTab({ isAdmin }: { isAdmin: boolean }) {
  const { data: activeBorrows = [], isLoading: borrowsLoading } =
    useActiveBorrows();
  const { data: members = [] } = useAllMembers();
  const { data: books = [] } = useAllBooks();

  const memberMap = useMemo(
    () => new Map(members.map((m) => [Number(m.id), m])),
    [members],
  );
  const bookMap = useMemo(
    () => new Map(books.map((b) => [Number(b.id), b])),
    [books],
  );

  const overdueCount = useMemo(
    () =>
      activeBorrows.filter((r) => isOverdue(r.dueDate, r.returnDate)).length,
    [activeBorrows],
  );

  return (
    <div className="space-y-4">
      {overdueCount > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>{overdueCount}</strong> overdue loan
            {overdueCount !== 1 ? "s" : ""} — highlighted in red below
          </span>
        </div>
      )}

      <div className="rounded-lg border border-border/60 overflow-hidden">
        <Table data-ocid="return.table">
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/60">
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">
                ID
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Member
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Book
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Borrowed
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Due Date
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right w-24">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {borrowsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <TableRow key={i} className="border-b border-border/30">
                  {Array.from({ length: 7 }).map((_, j) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                    <TableCell key={j}>
                      <Skeleton className="h-3.5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : activeBorrows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <BookCheck className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No active borrows
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    All books have been returned
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              activeBorrows.map((record, idx) => (
                <ReturnRow
                  key={Number(record.id)}
                  record={record}
                  idx={idx + 1}
                  memberName={
                    memberMap.get(Number(record.memberId))?.name ??
                    `Member #${Number(record.memberId)}`
                  }
                  bookTitle={
                    bookMap.get(Number(record.bookId))?.title ??
                    `Book #${Number(record.bookId)}`
                  }
                  isAdmin={isAdmin}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {activeBorrows.length > 0 && !borrowsLoading && (
        <p className="text-xs text-muted-foreground font-mono-code">
          {activeBorrows.length} active loan
          {activeBorrows.length !== 1 ? "s" : ""}
          {overdueCount > 0 ? ` · ${overdueCount} overdue` : ""}
        </p>
      )}
    </div>
  );
}
