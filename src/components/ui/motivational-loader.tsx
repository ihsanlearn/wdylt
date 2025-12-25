"use client";

import { Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const QUOTES = [
    "Never give up. Today is hard, tomorrow will be worse, but the day after tomorrow will be sunshine.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Success is stumbling from failure to failure with no loss of enthusiasm.",
    "Persist. Push. Prevail.",
    "Every line of code you write makes you stronger.",
    "Difficulty is what wakes up the genius.",
    "Keep pushing. You are building your future.",
    "Consistency beats intensity."
];

export function MotivationalLoader({ open, fullscreen = true }: { open: boolean; fullscreen?: boolean }) {
    const [quoteIndex, setQuoteIndex] = useState(0);

    useEffect(() => {
        if (!open) return;
        
        // Randomize start
        setQuoteIndex(Math.floor(Math.random() * QUOTES.length));

        const interval = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [open]);

    if (!open) return null;

    const containerClasses = fullscreen 
        ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 text-white backdrop-blur-sm transition-all animate-in fade-in duration-300"
        : "flex flex-col items-center justify-center w-full py-20 min-h-[300px] animate-in fade-in duration-300";

    const textClass = fullscreen ? "text-text-loading" : "text-foreground";
    const flameBg = fullscreen ? "bg-background" : "bg-muted";

    return (
        <div className={containerClasses}>
            <div className="relative mb-8">
                <div className="absolute inset-0 animate-ping rounded-full bg-orange-500/20 duration-1000" />
                <div className={cn("relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-orange-500/20 shadow-xl", flameBg)}>
                    <Flame className="h-10 w-10 text-orange-500 animate-pulse" />
                </div>
            </div>
            
            <div className="max-w-md text-center px-6">
                <p className={cn("text-lg font-medium min-h-14 animate-in slide-in-from-bottom-2 fade-in duration-500", textClass)} key={quoteIndex}>
                    "{QUOTES[quoteIndex]}"
                </p>    
                <div className="mt-4 flex justify-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" />
                </div>
            </div>
        </div>
    );
}
