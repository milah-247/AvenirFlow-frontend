"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { CONFIGURED_TOKENS } from "@/lib/constants";

const CUSTOM_VALUE = "__custom__";

interface TokenSelectProps {
  value: string;
  onChange: (contractId: string) => void;
  invalid?: boolean;
  id?: string;
}

/** Token picker for the create-vesting/create-stream forms: configured tokens, or a pasted contract id. */
export function TokenSelect({ value, onChange, invalid, id }: TokenSelectProps) {
  const knownIds = CONFIGURED_TOKENS.map((t) => t.contractId);
  const [mode, setMode] = useState<"known" | "custom">(value && !knownIds.includes(value) ? "custom" : "known");

  return (
    <div className="space-y-2">
      <Select
        id={id}
        invalid={invalid && mode === "known"}
        value={mode === "custom" ? CUSTOM_VALUE : value || ""}
        onChange={(e) => {
          if (e.target.value === CUSTOM_VALUE) {
            setMode("custom");
            onChange("");
          } else {
            setMode("known");
            onChange(e.target.value);
          }
        }}
      >
        <option value="" disabled>
          Select a token…
        </option>
        {CONFIGURED_TOKENS.map((t) => (
          <option key={t.contractId} value={t.contractId}>
            {t.code} — {t.name}
          </option>
        ))}
        <option value={CUSTOM_VALUE}>Custom token contract id…</option>
      </Select>
      {mode === "custom" && (
        <Input
          placeholder="C… (56-character Soroban token contract id)"
          value={value}
          invalid={invalid}
          onChange={(e) => onChange(e.target.value.trim())}
          className="font-mono"
        />
      )}
    </div>
  );
}
