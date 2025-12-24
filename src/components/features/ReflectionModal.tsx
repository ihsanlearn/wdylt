"use client";

import React, { useState } from "react";
// Removed unused Dialog imports as we implemented custom modal
// I will create a simple modal using fixed overlay if I want to avoid massive shadcn copy-paste, 
// OR I can just create the Dialog components. Sub-agent is faster for this?
// I'll create a simple accessible Modal component instead of full Shadcn Dialog for speed/minimalism.

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, X } from "lucide-react";
import { toast } from "sonner";

export function ReflectionModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(["", ""]);

  const questions = [
    "What is the most important thing you learned this week?",
    "What is one thing strictly technical that still confuses you?",
  ];

  if (!open) return null;

  const handleSubmit = () => {
    toast.success("Reflection saved! (Local only for now)");
    setAnswers(["", ""]);
    setStep(0);
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-xl bg-card p-6 shadow-lg border animate-in zoom-in-95 duration-200">
        <button 
           onClick={() => onOpenChange(false)}
           className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
        </button>
        
        <div className="mb-6 flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Weekly Reflection</h2>
        </div>

        <div className="space-y-4">
            <p className="text-sm font-medium leading-none">{questions[step]}</p>
            <Textarea 
                value={answers[step]}
                onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[step] = e.target.value;
                    setAnswers(newAnswers);
                }}
                placeholder="Reflect deeply..."
                className="min-h-[100px]"
            />
        </div>

        <div className="mt-6 flex justify-between">
            {step > 0 ? (
                <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
            ) : (
                <div />
            )}
            
            {step < questions.length - 1 ? (
                <Button onClick={() => setStep(step + 1)}>Next</Button>
            ) : (
                <Button onClick={handleSubmit}>Finish Reflection</Button>
            )}
        </div>
      </div>
    </div>
  );
}
