import { BuildOutlier, DevOptions, DevOutlier } from "../types";

export const REQUIRE_POST_TRANSFORM: Array<DevOutlier> = [
  "tailwind",
  "sass",
  "less",
  "stylus",
  "vue",
];

export const REQUIRE_STRONGER_LAZY_LOADING: Array<BuildOutlier> = [
  "vue-router",
];

export const DEFAULT_DEV_OPTIONS: DevOptions = {
  run: false,
  outlierSupport: [],
};
