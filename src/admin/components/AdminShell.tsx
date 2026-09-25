"use client";

import {
  BookOpen,
  CalendarDays,
  ExternalLink,
  FileText,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Star,
  Tags,
  UserCog,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "../actions";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/content/event", label: "Events", icon: CalendarDays },
  { href: "/admin/content/execomMember", label: "Execom", icon: Users },
  { href: "/admin/content/achievement", label: "Achievements", icon: Star },
  { href: "/admin/content/post", label: "Blog & Newsletter", icon: FileText },
  { href: "/admin/content/galleryAlbum", label: "Gallery", icon: Images },
  { href: "/admin/content/publication", label: "Publications", icon: BookOpen },
  { href: "/admin/content/society", label: "Societies", icon: Tags },
  { href: "/admin/applications", label: "Applications", icon: Inbox, badgeKey: "applications" },
  { href: "/admin/settings", label: "Site settings", icon: Settings },
];

export function AdminShell({
  user,
  newApplications,
  temporaryStorage,
  children,
}: {
  user: { name: string; email: string; role: string };
  newApplications: number;
  temporaryStorage: boolean;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string, exact?: boolean) => (exact ? path === href : path === href || path.startsWith(`${href}/`));
  const items = [
    ...nav,
    ...(user.role === "admin" ? [{ href: "/admin/users", label: "Users", icon: UserCog }] : []),
  ];

  const sidebar = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <span className="rounded bg-white px-2 py-1">
          <Image src="/logos/ieee-sb.png" alt="" width={161} height={72} className="h-7 w-auto" />
        </span>
        <span className="text-sm leading-tight font-semibold text-white">
          Admin
          <span className="block text-xs font-normal text-white/60">IEEE SB RMKEC</span>
        </span>
      </Link>
      <ul className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {items.map(({ href, label, icon: Icon, exact, badgeKey }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={() => setOpen(false)}
              aria-current={active(href, exact) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                active(href, exact) ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
              {badgeKey && newApplications > 0 && (
                <span className="ml-auto rounded-full bg-rmkec-green px-2 py-0.5 text-xs font-bold text-white">{newApplications}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
      <div className="border-t border-white/10 p-3">
        <a href="/" target="_blank" rel="noopener" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white">
          <ExternalLink className="h-4 w-4" aria-hidden="true" /> View website
        </a>
        <Link href="/admin/account" onClick={() => setOpen(false)} className="mt-1 block rounded-md px-3 py-2 hover:bg-white/10">
          <span className="block truncate text-sm font-semibold text-white">{user.name}</span>
          <span className="block truncate text-xs text-white/60">
            {user.email} · {user.role}
          </span>
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 bg-ieee-blue-dark lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/40" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-ieee-blue-dark shadow-xl">{sidebar}</aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-md border border-line p-2" aria-label="Open menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-semibold text-ink">IEEE SB RMKEC · Admin</span>
        </header>
        {temporaryStorage && (
          <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
            Temporary storage: this server can’t save files permanently, so changes may be lost on restart. Use the college server for real edits.
          </div>
        )}
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
