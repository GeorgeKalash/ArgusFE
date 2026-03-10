import { Handle, Position } from "reactflow";

export const CircleNode = ({ data }) => (
  <div
    style={{
      minWidth: 140,
      minHeight: 140,
      width: 140,
      height: 140,
      borderRadius: "50%",
      background: data.color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      fontWeight: 600,
      color: "#fff",
      position: "relative",
      boxSizing: "border-box",
      padding: 10,
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
    {data.label || " "}
  </div>
);
