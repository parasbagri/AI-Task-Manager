"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (loading) return null;

  return (
    <div className="app-container">
      {isAuthenticated && !isAuthPage && <Navbar />}
      <main className="main-content">{children}</main>
    </div>
  );
}
