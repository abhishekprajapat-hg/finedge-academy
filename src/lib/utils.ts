import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function buildCsv(rows: Record<string, string | number | boolean | null | undefined>[]) {
  if (!rows.length) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const esc = (value: string) => `"${value.replace(/"/g, '""')}"`;

  const csvRows = [headers.join(",")];

  rows.forEach((row) => {
    const cells = headers.map((header) => {
      const raw = row[header];
      if (raw === null || raw === undefined) {
        return "";
      }
      return esc(String(raw));
    });
    csvRows.push(cells.join(","));
  });

  return csvRows.join("\n");
}

