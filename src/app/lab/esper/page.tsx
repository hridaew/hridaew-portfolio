import { redirect } from "next/navigation";

/** The room is the home page now; old links (and ?theme / ?studio) carry over. */
export default async function EsperPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(await searchParams)) for (const x of [v ?? ""].flat()) q.append(k, x);
  const s = q.toString();
  redirect(s ? `/?${s}` : "/");
}
