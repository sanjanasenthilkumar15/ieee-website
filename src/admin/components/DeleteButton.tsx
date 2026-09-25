"use client";

import { Trash2 } from "lucide-react";

/** Submit button that asks for confirmation first. */
export function DeleteButton({ label = "Delete", confirmText }: { label?: string; confirmText: string }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" /> {label}
    </button>
  );
}
