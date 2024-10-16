// nodes.edges-sample1.ts

import { CustomNode } from "./nodes-edges";

export const jsonData = {
  nodes: [
    {
      id: "start",
      type: "custom",
      data: { label: "Start", class: "start" },
      style: { width: 100, height: 50 },
    },
    {
      id: "parent",
      type: "custom",
      data: { label: "Parent Node", class: "group" },
      style: { width: 200, height: 100 },
    },
    {
      id: "child1",
      type: "custom",
      data: { label: "Child Node 1", class: "task" },
      parentNode: "parent",
      extent: "parent",
      style: { width: 150, height: 50 },
    },
    {
      id: "child2",
      type: "custom",
      data: { label: "Child Node 2", class: "task" },
      parentNode: "parent",
      extent: "parent",
      style: { width: 150, height: 50 },
    },
    {
      id: "end",
      type: "custom",
      data: { label: "End", class: "end" },
      style: { width: 100, height: 50 },
    },
  ],
  edges: [
    {
      id: "start-parent",
      source: "start",
      target: "parent",
      type: "custom",
      animated: false,
      label: "starts",
      data: { label: "starts" },
    },
    {
      id: "parent-child1",
      source: "parent",
      target: "child1",
      type: "custom",
      animated: false,
      label: "contains",
      data: { label: "contains" },
    },
    {
      id: "parent-child2",
      source: "parent",
      target: "child2",
      type: "custom",
      animated: false,
      label: "contains",
      data: { label: "contains" },
    },
    {
      id: "child1-end",
      source: "child1",
      target: "end",
      type: "custom",
      animated: true,
      label: "finishes",
      data: { label: "finishes" },
    },
    {
      id: "child2-end",
      source: "child2",
      target: "end",
      type: "custom",
      animated: true,
      label: "finishes",
      data: { label: "finishes" },
    },
  ],
};

export const initialNodes: CustomNode[] = jsonData.nodes.map((node) => ({
  id: node.id,
  position: { x: 0, y: 0 },
  data: node.data,
  // status: node.status,
  // isParent: node.isParent,
  // childrenIds: node.childrenIds,
  // hidden: node.hidden,
  parentNode: node.parentNode,
  style: node.style,
  className: "",
  type: getNodeType(node.id), // new type attribute
}));

export const initialEdges = jsonData.edges.map((edge) => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  type: "smoothstep", // new type attribute
}));

function getNodeType(nodeId: string): string | undefined {
  switch (nodeId) {
    case "start":
      return "input";
    case "end":
      return "output";
    default:
      return undefined;
  }
}
