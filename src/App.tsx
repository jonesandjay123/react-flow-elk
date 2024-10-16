// src/App.tsx
import React, { useCallback, useLayoutEffect, useMemo } from "react";
import ELK, { ElkExtendedEdge, ElkNode } from "elkjs/lib/elk.bundled.js";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Position,
  Connection,
} from "reactflow";

import "reactflow/dist/style.css";
import CustomNodeComponent from "./CustomNode";
import { CustomEdge, CustomNode, NodeData } from "./nodes-edges";
import { initialNodes, initialEdges } from "./nodes.edges-sample1";

const elk = new ELK();

type ElkLayoutOptions = Record<string, string>;

const elkOptions: ElkLayoutOptions = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",
  "elk.hierarchyHandling": "INCLUDE_CHILDREN",
};

interface LayoutOptions {
  direction: "RIGHT" | "LEFT" | "DOWN" | "UP";
  useInitialNodes?: boolean;
}

const getLayoutedElements = async (
  nodes: CustomNode[],
  edges: CustomEdge[],
  options: ElkLayoutOptions = {}
): Promise<{ nodes: CustomNode[]; edges: CustomEdge[] }> => {
  const isHorizontal = options["elk.direction"] === "RIGHT";

  // 設置字體，用於計算節點寬度
  const font = "normal 12px Arial, sans-serif";

  // 建立節點映射，方便後續處理
  const nodeMap = new Map<string, ElkNode>();

  // 初始化 ELK 節點
  nodes.forEach((node) => {
    const label = node.data.label;
    const labelWidth = getTextWidth(label, font);
    const width = Math.max(
      labelWidth + 20,
      typeof node.style?.width === "number" ? node.style.width : 150
    );
    const height =
      typeof node.style?.height === "number" ? node.style.height : 50;

    const elkNode: ElkNode = {
      id: node.id,
      labels: [{ text: label }],
      width: width,
      height: height,
      layoutOptions: {},
      children: [],
      edges: [],
    };
    nodeMap.set(node.id, elkNode);
  });

  // 構建 ELK 節點的層次結構
  const elkRootNodes: ElkNode[] = [];

  nodes.forEach((node) => {
    const elkNode = nodeMap.get(node.id)!;
    if (node.parentNode) {
      const parentElkNode = nodeMap.get(node.parentNode);
      if (parentElkNode) {
        parentElkNode.children!.push(elkNode);
      } else {
        // 如果父節點不存在，將節點添加到根節點列表
        elkRootNodes.push(elkNode);
      }
    } else {
      elkRootNodes.push(elkNode);
    }
  });

  // 定義 ELK 的圖形結構
  const graph: ElkNode = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": options["elk.direction"],
      "elk.layered.spacing.nodeNodeBetweenLayers": "100",
      "elk.spacing.nodeNode": "80",
      "elk.hierarchyHandling": "INCLUDE_CHILDREN",
    },
    children: elkRootNodes,
    edges: [],
  };

  // 將根節點添加到 nodeMap
  nodeMap.set("root", graph);

  // 將邊添加到對應的節點中
  edges.forEach((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (!sourceNode || !targetNode) {
      throw new Error(`Edge connects unknown nodes: ${edge.id}`);
    }

    // 找到兩個節點的最近共同祖先
    const commonAncestorId = findCommonAncestor(sourceNode, targetNode, nodes);
    const ancestorElkNode = nodeMap.get(commonAncestorId)!;

    ancestorElkNode.edges!.push({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    });
  });

  try {
    const layoutedGraph = await elk.layout(graph);

    // 計算絕對位置
    const absolutePositions: { [key: string]: { x: number; y: number } } = {};
    const relativePositions: { [key: string]: { x: number; y: number } } = {};

    const computePositions = (
      node: ElkNode,
      parentId: string | null,
      offsetX = 0,
      offsetY = 0
    ) => {
      const x = (node.x || 0) + offsetX;
      const y = (node.y || 0) + offsetY;
      absolutePositions[node.id] = { x, y };
      relativePositions[node.id] = { x: node.x || 0, y: node.y || 0 };

      if (node.children) {
        node.children.forEach((child) =>
          computePositions(child, node.id, x, y)
        );
      }
    };

    computePositions(layoutedGraph, null);

    // 映射 ELK 布局結果到 CustomNode
    const layoutedNodes: CustomNode[] = nodes.map((node) => {
      const position = node.parentNode
        ? relativePositions[node.id]
        : absolutePositions[node.id];
      if (!position) {
        throw new Error(`Position for node ${node.id} not found`);
      }
      return {
        ...node,
        position,
        positionAbsolute: node.parentNode ? { x: 0, y: 0 } : position,
        parentNode: node.parentNode,
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
      };
    });

    return { nodes: layoutedNodes, edges };
  } catch (error) {
    console.error("ELK layout error:", error);
    return { nodes, edges };
  }
};

// 計算文字寬度的函數
function getTextWidth(text: string, font: string): number {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context) {
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }
  return text.length * 10; // 預設每個字元寬度為 10
}

// 查找最近共同祖先的函數
function findCommonAncestor(
  node1: CustomNode,
  node2: CustomNode,
  nodes: CustomNode[]
): string {
  const ancestors1 = getAncestors(node1, nodes);
  const ancestors2 = getAncestors(node2, nodes);

  for (const ancestor of ancestors1) {
    if (ancestors2.includes(ancestor)) {
      return ancestor;
    }
  }
  return "root";
}

function getAncestors(node: CustomNode, nodes: CustomNode[]): string[] {
  const ancestors = [];
  let currentNode = node;
  while (currentNode.parentNode) {
    ancestors.push(currentNode.parentNode);
    currentNode = nodes.find((n) => n.id === currentNode.parentNode)!;
  }
  return ancestors;
}

function LayoutFlow() {
  const nodeTypes = useMemo(() => ({ custom: CustomNodeComponent }), []);

  const [nodes, setNodes, onNodesChange] =
    useNodesState<NodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<CustomEdge>(initialEdges);
  const { fitView } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onLayout = useCallback(
    async ({ direction, useInitialNodes = false }: LayoutOptions) => {
      const opts: ElkLayoutOptions = {
        "elk.direction": direction,
        ...elkOptions,
      };
      const ns = useInitialNodes ? initialNodes : nodes;
      const es = useInitialNodes ? initialEdges : edges;

      const { nodes: layoutedNodes, edges: layoutedEdges } =
        await getLayoutedElements(ns, es, opts);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

      window.requestAnimationFrame(() => fitView());
    },
    [nodes, edges, fitView, setNodes, setEdges]
  );

  // 計算初始佈局
  useLayoutEffect(() => {
    onLayout({ direction: "RIGHT", useInitialNodes: true });
  }, [onLayout]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onConnect={onConnect}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      nodeTypes={nodeTypes}
    >
      <Panel position="top-right">
        <button onClick={() => onLayout({ direction: "DOWN" })}>
          Vertical Layout
        </button>
        <button onClick={() => onLayout({ direction: "RIGHT" })}>
          Horizontal Layout
        </button>
      </Panel>
    </ReactFlow>
  );
}

const App: React.FC = () => (
  <ReactFlowProvider>
    <div style={{ width: "100vw", height: "100vh" }}>
      <LayoutFlow />
    </div>
  </ReactFlowProvider>
);

export default App;
