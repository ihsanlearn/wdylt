import { create } from 'zustand';
import { saveEntryToGitHub, fetchEntriesFromGitHub, deleteEntryFromGitHub } from './github';
import { toast } from 'sonner';

export type Category = 'Programming' | 'Cyber Security' | 'Blockchain' | 'Math' | 'Design' | 'Other';

export interface LearningEntry {
  id: string;
  date: string; // ISO String
  content: string;
  category: string; // kept as string to allow flexibility, but typed as Category in UI

  notes?: string;
  createdAt: string;
}

interface LearningState {
  entries: LearningEntry[];
  streak: number;
  totalDays: number;
  totalTopics: number;
  isLoading: boolean;
  editingEntry: LearningEntry | null;
  isInitialized: boolean;
  
  fetchEntries: (force?: boolean) => Promise<void>;
  addEntry: (entry: Omit<LearningEntry, 'id' | 'createdAt' | 'date'> & { date?: string }) => Promise<void>;
  updateEntry: (entry: LearningEntry) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  setEditingEntry: (entry: LearningEntry | null) => void;
  isSetupOpen: boolean;
  setSetupOpen: (isOpen: boolean) => void;
}

export const useLearningStore = create<LearningState>((set, get) => ({
  entries: [],
  streak: 0,
  totalDays: 0,
  totalTopics: 0,
  isLoading: false,
  isInitialized: false,

  fetchEntries: async (force = false) => {
    // Return early if already initialized and not forced
    if (get().isInitialized && !force) return;

    set({ isLoading: true });
    try {
        const fetchedEntries = await fetchEntriesFromGitHub();
        // Calculate stats
        const uniqueDates = new Set(fetchedEntries.map(e => new Date(e.date).toDateString()));
        const totalDays = uniqueDates.size;
        
        // Streak calculation (Simplified)
        let streak = 0;
        const sortedDates = Array.from(uniqueDates)
            .map(d => new Date(d))
            .sort((a, b) => b.getTime() - a.getTime());
            
        if (sortedDates.length > 0) {
            const today = new Date();
            const lastDate = sortedDates[0];
            const isToday = lastDate.toDateString() === today.toDateString();
            const isYesterday = lastDate.toDateString() === new Date(today.getTime() - 86400000).toDateString();
            
            if (isToday || isYesterday) {
                streak = 1;
                let currentDate = lastDate;
                for (let i = 1; i < sortedDates.length; i++) {
                    const prevDate = sortedDates[i];
                    const diff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);
                    if (Math.round(diff) === 1) {
                        streak++;
                        currentDate = prevDate;
                    } else {
                        break;
                    }
                }
            }
        }

        set({
            entries: fetchedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            streak,
            totalDays,
            totalTopics: fetchedEntries.length,
            isLoading: false,
            isInitialized: true
        });
    } catch (error) {
        console.error("Failed to fetch entries", error);
        set({ isLoading: false });
    }
  },

  addEntry: async (newEntry) => {
    const entry: LearningEntry = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        date: newEntry.date || new Date().toISOString(),
        ...newEntry,
        category: newEntry.category,
    };

    // Optimistic update
    const previousEntries = get().entries;
    set(state => ({ 
        entries: [entry, ...state.entries],
        totalTopics: state.totalTopics + 1
    }));

    try {
        const result = await saveEntryToGitHub(entry);
        if (!result.success) {
            throw new Error("Failed to save to GitHub");
        }
        // Force re-fetch to ensure consistency
        get().fetchEntries(true); 
    } catch (error) {
        console.error(error);
        // Rollback
        set({ entries: previousEntries });
        throw error;
    }
  },

  removeEntry: async (id) => {
    const previousEntries = get().entries;
    set(state => ({
        entries: state.entries.filter(e => e.id !== id),
        totalTopics: state.totalTopics - 1
    }));

    try {
        await deleteEntryFromGitHub(id);
        get().fetchEntries(true); // Force re-fetch
    } catch (error) {
        console.error(error);
        set({ entries: previousEntries });
    }
  },
  editingEntry: null,

  setEditingEntry: (entry) => {
    set({ editingEntry: entry });
  },

  updateEntry: async (updatedEntry) => {
    const previousEntries = get().entries;
    
    // Optimistic update
    set(state => ({
        entries: state.entries.map(e => e.id === updatedEntry.id ? updatedEntry : e),
        editingEntry: null, // Clear editing state
    }));

    try {
        const result = await saveEntryToGitHub(updatedEntry);
        if (!result.success) {
            throw new Error("Failed to update entry on GitHub");
        }
        get().fetchEntries(true); // Re-sync force
    } catch (error) {
        console.error(error);
        toast.error("Failed to update entry");
        set({ entries: previousEntries });
    }
  },

  isSetupOpen: false,
  setSetupOpen: (isOpen: boolean) => set({ isSetupOpen: isOpen }),
}));
