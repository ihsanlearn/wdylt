import { auth } from "@/auth";
import { Dashboard } from "@/components/features/Dashboard";
import { GuestHero } from "@/components/layout/GuestHero";

import { checkRepoStatus } from "@/lib/repo-actions";

export default async function Home() {
  const session = await auth();
  
  let needsSetup = false;
  if (session) {
      const status = await checkRepoStatus();
      needsSetup = !status.exists;
  }

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
       {!session ? <GuestHero /> : <Dashboard needsSetup={needsSetup} />}
    </main>
  );
}
