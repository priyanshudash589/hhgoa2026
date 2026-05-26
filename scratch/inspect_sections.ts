import { figmaHomeTree } from '../lib/figma-home-tree';
import { figmaTokens } from '../lib/figma-tokens';

const children = figmaHomeTree.rootNode.children || [];
const info = children.map(child => {
  const layout = figmaTokens.layoutTokens[child.layout as keyof typeof figmaTokens.layoutTokens] as any;
  const y = layout?.locationRelativeToParent?.y ?? 0;
  const height = layout?.dimensions?.height ?? 0;
  return { id: child.id, name: child.name, y, height };
});

info.sort((a, b) => a.y - b.y);
console.log(JSON.stringify(info, null, 2));
