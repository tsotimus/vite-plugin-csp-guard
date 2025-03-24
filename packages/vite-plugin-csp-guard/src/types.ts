import { CSPKeys, CSPPolicy } from "csp-toolkit";
import { PluginContext } from "rollup";

export type HashAlgorithms = "sha256" | "sha384" | "sha512";

export type DevOutlier =
  | "tailwind"
  | "sass"
  | "scss"
  | "less"
  | "stylus"
  | "vue";

export type BuildOutlier = "vue-router";

export type DevOptions = {
  /**
   * Allows this plugin to run in dev mode. The trade-off is that developers can see the CSP policy in action in dev mode, at the cost of performance.
   * @default false
   */
  run?: boolean;
  /**
   * This is a list of outliers that require special treatment during dev mode.
   * @example ["tailwind", "sass"]
   */
  outlierSupport?: Array<DevOutlier>;
};

export type BuildOptions = {
  /**
   * Indicates whether to use [SRI](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) at build time.
   * @default false
   */
  sri?: boolean;
  /**
   * A list of outliers that require special treatment when doing a build
   * @default []
   */
  outlierSupport?: Array<BuildOutlier>;
};

export type MyPluginOptions = {
  /**
   * What hashing algorithm to use. Default is sha-256.
   * @default "sha256"
   * @example "sha512"
   */
  algorithm?: HashAlgorithms;
  /**
   * This is your CSP policy. Learn more about CSP [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
   * Enter as a key-value pair. The key is the directive and the value is an array of sources.
   */
  policy?: CSPPolicy;
  /**
   * This is a flag for the plugin to know what type of app you are building. Default is SPA. This is the only option available for now.
   * @default "SPA"
   */
  type?: "SPA";
  /**
   * Ignore this feature completely unless you are a contributor. This is for testing and developing new features.
   * @default "undefined"
   */
  features?: {
    /**
     * This is a flag to enable Multi-Page Application support. This is still in development.
     * @default false
     */
    mpa?: boolean;
    /**
     * This is a flag to enable CSS in JS support. This is still in development.
     * @default false
     */
    cssInJs?: boolean;
  };
  /**
   * This is a flag to override the default policy. When set to false, the plugin will merge the default policy (provided by the plugin) with your policy. When set to true, the plugin will **only** use your policy only.
   * @default false
   */
  override?: boolean;
  /**
   * Options that apply only when running `vite dev`.
   */
  dev?: DevOptions;
  /**
   * Options that apply only when running `vite build`.
   */
  build?: BuildOptions;
  /**
   * Debug is meant for plugin developers only
   */
  debug?: boolean;
};

export type HashCache = {
  fileType: "script" | "style";
  contents: string;
};

export type CryptoSources = `sha256-${string}`;

export const validCrypto = ["sha256", "sha384", "sha512"];

export type HashDataCollection = {
  algorithm: HashAlgorithms;
  content: string;
};

export type HashCollection = {
  "style-src": Map<string, HashDataCollection>; //In line styles
  "style-src-elem": Map<string, HashDataCollection>; //External styles
  "style-src-attr": Map<string, HashDataCollection>; //In line scripts

  "script-src": Map<string, HashDataCollection>; //External styles
  "script-src-attr": Map<string, HashDataCollection>; //External scripts
  "script-src-elem": Map<string, HashDataCollection>;
};

export type HashCollectionKey = keyof HashCollection;

export type WarnMissingPolicyProps = {
  source: string;
  currentPolicy: string[];
  sourceType?: CSPKeys;
  context?: PluginContext;
};

export type OverrideCheckerProps = {
  userPolicy: CSPPolicy | undefined;
  override: boolean;
};

export type TransformationStatus = Map<string, boolean>;

export type ShouldSkip = {
  "style-src": boolean;
  "style-src-elem": boolean;
  "style-src-attr": boolean;
  "script-src": boolean;
  "script-src-attr": boolean;
  "script-src-elem": boolean;
};

export type BundleContext = Record<
  string,
  { type: "chunk" | "asset"; hash: string }
>;

export type CSPPluginContext = {
  options: MyPluginOptions;
  algorithm: HashAlgorithms;
  collection: HashCollection;
  policy: CSPPolicy;
  requirements: {
    postTransform: boolean;
    strongLazyLoading: boolean;
  };
  debug: boolean;
  isDevMode: boolean;
  isVite6: boolean;
  shouldSkip: ShouldSkip;
};
