import LogoSmall from "@/components/icons/logo-small";
import { cn } from "@/lib/utils";

export default function Wordmark({ invert = false }: { invert?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoSmall className="h-[28px] w-[60px]" />
      <span
        className={cn(
          "text-[20px] font-medium tracking-[-0.03em]",
          invert ? "text-white" : "text-[#090D2B]",
        )}
      >
        workevent
      </span>
    </span>
  );
}
