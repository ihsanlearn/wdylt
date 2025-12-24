"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, X } from "lucide-react";
import { createRepository, setRepositoryName } from "@/lib/repo-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MotivationalLoader } from "@/components/ui/motivational-loader";
import { useLearningStore } from "@/lib/store";

export function RepoSetup() {
  const router = useRouter();
  const { isSetupOpen, setSetupOpen } = useLearningStore();
  
  const [mode, setMode] = useState<"initial" | "create" | "connect">("initial");
  const [repoName, setRepoName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isSetupOpen) return null;

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const result = await createRepository("wdylt-notes");
      if (result.success) {
        toast.success("Repository created successfully!");
        setSetupOpen(false);
        router.refresh(); 
        window.location.reload(); 
      } else {
        toast.error(result.error || "Failed to create repository");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!repoName.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await setRepositoryName(repoName);
      if (result.success) {
        toast.success("Connected to repository!");
        setSetupOpen(false);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to connect");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      {isLoading && <MotivationalLoader open={true} />}
      
      <Card className="w-full max-w-md relative shadow-lg border-2">
        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2" 
            onClick={() => setSetupOpen(false)}
        >
            <X className="h-4 w-4" />
        </Button>

        <CardHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Github className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>
            {mode === "initial" && "Setup your Journal"}
            {mode === "create" && "Creating Repository"}
            {mode === "connect" && "Connect Existing"}
          </CardTitle>
          <CardDescription>
            {mode === "initial" && "Choose how you want to store your learning notes on GitHub."}
            {mode === "create" && "We'll create a private repository named 'wdylt-notes'."}
            {mode === "connect" && "Enter the name of your existing repository."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {mode === "initial" && (
            <div className="grid gap-4">
              <Button 
                onClick={handleCreate} 
                className="h-auto flex-col items-start gap-1 p-4" 
                variant="outline"
              >
                <div className="font-semibold">Initialize Journal</div>
                <div className="text-xs text-muted-foreground text-left">
                  Create a new private repository called <code>wdylt-notes</code>.
                </div>
              </Button>
              
              <Button 
                onClick={() => setMode("connect")} 
                className="h-auto flex-col items-start gap-1 p-4" 
                variant="outline"
              >
                <div className="font-semibold">Connect Existing</div>
                <div className="text-xs text-muted-foreground text-left">
                  I already have a repository I want to use.
                </div>
              </Button>
            </div>
          )}

          {mode === "connect" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Input 
                  placeholder="Repository name (e.g. my-learning-notes)" 
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                    Make sure the repository exists and you have access to it.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setMode("initial")}>
                  Back
                </Button>
                <Button className="flex-1" onClick={handleConnect} disabled={!repoName}>
                  Connect
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
