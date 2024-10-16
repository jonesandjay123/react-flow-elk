// nodes.edges-sample.ts

import { CustomNode } from "./nodes-edges";

export const jsonData = {
  nodes: [
    {
      id: "start",
      data: { label: "start" },
      status: "SUCCESS",
      style: { borderRadius: "50%", borderStyle: "dashed", fontWeight: "bold" },
    },
    {
      id: "horizontal",
      data: { label: "horizontal" },
      status: "NOTSTARTDELAYED",
      isParent: true,
      childrenIds: ["h1", "h2", "h3"],
    },
    {
      id: "vertical",
      data: { label: "vertical" },
      status: "STARTED",
      isParent: true,
      childrenIds: ["v1", "v2", "v3", "v4"],
    },
    {
      id: "v1",
      data: { label: "v1" },
      status: "STARTED",
      hidden: true,
      parentNode: "vertical",
    },
    {
      id: "v2",
      data: { label: "v2" },
      status: "STARTED",
      hidden: true,
      parentNode: "vertical",
    },
    {
      id: "v3",
      data: { label: "v3" },
      status: "STARTED",
      hidden: true,
      parentNode: "vertical",
    },
    {
      id: "v4",
      data: { label: "v4" },
      status: "STARTED",
      hidden: true,
      parentNode: "vertical",
    },
    {
      id: "h1",
      data: { label: "h1" },
      status: "STARTED",
      hidden: true,
      parentNode: "horizontal",
    },
    {
      id: "h2",
      data: { label: "h2" },
      status: "STARTED",
      hidden: true,
      parentNode: "horizontal",
    },
    {
      id: "h3",
      data: { label: "h3" },
      status: "STARTED",
      hidden: true,
      parentNode: "horizontal",
    },
    {
      id: "end",
      data: { label: "end" },
      status: "DELAYED",
      style: { fontWeight: "bold" },
    },
  ],
  edges: [
    { id: "0", source: "start", target: "vertical" },
    { id: "1", source: "start", target: "horizontal" },
    { id: "2", source: "start", target: "end" },
    { id: "3", source: "v1", target: "v2" },
    { id: "4", source: "v2", target: "v3" },
    { id: "5", source: "v3", target: "v4" },
    { id: "6", source: "h1", target: "h2" },
    { id: "7", source: "h2", target: "h3" },
    { id: "8", source: "horizontal", target: "end" },
    { id: "9", source: "vertical", target: "end" },
    { id: "10", source: "v1", target: "end" },
    { id: "11", source: "v2", target: "end" },
    { id: "12", source: "v3", target: "end" },
    { id: "13", source: "h1", target: "end" },
    { id: "14", source: "h2", target: "end" },
  ],
};

export const initialNodes: CustomNode[] = jsonData.nodes.map((node) => ({
  id: node.id,
  position: { x: 0, y: 0 },
  data: node.data,
  status: node.status,
  isParent: node.isParent,
  childrenIds: node.childrenIds,
  hidden: node.hidden,
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
