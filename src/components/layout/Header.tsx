"use client";

import { useLearningStore } from "@/lib/store";
import { Flame, BookOpen, CalendarDays } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { UserMenu } from "./UserMenu";

export function Header({ session }: { session: any }) {
  const { streak, totalDays, totalTopics } = useLearningStore();
  const pathname = usePathname();

  return (
    <header className="mb-8 flex flex-col items-start justify-between gap-6 border-b md:flex-row md:items-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          What Did You Learn Today?
        </h1>
        <p className="text-muted-foreground text-lg">
          Track your learning. Build consistency. Grow every day.
        </p>
        {session?.user && (
        <nav className="flex items-center gap-4 text-sm font-medium pt-6">
            <Link 
              href="/" 
              className={cn(
                "transition-colors px-4 py-3 rounded-t-lg",
                pathname === "/" 
                    ? "text-foreground font-bold bg-background border-t-2 -mb-px z-10" 
                    : "text-muted-foreground hover:text-primary hover:bg-muted/50"
              )}
            >
              Daily Entry
            </Link>
            <Link 
              href="/notes" 
              className={cn(
                "transition-colors px-4 py-3 rounded-t-lg",
                pathname === "/notes" 
                    ? "text-foreground font-bold bg-background border-t-2 -mb-px z-10" 
                    : "text-muted-foreground hover:text-primary hover:bg-muted/50"
              )}
            >
              All Notes
            </Link>
        </nav>
        )}
      </div>
      
      <div className="flex gap-4 md:gap-8">
        {session?.user && (
          <>
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium">Streak</span>
              </div>
              <p className="text-2xl font-bold">{streak}</p>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Days</span>
              </div>
              <p className="text-2xl font-bold">{totalDays}</p>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Topics</span>
              </div>
              <p className="text-2xl font-bold">{totalTopics}</p>
            </div>
          </>
        )}

        <div className={cn("flex items-center gap-2 pl-4", session?.user ? "border-l" : "")}>
          <ModeToggle />
          <UserMenu session={session} />
        </div>
      </div>
    </header>
  );
}
