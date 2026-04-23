import { describe, expect, test, vi } from "vitest";
import { transformIndexHtmlHandler } from "../src/transform";
import { calculateSkip, createNewCollection } from "../src/policy/core";
import type { CSPPluginContext, TransformPolicyMeta } from "../src/types";
import type { IndexHtmlTransformContext } from "vite";

const minimalHtml = `<!DOCTYPE html><html><head></head><body></body></html>`;

const indexContext = (): IndexHtmlTransformContext =>
  ({
    path: "/index.html",
    filename: "index.html",
  }) as IndexHtmlTransformContext;

function makeCspContext(overrides: Partial<CSPPluginContext> = {}): CSPPluginContext {
  const policy = overrides.policy ?? { "default-src": ["'self'"] };
  return {
    options: (overrides.options ?? {}) as MyPluginOptions,
    algorithm: overrides.algorithm ?? "sha256",
    collection: overrides.collection ?? createNewCollection(),
    policy,
    requirements: overrides.requirements ?? {
      postTransform: false,
      strongLazyLoading: false,
    },
    debug: overrides.debug ?? false,
    isDevMode: overrides.isDevMode ?? false,
    viteVersion: overrides.viteVersion,
    shouldSkip: overrides.shouldSkip ?? calculateSkip(policy),
    ...overrides,
  };
}

describe("transformPolicy", () => {
  test("omitting transformPolicy prepends a meta tag with the generated policy", () => {
    const cspContext = makeCspContext();
    const result = transformIndexHtmlHandler({
      html: minimalHtml,
      context: indexContext(),
      pluginContext: undefined,
      isTransformationStatusEmpty: true,
      cspContext,
      sri: false,
    });
    expect(result?.html).toBeDefined();
    expect(result!.html).toContain('http-equiv="Content-Security-Policy"');
    expect(result!.html).toMatch(/content="[^"]*default-src[^"]*'self'[^"]*"/);
  });

  test("transformPolicy returning undefined keeps the default meta (same as generated policy)", () => {
    const cspContext = makeCspContext();
    const withoutHook = transformIndexHtmlHandler({
      html: minimalHtml,
      context: indexContext(),
      pluginContext: undefined,
      isTransformationStatusEmpty: true,
      cspContext,
      sri: false,
    });
    const withHook = transformIndexHtmlHandler({
      html: minimalHtml,
      context: indexContext(),
      pluginContext: undefined,
      isTransformationStatusEmpty: true,
      cspContext,
      sri: false,
      transformPolicy: () => undefined,
    });
    expect(withoutHook?.html).toBe(withHook?.html);
  });

  test("transformPolicy returning null skips meta injection", () => {
    const cspContext = makeCspContext();
    const result = transformIndexHtmlHandler({
      html: minimalHtml,
      context: indexContext(),
      pluginContext: undefined,
      isTransformationStatusEmpty: true,
      cspContext,
      sri: false,
      transformPolicy: () => null,
    });
    expect(result?.html).toBeDefined();
    expect(result!.html).not.toContain("Content-Security-Policy");
  });

  test("transformPolicy returning a string uses it as the meta content attribute", () => {
    const cspContext = makeCspContext();
    const custom = "default-src 'none'; connect-src 'self'";
    const result = transformIndexHtmlHandler({
      html: minimalHtml,
      context: indexContext(),
      pluginContext: undefined,
      isTransformationStatusEmpty: true,
      cspContext,
      sri: false,
      transformPolicy: () => custom,
    });
    expect(result?.html).toContain(`content="${custom}"`);
  });

  test("transformPolicy receives meta with command build when isDevMode is false", () => {
    const hook = vi.fn(
      (csp: string, meta: TransformPolicyMeta) => {
        void csp;
        void meta;
      },
    );
    const cspContext = makeCspContext({ isDevMode: false });
    transformIndexHtmlHandler({
      html: minimalHtml,
      context: indexContext(),
      pluginContext: undefined,
      isTransformationStatusEmpty: true,
      cspContext,
      sri: false,
      transformPolicy: (csp, meta) => {
        hook(csp, meta);
        return null;
      },
    });
    expect(hook).toHaveBeenCalledOnce();
    expect(hook.mock.calls[0]![1]).toEqual(
      expect.objectContaining({
        command: "build",
        algorithm: "sha256",
      }),
    );
  });

  test("transformPolicy receives meta with command serve when isDevMode is true", () => {
    const hook = vi.fn(
      (csp: string, meta: TransformPolicyMeta) => {
        void csp;
        void meta;
      },
    );
    const cspContext = makeCspContext({ isDevMode: true });
    transformIndexHtmlHandler({
      html: minimalHtml,
      context: indexContext(),
      pluginContext: undefined,
      isTransformationStatusEmpty: true,
      cspContext,
      sri: false,
      transformPolicy: (csp, meta) => {
        hook(csp, meta);
        return null;
      },
    });
    expect(hook.mock.calls[0]![1]).toEqual(
      expect.objectContaining({
        command: "serve",
        algorithm: "sha256",
      }),
    );
  });
});
