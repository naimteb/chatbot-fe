import { useState, useEffect } from "react";
import axios from "axios";
export default function SideNav({
  setIsOpen,
  isOpen,
  setCurrentChat,
  currentChat,
  handleDeleteChatContent,
  chatLog,
  setChatLog,
  chatTitles,
  setChatTitles,
}) {
  // const [nextId, setNextId] = useState(1);
  const [chatsbtnIndex, setNewChatsbtnIndex] = useState([]);
  // const [availableIds, setAvailableIds] = useState([]);

  // useEffect(() => {
  //   if (chatsbtnIndex.length === 0) {
  //     setNewChatsbtnIndex([1]);
  //     setCurrentChat(1);
  //     setNextId(2);
  //   }
  // }, []);

  const [loading, setLoading] = useState(false);
  const handleAddChat = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/new-chat");
      if (res.data && res.data.chatId) {
        const newId = res.data.chatId.toString();
        setChatLog((prev) => ({ ...prev, [newId]: [] }));
        setCurrentChat(newId);
        console.log("chat id is :", res.data.chatId.toString());
      } else {
        console.error("Unexpected response format:", res.data);
      }
    } catch (error) {
      console.error("Failed to create chat:", error);
      if (error.response) {
        console.error("Server responded with:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (chatIdToDelete) => {
    try {
      await axios.delete(`http://localhost:8080/chat/${chatIdToDelete}`);
      handleDeleteChatContent(chatIdToDelete); // clean Redux / parent
      setChatLog((prev) => {
        const next = { ...prev };
        delete next[chatIdToDelete];
        return next;
      });
      if (currentChat === chatIdToDelete) setCurrentChat(null);
    } catch (err) {
      console.error("Couldn’t delete chat:", err);
    }
  };
  const handleChatClick = (chatId) => {
    console.log("this chat id is clicked ", chatId);
  }; // just to know what chat is clicked

  useEffect(() => {
    const fetchAllTitles = async () => {
      const ids = Object.keys(chatLog || {});
      for (const id of ids) {
        console.log(chatTitles[id]);
        if (!chatTitles[id]) {
          try {
            const res = await axios.get(
              `http://localhost:8080/chat-title/${id}`
            );
            const title = res.data.title;
            setChatTitles((prev) => {
              const updated = { ...prev };
              updated[id] = title || `Chat ${id}`;
              return updated;
            });
          } catch (error) {
            console.error("Failed to load title for chat", id, error);
          }
        }
      }
    };

    fetchAllTitles();
  }, [chatLog]);

  return (
    <>
      <button
        className={`toggle-btn ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "X" : "☰"}
      </button>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="add-remove-container">
          <button
            className="addchat-btn"
            onClick={handleAddChat}
            disabled={loading}
          >
            {loading ? "creating..." : "new chat"}
          </button>
        </div>

        <div className="navlinks">
          {console.log("nav links indexes : ", Object.keys(chatLog || {}))}
          {Object.keys(chatLog || {}).map((chatId) => (
            <div key={chatId} className="chatlink-wrapper">
              <button
                className="chatlink"
                id={`chatlink-${chatId}`}
                onClick={() => {
                  setCurrentChat(chatId), handleChatClick(chatId);
                }}
              >
                {chatTitles[chatId] || `Chat ${chatId}`}
              </button>
              <button
                className="deletechat-btn"
                onClick={() => handleDeleteChat(chatId)}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
