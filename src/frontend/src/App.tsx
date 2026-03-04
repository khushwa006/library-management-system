import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import AppSidebar from "./components/AppSidebar";
import Header from "./components/Header";
import LoginScreen from "./components/LoginScreen";
import { RoleProvider, useRole } from "./contexts/RoleContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import BooksPage from "./pages/BooksPage";
import BorrowPage from "./pages/BorrowPage";
import DashboardPage from "./pages/DashboardPage";
import MembersPage from "./pages/MembersPage";
import RecommendationsPage from "./pages/RecommendationsPage";

export type PageId =
  | "dashboard"
  | "books"
  | "members"
  | "borrow"
  | "recommendations";

const ADMIN_PAGES: PageId[] = [
  "dashboard",
  "books",
  "members",
  "borrow",
  "recommendations",
];
const STUDENT_PAGES: PageId[] = ["books", "borrow", "recommendations"];

function AppContent() {
  const { isGuest, isAdmin, isLoading: roleLoading } = useRole();
  const { isInitializing } = useInternetIdentity();
  const [activePage, setActivePage] = useState<PageId>("books");

  const allowedPages = isAdmin ? ADMIN_PAGES : STUDENT_PAGES;

  // Reset to default page if current page is not allowed for role
  useEffect(() => {
    if (!roleLoading && !isGuest && !allowedPages.includes(activePage)) {
      setActivePage(isAdmin ? "dashboard" : "books");
    }
  }, [isAdmin, isGuest, roleLoading, allowedPages, activePage]);

  const handleNavigate = (page: PageId) => {
    if (allowedPages.includes(page)) {
      setActivePage(page);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage />;
      case "books":
        return <BooksPage />;
      case "members":
        return <MembersPage />;
      case "borrow":
        return <BorrowPage />;
      case "recommendations":
        return <RecommendationsPage />;
      default:
        return <BooksPage />;
    }
  };

  // Show full-page spinner while initializing or loading role
  if (isInitializing || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-mono-code">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Show login screen for guests
  if (isGuest) {
    return <LoginScreen />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar activePage={activePage} onNavigate={handleNavigate} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header activePage={activePage} onNavigate={handleNavigate} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="animate-fade-in">{renderPage()}</div>
          </main>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </SidebarProvider>
  );
}

function App() {
  return (
    <RoleProvider>
      <AppContent />
    </RoleProvider>
  );
}

export default App;
