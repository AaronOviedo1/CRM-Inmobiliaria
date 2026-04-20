"use client";

import { MessageSquare } from "lucide-react";

export function WhatsAppFab() {
  return (
    <a
      href="https://wa.me/526621234567"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-medium text-black shadow-lg hover:shadow-xl hover:scale-105 transition-all"
    >
      <MessageSquare className="h-4 w-4" />
      Chatear por WhatsApp
    </a>
  );
}
