"use server";

import { auth } from "@/auth";
import { Octokit } from "@octokit/rest";
import { cookies } from "next/headers";

const DEFAULT_REPO = "wdylt-notes";

export async function checkRepoStatus() {
  const session = await auth();
  const token = (session as any)?.accessToken;
  const username = (session as any)?.username;

  if (!token || !username) {
     return { authenticated: false, exists: false, repoName: "", username: "" };
  }
  
  const cookieStore = await cookies();
  const currentRepoName = cookieStore.get("wdylt-repo")?.value || DEFAULT_REPO;

  const octokit = new Octokit({ auth: token });

  try {
     await octokit.repos.get({ owner: username, repo: currentRepoName });
     return { authenticated: true, exists: true, repoName: currentRepoName, username };
  } catch (e: any) {
     if (e.status === 404) {
         return { authenticated: true, exists: false, repoName: currentRepoName, username };
     }
     // If other error (e.g. rate limit), we might want to let it bubble or handle gracefully
     console.error("Repo check error", e);
     return { authenticated: true, exists: false, repoName: currentRepoName, username, error: true };
  }
}

export async function createRepository(name: string) {
    const session = await auth();
    const token = (session as any)?.accessToken;
    
    if (!token) throw new Error("Not authenticated");
    
    const octokit = new Octokit({ auth: token });
    
    try {
        await octokit.repos.createForAuthenticatedUser({
            name: name,
            description: "Learning journal created by WDLYT app",
            private: true,
            auto_init: true, 
        });
        
        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set("wdylt-repo", name);
        
        return { success: true };
    } catch (e: any) {
        console.error("Failed to create repo", e);
        if (e.status === 422) {
             return { success: false, error: "Repository already exists or name is invalid." };
        }
        return { success: false, error: e.message || "Failed to create repository." };
    }
}

export async function setRepositoryName(name: string) {
    const session = await auth();
    const token = (session as any)?.accessToken;
    const username = (session as any)?.username;

    if (!token) throw new Error("Not authenticated");

    const octokit = new Octokit({ auth: token });

    // Verify it exists first
    try {
        await octokit.repos.get({ owner: username, repo: name });
    } catch (e: any) {
        console.error("Repo check failed", e);
        if (e.status === 404) {
             return { success: false, error: `Repository '${name}' not found for user '${username}'.` };
        }
        if (e.status === 403 || e.status === 401) {
             return { success: false, error: "Permission denied. Check your GitHub permissions." };
        }
        return { success: false, error: e.message || "Failed to verify repository." };
    }

    const cookieStore = await cookies();
    cookieStore.set("wdylt-repo", name);
    return { success: true };
}
