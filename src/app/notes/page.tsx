import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Notes } from "@/components/features/Notes";

export default async function NotesPage() {
  const session = await auth();

  if (!session) {
      redirect("/");
  }

  return <Notes />;
}
