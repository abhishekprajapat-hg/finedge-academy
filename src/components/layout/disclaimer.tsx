import { financialDisclaimer } from "@/lib/constants";

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "text-xs leading-6 text-[#4d6480]"
          : "rounded-2xl border border-[#f3d9a9] bg-[#fff7e5] p-4 text-sm leading-6 text-[#7a4a08] shadow-[0_20px_45px_-40px_rgba(133,77,14,0.9)]"
      }
    >
      <strong>Disclaimer:</strong> {financialDisclaimer}
    </div>
  );
}

