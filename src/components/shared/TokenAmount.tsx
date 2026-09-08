import { formatTokenAmount } from "@/lib/utils";
import type { TokenInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TokenAmountProps {
  amount: string | bigint;
  token: TokenInfo;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TokenAmount({ amount, token, className, size = "md" }: TokenAmountProps) {
  const formatted = formatTokenAmount(amount, token.decimals);
  const sizeClass = { sm: "text-sm", md: "text-base", lg: "text-2xl font-semibold" }[size];

  return (
    <span className={cn("inline-flex items-baseline gap-1 tabular-nums", sizeClass, className)}>
      <span>{formatted}</span>
      <span className="text-muted-foreground text-[0.85em] font-normal">{token.code}</span>
    </span>
  );
}
