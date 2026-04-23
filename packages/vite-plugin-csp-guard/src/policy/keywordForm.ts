import { unsafeEval, unsafeInline } from "csp-toolkit";

/**
 * How a keyword token (e.g. from `self`, `unsafeEval`) appears in normalized
 * CSPPolicy / definePolicy source arrays: wrapped in single quotes, e.g.
 * `"'self'"`, `"'unsafe-eval'"`.
 */
export function cspKeywordForm(token: string): string {
  return "'" + token + "'";
}

export const cspSkipElemInherit = new Set([cspKeywordForm(unsafeEval)]);

export function policyHasUnsafeInline(
  list: string[] | undefined,
): boolean {
  return list?.includes(cspKeywordForm(unsafeInline)) ?? false;
}

export function policyHasUnsafeEval(
  list: string[] | undefined,
): boolean {
  return list?.includes(cspKeywordForm(unsafeEval)) ?? false;
}
