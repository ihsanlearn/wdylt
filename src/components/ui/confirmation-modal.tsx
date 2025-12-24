"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200 bg-background">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10", variant === "default" && "bg-primary/10")}>
                <AlertTriangle className={cn("h-5 w-5", variant === "default" && "text-primary")} />
            </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} size="sm">
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} size="sm">
            {confirmText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
