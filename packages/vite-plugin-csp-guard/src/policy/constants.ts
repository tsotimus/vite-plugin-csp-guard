import { data, definePolicy, self, type DefinedPolicy } from "csp-toolkit";

export const DEFAULT_DEV_POLICY: DefinedPolicy = definePolicy({
  defaultSrc: [self],
  imgSrc: [self, data],
  scriptSrcElem: [self],
  styleSrcElem: [self],
});

export const DEFAULT_POLICY: DefinedPolicy = definePolicy({
  defaultSrc: [self],
  imgSrc: [self],
  scriptSrcElem: [self],
  styleSrcElem: [self],
});
