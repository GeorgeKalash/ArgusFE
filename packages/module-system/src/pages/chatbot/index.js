import { useState, useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

import {
  Bar,
  Line,
  Pie
} from "react-chartjs-2";
import { getFakeResponse } from "@argus/shared-utils/src/utils/chatMock";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Tooltip,
  Legend
);

export default function ChatPage() {
  const [chats, setChats] = useState([
    {
      id: 1,
      title: "Welcome",
      messages: [
        {
          sender: "ai",
          type: "text",
          text: "Hello 👋 How can I help you?"
        }
      ]
    }
  ]);

  const [selectedChatId, setSelectedChatId] =
    useState(1);

  const inputRef = useRef(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] =
    useState(false);

  const messagesEndRef = useRef(null);

  const selectedChat = chats.find(
    (chat) => chat.id === selectedChatId
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [selectedChat]);

  const createNewChat = () => {
    const currentChat = chats.find(
      (chat) => chat.id === selectedChatId
    );

    const isEmptyChat =
      currentChat &&
      currentChat.messages.length === 1 &&
      currentChat.messages[0].sender === "ai";

    if (isEmptyChat) return;

    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [
        {
          sender: "ai",
          type: "text",
          text: "Hello 👋 How can I help you?"
        }
      ]
    };

    setChats((prev) => [newChat, ...prev]);
    setSelectedChatId(newChat.id);
  };

  const sendMessage = () => {
    if (!input.trim() || loading) return;

    const userText = input;
    const lowerText = input.toLowerCase();

    setLoading(true);

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === selectedChatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  sender: "me",
                  type: "text",
                  text: userText
                }
              ]
            }
          : chat
      )
    );

    setInput("");

    setTimeout(() => {
      const response = getFakeResponse(userText);

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  ...response.messages
                ]
              }
            : chat
        )
      );

      setLoading(false);
    }, 2000);
  };

  useEffect(() => {
  if (!loading) {
    inputRef.current?.focus();
  }
}, [loading]);

  const renderMessage = (msg, index) => {
    const cardStyle = {
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: "12px",
      padding: "16px",
      width: "500px",
      maxWidth: "95%"
    };

    if (msg.type === "text") {
      return (
        <div
          key={index}
          style={{
            alignSelf:
              msg.sender === "me"
                ? "flex-end"
                : "flex-start",
            background:
              msg.sender === "me"
                ? "#2563eb"
                : "#f1f1f1",
            color:
              msg.sender === "me"
                ? "#fff"
                : "#000",
            padding: "10px 14px",
            borderRadius: "14px",
            maxWidth: "70%"
          }}
        >
          {msg.text}
        </div>
      );
    }

    if (msg.type === "table") {
      return (
        <div
          key={index}
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "12px",
            maxWidth: "90%"
          }}
        >
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%"
            }}
          >
            <thead>
              <tr>
                {msg.columns.map((col, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "8px",
                      borderBottom:
                        "1px solid #ddd",
                      textAlign: "left"
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {msg.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      style={{
                        padding: "8px",
                        borderBottom:
                          "1px solid #eee"
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (msg.type === "barChart") {
      return (
        <div
          key={index}
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "16px",
            width: "500px",
            maxWidth: "95%"
          }}
        >
          <h4>{msg.title}</h4>

          <Bar
            data={{
              labels: msg.labels,
              datasets: [
                {
                  label: msg.title,
                  data: msg.values,
                  backgroundColor: "rgba(22, 77, 161, 0.65)",
                  borderColor: "rgba(22, 77, 161, 0.85)",
                  borderWidth: 1
                }
              ]
            }}
          />
        </div>
      );
    }

    if (msg.type === "lineChart") {
      return (
        <div key={index} style={cardStyle}>
          <h4>{msg.title}</h4>

          <Line
            data={{
              labels: msg.labels,
              datasets: [
                {
                  label: msg.title,
                  data: msg.values,
                  backgroundColor: "rgba(22, 77, 161, 0.76)",
                  borderColor: "rgba(22, 77, 161, 0.85)",
                }
              ]
            }}
          />
        </div>
      );
    }

    if (msg.type === "pieChart") {
      return (
        <div key={index} style={cardStyle}>
          <h4>{msg.title}</h4>

          <Pie
            data={{
              labels: msg.labels,
              datasets: [
                {
                  data: msg.values,
                  backgroundColor: [
                    "rgba(163,175,30,0.88)",
                    "rgba(37,99,235,0.88)",
                    "rgba(46,138,110,0.88)",
                    "rgba(184,59,246,0.88)",
                    "rgba(246,59,59,0.88)",
                  ],
                  borderColor: [
                    "rgba(163,175,30,0.35)",
                    "rgba(37,99,235,0.35)",
                    "rgba(46,138,110,0.35)",
                    "rgba(184,59,246,0.35)",
                    "rgba(246,59,59,0.35)",
                  ],
                  borderWidth: 0.8
                }
              ]
            }}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh"
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "280px",
          borderRight: "1px solid #ddd",
          padding: "16px"
        }}
      >
        <h3>Chats</h3>

        <button
          onClick={createNewChat}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "12px",
            marginBottom: "20px",
            cursor: "pointer"
          }}
        >
          + New Chat
        </button>

        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() =>
              setSelectedChatId(chat.id)
            }
            style={{
              padding: "10px",
              marginBottom: "8px",
              borderRadius: "8px",
              cursor: "pointer",
              background:
                chat.id === selectedChatId
                  ? "#f1f1f1"
                  : "transparent",
              fontWeight:
                chat.id === selectedChatId
                  ? "bold"
                  : "normal"
            }}
          >
            {chat.title}
          </div>
        ))}
      </div>

      {/* Main Chat */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #ddd",
            fontWeight: "bold"
          }}
        >
          AI Assistant
        </div>

        <div
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}
        >
          {selectedChat.messages.map(
            (msg, i) =>
              renderMessage(msg, i)
          )}

          <div ref={messagesEndRef}></div>
        </div>

        {/* Input + Send */}
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid #ddd",
            display: "flex",
            gap: "10px"
          }}
        >
          <input
            value={input}
            disabled={loading}
            ref={inputRef}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={(e) =>
              e.key === "Enter" &&
              sendMessage()
            }
            placeholder="Type message..."
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            style={{
              padding:
                "0 18px",
              border: "none",
              borderRadius: "8px",
              background:
                loading
                  ? "#9ca3af"
                  : "#2563eb",
              color: "#fff",
              cursor:
                loading
                  ? "not-allowed"
                  : "pointer"
            }}
          >
            {loading
              ? "Sending..."
              : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}