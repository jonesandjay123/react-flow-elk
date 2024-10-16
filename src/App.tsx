// src/App.tsx
import React, { useCallback, useLayoutEffect } from "react";
import ELK, { ElkExtendedEdge, ElkNode } from "elkjs";
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
import {
  CustomEdge,
  CustomNode,
  // initialEdges,
  // initialNodes,
  NodeData,
} from "./nodes-edges";
import { initialNodes, initialEdges } from "./nodes.edges-sample";

const elk = new ELK();

// 定義 ELK 的選項類型
type ElkLayoutOptions = Record<string, string>;

// ELK 配置選項
const elkOptions: ElkLayoutOptions = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",
};

// 定義佈局函數的選項類型
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

  // 將 CustomNode 轉換為 ElkNode
  const elkNodes: ElkNode[] = nodes.map((node) => ({
    id: node.id,
    layoutOptions: options,
    targetPosition: isHorizontal ? Position.Left : Position.Top,
    sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
    width: 150,
    height: 50,
    labels: [{ text: node.data.label }],
  }));

  // 將 CustomEdge 轉換為 ElkExtendedEdge
  const elkEdges: ElkExtendedEdge[] = edges.map((edge) => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
  }));

  // 定義 graph 對象
  const graph: ElkNode & { children: ElkNode[]; edges: ElkExtendedEdge[] } = {
    id: "root",
    layoutOptions: options,
    children: elkNodes,
    edges: elkEdges,
  };

  try {
    const layoutedGraph = await elk.layout(graph);

    if (!layoutedGraph.children || !layoutedGraph.edges) {
      throw new Error("No children or edges in layoutedGraph");
    }

    // 映射 ELK 布局結果到 CustomNode
    const layoutedNodes: CustomNode[] = layoutedGraph.children.map(
      (node: ElkNode) => {
        const originalNode = nodes.find((n) => n.id === node.id);
        if (!originalNode) {
          throw new Error(`Node with id ${node.id} not found`);
        }
        if (node.x === undefined || node.y === undefined) {
          throw new Error(`Node position for id ${node.id} is undefined`);
        }
        return {
          ...originalNode,
          position: { x: node.x, y: node.y },
          targetPosition: Position.Left,
          sourcePosition: Position.Right,
        };
      }
    );

    // 映射 ELK 布局結果到 CustomEdge
    const layoutedEdges: CustomEdge[] = layoutedGraph.edges.map(
      (edge: ElkExtendedEdge) => {
        const originalEdge = edges.find((e) => e.id === edge.id);
        if (!originalEdge) {
          throw new Error(`Edge with id ${edge.id} not found`);
        }
        return {
          ...originalEdge,
          source: edge.sources[0],
          target: edge.targets[0],
        };
      }
    );

    return { nodes: layoutedNodes, edges: layoutedEdges };
  } catch (error) {
    console.error("ELK layout error:", error);
    return { nodes, edges };
  }
};

function LayoutFlow() {
  // 修改這裡的泛型參數
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
      nodeTypes={{ custom: CustomNodeComponent }}
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
