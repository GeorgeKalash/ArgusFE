import { Handle, Position } from "reactflow";

export const SquareNode = ({ data }) => (
  <div
    style={{
      padding: 14,
      borderRadius: 6,
      minWidth: 180,
      textAlign: "center",
      fontWeight: 600,
      background: data.color,
      color: data.textColor || "#000",
      position: "relative",
    }}
  >
    <Handle
      type="target"
      position={Position.Top}
      id="top"
      style={{ opacity: 0 }}
    />
    <Handle
      type="source"
      position={Position.Top}
      id="top-source"
      style={{ opacity: 0 }}
    />

    <Handle
      type="target"
      position={Position.Left}
      id="left"
      style={{ opacity: 0 }}
    />
    <Handle
      type="source"
      position={Position.Left}
      id="left-source"
      style={{ opacity: 0 }}
    />

    <Handle
      type="target"
      position={Position.Right}
      id="right"
      style={{ opacity: 0 }}
    />
    <Handle
      type="source"
      position={Position.Right}
      id="right-source"
      style={{ opacity: 0 }}
    />

    <Handle
      type="target"
      position={Position.Bottom}
      id="bottom"
      style={{ opacity: 0 }}
    />
    <Handle
      type="source"
      position={Position.Bottom}
      id="bottom-source"
      style={{ opacity: 0 }}
    />

    {data.label}
  </div>
);