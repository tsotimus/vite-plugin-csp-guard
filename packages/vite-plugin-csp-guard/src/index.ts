import { Plugin, ViteDevServer } from "vite";
import { PluginContext } from "rollup";
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
} from "./policy/core";
import { transformHandler, transformIndexHtmlHandler } from "./transform";
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

export default function vitePluginCSP(
  options: MyPluginOptions | undefined = {}
): Plugin {
  const {
    algorithm = "sha256",
    policy,
    dev = {},
    features = FEATURE_FLAGS,
    build = {},
    override = false,
    debug = false,
  } = options;

  let pluginContext: PluginContext | undefined = undefined; //Needed for logging
  let isDevMode = false; // This is a flag to check if we are in dev mode
  let server: ViteDevServer | undefined = undefined;
  let viteVersion: string | undefined = undefined;

  const { outlierSupport = [], run = false } = dev;
  const { sri = false, outlierSupport: buildOutlierSupport = [] } = build;

  const CORE_COLLECTION = createNewCollection();

  const overrideIsFine = overrideChecker({
    userPolicy: policy,
    override,
  });
  if (!overrideIsFine) {
    throw new Error(
      "Override cannot be true when a csp policy is not provided"
    );
  }
  const isUserDevOpt = run; // This is a flag to check if the user wants to run in dev mode
  const isDevAndAllowed = () => isDevMode && isUserDevOpt; // This is a function to check if we can run in dev mode

  const transformationStatus: TransformationStatus = new Map<string, boolean>();
  const isTransformationStatusEmpty = () => transformationStatus.size === 0;

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
      viteVersion = this.meta.viteVersion;
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
      const devCommand =
        config.command === "serve" && config.mode === "development";

      if (devCommand && !isUserDevOpt) {
        console.warn(
          "You are running in development mode but dev.run is set to false. This will not inject the default policy for development mode"
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
    transformIndexHtml: {
      order: "post",
      handler: async (html, context) => {
        if (features.mpa) {
          // console.log("transformIndexHtml");
        }

        const defaultPolicy = isDevAndAllowed()
          ? DEFAULT_DEV_POLICY
          : DEFAULT_POLICY;

        const effectivePolicy = mergePolicies(defaultPolicy, policy, override);

        // Update the effective policy in the context
        cspContext.policy = effectivePolicy;

        return transformIndexHtmlHandler({
          html,
          context,
          pluginContext,
          isTransformationStatusEmpty: isTransformationStatusEmpty(),
          cspContext,
          sri,
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
