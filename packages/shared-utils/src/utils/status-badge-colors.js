export const StatusBadgeColors = {
  document: {
    "-1": { key: "cancelled", bg: "#F3F4F6", text: "#374151", border: "#D1D5DB" },
    "-2": { key: "onHold", bg: "#FFF7ED", text: "#C2410C", border: "#FDBA74" },
    "-3": { key: "rejected", bg: "#FEF2F2", text: "#B91C1C", border: "#FCA5A5" },

    "1": { key: "draft", bg: "#F9FAFB", text: "#4B5563", border: "#E5E7EB" },
    "2": { key: "imported", bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE" },
    "3": { key: "posted", bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" },
    "4": { key: "released", bg: "#F0FDFA", text: "#0F766E", border: "#99F6E4" }
  },

  wip: {
    "1": { key: "inProcess", bg: "#EFF6FF", text: "#1D4ED8", border: "#93C5FD" },
    "2": { key: "completed", bg: "#F5F3FF", text: "#7C3AED", border: "#C4B5FD" }
  },

  delivery: {
    "1": { key: "notDelivered", bg: "#F9FAFB", text: "#6B7280", border: "#E5E7EB" },
    "2": { key: "partial", bg: "#FFF7ED", text: "#C2410C", border: "#FDBA74" },
    "3": { key: "fullyDelivered", bg: "#ECFEFF", text: "#0E7490", border: "#A5F3FC" },
    "4": { key: "terminated", bg: "#f6f4f3", text: "#da6333", border: "#f2ba9a" },
    "5": { key: "inProcess", bg: "#EFF6FF", text: "#1D4ED8", border: "#93C5FD" }
  }
};

export const getStatusBadgeColor = (family, value) => {
  return StatusBadgeColors?.[family]?.[String(value)] || {
    bg: "#F9FAFB",
    text: "#374151",
    border: "#E5E7EB"
  };
};