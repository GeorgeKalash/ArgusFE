import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

export const getStatusIcon = (family, value) => {
    if (family === "printStatus") {
        if (value === 2) {
        return {
            icon: CheckCircleIcon,
            color: "#16A34A"
        };
        }

        return {
        icon: CancelIcon,
        color: "#ec6161"
        };
    }
    if (family === "invoice") {
        if (value) {
        return {
            icon: CheckCircleIcon,
            color: "#1679a3"
        };
        }

        return {
        icon: CancelIcon,
        color: "#0c0101"
        };
    }

  return null;
};