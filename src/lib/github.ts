"use server";

import { Octokit } from "@octokit/rest";
import matter from "gray-matter";
import slugify from "slugify";
import { type LearningEntry, type Category } from "./store";
import dns from "node:dns";

// Force IPv4 first to avoid long timeouts with IPv6 on some networks
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const OCTOKIT = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  request: {
    timeout: 30000,
  },
});

const OWNER = process.env.GITHUB_OWNER || "";
const REPO = process.env.GITHUB_REPO || "";

if (!process.env.GITHUB_TOKEN) {
  console.error("GITHUB_TOKEN is missing");
}

export interface GitHubEntry {
  name: string;
  path: string;
  sha: string;
  content?: string;
}

export async function findFileById(id: string): Promise<{ path: string; sha: string } | null> {
  if (!OWNER || !REPO) return null;

  try {
    const response = await OCTOKIT.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: "entries",
    });

    if (!Array.isArray(response.data)) return null;

    // Scan all files to find the one with the matching ID
    // Parallelize for speed
    const filePromises = response.data
      .filter((file) => file.name.endsWith(".md"))
      .map(async (file) => {
        try {
            const fileData = await OCTOKIT.repos.getContent({
                owner: OWNER,
                repo: REPO,
                path: file.path,
            });

            if ("content" in fileData.data) {
                const content = Buffer.from(fileData.data.content, "base64").toString("utf-8");
                const { data } = matter(content);
                if (data.id === id) {
                    return { path: file.path, sha: fileData.data.sha };
                }
            }
        } catch (e) {
            // Ignore errors for individual files
        }
        return null;
      });

    const results = await Promise.all(filePromises);
    return results.find((res) => res !== null) || null;

  } catch (error) {
    console.error("Error finding file by ID:", error);
    return null;
  }
}

export async function saveEntryToGitHub(entry: LearningEntry) {
  if (!OWNER || !REPO) throw new Error("Missing GitHub Config");

  // Create frontmatter content
  const fileContent = matter.stringify(entry.content || "", {
    id: entry.id,
    date: entry.date,
    category: entry.category,
    notes: entry.notes || "",
    createdAt: entry.createdAt,
  });

  const slug = slugify(`${entry.date.split("T")[0]} ${entry.category.toLowerCase()} ${entry.id.slice(0, 4)}`, { lower: true, strict: true });
  const newPath = `entries/${slug}.md`;

  try {
    // Check if we are updating an existing entry
    const existingFile = await findFileById(entry.id);

    if (existingFile) {
        // It's an update
        if (existingFile.path !== newPath) {
            // Path changed (e.g. date or category changed) -> Rename (Delete + Create)
            await OCTOKIT.repos.deleteFile({
                owner: OWNER,
                repo: REPO,
                path: existingFile.path,
                message: `chore: rename entry ${entry.id} (delete old)`,
                sha: existingFile.sha,
            });
            
            // Create new file
            await OCTOKIT.repos.createOrUpdateFileContents({
                owner: OWNER,
                repo: REPO,
                path: newPath,
                message: `feat: rename entry ${entry.id} (create new)`,
                content: Buffer.from(fileContent).toString("base64"),
            });
        } else {
            // Path matches -> Update content
            await OCTOKIT.repos.createOrUpdateFileContents({
                owner: OWNER,
                repo: REPO,
                path: newPath,
                message: `feat: update learning entry ${entry.date}`,
                content: Buffer.from(fileContent).toString("base64"),
                sha: existingFile.sha, // Important for updates
            });
        }
    } else {
        // It's a new entry
        // Check if file already exists at path (unlikely with UUID but possible)
        // If so, we can't create it without SHA. But since ID didn't match, it's a collision or new file.
        // We'll assume new file.
        await OCTOKIT.repos.createOrUpdateFileContents({
            owner: OWNER,
            repo: REPO,
            path: newPath,
            message: `feat: add learning entry ${entry.date}`,
            content: Buffer.from(fileContent).toString("base64"),
        });
    }
    
    return { success: true, path: newPath };
  } catch (error) {
    console.error("Failed to save to GitHub", error);
    return { success: false, error };
  }
}

export async function fetchEntriesFromGitHub(): Promise<LearningEntry[]> {
   if (!OWNER || !REPO) return [];

   try {
     // List files in 'entries' directory
     // If directory doesn't exist (fresh repo), this throws 404. We handle that.
     const response = await OCTOKIT.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path: "entries",
     });

     if (!Array.isArray(response.data)) {
        return [];
     }

     const entries: LearningEntry[] = [];

     // Fetch content for each file (Parallelized)
     // Note: detailed list file content might be large. 
     // For a personal app, fetching 50 files is okay. 
     // Start with latest 20? 
     // Let's fetch all for now, assuming small volume.
     
     const filePromises = response.data
        .filter((file) => file.name.endsWith(".md"))
        .map(async (file) => {
            const fileData = await OCTOKIT.repos.getContent({
                owner: OWNER,
                repo: REPO,
                path: file.path,
            });
            
            if ("content" in fileData.data) {
                const content = Buffer.from(fileData.data.content, "base64").toString("utf-8");
                const { data, content: markdownBody } = matter(content);
                
                return {
                    id: data.id || "unknown",
                    date: data.date instanceof Date ? data.date.toISOString() : data.date,
                    category: data.category as Category,

                    notes: data.notes,
                    createdAt: data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt,
                    content: markdownBody,
                } as LearningEntry;
            }
            return null;
        });

     const results = await Promise.all(filePromises);
     return results.filter((e): e is LearningEntry => e !== null);

   } catch (error: any) {
      if (error.status === 404) {
          // Repo empty or entries folder missing
          return [];
      }
      console.error("Error fetching entries:", error);
      return [];
   }
}

export async function deleteEntryFromGitHub(id: string) {
    // We need to find the file path for the ID.
    // This is inefficient (O(N) search). 
    // Better: Store path in local state? 
    // For now, scan.
     // We need to find the file path for the ID.
     if (!OWNER || !REPO) return;
     
     // Correct implementation: Search for file containing the ID? 
     // Or iterate entries.
     
     // Let's do simple: List entries, check frontmatter, find path?
     // To delete, we need the SHA.
     
     // Re-implementation of lookup:
     try {
         const response = await OCTOKIT.repos.getContent({
            owner: OWNER,
            repo: REPO,
            path: "entries",
         });
         
         if (!Array.isArray(response.data)) return;

         for (const file of response.data) {
             const fileData = await OCTOKIT.repos.getContent({
                owner: OWNER,
                repo: REPO,
                path: file.path,
            });
            
            if ("content" in fileData.data) {
                const content = Buffer.from(fileData.data.content, "base64").toString("utf-8");
                const { data } = matter(content);
                if (data.id === id) {
                    await OCTOKIT.repos.deleteFile({
                        owner: OWNER,
                        repo: REPO,
                        path: file.path,
                        message: `chore: delete entry ${id}`,
                        sha: fileData.data.sha,
                    });
                    return { success: true };
                }
            }
         }
     } catch (e) {
         console.error(e);
     }
     return { success: false };
}
