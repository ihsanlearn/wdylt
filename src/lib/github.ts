"use server";

import { Octokit } from "@octokit/rest";
import matter from "gray-matter";
import slugify from "slugify";
import { type LearningEntry, type Category } from "./store";
import dns from "node:dns";
import { auth } from "@/auth";

import { cookies } from "next/headers";

// Force IPv4 first to avoid long timeouts with IPv6 on some networks
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const DEFAULT_REPO = "wdylt-notes";

async function getClient() {
  const session = await auth();
  const token = (session as any)?.accessToken;
  const username = (session as any)?.username;

  if (!token || !username) {
    return null;
  }

  const cookieStore = await cookies();
  const repo = cookieStore.get("wdylt-repo")?.value || DEFAULT_REPO;

  const octokit = new Octokit({
    auth: token,
    request: {
      timeout: 30000,
    },
  });

  return { octokit, owner: username as string, repo };
}

async function ensureRepoExists(octokit: Octokit, repo: string) {
    try {
        await octokit.repos.get({ owner: (await octokit.users.getAuthenticated()).data.login, repo });
    } catch (e: any) {
        if (e.status === 404) {
            // Create repo
            await octokit.repos.createForAuthenticatedUser({
                name: repo,
                description: "Learning journal created by WDLYT app",
                private: true, // Default to private for safety
                auto_init: true,
            });
        } else {
            throw e;
        }
    }
}

export interface GitHubEntry {
  name: string;
  path: string;
  sha: string;
  content?: string;
}

export async function findFileById(id: string): Promise<{ path: string; sha: string } | null> {
  const client = await getClient();
  if (!client) return null;
  const { octokit, owner, repo } = client;

  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: "entries",
    });

    if (!Array.isArray(response.data)) return null;

    // Scan all files to find the one with the matching ID
    // Parallelize for speed
    const filePromises = response.data
      .filter((file) => file.name.endsWith(".md"))
      .map(async (file) => {
        try {
            const fileData = await octokit.repos.getContent({
                owner,
                repo,
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
    // Console error only if it's not 404 (repo might not exist yet)
    // console.error("Error finding file by ID:", error);
    return null;
  }
}

export async function saveEntryToGitHub(entry: LearningEntry) {
  const client = await getClient();
  if (!client) throw new Error("Unauthorized");
  const { octokit, owner, repo } = client;

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
    await ensureRepoExists(octokit, repo);

    // Check if we are updating an existing entry
    const existingFile = await findFileById(entry.id);

    if (existingFile) {
        // It's an update
        if (existingFile.path !== newPath) {
            // Path changed (e.g. date or category changed) -> Rename (Delete + Create)
            await octokit.repos.deleteFile({
                owner,
                repo,
                path: existingFile.path,
                message: `chore: rename entry ${entry.id} (delete old)`,
                sha: existingFile.sha,
            });
            
            // Create new file
            await octokit.repos.createOrUpdateFileContents({
                owner,
                repo,
                path: newPath,
                message: `feat: rename entry ${entry.id} (create new)`,
                content: Buffer.from(fileContent).toString("base64"),
            });
        } else {
            // Path matches -> Update content
            await octokit.repos.createOrUpdateFileContents({
                owner,
                repo,
                path: newPath,
                message: `feat: update learning entry ${entry.date}`,
                content: Buffer.from(fileContent).toString("base64"),
                sha: existingFile.sha, // Important for updates
            });
        }
    } else {
        // It's a new entry
        try {
            await octokit.repos.createOrUpdateFileContents({
                owner,
                repo,
                path: newPath,
                message: `feat: add learning entry ${entry.date}`,
                content: Buffer.from(fileContent).toString("base64"),
            });
        } catch(e: any) {
             // Retry? 
             throw e;
        }
    }
    
    return { success: true, path: newPath };
  } catch (error) {
    console.error("Failed to save to GitHub", error);
    return { success: false, error };
  }
}

export async function fetchEntriesFromGitHub(): Promise<LearningEntry[]> {
   const client = await getClient();
   if (!client) return []; // Not logged in -> empty entries
   const { octokit, owner, repo } = client;

   try {
     const response = await octokit.repos.getContent({
        owner,
        repo,
        path: "entries",
     });

     if (!Array.isArray(response.data)) {
        return [];
     }

     const filePromises = response.data
        .filter((file) => file.name.endsWith(".md"))
        .map(async (file) => {
            const fileData = await octokit.repos.getContent({
                owner,
                repo,
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
          // Repo or folder doesn't exist yet
          return [];
      }
      console.error("Error fetching entries:", error);
      return [];
   }
}

export async function deleteEntryFromGitHub(id: string) {
     const client = await getClient();
     if (!client) return { success: false };
     const { octokit, owner, repo } = client;
     
     try {
         const response = await octokit.repos.getContent({
            owner,
            repo,
            path: "entries",
         });
         
         if (!Array.isArray(response.data)) return { success: false };

         for (const file of response.data) {
             const fileData = await octokit.repos.getContent({
                owner,
                repo,
                path: file.path,
            });
            
            if ("content" in fileData.data) {
                const content = Buffer.from(fileData.data.content, "base64").toString("utf-8");
                const { data } = matter(content);
                if (data.id === id) {
                    await octokit.repos.deleteFile({
                        owner,
                        repo,
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
