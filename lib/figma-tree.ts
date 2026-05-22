export type FigmaNode = {
  id: string;
  name: string;
  type: string;
  layout?: string;
  fills?: string;
  strokes?: string;
  strokeWeight?: string;
  text?: string;
  textStyle?: string;
  effects?: string;
  borderRadius?: string;
  children?: readonly FigmaNode[];
};

export function findNodeById(node: FigmaNode, id: string): FigmaNode | null {
  if (node.id === id) return node;
  if (!node.children) return null;
  for (const child of node.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}
