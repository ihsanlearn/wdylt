"use client";

import { login } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Github, Sparkles } from "lucide-react";

export function GuestHero() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 rounded-full bg-primary/10 p-4 text-primary">
         <Sparkles className="h-10 w-10" />
      </div>
      <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
        What Did You <span className="text-primary">Learn</span> Today?
      </h1>
      <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
        A developer-first journaling tool. Track your daily learnings, build consistency, 
        and sync everything directly to your private GitHub repository.
      </p>
      
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button onClick={() => login()} size="lg" className="gap-2 text-md">
          <Github className="h-5 w-5" />
          Sign In with GitHub
        </Button>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 text-left sm:grid-cols-3">
         <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-2">GitHub Sync</h3>
            <p className="text-sm text-muted-foreground">Your data lives in your repo. You own it 100%.</p>
         </div>
         <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-2">Markdown First</h3>
            <p className="text-sm text-muted-foreground">Write in Markdown with full support for code blocks and alerts.</p>
         </div>
         <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-2">Streak Tracking</h3>
            <p className="text-sm text-muted-foreground">Visualize your consistency and keep the momentum going.</p>
         </div>
      </div>
    </div>
  );
}
