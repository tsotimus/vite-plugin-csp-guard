import { OutputBundle, OutputChunk } from "rollup";

export const replaceVitePreload = (code: string) => {
  return code.replace(/__VITE_PRELOAD__/g, "[]");
};

// Generate a Vite dependency map declaration based on the bundle files
export const generateViteDepMap = (bundle: OutputBundle) => {
  // Find the main index chunk that contains the router code
  const indexChunk = Object.values(bundle).find(
    (chunk): chunk is OutputChunk =>
      chunk.type === "chunk" &&
      chunk.fileName.includes("index") &&
      chunk.dynamicImports.length > 0
  );

  if (!indexChunk) {
    return 'const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["placeholder.js"])))=>i.map(i=>d[i]);\n';
  }

  const pairedAssets: string[] = [];
  const addedFiles = new Set<string>();

  // Process each dynamically imported chunk
  for (const importPath of indexChunk.dynamicImports) {
    // Find the corresponding chunk in the bundle
    const chunk = Object.values(bundle).find(
      (c): c is OutputChunk => c.type === "chunk" && c.fileName === importPath
    );

    if (!chunk) continue;

    // Add the JS file
    const jsPath = `"assets/${chunk.fileName.split("/").pop()}"`;
    if (!addedFiles.has(jsPath)) {
      pairedAssets.push(jsPath);
      addedFiles.add(jsPath);
    }

    // Add associated CSS files from viteMetadata
    if (chunk.viteMetadata?.importedCss) {
      const cssFiles = Array.isArray(chunk.viteMetadata.importedCss)
        ? chunk.viteMetadata.importedCss
        : chunk.viteMetadata.importedCss instanceof Set
          ? Array.from(chunk.viteMetadata.importedCss)
          : [];

      for (const cssFile of cssFiles) {
        const cssPath = `"assets/${cssFile.split("/").pop()}"`;
        if (!addedFiles.has(cssPath)) {
          pairedAssets.push(cssPath);
          addedFiles.add(cssPath);
        }
      }
    }
  }

  // If we have no assets, use a placeholder
  if (pairedAssets.length === 0) {
    pairedAssets.push('"placeholder.js"');
  }

  // Generate the Vite map dependencies declaration with a newline at the end
  const declaration = `const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=[${pairedAssets.join(",")}])))=>i.map(i=>d[i]);\n`;
  return declaration;
};

export const replaceVueRouterPreload = (code: string, bundle: OutputBundle) => {
  // Create a counter for route indices
  let routeIndex = 0;

  // Replace __VITE_PRELOAD__ instances with appropriate values
  let newCode = code.replace(/__VITE_PRELOAD__/g, () => {
    // For the first occurrence (root route), use void 0
    if (routeIndex === 0) {
      routeIndex++;
      return "void 0";
    }

    // For subsequent occurrences, use __vite__mapDeps with sequential indices
    // Each route gets indices based on its position in the routes array
    const startIndex = (routeIndex - 1) * 2; // -1 because first occurrence is void 0
    routeIndex++;
    return `__vite__mapDeps([${startIndex},${startIndex + 1}])`;
  });

  // Only add the dependency map if we have dynamic imports and the declaration isn't already present
  if (!newCode.includes("const __vite__mapDeps=")) {
    const depMapDeclaration = generateViteDepMap(bundle);
    // Only add the declaration if we have actual dynamic imports
    if (depMapDeclaration.includes('"placeholder.js"') && routeIndex <= 1) {
      // If we only have the placeholder and no dynamic routes, don't add the declaration
      return newCode;
    }
    newCode = depMapDeclaration + newCode;
  }

  return newCode;
};
