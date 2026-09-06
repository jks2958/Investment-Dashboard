import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EntryCurrency } from "@/lib/api";
import { convertFromUsd, formatInCurrency, getMoneyConfig } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * An amount field that knows what currency you're typing in.
 *
 * Everything is still reported in USD, but entering a rupee figure used to mean
 * dividing by the rate in your head — and the result then froze at whatever
 * rate you happened to use, with no record of which one it was. Typing the
 * figure you actually have is both easier and more accurate.
 *
 * The currency selector belongs on the amount, not on the form: one dialog can
 * hold a rupee balance and a dollar one, and the pairing has to be visible.
 */
export function MoneyInput({
  id,
  label,
  value,
  onValueChange,
  currency,
  onCurrencyChange,
  required,
  placeholder,
  hint,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onValueChange: (next: string) => void;
  currency: EntryCurrency;
  onCurrencyChange: (next: EntryCurrency) => void;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  className?: string;
}) {
  const money = getMoneyConfig();
  const amount = Number(value);

  // Show the other side of the conversion as you type, so a slipped digit in
  // a seven-figure rupee number is obvious before saving.
  const preview =
    Number.isFinite(amount) && amount > 0 && currency !== "USD"
      ? formatInCurrency(amount / money.usdPkrRate, "USD")
      : Number.isFinite(amount) && amount > 0 && currency === "USD" && money.currency === "PKR"
        ? formatInCurrency(convertFromUsd(amount, "USD", money.usdPkrRate), "PKR")
        : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type="number"
          step="any"
          min="0"
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onValueChange(e.target.value)}
          required={required}
          className="flex-1"
        />
        <Select value={currency} onValueChange={(v) => onCurrencyChange(v as EntryCurrency)}>
          <SelectTrigger className="w-24 shrink-0" aria-label={`${label} currency`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="PKR">PKR</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {preview && (
        <p className="text-xs text-muted-foreground tabular-nums">≈ {preview}</p>
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
