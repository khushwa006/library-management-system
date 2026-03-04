import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  BookOpen,
  ChevronRight,
  LayoutDashboard,
  Library,
  Shield,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import type { PageId } from "../App";
import { useRole } from "../contexts/RoleContext";

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
  badge?: string;
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
  {
    id: "books",
    label: "Books Catalog",
    icon: BookOpen,
    ocid: "nav.books.link",
  },
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
    label: "ML Recommendations",
    icon: Sparkles,
    badge: "AI",
    ocid: "nav.recommendations.link",
  },
];

interface AppSidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

export default function AppSidebar({
  activePage,
  onNavigate,
}: AppSidebarProps) {
  const { isAdmin, isStudent } = useRole();

  const navItems = allNavItems.filter((item) =>
    item.adminOnly ? isAdmin : true,
  );

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-sidebar border-r border-sidebar-border h-screen overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shrink-0">
          <Library className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <span className="font-display text-sm font-bold text-sidebar-foreground leading-tight block">
            LibraryOS
          </span>
          <span className="text-xs text-muted-foreground font-mono-code">
            v2.0.1
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2">
        <div className="mb-2 px-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground font-mono-code">
            Navigation
          </span>
        </div>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  data-ocid={item.ocid}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 group",
                    isActive
                      ? "sidebar-active text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-sidebar-accent-foreground",
                    )}
                  />
                  <span className="flex-1 text-left truncate">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="text-[9px] font-bold font-mono-code bg-primary/20 text-primary px-1.5 py-0.5 rounded-full border border-primary/30">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight className="w-3 h-3 text-primary shrink-0" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom footer */}
      <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
        {/* Role badge */}
        <div
          data-ocid="sidebar.role.panel"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border",
            isAdmin
              ? "bg-warning/10 border-warning/30 text-warning"
              : isStudent
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-muted/30 border-border text-muted-foreground",
          )}
        >
          {isAdmin ? (
            <Shield className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{isAdmin ? "Admin Mode" : "Student Mode"}</span>
        </div>

        {/* System status */}
        <div className="text-[10px] text-muted-foreground font-mono-code leading-relaxed">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block animate-pulse" />
            <span>System Online</span>
          </div>
          <div className="opacity-60">DBMS · ML · OS Integration</div>
        </div>
      </div>
    </aside>
  );
}
