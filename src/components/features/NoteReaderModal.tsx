"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { type LearningEntry } from "@/lib/store";
import { Code, ShieldCheck, Calculator, PenTool, Book } from "lucide-react";

interface NoteReaderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: LearningEntry | null;
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case "Programming": return <Code className="h-4 w-4" />;
    case "Cyber Security": return <ShieldCheck className="h-4 w-4" />;
    case "Math": return <Calculator className="h-4 w-4" />;
    case "Design": return <PenTool className="h-4 w-4" />;
    default: return <Book className="h-4 w-4" />;
  }
};

export function NoteReaderModal({ open, onOpenChange, entry }: NoteReaderModalProps) {
  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="secondary" className="gap-1.5 py-1 px-3">
               <CategoryIcon category={entry.category} />
               {entry.category}
            </Badge>
            <span className="text-sm text-muted-foreground font-medium">
                {format(new Date(entry.date), "EEEE, MMMM do, yyyy")}
            </span>
          </div>
          <DialogTitle className="sr-only">Learning Entry Details</DialogTitle> 
          {/* sr-only because the content itself is the title/body essentially, but accessibility requires a title */}
           <div className="text-xl font-semibold tracking-tight">
              Learning Entry
           </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-6 pt-4">
           <div className="space-y-6 pb-20">
               <div className="prose dark:prose-invert max-w-none">
                  <MarkdownRenderer content={entry.content} />
               </div>
               
               {entry.notes && (
                 <div className="mt-8 rounded-lg bg-muted/50 p-4 border border-border/50">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-muted-foreground">
                        📝 Additional Notes
                    </h4>
                    <p className="text-sm italic text-muted-foreground/90">
                        "{entry.notes}"
                    </p>
                 </div>
               )}
           </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
