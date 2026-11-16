"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Newspaper, FlaskConical, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_NAV = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Markets", icon: BarChart3, href: "/index/defense" },
  { label: "News", icon: Newspaper, href: "/news" },
  { label: "Research", icon: FlaskConical, href: "#" },
  { label: "More", icon: MoreHorizontal, href: "#" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-lg border-t border-gray-800 pb-safe">
      <div className="flex justify-around items-center h-16">
        {MOBILE_NAV.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-green-500" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]")} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}