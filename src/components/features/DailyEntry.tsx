"use client";

import React, { useState, useEffect } from "react";
import { useLearningStore, type Category } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Eye, EyeOff, Save, X } from "lucide-react";
import { MotivationalLoader } from "@/components/ui/motivational-loader";

const CATEGORIES: Category[] = [
  "Programming",
  "Cyber Security",
  "Blockchain",
  "Math",
  "Design",
  "Other",
];

export function DailyEntry() {
  const addEntry = useLearningStore((state) => state.addEntry);
  const updateEntry = useLearningStore((state) => state.updateEntry);
  const editingEntry = useLearningStore((state) => state.editingEntry);
  const setEditingEntry = useLearningStore((state) => state.setEditingEntry);

  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>("Programming");

  const [notes, setNotes] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingEntry) {
      setContent(editingEntry.content);
      setCategory(editingEntry.category as Category);
      setNotes(editingEntry.notes || "");
      // Scroll to top to ensure user sees the form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [editingEntry]);

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setContent("");
    setNotes("");
    setCategory("Programming");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Please describe what you learned today.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEntry) {
         await updateEntry({
            ...editingEntry,
            content,
            category,
            notes,
            // Date remains original unless we want to allow editing date? 
            // Let's keep original date for now, or use existing logic if needed.
            // If user wants to "move" entry to today, we might need a date picker.
            // For now, assume date is fixed or updated via specialized UI later.
            // Actually, let's keep the original date to preserve history.
         });
         toast.success("Entry updated successfully!");
         handleCancelEdit(); // Clear form
      } else {
          await addEntry({
            content,
            category,
            notes,
            date: new Date().toISOString(),
          });
          toast.success("Learning entry saved to GitHub!");
          setContent("");
          setNotes("");
      }
    } catch (error) {
       toast.error("Failed to save entry. Check your connection.");
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-medium">
            {editingEntry ? "Edit Entry" : "Today's Learning"}
        </CardTitle>
        <div className="flex gap-2">
            {editingEntry && (
                <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-muted-foreground hover:text-foreground">
                    <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
            )}
            <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className="text-muted-foreground hover:text-foreground"
            >
            {isPreview ? (
                <>
                <EyeOff className="mr-2 h-4 w-4" /> Edit
                </>
            ) : (
                <>
                <Eye className="mr-2 h-4 w-4" /> Preview
                </>
            )}
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                What did you learn?
              </label>
              <span className="text-xs text-muted-foreground">
                Markdown supported
              </span>
            </div>
            {isPreview ? (
              <div className="min-h-[120px] max-h-[500px] w-full max-w-none overflow-y-auto rounded-md border p-4">
                <MarkdownRenderer content={content || "*Nothing written yet...*"} />
              </div>                                                                                                                                                                                               
            ) : (
              <Textarea
                placeholder="I learned about..."
                className="min-h-[120px] resize-y"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'i')) {
                    e.preventDefault();
                    const textarea = e.currentTarget;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const selectedText = content.substring(start, end);
                    const syntax = e.key === 'b' ? '**' : '_';
                    const len = syntax.length;

                    // Check if already wrapped
                    const isWrapped = content.substring(start - len, start) === syntax && 
                                      content.substring(end, end + len) === syntax;

                    let newContent;
                    let newCursorStart, newCursorEnd;

                    if (isWrapped) {
                      // Unwrap
                      newContent = content.substring(0, start - len) + selectedText + content.substring(end + len);
                      newCursorStart = start - len;
                      newCursorEnd = end - len;
                    } else {
                      // Wrap
                      newContent = content.substring(0, start) + syntax + selectedText + syntax + content.substring(end);
                      newCursorStart = start + len;
                      newCursorEnd = end + len;
                    }

                    setContent(newContent);
                    
                    // We need to set cursor position after render, but React state update is async.
                    // Using setTimeout is a simple workaround for maintaining cursor position after state update re-render.
                    setTimeout(() => {
                        textarea.setSelectionRange(newCursorStart, newCursorEnd);
                        textarea.focus();
                    }, 0);
                  }
                }}
              />
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Category</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-background text-foreground">
                    {cat}
                  </option>
                ))}
              </select>
            </div>


          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium leading-none">Additional Notes / Insights</label>
             <Input 
                placeholder="One key takeaway..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
             />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
                 <>Saving...</>
            ) : (
                 <><Save className="mr-2 h-4 w-4" /> {editingEntry ? "Update Entry" : "Save Entry"}</>
            )}
          </Button>
        </form>
      </CardContent>
      <MotivationalLoader open={isSubmitting} />
    </Card>
  );
}
