/*
document -> KVS 7
approvals -> KVS 8
delivery -> KVS 63
woTask -> KVS 89
wip -> KVS 113
*/

export const StatusBadgeColors = {
  document: {
    "-1": { key: "cancelled", bg: "#dde9fd", text: "#652020", border: "#d9c6c6" },
    "-2": { key: "onHold", bg: "#FFF7ED", text: "#C2410C", border: "#FDBA74" },
    "-3": { key: "rejected", bg: "#FEF2F2", text: "#B91C1C", border: "#FCA5A5" },

    "1": { key: "draft", bg: "#F9FAFB", text: "#4B5563", border: "#E5E7EB" },
    "2": { key: "imported", bg: "#f5f38b", text: "#000000", border: "#fffb29" },
    "3": { key: "posted", bg: "#ECFDF5", text: "#08503c", border: "#A7F3D0" },
    "4": { key: "released", bg: "#F0FDFA", text: "#4338CA", border: "#C7D2FE"}
  },

  wip: {
    "1": { key: "inProcess", bg: "#EFF6FF", text: "#1D4ED8", border: "#93C5FD" },
    "2": { key: "completed", bg: "#F5F3FF", text: "#0f6f3f", border: "#97d499d9" }
  },

  delivery: {
    "1": { key: "notDelivered", bg: "#F9FAFB", text: "#6B7280", border: "#E5E7EB" },
    "2": { key: "partial", bg: "#FFF7ED", text: "#C2410C", border: "#FDBA74" },
    "3": { key: "fullyDelivered", bg: "#ECFEFF", text: "#0E7490", border: "#A5F3FC" },
    "4": { key: "terminated", bg: "#f6f4f3", text: "#da6333", border: "#f2ba9a" },
    "5": { key: "inProcess", bg: "#EFF6FF", text: "#1D4ED8", border: "#93C5FD" }
  },

  woTaskStatus: {
    "1": { key: "open", bg: "#F9FAFB", text: "#4B5563", border: "#E5E7EB" },
    "2": { key: "completed", bg: "#f5f38b", text: "#000000", border: "#fffb29" },
  },

  approvals: {
    "-1": { key: "dismissed", bg: "#dde9fd", text: "#652020", border: "#d9c6c6" },
    "-2": { key: "unreached", bg: "#FFF7ED", text: "#C2410C", border: "#FDBA74" },
    "1": { key: "new", bg: "#F9FAFB", text: "#4B5563", border: "#E5E7EB" },
    "2": { key: "approved", bg: "#f5f38b", text: "#000000", border: "#fffb29"  },
    "3": { key: "inQueue", bg: "#ECFDF5", text: "#08503c", border: "#A7F3D0" },
    "4": { key: "cancelled", bg: "#FEF2F2", text: "#B91C1C", border: "#FCA5A5" }
  },
};

export const getStatusBadgeColor = (family, value) => {
  return StatusBadgeColors?.[family]?.[String(value)] || {
    bg: "#F9FAFB",
    text: "#374151",
    border: "#E5E7EB"
  };
};