import { createFilter } from "vite";
import { CSPPolicy, Outlier, WarnMissingPolicyProps } from "./types";
import { REQUIRE_POST_TRANSFORM } from "./transform/constants";

export const extractBaseURL = (url: string): string | false => {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}`;
  } catch (e) {
    return false;
  }
};

export const isExternalSource = (source: string): boolean => {
  if (source.includes("http://") || source.includes("https://")) {
    return true;
  }
  return false;
};

export const isSourceInPolicy = ({
  source,
  currentPolicy,
}: WarnMissingPolicyProps) => {
  const baseUrl = extractBaseURL(source);
  if (baseUrl) {
    return currentPolicy.includes(baseUrl);
  } else {
    return false;
  }
};

export const cssFilter = createFilter("**.css");
export const preCssFilter = createFilter(["**.scss", "**.less", "**.styl"]);
export const jsFilter = createFilter(["**/*.js?(*)", "**/*.jsx?(*)"]);
export const tsFilter = createFilter(["**/*.ts", "**/*.tsx"]);
export const htmlFilter = createFilter("**.html");

export const mergePolicies = (
  defaultPolicy: CSPPolicy,
  userPolicy: CSPPolicy | undefined,
  shouldOverride: boolean
): CSPPolicy => {
  const userPolicyExists = userPolicy && Object.keys(userPolicy).length > 0;

  if (shouldOverride) {
    return userPolicy as CSPPolicy;
  }
  if (!userPolicyExists) return defaultPolicy;

  const mergedPolicy: CSPPolicy = { ...defaultPolicy };

  for (const key in userPolicy as CSPPolicy) {
    const _key = key as keyof CSPPolicy;
    if (userPolicy.hasOwnProperty(key)) {
      const defaultValues = defaultPolicy[_key] || [];
      const userValues = userPolicy[_key] || [];

      if (Array.isArray(userValues)) {
        mergedPolicy[_key] = Array.from(
          new Set([...defaultValues, ...userValues])
        );
      } else {
        mergedPolicy[_key] = userValues;
      }
    }
  }

  return mergedPolicy;
};

export const parseOutliers = (outliers: Array<Outlier>) => {
  return {
    postTransform: outliers.some((outlier) =>
      REQUIRE_POST_TRANSFORM.includes(outlier)
    ),
  };
};

export const removeEscapedBacktick = (str: string) => {
  return str.replace(/\\`/g, "`");
};

export const extractAssetPath = (source: string): string | false => {
  if (!source.startsWith("/")) {
    //This is to ensure we are not looking at urls,etc
    return false;
  }
  //Remove the first slash
  return source.slice(1);
};
