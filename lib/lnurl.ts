import type { LnUrlPayServiceResponse } from "lnurl-pay/dist/types/types"

export type LnurlSendableFields = {
  minSendable: number
  maxSendable: number
  metadata: string
}

/**
 * LUD-06 fields our well-known endpoint must re-emit byte-faithfully from the
 * upstream LNURL service (IBEX):
 *
 * - `minSendable` / `maxSendable` are defined in MILLISATS, but lnurl-pay's
 *   `requestPayServiceParams` converts them to SATS (`details.min/max`).
 *   Re-emitting those numbers unconverted advertised limits 1000x too low
 *   (150k sats instead of 150M), so compliant wallets refused any larger
 *   payment.
 * - `metadata` is committed to by the invoice's description hash; wallets
 *   verify the hash against the exact bytes of this string, so a re-serialized
 *   parse (key order, whitespace) can invalidate otherwise-good invoices.
 *
 * Prefer the service's raw values verbatim; fall back to converting the parsed
 * ones (also correct, modulo sub-sat rounding) if `rawData` is unavailable.
 */
export const lnurlSendableFields = (
  details: LnUrlPayServiceResponse,
): LnurlSendableFields => {
  const rawData = details.rawData as
    | {
        minSendable?: number | string
        maxSendable?: number | string
        metadata?: unknown
      }
    | undefined

  const rawMinSendable = Number(rawData?.minSendable)
  const rawMaxSendable = Number(rawData?.maxSendable)

  return {
    minSendable:
      Number.isFinite(rawMinSendable) && rawMinSendable > 0
        ? rawMinSendable
        : Number(details.min) * 1000,
    maxSendable:
      Number.isFinite(rawMaxSendable) && rawMaxSendable > 0
        ? rawMaxSendable
        : Number(details.max) * 1000,
    metadata:
      typeof rawData?.metadata === "string"
        ? rawData.metadata
        : JSON.stringify(details.metadata),
  }
}
