"use client";

import React, { useEffect, useState } from "react";
import { DailyEntry } from "@/components/features/DailyEntry";
import { HistoryList } from "@/components/features/HistoryList";
import { ProgressChart } from "@/components/features/ProgressChart";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useLearningStore } from "@/lib/store";
import { ReflectionModal } from "@/components/features/ReflectionModal";
import { Button } from "@/components/ui/button";

export default function Home() {
  const fetchEntries = useLearningStore((state) => state.fetchEntries);
  const [showReflection, setShowReflection] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <div className="grid gap-8 lg:grid-cols-[1.6fr,1fr]">
          {/* Left Column: Input and History */}
          <div className="space-y-10">
            <section aria-label="Daily Entry">
               <DailyEntry />
            </section>

            <section aria-label="History">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Today's Progress</h2>
                <div className="text-sm text-muted-foreground">Recent entries</div>
              </div>
              <HistoryList onlyToday={true} />
            </section>
          </div>

          {/* Right Column: Stats & Reflection (Desktop) */}
          <div className="space-y-8">
            <div className="sticky top-8 space-y-8">
              <ProgressChart />

              {/* Reflection Card Placeholder */}
              <Card className="bg-primary/5 border-primary/10 transition-colors hover:bg-primary/10 cursor-pointer" onClick={() => setShowReflection(true)}>
                <CardContent className="p-6">
                  <div className="mb-2 flex items-center gap-2 text-primary">
                    <Sparkles className="h-5 w-5" />
                    <h3 className="font-semibold">Weekly Reflection</h3>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Take a moment to review what stuck with you this week.
                    "Consistency beats motivation."
                  </p>
                  <Button variant="outline" size="sm" className="w-full">Start Reflection</Button>
                </CardContent>
              </Card>
           </div>
          </div>
        </div>
      <ReflectionModal open={showReflection} onOpenChange={setShowReflection} />
    </main>
  );
}
