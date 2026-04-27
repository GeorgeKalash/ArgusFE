import { useState, useRef, useEffect, useContext } from "react";
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

import { sendChatMessage } from "@argus/shared-providers/src/providers/chatService";
import { AuthContext } from '@argus/shared-providers/src/providers/AuthContext'
import ReactMarkdown from "react-markdown";
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import DeleteDialog from "@argus/shared-ui/src/components/Shared/DeleteDialog";
import { ResourceIds } from "@argus/shared-domain/src/resources/ResourceIds";
import { useResourceQuery } from "@argus/shared-hooks/src/hooks/resource";

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
  const { user } = useContext(AuthContext);
  const { stack } = useWindow()

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  
  const {
    labels,
  } = useResourceQuery({
    datasetId: ResourceIds.AIChatbot,
  })
  
  const newChat = {
    id: Date.now(),
    conversationId: "",
    title: labels?.newChat || "New Chat",
    messages: []
    };
    
  const [chats, setChats] = useState([newChat]);

  const [selectedChatId, setSelectedChatId] = useState(() => newChat.id);
  
  const selectedChat =
    chats.find(
      (chat) =>
        chat.id === selectedChatId
    ) || chats[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [selectedChat]);

  const createNewChat = () => {
    const existingDraft =
      chats.find(
        (chat) =>
          !chat.conversationId
      );

    if (existingDraft) {
      setSelectedChatId(
        existingDraft.id
      );
      return;
    }

    setChats((prev) => [
      newChat,
      ...prev
    ]);

    setSelectedChatId(
      newChat.id
    );
  };

  const sendMessage = () => {
    if (!input.trim() || loading) return;

    const userText = input;

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
                },
                {
                  sender: "ai",
                  type: "text",
                  text: "",
                  isStreaming: true,
                  isWaiting: true
                }
              ]
            }
          : chat
      )
    );

    setInput("");

    const conversationId = selectedChat?.conversationId

    sendChatMessage(userText, user.accessToken, conversationId, (event) => {
      if (
        event.type ===
        "conversationId"
      ) {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === selectedChatId
              ? {
                  ...chat,
                  conversationId:
                    chat.conversationId || event.value
                }
              : chat
          )
        );

        return;
      }
      if (event.type === "chunk") {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id !== selectedChatId)
              return chat;

            const updatedMessages = [
              ...chat.messages
            ];

            const last =
              updatedMessages.length - 1;

            updatedMessages[last] = {
              ...updatedMessages[last],
              text:
                updatedMessages[last]
                  .text + event.text,
              isStreaming: true,
              isWaiting: false
            };

            return {
              ...chat,
              messages: updatedMessages
            };
          })
        );
      }

      if (event.type === "message") {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === selectedChatId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    event.message
                  ]
                }
              : chat
          )
        );
      }

      if (event.type === "done") {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id !== selectedChatId)
              return chat;

            const updatedMessages = [
              ...chat.messages
            ];

            const lastIndex =
              updatedMessages.length - 1;

            if (
              updatedMessages[lastIndex]
                ?.isStreaming
            ) {
              updatedMessages[lastIndex] = {
                ...updatedMessages[lastIndex],
                isStreaming: false
              };
            }

            return {
              ...chat,
              messages: updatedMessages
            };
          })
        );

        setLoading(false);
      }
    });
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
            maxWidth: "70%",
          }}
        >
          
          {msg.isWaiting ? (
            <div
              style={{
                display: "flex",
                gap: "6px",
                alignItems: "center",
                padding: "4px 0"
              }}
            >
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          ) : msg.isStreaming ? (
            <div style={{ whiteSpace: "pre-wrap" }}>
              {msg.text}▋
            </div>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => (
                  <p
                    style={{
                      margin: 0,
                      lineHeight: 1.5
                    }}
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul
                    style={{
                      margin: "6px 0",
                      paddingLeft: "20px"
                    }}
                    {...props}
                  />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    style={{
                      margin: "6px 0",
                      paddingLeft: "20px"
                    }}
                    {...props}
                  />
                )
              }}
            >
              {msg.text}
            </ReactMarkdown>
          )}
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


  const confirmDeleteChat = (chat) => {
    openDelete({
      ...chat
    });
  };

  const onDelete = (chat) => {
    deleteChat(chat.id);
  };

  function openDelete(chat) {
    stack({
      Component: DeleteDialog,
      props: {
        open: [true, {}],
        fullScreen: false,
        onConfirm: () =>
          onDelete(chat)
      },
      refresh: false
    });
  }
  

  const deleteChat = (chatId) => {
    const visibleChats =
      searchText.trim()
        ? filteredChats
        : chats;

    const deletedIndex =
      visibleChats.findIndex(
        (c) => c.id === chatId
      );

    const updatedChats =
      chats.filter(
        (c) => c.id !== chatId
      );

    if (!updatedChats.length) {
      setChats([newChat]);
      setSelectedChatId(
        newChat.id
      );
      return;
    }

    setChats(updatedChats);

    if (
      selectedChatId !== chatId
    ) {
      return;
    }

    let nextChat = null;

    if (
      deletedIndex >= 0 &&
      visibleChats[
        deletedIndex + 1
      ]
    ) {
      const nextId =
        visibleChats[
          deletedIndex + 1
        ].id;

      nextChat =
        updatedChats.find(
          (c) => c.id === nextId
        );
    }

    if (
      !nextChat &&
      deletedIndex > 0
    ) {
      const prevId =
        visibleChats[
          deletedIndex - 1
        ].id;

      nextChat =
        updatedChats.find(
          (c) => c.id === prevId
        );
    }

    if (!nextChat) {
      nextChat =
        updatedChats[0];
    }

    setSelectedChatId(
      nextChat.id
    );
  };

  const filteredChats =
    chats.filter((chat) =>
      chat.title
        .toLowerCase()
        .includes(
          searchText.toLowerCase()
        )
    );

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          width: sidebarOpen
            ? "280px"
            : "0px",
          minWidth: sidebarOpen
            ? "280px"
            : "0px",
          flexShrink: 0,
          overflow: "hidden",
          transition:
            "all 0.25s ease",
          borderRight:
            sidebarOpen
              ? "1px solid #ddd"
              : "none"
        }}
      >
        <div
          style={{
            padding: "16px"
          }}
        >
        <button
          onClick={createNewChat}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 14px",
            background: "#fff",
            color: "#111",
            border: "1px solid #ddd",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "500",
            transition:
              "all 0.2s ease"
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background =
              "#f7f7f7")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background =
              "#fff")
          }
        >
          <span
            style={{
              fontSize: "18px",
              lineHeight: 1
            }}
          >
            ✎
          </span>

          <span>
            {labels?.newChat ??
              "New Chat"}
          </span>
        </button>
        <input
          value={searchText}
          onChange={(e) =>
            setSearchText(
              e.target.value
            )
          }
          placeholder={labels?.placeholder ?? ''}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "12px",
            marginBottom: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc"
          }}
        />

        

          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                padding: "10px",
                marginBottom: "8px",
                borderRadius: "8px",
                background:
                  chat.id === selectedChatId
                    ? "#f1f1f1"
                    : "transparent"
              }}
            >
              <div
                onClick={() =>
                  setSelectedChatId(chat.id)
                }
                style={{
                  flex: 1,
                  cursor: "pointer"
                }}
              >
                {chat.title}
              </div>

              {chat.conversationId && (
                <button
                  onClick={() =>
                    confirmDeleteChat(chat)
                  }
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    cursor: "pointer",
                    color: "#999"
                  }}
                >
                  🗑
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
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
          <button
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "20px",
              padding: "4px 8px",
              borderRadius: "6px"
            }}
          >
            ☰
          </button>
          <span>
            {labels?.aiAssistant ?? ''}
          </span>
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
          {selectedChat.messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: "#666",
              textAlign: "center"
            }}
          >
            <h2
              style={{
                marginBottom: "10px"
              }}
            >
              {labels?.startNewChat ?? ''}
            </h2>

            <div>
              {labels?.askAnything ?? ''}
            </div>
          </div>
        ) : (
          <>
            {selectedChat.messages.map(
              (msg, i) =>
                renderMessage(msg, i)
            )}

            <div ref={messagesEndRef}></div>
          </>
        )}
        </div>

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
            placeholder={labels?.fieldPlaceHolder ?? ''}
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
              ? labels?.sending ?? ''
              : labels?.send ?? ''}
          </button>
        </div>
      </div>
    </div>
  );
}