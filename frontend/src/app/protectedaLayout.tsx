import type {ReactNode} from "react";
import {cookies} from "next/headers";
import { redirect } from "next/navigation";

// Block rendering if no session cookie is present
export default async function ProtectedLayout({children}: {children: ReactNode}) {
    if (!(await cookies()).has('session')) redirect('/login');
    return <>{children}</>;
}