import { redirect } from "next/navigation";

/** The previous home. The room is the site. */
export default function ClassicHome() {
  redirect("/");
}
