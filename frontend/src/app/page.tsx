import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  // If the cookie exists, go to /dashboard; otherwise, go to /login
  redirect(token ? "/dashboard" : "/login");
}
