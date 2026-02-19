"use client";

import Link from "next/link";
import { type User } from "@supabase/supabase-js";
import { Shield, ArrowLeft } from "lucide-react";

interface AdminHeaderProps {
  user: User;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-3 sm:px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/vault"
          className="flex items-center gap-1.5 sm:gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs sm:text-sm">Back to App</span>
        </Link>
        <div className="h-6 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
          <span className="font-semibold text-sm sm:text-base text-white">
            TeamPrompt Admin
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xs sm:text-sm text-slate-400 hidden sm:inline">
          {user.email}
        </span>
        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-medium text-xs sm:text-sm">
          {user.email?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
