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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, Edit, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Book } from "../backend.d";
import {
  useAddBook,
  useAllBooks,
  useIsAdmin,
  useRemoveBook,
  useUpdateBook,
} from "../hooks/useQueries";

interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  genre: string;
  yearPublished: string;
  quantity: string;
}

const defaultForm: BookFormData = {
  title: "",
  author: "",
  isbn: "",
  genre: "",
  yearPublished: "",
  quantity: "1",
};

function BookFormFields({
  form,
  onChange,
}: {
  form: BookFormData;
  onChange: (field: keyof BookFormData, value: string) => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="book-title" className="text-xs">
            Title *
          </Label>
          <Input
            id="book-title"
            data-ocid="add_book.title.input"
            value={form.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="e.g. Operating System Concepts"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="book-author" className="text-xs">
            Author *
          </Label>
          <Input
            id="book-author"
            data-ocid="add_book.author.input"
            value={form.author}
            onChange={(e) => onChange("author", e.target.value)}
            placeholder="e.g. Abraham Silberschatz"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="book-isbn" className="text-xs">
            ISBN *
          </Label>
          <Input
            id="book-isbn"
            value={form.isbn}
            onChange={(e) => onChange("isbn", e.target.value)}
            placeholder="978-0-13-230448-0"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="book-genre" className="text-xs">
            Genre *
          </Label>
          <Input
            id="book-genre"
            value={form.genre}
            onChange={(e) => onChange("genre", e.target.value)}
            placeholder="e.g. Computer Science"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="book-year" className="text-xs">
            Year Published *
          </Label>
          <Input
            id="book-year"
            type="number"
            value={form.yearPublished}
            onChange={(e) => onChange("yearPublished", e.target.value)}
            placeholder="2024"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="book-qty" className="text-xs">
            Quantity *
          </Label>
          <Input
            id="book-qty"
            type="number"
            min={1}
            value={form.quantity}
            onChange={(e) => onChange("quantity", e.target.value)}
            placeholder="1"
            className="h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

function AddBookDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BookFormData>(defaultForm);
  const { mutateAsync, isPending } = useAddBook();

  const handleChange = (field: keyof BookFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValid =
    form.title &&
    form.author &&
    form.isbn &&
    form.genre &&
    form.yearPublished &&
    form.quantity;

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      await mutateAsync({
        title: form.title.trim(),
        author: form.author.trim(),
        isbn: form.isbn.trim(),
        genre: form.genre.trim(),
        yearPublished: BigInt(Number.parseInt(form.yearPublished)),
        quantity: BigInt(Number.parseInt(form.quantity)),
      });
      toast.success("Book added successfully!");
      setForm(defaultForm);
      setOpen(false);
      onSuccess();
    } catch {
      toast.error("Failed to add book. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 h-8" data-ocid="books.add_button">
          <Plus className="w-3.5 h-3.5" />
          Add Book
        </Button>
      </DialogTrigger>
      <DialogContent data-ocid="add_book.dialog" className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display">Add New Book</DialogTitle>
          <DialogDescription>
            Enter the book details to add it to the catalog.
          </DialogDescription>
        </DialogHeader>
        <BookFormFields form={form} onChange={handleChange} />
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            data-ocid="add_book.submit_button"
            disabled={!isValid || isPending}
            onClick={handleSubmit}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
            ) : null}
            {isPending ? "Adding..." : "Add Book"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditBookDialog({
  book,
  onSuccess,
}: { book: Book; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BookFormData>({
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    genre: book.genre,
    yearPublished: String(Number(book.yearPublished)),
    quantity: String(Number(book.totalQuantity)),
  });
  const { mutateAsync, isPending } = useUpdateBook();

  const handleChange = (field: keyof BookFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await mutateAsync({
        id: book.id,
        title: form.title.trim(),
        author: form.author.trim(),
        isbn: form.isbn.trim(),
        genre: form.genre.trim(),
        yearPublished: BigInt(Number.parseInt(form.yearPublished)),
        quantity: BigInt(Number.parseInt(form.quantity)),
      });
      toast.success("Book updated successfully!");
      setOpen(false);
      onSuccess();
    } catch {
      toast.error("Failed to update book.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Edit className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Book</DialogTitle>
          <DialogDescription>Update the book information.</DialogDescription>
        </DialogHeader>
        <BookFormFields form={form} onChange={handleChange} />
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

function DeleteBookDialog({ book, idx }: { book: Book; idx: number }) {
  const { mutateAsync, isPending } = useRemoveBook();

  const handleDelete = async () => {
    try {
      await mutateAsync(book.id);
      toast.success(`"${book.title}" removed from catalog.`);
    } catch {
      toast.error("Failed to remove book.");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          data-ocid={`books.delete_button.${idx}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Book</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>"{book.title}"</strong> from
            the catalog? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-ocid="delete.cancel_button">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            data-ocid="delete.confirm_button"
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
            ) : null}
            Remove Book
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function BooksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: books = [], isLoading } = useAllBooks();
  const { data: isAdmin = false } = useIsAdmin();

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const q = searchQuery.toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q),
    );
  }, [books, searchQuery]);

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
          <h1 className="text-2xl font-display font-bold">Books Catalog</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? "Loading..." : `${books.length} books in database`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && <AddBookDialog onSuccess={() => {}} />}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          data-ocid="books.search_input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, author, genre, or ISBN..."
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

      {/* Books Table */}
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <Table data-ocid="books.table">
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/60">
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[280px]">
                Title / Author
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                ISBN
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Genre
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                Year
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                Available
              </TableHead>
              {isAdmin && (
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right w-20">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <TableRow key={i} className="border-b border-border/30">
                  <TableCell>
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3 w-10 mx-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                  </TableCell>
                  {isAdmin && <TableCell />}
                </TableRow>
              ))
            ) : filteredBooks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 6 : 5}
                  className="text-center py-16"
                  data-ocid="books.empty_state"
                >
                  <BookOpen className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? `No books matching "${searchQuery}"`
                      : "No books in catalog yet"}
                  </p>
                  {isAdmin && !searchQuery && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Add your first book to get started
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredBooks.map((book, idx) => {
                const available = Number(book.availableQuantity);
                const total = Number(book.totalQuantity);
                return (
                  <TableRow
                    key={Number(book.id)}
                    data-ocid={`books.item.${idx + 1}`}
                    className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-foreground leading-tight">
                          {book.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {book.author}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono-code text-muted-foreground">
                        {book.isbn}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-medium"
                      >
                        {book.genre}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-mono-code text-muted-foreground">
                        {Number(book.yearPublished)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={
                          available > 0
                            ? "bg-success/15 text-success border-success/30 text-xs"
                            : "bg-destructive/15 text-destructive border-destructive/30 text-xs"
                        }
                        variant="outline"
                      >
                        {available}/{total}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <span data-ocid={`books.edit_button.${idx + 1}`}>
                            <EditBookDialog book={book} onSuccess={() => {}} />
                          </span>
                          <DeleteBookDialog book={book} idx={idx + 1} />
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {filteredBooks.length > 0 && !isLoading && (
        <p className="text-xs text-muted-foreground font-mono-code">
          Showing {filteredBooks.length} of {books.length} records
        </p>
      )}
    </div>
  );
}
