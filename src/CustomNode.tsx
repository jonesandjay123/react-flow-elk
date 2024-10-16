// src/CustomNode.tsx
import React from "react";
import { Handle, Position } from "reactflow";
import { CustomNode as NodeType } from "./nodes-edges";

interface CustomNodeProps {
  data: NodeType["data"];
  style?: React.CSSProperties;
  className?: string;
}

const CustomNode: React.FC<CustomNodeProps> = ({ data, style, className }) => {
  return (
    <div
      style={{
        ...style,
        padding: 10,
        backgroundColor: "#e2e8f0",
        borderRadius: 5,
      }}
      className={className}
    >
      <Handle type="target" position={Position.Left} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default CustomNode;
