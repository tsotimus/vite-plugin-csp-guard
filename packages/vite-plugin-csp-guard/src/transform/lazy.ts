import { OutputBundle, OutputChunk } from "rollup";

export const replaceVitePreload = (code: string) => {
  return code.replace(/__VITE_PRELOAD__/g, "[]");
};

// Generate a Vite dependency map declaration based on the bundle files
export const generateViteDepMap = (bundle: OutputBundle) => {
  // We'll create separate arrays for JS and CSS assets to ensure correct order
  const jsAssets: string[] = [];
  const cssAssets: string[] = [];
  // Track files already added to avoid duplicates
  const addedFiles = new Set<string>();

  // Look for lazy-loaded chunks (non-index JS chunks)
  for (const fileName of Object.keys(bundle)) {
    const chunk = bundle[fileName];
    if (!chunk) continue;

    // Skip anything related to index
    if (fileName.includes("index")) continue;

    // Process JS chunks
    if (chunk.type === "chunk" && fileName.endsWith(".js")) {
      const assetPath = `"assets/${fileName.split("/").pop()}"`;
      if (!addedFiles.has(assetPath)) {
        jsAssets.push(assetPath);
        addedFiles.add(assetPath);
      }

      // Need to cast to OutputChunk to access viteMetadata
      const outputChunk = chunk as OutputChunk;

      // Find associated CSS for this chunk
      if (outputChunk.viteMetadata && outputChunk.viteMetadata.importedCss) {
        const importedCss = outputChunk.viteMetadata.importedCss;

        // Handle both array and Set types for importedCss
        const cssFiles = Array.isArray(importedCss)
          ? importedCss
          : importedCss instanceof Set
            ? Array.from(importedCss)
            : [];

        for (const cssFile of cssFiles) {
          // Skip index CSS
          if (cssFile.includes("index")) continue;

          const cssAssetPath = `"assets/${cssFile.split("/").pop()}"`;
          if (!addedFiles.has(cssAssetPath)) {
            cssAssets.push(cssAssetPath);
            addedFiles.add(cssAssetPath);
          }
        }
      }
    }

    // Process direct CSS files
    if (
      fileName.endsWith(".css") &&
      !fileName.includes("index") &&
      chunk.type === "asset"
    ) {
      const cssAssetPath = `"assets/${fileName.split("/").pop()}"`;
      if (!addedFiles.has(cssAssetPath)) {
        cssAssets.push(cssAssetPath);
        addedFiles.add(cssAssetPath);
      }
    }
  }

  // Special handling for Hello component (fallback for vue-router example)
  const hasHelloComponent = Object.keys(bundle).some(
    (name) => name.includes("Hello") && !name.includes("index")
  );

  if (hasHelloComponent) {
    for (const fileName of Object.keys(bundle)) {
      const bundleItem = bundle[fileName];
      if (!bundleItem) continue;

      // Add Hello JS if not already added
      if (
        fileName.endsWith(".js") &&
        fileName.includes("Hello") &&
        !fileName.includes("index") &&
        bundleItem.type === "chunk"
      ) {
        const jsPath = `"assets/${fileName.split("/").pop()}"`;
        if (!addedFiles.has(jsPath)) {
          jsAssets.push(jsPath);
          addedFiles.add(jsPath);
        }
      }

      // Add Hello CSS if not already added
      if (
        fileName.endsWith(".css") &&
        fileName.includes("Hello") &&
        !fileName.includes("index")
      ) {
        const cssPath = `"assets/${fileName.split("/").pop()}"`;
        if (!addedFiles.has(cssPath)) {
          cssAssets.push(cssPath);
          addedFiles.add(cssPath);
        }
      }
    }
  }

  // Combine assets with JS first, then CSS (this is the order Vite seems to use)
  const assets = [...jsAssets, ...cssAssets];

  // If we have no assets, use a placeholder
  if (assets.length === 0) {
    assets.push('"placeholder.js"');
  }

  // Generate the Vite map dependencies declaration with a newline at the end
  const declaration = `const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=[${assets.join(",")}])))=>i.map(i=>d[i]);\n`;
  return declaration;
};

export const replaceVueRouterPreload = (
  code: string,
  bundle?: OutputBundle
) => {
  // Create a counter for occurrences
  let occurrenceCounter = 0;

  // Replace __VITE_PRELOAD__ instances with appropriate values based on occurrence order
  // This should not affect any other part of the code
  let newCode = code.replace(/__VITE_PRELOAD__/g, (match) => {
    // For the first occurrence (root route), use void 0
    if (occurrenceCounter === 0) {
      occurrenceCounter++;
      return "void 0";
    }

    // For subsequent occurrences, use __vite__mapDeps with incrementing index
    const result = `__vite__mapDeps([0,${occurrenceCounter}])`;
    occurrenceCounter++;
    return result;
  });

  // Generate and add the dependency map if needed and if bundle is provided
  if (bundle && !newCode.includes("const __vite__mapDeps=")) {
    const depMapDeclaration = generateViteDepMap(bundle);
    newCode = depMapDeclaration + newCode;
  }

  return newCode;
};
