import { Handle } from "reactflow";

export const HexNode = ({ data }) => {
  return (
    <div
      style={{
        padding: "12px 24px",
        background: data.color,
        clipPath: "polygon(15% 0%, 100% 0%, 100% 100%, 15% 100%, 0% 50%)",
        fontWeight: 500,
        textAlign: "center",
        position: "relative",
        minWidth: 140,
      }}
    >
      <Handle
        type="target"
        id="left-top"
        position="left"
        style={{ top: 8, opacity: 0 }}
      />

      <Handle
        type="target"
        id="left-middle"
        position="left"
        style={{ top: "50%", transform: "translateY(-50%)", opacity: 0 }}
      />

      <Handle
        type="target"
        id="left-bottom"
        position="left"
        style={{ bottom: 8, top: "auto", opacity: 0 }}
      />

      <Handle
        type="source"
        id="right-center"
        position="right"
        style={{ top: '50%', transform: 'translateY(-50%)', opacity: 0 }}
      />

      {data.label}
    </div>
  );
};
