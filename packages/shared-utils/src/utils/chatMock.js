export function getFakeResponse(text) {
  const q = text.toLowerCase();

  if (q.includes("sales")) {
    return {
      messages: [
        {
          type: "text",
          sender: "ai",
          text: "Here is your monthly sales:"
        },
        {
          type: "barChart",
          sender: "ai",
          title: "Monthly Sales",
          labels: ["Jan", "Feb", "Mar"],
          values: [1200, 1800, 1500]
        }
      ]
    };
  }

  if (q.includes("trend")) {
    return {
      messages: [
        {
          type: "lineChart",
          sender: "ai",
          title: "Revenue Trend",
          labels: ["Jan", "Feb", "Mar"],
          values: [5000, 6200, 7100]
        }
      ]
    };
  }

  if (q.includes("category")) {
    return {
      messages: [
        {
          type: "pieChart",
          sender: "ai",
          title: "Sales by Category",
          labels: ["Phones", "Cases", "Chargers", "ScreenProtectors", "Adapters"],
          values: [40, 35, 25, 50, 6]
        }
      ]
    };
  }

  if (q.includes("invoice")) {
    return {
      messages: [
        {
          type: "text",
          sender: "ai",
          text: "Here are your invoices:"
        },
        {
          type: "table",
          sender: "ai",
          columns: ["Invoice", "Amount", "Status"],
          rows: [
            ["INV-001", "$120", "Unpaid"],
            ["INV-002", "$300", "Paid"]
          ]
        }
      ]
    };
  }

  return {
    messages: [
      {
        type: "text",
        sender: "ai",
        text: "I received: " + text
      }
    ]
  };
}