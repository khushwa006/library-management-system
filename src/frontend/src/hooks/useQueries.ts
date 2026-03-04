import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Book,
  BorrowRecord,
  DashboardStats,
  Member,
  Recommendation,
  UserRole,
  Variant_faculty_student_external,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Dashboard ───────────────────────────────────────────────────────────────

export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<DashboardStats | null>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Books ────────────────────────────────────────────────────────────────────

export function useAllBooks() {
  const { actor, isFetching } = useActor();
  return useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBooks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchBooks(
  query: string,
  field: "title" | "author" | "genre" | "isbn",
) {
  const { actor, isFetching } = useActor();
  return useQuery<Book[]>({
    queryKey: ["books", "search", field, query],
    queryFn: async () => {
      if (!actor || !query.trim()) return [];
      const searchMap = {
        title: () => actor.searchBooksByTitle(query),
        author: () => actor.searchBooksByAuthor(query),
        genre: () => actor.searchBooksByGenre(query),
        isbn: () => actor.searchBooksByISBN(query),
      };
      return searchMap[field]();
    },
    enabled: !!actor && !isFetching && query.trim().length > 0,
  });
}

export function useAddBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      author: string;
      isbn: string;
      genre: string;
      yearPublished: bigint;
      quantity: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addBook(
        params.title,
        params.author,
        params.isbn,
        params.genre,
        params.yearPublished,
        params.quantity,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      title: string;
      author: string;
      isbn: string;
      genre: string;
      yearPublished: bigint;
      quantity: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateBook(
        params.id,
        params.title,
        params.author,
        params.isbn,
        params.genre,
        params.yearPublished,
        params.quantity,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRemoveBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeBook(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ─── Members ──────────────────────────────────────────────────────────────────

export function useAllMembers() {
  const { actor, isFetching } = useActor();
  return useQuery<Member[]>({
    queryKey: ["members"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMembers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      email: string;
      memberType: Variant_faculty_student_external;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addMember(params.name, params.email, params.memberType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      name: string;
      email: string;
      memberType: Variant_faculty_student_external;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateMember(
        params.id,
        params.name,
        params.email,
        params.memberType,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useRemoveMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeMember(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useMemberBorrowHistory(memberId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<BorrowRecord[]>({
    queryKey: ["member-history", memberId?.toString()],
    queryFn: async () => {
      if (!actor || memberId === null) return [];
      return actor.getMemberBorrowHistory(memberId);
    },
    enabled: !!actor && !isFetching && memberId !== null,
  });
}

// ─── Borrow / Return ──────────────────────────────────────────────────────────

export function useActiveBorrows() {
  const { actor, isFetching } = useActor();
  return useQuery<BorrowRecord[]>({
    queryKey: ["active-borrows"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveBorrowRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOverdueBorrows() {
  const { actor, isFetching } = useActor();
  return useQuery<BorrowRecord[]>({
    queryKey: ["overdue-borrows"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOverdueBorrowRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBorrowBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { memberId: bigint; bookId: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.borrowBook(params.memberId, params.bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["active-borrows"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useReturnBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (borrowId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.returnBook(borrowId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["active-borrows"] });
      queryClient.invalidateQueries({ queryKey: ["overdue-borrows"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export function useRecommendations(memberId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Recommendation[]>({
    queryKey: ["recommendations", memberId?.toString()],
    queryFn: async () => {
      if (!actor || memberId === null) return [];
      return actor.getRecommendations(memberId);
    },
    enabled: !!actor && !isFetching && memberId !== null,
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function useUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole | null>({
    queryKey: ["user-role"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
