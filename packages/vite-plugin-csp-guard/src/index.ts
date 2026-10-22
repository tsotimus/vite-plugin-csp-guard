import {
  Plugin,
  Rolldown,
  ViteDevServer,
  type ResolvedConfig,
} from "vite";
import {
  CSPPluginContext,
  MyPluginOptions,
  TransformationStatus,
} from "./types";
import { DEFAULT_DEV_POLICY, DEFAULT_POLICY } from "./policy/constants";
import {
  calculateSkip,
  createNewCollection,
  overrideChecker,
  generateHash,
} from "./policy/core";
import {
  applyPendingTransformPolicy,
  transformHandler,
  transformIndexHtmlHandler,
} from "./transform";
import {
  cssFilter,
  jsFilter,
  parseOutliers,
  preCssFilter,
  tsFilter,
} from "./utils";
import { unstable_handleModuleParsed } from "./css";
import { FEATURE_FLAGS } from "./constants";
import { mergePolicies } from "csp-toolkit";
import {
  buildIntegrityMappings,
  analyzeDynamicImports,
  processHtmlForSri,
  installSriRuntime,
} from "./sri";
import type { OutputBundle as RollupOutputBundle } from "rollup";

export default function vitePluginCSP(
  options: MyPluginOptions | undefined = {},
): Plugin {
  const {
    algorithm = "sha256",
    policy,
    dev = {},
    features = FEATURE_FLAGS,
    build = {},
    override = false,
    debug = false,
    transformPolicy,
  } = options;

  let pluginContext: Rolldown.PluginContext | undefined = undefined; //Needed for logging
  let isDevMode = false; // This is a flag to check if we are in dev mode
  let server: ViteDevServer | undefined = undefined;
  let viteVersion: string | undefined = undefined;
  let resolvedConfig: ResolvedConfig | undefined = undefined;

  const { outlierSupport = [], run = false, override: devOverride } = dev;
  const {
    sri = false,
    outlierSupport: buildOutlierSupport = [],
    override: buildOverride,
  } = build;

  // Normalize SRI configuration (sri can be boolean or SriOptions object)
  const sriEnabled = typeof sri === "boolean" ? sri : !!sri;
  const isSriObject = typeof sri === "object" && sri !== null;
  const sriConfig = {
    enabled: sriEnabled,
    runtimePatchDynamicLinks: isSriObject
      ? (sri.runtimePatchDynamicLinks ?? true)
      : true,
    preloadDynamicChunks: isSriObject
      ? (sri.preloadDynamicChunks ?? true)
      : true,
    skipResources: isSriObject ? (sri.skipResources ?? []) : [],
    crossorigin: isSriObject ? sri.crossorigin : undefined,
  };

  const sriRuntimeOptions = `{crossorigin:${
    sriConfig.crossorigin ? JSON.stringify(sriConfig.crossorigin) : "undefined"
  },skipResources:${JSON.stringify(sriConfig.skipResources)}}`;
  const sriRuntimeFingerprint =
    `${installSriRuntime.toString()}|${sriRuntimeOptions}|${algorithm}`;

  const CORE_COLLECTION = createNewCollection();

  const overrideIsFine = overrideChecker({
    userPolicy: policy,
    override,
  });
  if (!overrideIsFine) {
    throw new Error(
      "Override cannot be true when a csp policy is not provided",
    );
  }
  const isUserDevOpt = run; // This is a flag to check if the user wants to run in dev mode
  const isDevAndAllowed = () => isDevMode && isUserDevOpt; // This is a function to check if we can run in dev mode

  const transformationStatus: TransformationStatus = new Map<string, boolean>();
  const isTransformationStatusEmpty = () => transformationStatus.size === 0;

  // Storage for final chunk hashes calculated in renderChunk hook
  const chunkHashes = new Map<string, string>();

  // Chunk hashes added to the CSP before Vite fills the preload lists. The post
  // generateBundle hook swaps them for hashes of the final chunk code.
  const provisionalChunkHashes = new Map<string, string>();

  const requirements = parseOutliers(outlierSupport, buildOutlierSupport);
  const shouldSkip = calculateSkip(policy);

  // Create the shared plugin context
  const cspContext: CSPPluginContext = {
    options: {
      algorithm,
      policy,
      dev,
      features,
      build,
      override,
      debug,
      transformPolicy,
    },
    algorithm,
    collection: CORE_COLLECTION,
    policy: policy || {},
    requirements,
    debug,
    isDevMode,
    viteVersion,
    shouldSkip,
  };

  return {
    name: "vite-plugin-csp-guard",
    enforce: "post",
    buildStart() {
      pluginContext = this;
      provisionalChunkHashes.clear();
      viteVersion = this.meta.viteVersion;
      if (!viteVersion) {
        throw new Error(
          "Please ensure you're using a minimum version of vite 8.0.0.",
        );
      }
    },
    apply(config, { command }) {
      // If we are in dev mode return true
      if (command === "serve" && config.mode === "development" && isUserDevOpt)
        return true;
      // apply only on build but not for SSR
      if (command === "build" && !config.build?.ssr) {
        return true;
      }
      if (command === "build" && features.mpa && config.build?.ssr) {
        return true;
      }
      return false;
    },
    configResolved(config) {
      resolvedConfig = config;
      const devCommand =
        config.command === "serve" && config.mode === "development";

      if (devCommand && !isUserDevOpt) {
        console.warn(
          "You are running in development mode but dev.run is set to false. This will not inject the default policy for development mode",
        );
      }

      if (devCommand) {
        isDevMode = true;
      }
      if (config.appType !== "spa" && !features.mpa) {
        throw new Error("Vite CSP Plugin only works with SPA apps for now");
      }
      if (config.build.ssr && !features.mpa) {
        throw new Error("Vite CSP Plugin does not work with SSR apps");
      }

      cspContext.isDevMode = isDevMode;
    },
    load(id) {
      if (!isDevAndAllowed()) return null; // Exit early if we are not in dev mode or if we are in dev mode but the user does not want to run in dev mode

      // Entry points to files that need to be transformed
      const isCss = cssFilter(id);
      const isPreCss = preCssFilter(id);
      const isJs = jsFilter(id);
      const isTs = tsFilter(id);
      if (isCss || isJs || isTs || isPreCss)
        transformationStatus.set(id, false);

      return null;
    },
    transform: {
      order: requirements.postTransform ? "post" : "pre",
      handler: async (code, id) => {
        if (features.mpa) {
          // console.log(id);
        }

        if (!isDevAndAllowed()) return null; // Exit early if we are not in dev mode or if we are in dev mode but the user does not want to run in dev mode

        await transformHandler({
          code,
          id,
          cspContext,
          transformationStatus,
          server,
          transformMode: requirements.postTransform ? "post" : "pre",
        });
        return null;
      },
    },
    renderChunk: {
      order: "post",
      handler(code, chunk, _options) {
        // Only process in build mode (not dev mode)
        if (isDevAndAllowed()) return null;

        // Skip if we're not hashing script-src-elem
        if (shouldSkip["script-src-elem"]) return null;

        // This hook runs after all transformations (including minification)
        // so we get the final code that will be written to disk
        let finalCode = code;

        // Handle __VITE_PRELOAD__ replacements if present
        if (code.includes("__VITE_PRELOAD__")) {
          if (debug) {
            console.log(`Found __VITE_PRELOAD__ in chunk: ${chunk.fileName}`);
          }
          // We need access to the full bundle to replace correctly
          // This will be handled in transformIndexHtml where we have the bundle
          // For now, just mark that this chunk needs special handling
        }

        // Generate hash for this chunk's final code
        const hash = generateHash(finalCode, algorithm);

        // Store the hash mapped to the chunk filename
        chunkHashes.set(chunk.fileName, hash);

        if (debug) {
          console.log(
            `Hashed chunk ${chunk.fileName}: sha256-${hash.substring(0, 20)}...`,
          );
        }

        // Return null to not modify the chunk
        return null;
      },
    },
    augmentChunkHash(chunk) {
      if (isDevMode || !sriConfig.enabled) return;
      const salt: string[] = [];
      if (sriConfig.runtimePatchDynamicLinks && chunk.isEntry) {
        salt.push(sriRuntimeFingerprint);
      }
      // 4.0.x cleared these preload lists, so cached copies need new names.
      if (!shouldSkip["script-src-elem"] && chunk.dynamicImports.length > 0) {
        salt.push("vite-plugin-csp-guard:preload-lists-kept");
      }
      return salt.length ? salt.join("\n") : undefined;
    },
    generateBundle: {
      order: "post",
      handler(_options, bundle: Rolldown.OutputBundle) {
        if (!sriConfig.enabled || isDevMode) return;

        // SRI helpers are typed against Rollup's OutputBundle; Vite 8 passes Rolldown's
        // bundle (compatible at runtime, distinct types).
        const rollupBundle = bundle as unknown as RollupOutputBundle;
        const htmlAssets: {
          asset: { type: "asset"; source: string | Buffer };
          html: string;
        }[] = [];

        try {
          if (debug) console.log("[SRI] Processing bundle for lazy chunk SRI...");

          // 1. Build initial integrity map (for non-entry chunks and assets)
          let sriByPathname = buildIntegrityMappings(rollupBundle, algorithm, debug);

          // 2. Inject runtime into entry chunks FIRST - before we hash them for HTML
          //    (the integrity in HTML must match the final file content)
          if (sriConfig.runtimePatchDynamicLinks) {
            const serializedMap = JSON.stringify(sriByPathname);
            const injected =
              `\n(${installSriRuntime.toString()})(${serializedMap},${sriRuntimeOptions});\n`;

            for (const [fileName, item] of Object.entries(bundle)) {
              if (item.type !== "chunk") continue;
              const chunk = item as { type: "chunk"; isEntry?: boolean; code?: string };
              if (!chunk.isEntry || !chunk.code) continue;

              chunk.code = injected + chunk.code;
              if (debug) {
                console.log(`[SRI] Injected runtime into entry: ${fileName}`);
              }
            }

            // Rebuild integrity map so entry chunks have correct hashes (with runtime)
            sriByPathname = buildIntegrityMappings(
              rollupBundle,
              algorithm,
              debug,
            );
          }

          const hashReplacements: { old: string; new: string }[] = [];
          for (const [fileName, provisional] of provisionalChunkHashes) {
            const chunk = bundle[fileName];
            if (chunk?.type !== "chunk") continue;
            hashReplacements.push({
              old: `${algorithm}-${provisional}`,
              new: `${algorithm}-${generateHash(chunk.code, algorithm)}`,
            });
          }

          const dynamicChunkFiles = analyzeDynamicImports(rollupBundle, debug);

          const base = resolvedConfig?.base ?? "/";
          const baseNorm = base.endsWith("/") ? base.slice(0, -1) : base;

          // 3. Process HTML assets: add SRI to elements, inject modulepreload links
          for (const [fileName, item] of Object.entries(bundle)) {
            if (
              !fileName.toLowerCase().endsWith(".html") ||
              item.type !== "asset"
            )
              continue;

            const asset = item as { type: "asset"; source: string | Buffer };
            if (!asset.source) continue;

            const html =
              typeof asset.source === "string"
                ? asset.source
                : Buffer.from(asset.source).toString();

            const processed = processHtmlForSri(
              html,
              sriByPathname,
              dynamicChunkFiles,
              baseNorm,
              sriConfig.crossorigin,
              sriConfig.skipResources,
              debug,
              hashReplacements,
            );

            htmlAssets.push({ asset, html: processed });
          }
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          this.error(
            new Error(`SRI processing failed: ${message}`, { cause: e }),
          );
        }

        for (const { asset, html } of htmlAssets) {
          asset.source = applyPendingTransformPolicy(
            html,
            cspContext,
            transformPolicy,
          );
        }
      },
    },
    transformIndexHtml: {
      order: "post",
      handler: async (html, context) => {
        if (features.mpa) {
          // console.log("transformIndexHtml");
        }

        const defaultPolicy = isDevAndAllowed()
          ? DEFAULT_DEV_POLICY
          : DEFAULT_POLICY;

        // Use environment-specific override if set, otherwise fall back to top-level override
        const shouldOverride = isDevAndAllowed()
          ? (devOverride ?? override)
          : (buildOverride ?? override);
        const effectivePolicy = mergePolicies(
          defaultPolicy,
          policy,
          shouldOverride,
        );

        // Update the effective policy in the context
        cspContext.policy = effectivePolicy;

        return transformIndexHtmlHandler({
          html,
          context,
          pluginContext,
          isTransformationStatusEmpty: isTransformationStatusEmpty(),
          cspContext,
          sri: sriConfig.enabled,
          chunkHashes,
          provisionalChunkHashes,
          transformPolicy,
        });
      },
    },
    onLog(_level, log) {
      if (log.plugin === "vite-plugin-csp-guard") {
        this.warn(log);
      }
    },
    moduleParsed: (info) =>
      // This handleModuleParsed function is not ready for production
      features.cssInJs ? unstable_handleModuleParsed({ info }) : undefined,
    configureServer(thisServer) {
      server = thisServer;
    },
  };
}
