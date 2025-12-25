"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLearningStore, type LearningEntry } from "@/lib/store";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Tag, Pencil } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MotivationalLoader } from "@/components/ui/motivational-loader";

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const { entries, fetchEntries, isLoading, setEditingEntry } = useLearningStore();
  const [entry, setEntry] = useState<LearningEntry | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    // If entries are empty, we might need to fetch (e.g. direct link or reload)
    const loadEntry = async () => {
        setIsPageLoading(true);
        if (entries.length === 0) {
            await fetchEntries();
        }
        setIsPageLoading(false);
    };
    
    loadEntry();
  }, [entries.length, fetchEntries]);

  useEffect(() => {
     if (!isPageLoading) {
         const found = entries.find(e => e.id === id);
         setEntry(found || null);
     }
  }, [entries, id, isPageLoading]);

  if (isPageLoading || isLoading) {
      return <MotivationalLoader open={true} fullscreen={true} />;
  }

  if (!entry) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
              <h2 className="text-2xl font-bold text-muted-foreground">Note not found</h2>
              <Button onClick={() => router.push('/')} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Return Home
              </Button>
          </div>
      );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
        <Button 
            variant="ghost" 
            className="mb-4 pl-0 hover:pl-2 transition-all" 
            onClick={() => router.back()}
        >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                            <Tag className="mr-1.5 h-3 w-3" />
                            {entry.category}
                        </Badge>
                        <span className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-1.5 h-3 w-3" />
                            {format(new Date(entry.date), "MMMM do, yyyy")}
                        </span>
                    </div>
                </div>
                <Button 
                    variant="outline"
                    onClick={() => {
                        setEditingEntry(entry);
                        router.push('/');
                    }}
                >
                    <Pencil className="mr-2 h-4 w-4" /> Edit Note
                </Button>
            </div>

            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 pt-4">
                    <article className="prose dark:prose-invert max-w-none text-lg leading-relaxed">
                        <MarkdownRenderer content={entry.content} />
                    </article>

                    {entry.notes && (
                        <div className="mt-12 p-6 bg-muted/30 rounded-lg border border-border/50">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                Additional Insights
                            </h3>
                            <p className="italic text-muted-foreground">
                                "{entry.notes}"
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
