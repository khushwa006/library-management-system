import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  BookOpen,
  Clock,
  DollarSign,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import { useDashboardStats } from "../hooks/useQueries";
import { formatFine, truncate } from "../utils/format";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  color,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  color: string;
  loading?: boolean;
}) {
  return (
    <Card className="stat-card-glow border-border/60 relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono-code mb-1.5">
              {title}
            </p>
            {loading ? (
              <Skeleton className="h-8 w-20 mb-1" />
            ) : (
              <p className={`text-2xl font-bold font-display ${color}`}>
                {value}
              </p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color.replace("text-", "bg-").replace("-", "/10-")}`}
            style={{ background: "oklch(from currentColor l c h / 0.12)" }}
          >
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BookListItem({
  title,
  author,
  genre,
  rank,
}: { title: string; author: string; genre: string; rank?: number }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
      {rank !== undefined && (
        <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold font-mono-code flex items-center justify-center shrink-0">
          {rank}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{author}</p>
      </div>
      <Badge variant="outline" className="text-[10px] shrink-0 font-mono-code">
        {genre}
      </Badge>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  const overdueCount = stats ? Number(stats.overdueLoans) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono-code text-muted-foreground uppercase tracking-widest">
            System Monitor
          </span>
          <span className="flex items-center gap-1 text-[10px] font-mono-code text-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block animate-pulse" />
            Operational
          </span>
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time library system statistics and monitoring
        </p>
      </div>

      {/* Overdue Alert */}
      {overdueCount > 0 && (
        <Alert className="border-destructive/50 bg-destructive/10 text-destructive animate-fade-in">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertTitle className="text-destructive font-semibold">
            Overdue Alert
          </AlertTitle>
          <AlertDescription className="text-destructive/80">
            {overdueCount} loan{overdueCount !== 1 ? "s are" : " is"} overdue.
            Please review the Borrow / Return section immediately.
          </AlertDescription>
        </Alert>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <StatCard
          title="Total Books"
          value={
            isLoading ? "—" : Number(stats?.totalBooks ?? 0).toLocaleString()
          }
          icon={BookOpen}
          description="In catalog"
          color="text-chart-2"
          loading={isLoading}
        />
        <StatCard
          title="Members"
          value={
            isLoading ? "—" : Number(stats?.totalMembers ?? 0).toLocaleString()
          }
          icon={Users}
          description="Registered"
          color="text-primary"
          loading={isLoading}
        />
        <StatCard
          title="Active Loans"
          value={
            isLoading ? "—" : Number(stats?.activeLoans ?? 0).toLocaleString()
          }
          icon={Clock}
          description="Currently out"
          color="text-chart-3"
          loading={isLoading}
        />
        <StatCard
          title="Overdue"
          value={
            isLoading ? "—" : Number(stats?.overdueLoans ?? 0).toLocaleString()
          }
          icon={AlertTriangle}
          description="Past due date"
          color={
            overdueCount > 0 ? "text-destructive" : "text-muted-foreground"
          }
          loading={isLoading}
        />
        <StatCard
          title="Fines Collected"
          value={isLoading ? "—" : formatFine(stats?.totalFines ?? 0n)}
          icon={DollarSign}
          description="Total revenue"
          color="text-chart-4"
          loading={isLoading}
        />
      </div>

      {/* Book Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Borrowed */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold">
                Most Borrowed Books
              </CardTitle>
            </div>
            <Badge variant="secondary" className="text-[10px] font-mono-code">
              DBMS
            </Badge>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (stats?.mostBorrowedBooks?.length ?? 0) > 0 ? (
              <div>
                {(stats?.mostBorrowedBooks ?? []).slice(0, 5).map((book, i) => (
                  <BookListItem
                    key={Number(book.id)}
                    title={book.title}
                    author={book.author}
                    genre={book.genre}
                    rank={i + 1}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No data available yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recently Added */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-chart-3" />
              <CardTitle className="text-sm font-semibold">
                Recently Added Books
              </CardTitle>
            </div>
            <Badge variant="secondary" className="text-[10px] font-mono-code">
              DBMS
            </Badge>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (stats?.recentlyAddedBooks?.length ?? 0) > 0 ? (
              <div>
                {(stats?.recentlyAddedBooks ?? []).slice(0, 5).map((book) => (
                  <BookListItem
                    key={Number(book.id)}
                    title={book.title}
                    author={book.author}
                    genre={book.genre}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No books added yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Info Footer */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "DBMS", desc: "PostgreSQL-like structured data" },
          { label: "ML Engine", desc: "Genre-based recommendation" },
          { label: "OS Layer", desc: "System monitoring active" },
        ].map((item) => (
          <div
            key={item.label}
            className="p-3 rounded-lg bg-muted/40 border border-border/40"
          >
            <p className="text-xs font-bold font-mono-code text-primary">
              {item.label}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Caffeine Footer */}
      <footer className="text-center text-xs text-muted-foreground pt-4 pb-2">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
