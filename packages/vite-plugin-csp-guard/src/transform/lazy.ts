import { OutputBundle, OutputChunk } from "rollup";

export const replaceVitePreload = (code: string) => {
  return code.replace(/__VITE_PRELOAD__/g, "[]");
};

// Generate a Vite dependency map declaration based on the bundle files
export const generateViteDepMap = (bundle: OutputBundle) => {
  // We'll use a single array for paired assets (each JS file followed by its CSS files)
  const pairedAssets: string[] = [];
  // Track files already added to avoid duplicates
  const addedFiles = new Set<string>();
  // Keep track of component names to match JS with CSS
  const componentMap: Record<string, { js?: string; css: string[] }> = {};

  // First pass: collect all components and their assets
  for (const fileName of Object.keys(bundle)) {
    const chunk = bundle[fileName];
    if (!chunk) continue;

    // Skip anything related to index
    if (fileName.includes("index")) continue;

    // First handle JS files and try to extract component names
    if (chunk.type === "chunk" && fileName.endsWith(".js")) {
      // Extract component name from file path (like 'Hello' from 'Hello-123abc.js')
      const componentMatch = fileName.match(/([^\/]+)-[^-]+\.js$/);
      if (componentMatch && componentMatch[1]) {
        const componentName = componentMatch[1]; // e.g., 'Hello'

        if (!componentMap[componentName]) {
          componentMap[componentName] = { css: [] };
        }

        const assetPath = `"assets/${fileName.split("/").pop()}"`;
        componentMap[componentName].js = assetPath;

        // For JS chunks, also look at their imported CSS directly through viteMetadata
        const outputChunk = chunk as OutputChunk;
        if (outputChunk.viteMetadata && outputChunk.viteMetadata.importedCss) {
          const importedCss = outputChunk.viteMetadata.importedCss;

          // Handle both array and Set types for importedCss
          const cssFiles = Array.isArray(importedCss)
            ? importedCss
            : importedCss instanceof Set
              ? Array.from(importedCss)
              : [];

          for (const cssFile of cssFiles) {
            if (cssFile && !cssFile.includes("index")) {
              const cssAssetPath = `"assets/${cssFile.split("/").pop()}"`;
              componentMap[componentName].css.push(cssAssetPath);
            }
          }
        }
      }
    }
  }

  // Second pass: look for CSS files directly
  for (const fileName of Object.keys(bundle)) {
    const chunk = bundle[fileName];
    if (
      !chunk ||
      chunk.type !== "asset" ||
      !fileName.endsWith(".css") ||
      fileName.includes("index")
    )
      continue;

    // Try to match CSS file to a component
    for (const componentName of Object.keys(componentMap)) {
      const component = componentMap[componentName];
      if (!component) continue;

      if (fileName.includes(componentName)) {
        const cssPath = `"assets/${fileName.split("/").pop()}"`;
        if (!component.css.includes(cssPath)) {
          component.css.push(cssPath);
        }
      }
    }
  }

  // Third pass: build the paired asset list
  for (const componentName of Object.keys(componentMap)) {
    const component = componentMap[componentName];
    if (!component) continue;

    // Add JS first if it exists
    if (component.js && !addedFiles.has(component.js)) {
      pairedAssets.push(component.js);
      addedFiles.add(component.js);

      // Then add all CSS files associated with this component
      if (component.css && Array.isArray(component.css)) {
        component.css.forEach((cssPath) => {
          if (cssPath && !addedFiles.has(cssPath)) {
            pairedAssets.push(cssPath);
            addedFiles.add(cssPath);
          }
        });
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
  // Create a counter for occurrences and a starting index for dependencies
  let occurrenceCounter = 0;
  let depIndex = 0;

  // Replace __VITE_PRELOAD__ instances with appropriate values based on occurrence order
  // This should not affect any other part of the code
  let newCode = code.replace(/__VITE_PRELOAD__/g, (match) => {
    // For the first occurrence (root route), use void 0
    if (occurrenceCounter === 0) {
      occurrenceCounter++;
      return "void 0";
    }

    // For subsequent occurrences, use __vite__mapDeps with sequential indices
    // Each route gets 2 consecutive indices (for JS and CSS)
    const result = `__vite__mapDeps([${depIndex},${depIndex + 1}])`;
    depIndex += 2; // Increment by 2 for the next route
    occurrenceCounter++;
    return result;
  });

  // Generate and add the dependency map if needed and if bundle is provided
  if (!newCode.includes("const __vite__mapDeps=")) {
    const depMapDeclaration = generateViteDepMap(bundle);
    newCode = depMapDeclaration + newCode;
  }

  return newCode;
};
