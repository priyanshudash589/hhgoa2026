import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const sourcePath =
  "/home/cobra/.cursor/projects/home-cobra-projects-hh-goa/agent-tools/10b3e22e-6dae-4596-8a62-1ab19250301f.txt";
const outputDir = "/home/cobra/projects/hh-goa/lib";

const raw = fs.readFileSync(sourcePath, "utf8");
const data = YAML.parse(raw);

const rootNode = data?.nodes?.find((node) => node.id === "54:2");
if (!rootNode) {
  throw new Error("Root node 54:2 not found in Framelink dump.");
}

const collectNodes = (node, acc = []) => {
  acc.push(node);
  for (const child of node.children ?? []) collectNodes(child, acc);
  return acc;
};

const allNodes = collectNodes(rootNode);
const imageNodes = allNodes
  .filter((node) => ["IMAGE-SVG", "IMAGE"].includes(node.type))
  .map((node) => ({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    fills: node.fills ?? null,
    layout: node.layout ?? null,
  }));

const resolveFillDef = (fillRef) =>
  typeof fillRef === "string" ? data?.fills?.[fillRef] : undefined;

const sanitize = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const downloadNodes = imageNodes.map((node, index) => {
  const fillDef = resolveFillDef(node.fills);
  const firstFill = Array.isArray(fillDef) ? fillDef[0] : undefined;
  const hasGif = Boolean(firstFill?.gifRef);
  const ext = hasGif ? "gif" : node.nodeType === "IMAGE-SVG" ? "svg" : "png";
  const baseName = sanitize(node.nodeName || `node-${index + 1}`) || "node";
  const fileName = `${String(index + 1).padStart(3, "0")}-${baseName}-${node.nodeId.replace(":", "-")}.${ext}`;
  return {
    nodeId: node.nodeId,
    fileName,
    ...(firstFill?.imageRef ? { imageRef: firstFill.imageRef } : {}),
    ...(firstFill?.gifRef ? { gifRef: firstFill.gifRef } : {}),
    ...(firstFill?.imageDownloadArguments ?? {}),
  };
});

const varSource = data.globalVars?.styles ?? {};

const extractPrefixedMap = (source, prefix) =>
  Object.fromEntries(
    Object.entries(source).filter(([key]) => key.startsWith(prefix))
  );

const tokenPayload = {
  frameId: "54:2",
  frameName: rootNode.name,
  layoutTokens: extractPrefixedMap(varSource, "layout_"),
  styleTokens: extractPrefixedMap(varSource, "style_"),
  fillTokens: extractPrefixedMap(varSource, "fill_"),
  effectTokens: extractPrefixedMap(varSource, "effect_"),
  allNodeCount: allNodes.length,
  imageNodeCount: imageNodes.length,
};

const treePayload = {
  rootNode,
};

const writeTs = (fileName, constName, payload) => {
  const source = `/* Auto-generated from Framelink MCP dump. */\nexport const ${constName} = ${JSON.stringify(
    payload,
    null,
    2
  )} as const;\n`;
  fs.writeFileSync(path.join(outputDir, fileName), source, "utf8");
};

writeTs("figma-tokens.ts", "figmaTokens", tokenPayload);
writeTs("figma-home-tree.ts", "figmaHomeTree", treePayload);

const mapperSource = `import { figmaTokens } from "./figma-tokens";

type Dict = Record<string, unknown>;

export const px = (value?: number | string | null): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number") return \`\${value}px\`;
  return value;
};

export const resolveLayout = (layoutId?: string) =>
  layoutId ? (figmaTokens.layoutTokens[layoutId as keyof typeof figmaTokens.layoutTokens] as Dict | undefined) : undefined;

export const resolveTextStyle = (styleId?: string) =>
  styleId ? (figmaTokens.styleTokens[styleId as keyof typeof figmaTokens.styleTokens] as Dict | undefined) : undefined;

export const resolveFill = (fillId?: string) =>
  fillId ? (figmaTokens.fillTokens[fillId as keyof typeof figmaTokens.fillTokens] as unknown[] | undefined) : undefined;
`;

fs.writeFileSync(path.join(outputDir, "figma-mappers.ts"), mapperSource, "utf8");
fs.writeFileSync(
  path.join(outputDir, "figma-image-nodes.json"),
  JSON.stringify(imageNodes, null, 2),
  "utf8"
);
fs.writeFileSync(
  path.join(outputDir, "figma-download-nodes.json"),
  JSON.stringify(downloadNodes, null, 2),
  "utf8"
);

console.log(
  JSON.stringify(
    {
      allNodeCount: allNodes.length,
      imageNodeCount: imageNodes.length,
      outputDir,
    },
    null,
    2
  )
);
