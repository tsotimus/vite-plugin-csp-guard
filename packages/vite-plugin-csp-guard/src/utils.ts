import { createFilter } from "vite";
import { BuildOutlier, DevOutlier, WarnMissingPolicyProps } from "./types";
import {
  REQUIRE_POST_TRANSFORM,
  REQUIRE_STRONGER_LAZY_LOADING,
} from "./transform/constants";

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

export const parseOutliers = (
  devOutliers: Array<DevOutlier>,
  buildOutliers: Array<BuildOutlier>
) => {
  return {
    postTransform: devOutliers.some((outlier) =>
      REQUIRE_POST_TRANSFORM.includes(outlier)
    ),
    strongLazyLoading: buildOutliers.some((outlier) =>
      REQUIRE_STRONGER_LAZY_LOADING.includes(outlier)
    ),
  };
};

export const getViteMajorVersion = (v: string) => {
  const viteVersion = v.split(".")[0];
  return viteVersion;
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
