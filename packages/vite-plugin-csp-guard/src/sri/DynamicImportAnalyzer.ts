import type { OutputBundle, OutputChunk } from "rollup";

export function analyzeDynamicImports(
  bundle: OutputBundle,
  debug: boolean
): Set<string> {
  const dynamicChunkFiles = new Set<string>();
  const idToFileMap = new Map<string, string>();

  const chunks = Object.values(bundle).filter(
    (item): item is OutputChunk => item.type === "chunk"
  );

  for (const chunk of chunks) {
    if (chunk.facadeModuleId) idToFileMap.set(chunk.facadeModuleId, chunk.fileName);
    if (chunk.name) idToFileMap.set(chunk.name, chunk.fileName);
    if (chunk.modules) {
      for (const id of Object.keys(chunk.modules)) {
        idToFileMap.set(id, chunk.fileName);
      }
    }
  }

  for (const chunk of chunks) {
    for (const dynamicImport of chunk.dynamicImports || []) {
      const resolved =
        idToFileMap.get(dynamicImport) ||
        (bundle[dynamicImport]?.type === "chunk"
          ? (bundle[dynamicImport] as OutputChunk).fileName
          : null) ||
        chunks.find((c) => c.name === dynamicImport)?.fileName;
      if (resolved) dynamicChunkFiles.add(resolved);
      else if (debug) {
        console.warn(`[SRI] Could not resolve dynamic import: ${dynamicImport}`);
      }
    }
  }

  if (debug && dynamicChunkFiles.size > 0) {
    console.log(
      `[SRI] Found ${dynamicChunkFiles.size} dynamic chunks:`,
      [...dynamicChunkFiles]
    );
  }

  return dynamicChunkFiles;
}
