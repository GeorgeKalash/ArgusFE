import { Handle, Position } from "reactflow";
import styles from "./SquareNode.module.css";

export const SquareNode = ({ data }) => (
  <div
    className={styles.squareNode}
    style={{
      background: data.color,
      color: data.textColor || "#000",
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

    <span className={styles.label}>{data.label}</span>
  </div>
);