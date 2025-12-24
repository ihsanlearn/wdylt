"use client";

import { useState, useRef, useEffect } from "react";
import { login, logout } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Github, LogOut, User } from "lucide-react";

interface UserMenuProps {
    session: any;
}

export function UserMenu({ session }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!session?.user) {
        return (
            <Button onClick={() => login()} variant="default" size="sm" className="gap-2">
                <Github className="h-4 w-4" />
                Sign In with GitHub
            </Button>
        );
    }

    const { name, email, image } = session.user;
    const username = session.username;

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center rounded-full border border-border bg-muted/50 transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            >
                {image ? (
                    <img 
                        src={image} 
                        alt={name || "User"} 
                        className="h-8 w-8 rounded-full object-cover" 
                    />
                ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4" />
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 z-50">
                     <div className="p-2">
                        <div className="flex flex-col space-y-1 px-2 py-1.5 text-sm">
                            <p className="font-medium leading-none">{name}</p>
                            <p className="text-xs text-muted-foreground truncate">{email}</p>
                            {username && <p className="text-xs text-muted-foreground">@{username}</p>}
                        </div>
                        <div className="h-px bg-border my-1" />
                        <div 
                            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                            onClick={async () => {
                                try {
                                    await logout();
                                } finally {
                                    window.location.href = "/";
                                }
                            }}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </div>
                     </div>
                </div>
            )}
        </div>
    );
}
