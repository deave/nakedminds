"use client";

import Link from "next/link";

export default function MonthlySetupBanner() {
  return (
    <div className="bg-warm-50 border border-warm-200 rounded-lg px-4 py-3 mb-4">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-warm-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-800">
            Set your monthly focus
          </p>
          <p className="text-sm text-stone-500">
            Take a moment to choose your habit goals and focus challenge for this
            month.
          </p>
        </div>
        <Link href="/monthly-setup" className="btn-primary text-xs px-3 py-1.5">
          Set now
        </Link>
      </div>
    </div>
  );
}
