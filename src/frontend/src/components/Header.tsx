import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  BookOpen,
  ChevronRight,
  LayoutDashboard,
  Library,
  Loader2,
  LogOut,
  Menu,
  Shield,
  Sparkles,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import type { PageId } from "../App";
import { useRole } from "../contexts/RoleContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const pageLabels: Record<PageId, string> = {
  dashboard: "System Monitor",
  books: "Books Catalog",
  members: "Members",
  borrow: "Borrow / Return",
  recommendations: "ML Recommendations",
};

const pageIcons: Record<PageId, React.ElementType> = {
  dashboard: LayoutDashboard,
  books: BookOpen,
  members: Users,
  borrow: ArrowLeftRight,
  recommendations: Sparkles,
};

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
  ocid: string;
  adminOnly?: boolean;
}

const allNavItems: NavItem[] = [
  {
    id: "dashboard",
    label: "System Monitor",
    icon: LayoutDashboard,
    ocid: "nav.dashboard.link",
    adminOnly: true,
  },
  { id: "books", label: "Books", icon: BookOpen, ocid: "nav.books.link" },
  {
    id: "members",
    label: "Members",
    icon: Users,
    ocid: "nav.members.link",
    adminOnly: true,
  },
  {
    id: "borrow",
    label: "Borrow / Return",
    icon: ArrowLeftRight,
    ocid: "nav.borrow.link",
  },
  {
    id: "recommendations",
    label: "ML Recs",
    icon: Sparkles,
    ocid: "nav.recommendations.link",
  },
];

interface HeaderProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

export default function Header({ activePage, onNavigate }: HeaderProps) {
  const { identity, clear, isInitializing } = useInternetIdentity();
  const { isAdmin, isStudent } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const PageIcon = pageIcons[activePage];

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 6)}...${principal.slice(-4)}`
    : null;

  const navItems = allNavItems.filter((item) =>
    item.adminOnly ? isAdmin : true,
  );

  return (
    <>
      <header className="h-14 flex items-center px-4 md:px-6 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2 h-8 w-8"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>

        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2 mr-auto">
          <Library className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-sm">LibraryOS</span>
        </div>

        {/* Page title (desktop) */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">LibraryOS</span>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
          <PageIcon className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">
            {pageLabels[activePage]}
          </span>
        </div>

        {/* Auth controls */}
        <div className="ml-auto flex items-center gap-2">
          {isInitializing ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : identity ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 h-8 px-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                      {principal ? principal.slice(0, 2).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-xs font-mono-code text-muted-foreground">
                    {shortPrincipal}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium">Signed in</p>
                      {/* Role badge */}
                      <div data-ocid="header.role.panel">
                        {isAdmin ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-4 gap-1 border-warning/40 bg-warning/10 text-warning"
                          >
                            <Shield className="w-2.5 h-2.5" />
                            Admin
                          </Badge>
                        ) : isStudent ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-4 gap-1 border-primary/40 bg-primary/10 text-primary"
                          >
                            <UserCheck className="w-2.5 h-2.5" />
                            Student
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-[10px] font-mono-code text-muted-foreground truncate">
                      {principal}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-3.5 w-3.5" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={clear}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-50 bg-background/95 backdrop-blur-sm">
          <nav className="p-4">
            {/* Mobile role badge */}
            <div
              data-ocid="sidebar.role.panel"
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border mb-4",
                isAdmin
                  ? "bg-warning/10 border-warning/30 text-warning"
                  : "bg-primary/10 border-primary/30 text-primary",
              )}
            >
              {isAdmin ? (
                <Shield className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{isAdmin ? "Admin Mode" : "Student Mode"}</span>
            </div>

            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      data-ocid={item.ocid}
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/15 text-primary border-l-2 border-primary"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4",
                          isActive ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
