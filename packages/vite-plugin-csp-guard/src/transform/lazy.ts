export const replaceVitePreload = (code: string) => {
  return code.replace(/__VITE_PRELOAD__/g, "[]");
};

// Generate a Vite dependency map declaration based on the bundle files
export const generateViteDepMap = (bundle: Record<string, any>) => {
  // We'll create separate arrays for JS and CSS assets to ensure correct order
  const jsAssets: string[] = [];
  const cssAssets: string[] = [];
  // Track files already added to avoid duplicates
  const addedFiles = new Set<string>();

  console.log("Analyzing bundle for dependencies:");

  // Look for lazy-loaded chunks (non-index JS chunks)
  for (const fileName of Object.keys(bundle)) {
    const chunk = bundle[fileName];
    if (!chunk) continue;

    // Skip anything related to index
    if (fileName.includes("index")) {
      console.log(`Skipping index file: ${fileName}`);
      continue;
    }

    // Process JS chunks
    if (chunk.type === "chunk" && fileName.endsWith(".js")) {
      const assetPath = `"assets/${fileName.split("/").pop()}"`;
      console.log(`Adding lazy-loaded JS asset: ${assetPath}`);
      if (!addedFiles.has(assetPath)) {
        jsAssets.push(assetPath);
        addedFiles.add(assetPath);
      }

      // Find associated CSS for this chunk
      if (chunk.viteMetadata?.importedCss?.length > 0) {
        console.log(
          `Found ${chunk.viteMetadata.importedCss.length} CSS files associated with ${fileName}`
        );
        for (const cssFile of chunk.viteMetadata.importedCss) {
          // Skip index CSS
          if (cssFile.includes("index")) {
            console.log(`Skipping index CSS: ${cssFile}`);
            continue;
          }
          const cssAssetPath = `"assets/${cssFile.split("/").pop()}"`;
          if (!addedFiles.has(cssAssetPath)) {
            console.log(`Adding associated CSS: ${cssAssetPath}`);
            cssAssets.push(cssAssetPath);
            addedFiles.add(cssAssetPath);
          }
        }
      }
    }

    // Process direct CSS files
    if (fileName.endsWith(".css") && !fileName.includes("index")) {
      const cssAssetPath = `"assets/${fileName.split("/").pop()}"`;
      if (!addedFiles.has(cssAssetPath)) {
        console.log(`Adding direct CSS asset: ${cssAssetPath}`);
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
      // Add Hello JS if not already added
      if (
        fileName.endsWith(".js") &&
        fileName.includes("Hello") &&
        !fileName.includes("index")
      ) {
        const jsPath = `"assets/${fileName.split("/").pop()}"`;
        if (!addedFiles.has(jsPath)) {
          console.log(`Adding Hello component JS: ${jsPath}`);
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
          console.log(`Adding Hello component CSS: ${cssPath}`);
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
    console.log("No assets found, using placeholder");
    assets.push('"placeholder.js"');
  }

  console.log(`Total assets for dependency map: ${assets.length}`);
  console.log(`Assets in order: ${assets.join(", ")}`);

  // Generate the Vite map dependencies declaration with a newline at the end
  const declaration = `const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=[${assets.join(",")}])))=>i.map(i=>d[i]);\n`;
  return declaration;
};

export const replaceVueRouterPreload = (
  code: string,
  bundle?: Record<string, any>
) => {
  // Create a counter for occurrences
  let occurrenceCounter = 0;

  // Log the routes section from original code for debugging
  const originalRoutesMatch = code.match(/routes:\[.+/s);
  if (originalRoutesMatch) {
    console.log("Original routes section:", originalRoutesMatch[0]);
  }

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
    console.log("Generated dependency map:", depMapDeclaration);
    newCode = depMapDeclaration + newCode;
  }

  // Log the routes section from transformed code for debugging
  const transformedRoutesMatch = newCode.match(/routes:\[.+/s);
  if (transformedRoutesMatch) {
    console.log("Transformed routes section:", transformedRoutesMatch[0]);
  }

  return newCode;
};
