import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface BorrowRecord {
    id: bigint;
    memberId: bigint;
    borrowDate: Time;
    fineAmount: bigint;
    dueDate: Time;
    bookId: bigint;
    returnDate?: Time;
}
export interface Recommendation {
    title: string;
    genreScore: bigint;
    bookId: bigint;
    author: string;
    genre: string;
}
export interface Member {
    id: bigint;
    joinDate: Time;
    name: string;
    email: string;
    memberType: Variant_faculty_student_external;
}
export interface Book {
    id: bigint;
    title: string;
    availableQuantity: bigint;
    isbn: string;
    yearPublished: bigint;
    author: string;
    genre: string;
    totalQuantity: bigint;
}
export interface DashboardStats {
    totalFines: bigint;
    overdueLoans: bigint;
    mostBorrowedBooks: Array<Book>;
    totalBooks: bigint;
    totalMembers: bigint;
    recentlyAddedBooks: Array<Book>;
    activeLoans: bigint;
}
export interface UserProfile {
    memberId?: bigint;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_faculty_student_external {
    faculty = "faculty",
    student = "student",
    external = "external"
}
export interface backendInterface {
    addBook(title: string, author: string, isbn: string, genre: string, yearPublished: bigint, quantity: bigint): Promise<bigint>;
    addMember(name: string, email: string, memberType: Variant_faculty_student_external): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    borrowBook(memberId: bigint, bookId: bigint): Promise<bigint>;
    calculateFine(borrowId: bigint): Promise<bigint>;
    getActiveBorrowRecords(): Promise<Array<BorrowRecord>>;
    getAllBooks(): Promise<Array<Book>>;
    getAllMembers(): Promise<Array<Member>>;
    getBookBorrowHistory(bookId: bigint): Promise<Array<BorrowRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getMemberBorrowHistory(memberId: bigint): Promise<Array<BorrowRecord>>;
    getOverdueBorrowRecords(): Promise<Array<BorrowRecord>>;
    getRecommendations(memberId: bigint): Promise<Array<Recommendation>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    linkPrincipalToMember(memberId: bigint): Promise<void>;
    removeBook(id: bigint): Promise<void>;
    removeMember(id: bigint): Promise<void>;
    returnBook(borrowId: bigint): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchBooksByAuthor(author: string): Promise<Array<Book>>;
    searchBooksByGenre(genre: string): Promise<Array<Book>>;
    searchBooksByISBN(isbn: string): Promise<Array<Book>>;
    searchBooksByTitle(title: string): Promise<Array<Book>>;
    updateBook(id: bigint, title: string, author: string, isbn: string, genre: string, yearPublished: bigint, quantity: bigint): Promise<void>;
    updateMember(id: bigint, name: string, email: string, memberType: Variant_faculty_student_external): Promise<void>;
}
