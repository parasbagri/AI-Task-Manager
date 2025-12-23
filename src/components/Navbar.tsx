"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link href="/" className="nav-logo">
          Task Timer
        </Link>
        <div className="nav-links">
          <Link
            href="/"
            className={`nav-link ${pathname === "/" ? "active" : ""}`}
          >
            Tasks
          </Link>
          <Link
            href="/logs"
            className={`nav-link ${pathname === "/logs" ? "active" : ""}`}
          >
            Time Logs
          </Link>
          <Link
            href="/summary"
            className={`nav-link ${pathname === "/summary" ? "active" : ""}`}
          >
            Daily Summary
          </Link>
          <span className="nav-user">Hello, {user?.name}</span>
          <Link
            href="/logout"
            className={`nav-link ${pathname === "/logout" ? "active" : ""}`}
          >
            Logout
          </Link>
        </div>
      </div>
    </nav>
  );
}
