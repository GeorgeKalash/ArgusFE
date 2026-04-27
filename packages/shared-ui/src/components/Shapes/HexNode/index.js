import { Handle } from "reactflow";
import styles from "./HexNode.module.css";

export const HexNode = ({ data }) => {
  return (
    <div
      className={styles.hexNode}
      style={{ background: data.color }}
    >
      <Handle
        type="target"
        id="left-top"
        position="left"
        className={styles.leftTopHandle}
      />

      <Handle
        type="target"
        id="left-middle"
        position="left"
        className={styles.leftMiddleHandle}
      />

      <Handle
        type="target"
        id="left-bottom"
        position="left"
        className={styles.leftBottomHandle}
      />

      <Handle
        type="source"
        id="right-center"
        position="right"
        className={styles.rightCenterHandle}
      />

      <span className={styles.label}>{data.label || " "}</span>
    </div>
  );
};