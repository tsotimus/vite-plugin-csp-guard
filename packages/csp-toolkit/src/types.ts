export type FetchDirectives =
    | "default-src"
    | "script-src"
    | "style-src"
    | "connect-src"
    | "object-src"
    | "img-src"
    | "frame-src"
    | "child-src"
    | "font-src"
    | "manifest-src"
    | "media-src"
    | "object-src"
    | "report-to"
    | "sandbox"
    | "script-src-attr"
    | "script-src-elem"
    | "style-src-attr"
    | "style-src-elem"
    | "upgrade-insecure-requests"
    | "worker-src"
    | "fenced-frame-src";

export type DocumentDirectives = "base-uri" | "sandbox";

export type NavigationDirectives = "form-action" | "frame-ancestors";

export type ReportingDirectives = "report-to";

export type OtherDirectives = "require-trusted-types-for" | "trusted-types" | "upgrade-insecure-requests";

export type DeprecatedDirectives = "block-all-mixed-content" | "report-uri";

export type CSPKeys = FetchDirectives | DocumentDirectives | NavigationDirectives | ReportingDirectives | OtherDirectives | DeprecatedDirectives;

export type CSPPolicy = Partial<{
  [n in CSPKeys]: string[];
}>;

export type HashAlgorithms = "sha256" | "sha384" | "sha512";