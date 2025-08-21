import { IndexHtmlTransformContext, ViteDevServer } from "vite";
import { addHash, generateHash } from "../policy/core";
import { BundleContext, TransformationStatus } from "../types";
import { handleCSPInsert, handleIndexHtml } from "./handleIndexHtml";
import { PluginContext } from "rollup";
import { generatePolicyString } from "../policy/createPolicy";
import { cssFilter, jsFilter, preCssFilter, tsFilter } from "../utils";
import { getCSS } from "../css/extraction";
import { replaceVitePreload, replaceVueRouterPreload } from "./lazy";
import * as fs from "fs";
import * as path from "path";
import { CSPPluginContext } from "../types";

// Debug function to write code to a file
const writeDebugFile = (code: string, fileName: string) => {
  try {
    fs.writeFileSync(path.resolve(process.cwd(), fileName), code);
    console.log(`Debug file written: ${fileName}`);
  } catch (error) {
    console.error("Error writing debug file:", error);
  }
};

export interface TransformHandlerProps {
  code: string;
  id: string;
  cspContext: CSPPluginContext;
  transformationStatus: TransformationStatus;
  transformMode: "pre" | "post"; // Lets us know if we are in the pre or post transform
  server?: ViteDevServer; // This is the ViteDevServer, if this exists it means we are in dev mode
}

export const transformHandler = async ({
  code,
  id,
  cspContext,
  transformationStatus,
  transformMode,
  server,
}: TransformHandlerProps) => {
  const { algorithm, collection } = cspContext;

  if (!server) return null; // Exit early if we are not in dev mode
  const isCss = cssFilter(id);
  const isPreCss = preCssFilter(id);
  const isJs = jsFilter(id);
  const isTs = tsFilter(id);

  const isAllTransformed = () =>
    Array.from(transformationStatus.values()).every((value) => value === true);

  const handleCSS = () => {
    const currentCode = transformMode === "pre" ? code : getCSS(code);

    const hash = generateHash(currentCode, algorithm);

    addHash({
      hash,
      key: "style-src-elem",
      data: {
        algorithm,
        content: code,
      },
      collection: collection,
    });
    transformationStatus.set(id, true);
  };

  const handleJS = () => {
    const hash = generateHash(code, algorithm);
    addHash({
      hash,
      key: "script-src-elem",
      data: {
        algorithm,
        content: code,
      },
      collection: collection,
    });
    transformationStatus.set(id, true);
  };

  if (transformationStatus.has(id)) {
    if (isJs || isTs) {
      handleJS();
    } else if (isCss || isPreCss) {
      handleCSS();
    } else {
      // Do nothing
    }
  } else {
    //Files that are deps of the entry points that are loaded in the load() hook

    if (isJs) {
      handleJS();
    } else if (isCss || isPreCss) {
      handleCSS();
    } else {
      // Do nothing
    }
  }

  if (isAllTransformed() && (isCss || isJs)) {
    await server.transformIndexHtml("/index.html", "", "/");
    server.ws.send({
      type: "full-reload",
    });
  }

  return null;
};

export interface TransformIndexHtmlHandlerProps {
  html: string;
  context: IndexHtmlTransformContext;
  pluginContext: PluginContext | undefined;
  isTransformationStatusEmpty: boolean;
  cspContext: CSPPluginContext;
  sri: boolean;
}

export const transformIndexHtmlHandler = ({
  html,
  context: { server, bundle, chunk, path, filename },
  pluginContext,
  isTransformationStatusEmpty,
  cspContext,
  sri,
}: TransformIndexHtmlHandlerProps) => {
  const { algorithm, policy, collection, shouldSkip, debug, requirements } =
    cspContext;

  if (isTransformationStatusEmpty && server) {
    //Return early if there are no transformations and we are in dev mode
    return;
  }

  const bundleContext = {} as BundleContext;

  if (bundle && sri) {
    for (const fileName of Object.keys(bundle)) {
      const currentFile = bundle[fileName];

      if (currentFile) {
        if (currentFile.type === "chunk" && !shouldSkip["script-src-elem"]) {
          let code = currentFile.code;

          if (code.includes("__VITE_PRELOAD__")) {
            // Write original code to debug file
            if (debug) {
              writeDebugFile(
                code,
                `temp-original-${fileName.replace(/\//g, "-")}.js`
              );
            }
            if (requirements.strongLazyLoading) {
              code = replaceVueRouterPreload(code, bundle);
            } else {
              code = replaceVitePreload(code);
            }

            if (debug) {
              // Write transformed code to debug file
              writeDebugFile(
                code,
                `temp-transformed-${fileName.replace(/\//g, "-")}.js`
              );
            }
          }
          const hash = generateHash(code, algorithm);
          if (!collection["script-src-elem"].has(hash)) {
            addHash({
              hash,
              key: "script-src-elem",
              data: {
                algorithm,
                content: code,
              },
              collection: collection,
            });
            if (fileName.includes("index")) {
              bundleContext[fileName] = {
                type: "chunk",
                hash,
              };
            }
          }
        }
      }
    }
  }

  const { html: newHtml, HASH_COLLECTION: updatedCollection } = handleIndexHtml(
    {
      html,
      algorithm,
      collection,
      policy,
      context: pluginContext,
      bundleContext: bundle ? bundleContext : undefined,
    }
  );

  const policyString = generatePolicyString({
    collection: updatedCollection,
    policy: policy,
  });

  const changedHtml = handleCSPInsert(newHtml, policyString);
  return {
    html: changedHtml,
    tags: [],
  };
  // Vite 6 and probably 7 don't support below
  // const InjectedHtmlTags = policyToTag(policyString);
  // return {
  //   html: newHtml,
  //   tags: InjectedHtmlTags,
  // };
};
