"use client";

import React, { useEffect } from "react";
import { HistoryList } from "@/components/features/HistoryList";
import { useLearningStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotesPage() {
  const fetchEntries = useLearningStore((state) => state.fetchEntries);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <div className="mb-8">
            <Link href="/">
                <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
                    <ArrowLeft className="h-4 w-4" /> Back to Daily Entry
                </Button>
            </Link>
        </div>

        <section aria-label="All Notes">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">All Learning Notes</h2>
            <p className="text-muted-foreground">A complete archive of your journey.</p>
          </div>
          <HistoryList />
        </section>
    </main>
  );
}
