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

interface DashboardProps {
    needsSetup?: boolean;
}

export function Dashboard({ needsSetup }: DashboardProps) {
  const { setSetupOpen } = useLearningStore();
  const fetchEntries = useLearningStore((state) => state.fetchEntries);
  const [showReflection, setShowReflection] = useState(false);

  useEffect(() => {
    if (!needsSetup) {
        fetchEntries();
    }
  }, [fetchEntries, needsSetup]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr,1fr]">
      {/* Left Column: Input and History */}
      <div className="space-y-10">
        <section aria-label="Daily Entry">
           {needsSetup ? (
                <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center p-10 text-center space-y-4">
                        <div className="p-4 rounded-full bg-primary/10 text-primary">
                            <Sparkles className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">Welcome to WDYLT!</h3>
                            <p className="text-muted-foreground max-w-sm">
                                To start tracking your learning journey, please connect or create a GitHub repository.
                            </p>
                        </div>
                         <Button onClick={() => setSetupOpen(true)}>Setup Journal</Button>
                    </CardContent>
                </Card>
           ) : (
                <DailyEntry />
           )}
        </section>

        <section aria-label="History">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Today's Progress</h2>
            <div className="text-sm text-muted-foreground">Recent entries</div>
          </div>
          {!needsSetup && <HistoryList onlyToday={true} />}
          {needsSetup && <div className="text-muted-foreground text-sm italic">Connect your repository to see your history.</div>}
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
      <ReflectionModal open={showReflection} onOpenChange={setShowReflection} />
    </div>
  );
}
