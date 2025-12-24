"use client";

import React from "react";
import { useLearningStore, type LearningEntry } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Trash2, Book, Code, Calculator, ShieldCheck, PenTool, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import { MotivationalLoader } from "@/components/ui/motivational-loader";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case "Programming": return <Code className="h-4 w-4" />;
    case "Cyber Security": return <ShieldCheck className="h-4 w-4" />;
    case "Math": return <Calculator className="h-4 w-4" />;
    case "Design": return <PenTool className="h-4 w-4" />;
    default: return <Book className="h-4 w-4" />;
  }
};

export function HistoryList({ onlyToday = false }: { onlyToday?: boolean }) {
  const { entries, removeEntry, isLoading } = useLearningStore();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  if (isLoading) {
    return <MotivationalLoader open={true} fullscreen={false} />;
  }

  // Filter entries if onlyToday is true
  const filteredEntries = onlyToday 
    ? entries.filter((entry) => {
        const entryDate = format(new Date(entry.date), "yyyy-MM-dd");
        const todayDate = format(new Date(), "yyyy-MM-dd");
        return entryDate === todayDate;
      })
    : entries;

  // Group entries by date
  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    const dateKey = format(new Date(entry.date), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, LearningEntry[]>);

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const handleConfirmDelete = async () => {
    if (deletingId) {
      await removeEntry(deletingId);
      setDeletingId(null);
    }
  };

  if (filteredEntries.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>{onlyToday ? "No notes for today yet." : "No learning history yet. Start today!"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedDates.map((date) => (
        <div key={date} className="relative pl-6 border-l border-border/50">
          <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-border" />
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">
            {format(new Date(date), "EEEE, MMMM do, yyyy")}
          </h3>
          <div className="space-y-4">
            {groupedEntries[date].map((entry) => (
              <Card key={entry.id} className="overflow-hidden transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-foreground">
                             <CategoryIcon category={entry.category} /> {entry.category}
                          </span>

                       </div>
                       <div className="text-sm leading-relaxed">
                          <MarkdownRenderer content={entry.content} />
                       </div>
                       {entry.notes && (
                         <p className="text-xs text-muted-foreground italic border-l-2 pl-2 border-primary/20">
                           "{entry.notes}"
                         </p>
                       )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-primary"
                          onClick={() => {
                              useLearningStore.getState().setEditingEntry(entry);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeletingId(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
      
      <ConfirmationModal
        open={!!deletingId}
        title="Delete Entry"
        description="Are you sure you want to delete this learning entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
