import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Brain, Loader2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { Recommendation } from "../backend.d";
import { useAllMembers, useRecommendations } from "../hooks/useQueries";
import { truncate } from "../utils/format";

function RecommendationCard({
  rec,
  idx,
}: { rec: Recommendation; idx: number }) {
  const score = Math.min(Number(rec.genreScore), 100);
  const scoreLabel =
    score >= 80 ? "Highly Relevant" : score >= 50 ? "Relevant" : "Suggested";
  const scoreColor =
    score >= 80
      ? "text-success"
      : score >= 50
        ? "text-primary"
        : "text-muted-foreground";

  return (
    <Card
      className="border-border/60 hover:border-primary/40 transition-all duration-200 hover:shadow-card group animate-fade-in"
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Book icon with rank */}
          <div className="w-10 h-12 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            {/* Title & Author */}
            <div>
              <h3 className="text-sm font-semibold text-foreground leading-tight">
                {truncate(rec.title, 60)}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {rec.author}
              </p>
            </div>

            {/* Genre */}
            <Badge variant="outline" className="text-[10px] font-medium">
              {rec.genre}
            </Badge>

            {/* Score bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-mono-code uppercase tracking-wide">
                  Genre Relevance
                </span>
                <span
                  className={`text-[10px] font-semibold font-mono-code ${scoreColor}`}
                >
                  {scoreLabel}
                </span>
              </div>
              <div className="relative">
                <Progress value={score} className="h-1.5 bg-muted/60" />
              </div>
              <p className={`text-[10px] font-mono-code ${scoreColor}`}>
                Score: {score}/100
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RecommendationsPage() {
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const { data: members = [], isLoading: membersLoading } = useAllMembers();
  const memberIdBigInt = useMemo(
    () => (selectedMemberId ? BigInt(selectedMemberId) : null),
    [selectedMemberId],
  );
  const {
    data: recommendations = [],
    isLoading: recsLoading,
    isFetching,
  } = useRecommendations(memberIdBigInt);

  const selectedMember = useMemo(
    () => members.find((m) => String(Number(m.id)) === selectedMemberId),
    [members, selectedMemberId],
  );

  const isLoadingRecs = recsLoading || isFetching;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono-code text-muted-foreground uppercase tracking-widest">
            ML Module
          </span>
          <Badge
            className="text-[9px] font-bold bg-primary/15 text-primary border-primary/30 font-mono-code"
            variant="outline"
          >
            AI-Powered
          </Badge>
        </div>
        <h1 className="text-2xl font-display font-bold">
          ML-Powered Recommendations
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Based on borrowing history and genre preferences
        </p>
      </div>

      {/* How it Works Banner */}
      <div className="p-4 rounded-lg bg-primary/8 border border-primary/20 flex items-start gap-3">
        <Brain className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">
            How Recommendations Work
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            The ML engine analyzes each member's borrowing history and
            calculates genre affinity scores. Books from preferred genres with
            high availability are ranked by relevance.
          </p>
        </div>
      </div>

      {/* Member Selector */}
      <div className="max-w-sm space-y-1.5">
        <Label className="text-xs font-medium">Select a Member</Label>
        {membersLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : (
          <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
            <SelectTrigger
              className="h-9 text-sm"
              data-ocid="recommendations.member.select"
            >
              <SelectValue placeholder="Choose a member to see recommendations..." />
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

      {/* Results */}
      {selectedMemberId && (
        <div className="space-y-4">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">
                {isLoadingRecs
                  ? "Loading recommendations..."
                  : `Recommendations for ${selectedMember?.name ?? "this member"}`}
              </span>
            </div>
            {!isLoadingRecs && recommendations.length > 0 && (
              <span className="text-xs font-mono-code text-muted-foreground">
                {recommendations.length} suggestions
              </span>
            )}
          </div>

          {isLoadingRecs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <Card key={i} className="border-border/60">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Skeleton className="w-10 h-12 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-3 w-3/5" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-2 w-full rounded-full" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <div
              className="text-center py-16 rounded-lg border border-border/40 bg-muted/20"
              data-ocid="recommendations.list"
            >
              <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No recommendations yet
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto">
                The ML engine needs at least one borrow record to generate
                personalized recommendations.
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              data-ocid="recommendations.list"
            >
              {recommendations.map((rec, idx) => (
                <RecommendationCard
                  key={Number(rec.bookId)}
                  rec={rec}
                  idx={idx}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedMemberId && (
        <div className="text-center py-20 rounded-lg border border-border/40 bg-muted/10">
          <Sparkles className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-base font-medium text-muted-foreground">
            Select a member
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a member above to view their personalized book
            recommendations
          </p>
        </div>
      )}
    </div>
  );
}
