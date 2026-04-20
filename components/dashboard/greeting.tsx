"use client";

import { formatDateLong } from "@/lib/format";

export function Greeting({ name }: { name: string }) {
  const hour = new Date().getHours();
  const greet =
    hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-gold">
        {formatDateLong(new Date())}
      </p>
      <h1 className="mt-1 font-serif text-4xl font-medium text-foreground">
        {greet}, <span className="gold-gradient-text">{name.split(" ")[0]}</span>
      </h1>
    </div>
  );
}
