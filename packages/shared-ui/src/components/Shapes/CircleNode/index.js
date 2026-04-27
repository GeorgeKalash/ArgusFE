import { Handle, Position } from "reactflow";
import styles from "./CircleNode.module.css";

export const CircleNode = ({ data }) => (
  <div
    className={styles.circleNode}
    style={{ background: data.color }}
  >
    <Handle
      type="target"
      position={Position.Top}
      id="top"
      className={styles.hiddenHandle}
    />
    <Handle
      type="source"
      position={Position.Top}
      id="top-source"
      className={styles.hiddenHandle}
    />

    <Handle
      type="target"
      position={Position.Left}
      id="left"
      className={styles.hiddenHandle}
    />
    <Handle
      type="source"
      position={Position.Left}
      id="left-source"
      className={styles.hiddenHandle}
    />

    <Handle
      type="target"
      position={Position.Right}
      id="right"
      className={styles.hiddenHandle}
    />
    <Handle
      type="source"
      position={Position.Right}
      id="right-source"
      className={styles.hiddenHandle}
    />

    <Handle
      type="target"
      position={Position.Bottom}
      id="bottom"
      className={styles.hiddenHandle}
    />
    <Handle
      type="source"
      position={Position.Bottom}
      id="bottom-source"
      className={styles.hiddenHandle}
    />

    <span className={styles.label}>{data.label || " "}</span>
  </div>
);