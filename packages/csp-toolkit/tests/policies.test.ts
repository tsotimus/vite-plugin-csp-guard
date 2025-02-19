import { describe, expect, test } from "vitest";
import { CSPPolicy } from "../src/types";
import { mergePolicies, policyToString } from "../src/";

export const DEFAULT_POLICY: CSPPolicy = {
  "default-src": ["'self'"],
  "img-src": ["'self'"],
  "script-src-elem": ["'self'"],
  "style-src-elem": ["'self'"],
};

describe("Policy Merging", () => {
  test("Simple Policy Merge", () => {
    const policy: CSPPolicy = {
      "frame-src": ["example.com"],
    };
    const mergedPolicy = mergePolicies(DEFAULT_POLICY, policy, false);

    expect(mergedPolicy).toEqual({
      "default-src": ["'self'"],
      "img-src": ["'self'"],
      "script-src-elem": ["'self'"],
      "style-src-elem": ["'self'"],
      "frame-src": ["example.com"],
    });
  });

  test("Deep Policy Merge", () => {
    const policy: CSPPolicy = {
      "img-src": ["example.com"],
    };

    const mergedPolicy = mergePolicies(DEFAULT_POLICY, policy, false);

    expect(mergedPolicy).toEqual({
      "default-src": ["'self'"],
      "img-src": ["'self'", "example.com"],
      "style-src-elem": ["'self'"],
      "script-src-elem": ["'self'"],
    });
  });

  test("Override Policy Merge", () => {
    const policy: CSPPolicy = {
      "img-src": ["example.com"],
    };

    const mergedPolicy = mergePolicies(DEFAULT_POLICY, policy, true);

    expect(mergedPolicy).toEqual({
      "img-src": ["example.com"],
    });
  });
});

describe("Policy to String", () => {
  test("Empty Policy", () => {
    const policy: CSPPolicy = {};
    const result = policyToString(policy);
    expect(result).toBe("");
  });

  test("Simple Policy", () => {
    const policy: CSPPolicy = {
      "default-src": ["'self'"],
    };
    const result = policyToString(policy);
    expect(result).toBe("default-src 'self';");
  });

  test("Policy with sha values", () => {
    const policy: CSPPolicy = {
      "script-src": ["'self'", "sha256-abc123"],
    };
    const result = policyToString(policy);
    expect(result).toBe("script-src 'self' 'sha256-abc123';");
  });

  test("Policy with wildcard", () => {
    const policy: CSPPolicy = {
      "default-src": ["*"],
    };
    const result = policyToString(policy);
    expect(result).toBe("default-src *;");
  });

  test("Policy with data URI", () => {
    const policy: CSPPolicy = {
      "img-src": ["data:"],
    };
    const result = policyToString(policy);
    expect(result).toBe("img-src data:;");
  });

  test("Policy with multiple directives including wildcard and data URI", () => {
    const policy: CSPPolicy = {
      "default-src": ["'self'", "*"],
      "img-src": ["'self'", "data:"],
    };
    const result = policyToString(policy);
    expect(result).toBe("default-src 'self' *; img-src 'self' data:;");
  });
});

