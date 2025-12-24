"use client";

import { useState } from "react";
import { createRepository, setRepositoryName } from "@/lib/repo-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Github, Database, ArrowRight, Loader2, Book } from "lucide-react";
import { toast } from "sonner";

export function RepoSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"initial" | "custom">("initial");
  const [customRepo, setCustomRepo] = useState("");

  const handleCreateDefault = async () => {
    setIsLoading(true);
    try {
      const result = await createRepository("wdylt-notes");
      if (result.success) {
        toast.success("Repository created successfully!");
        window.location.reload(); // Reload to pick up the new state/cookie
      } else {
        toast.error(result.error || "Failed to create repository");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectExisting = async () => {
    if (!customRepo.trim()) return;
    setIsLoading(true);
    try {
      const result = await setRepositoryName(customRepo);
      if (result.success) {
        toast.success("Connected to repository!");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to connect. Does the repo exist?");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Database className="h-6 w-6 text-primary" />
            Setup Your Journal
          </CardTitle>
          <CardDescription>
            WDYLT needs a place to store your learnings on GitHub.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {mode === "initial" ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50 cursor-pointer" onClick={handleCreateDefault}>
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <Book className="h-5 w-5" />
                   </div>
                   <h3 className="font-semibold">Create New Journal</h3>
                </div>
                <p className="text-sm text-muted-foreground pl-13">
                   We'll create a private repository named <span className="font-mono text-foreground bg-muted px-1 rounded">wdylt-notes</span> for you.
                </p>
              </div>

               <Button 
                variant="default" 
                className="w-full h-12 text-base" 
                onClick={handleCreateDefault} 
                disabled={isLoading}
               >
                 {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                    </>
                 ) : (
                    <>
                        Initialize Journal <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                 )}
               </Button>

               <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

               <Button variant="ghost" className="w-full" onClick={() => setMode("custom")}>
                 I have an existing repository
               </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
               <div className="space-y-2">
                 <label className="text-sm font-medium">Repository Name</label>
                 <Input 
                    placeholder="e.g. my-learning-journal" 
                    value={customRepo}
                    onChange={(e) => setCustomRepo(e.target.value)}
                 />
                 <p className="text-xs text-muted-foreground">
                   Enter the name of a repository you own.
                 </p>
               </div>

               <div className="flex gap-2">
                 <Button variant="outline" onClick={() => setMode("initial")} disabled={isLoading}>
                    Back
                 </Button>
                 <Button className="flex-1" onClick={handleConnectExisting} disabled={isLoading || !customRepo}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
                 </Button>
               </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
