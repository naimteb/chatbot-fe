import { useState, useEffect } from "react";

export default function SideNav({
  setIsOpen,
  isOpen,
  setCurrentChat,
  currentChat,
  handleDeleteChatContent,
}) {
  const [nextId, setNextId] = useState(1);
  const [chatsbtnIndex, setNewChatsbtnIndex] = useState([]);
  const [availableIds, setAvailableIds] = useState([]);

  useEffect(() => {
    if (chatsbtnIndex.length === 0) {
      setNewChatsbtnIndex([1]);
      setCurrentChat(1);
      setNextId(2);
    }
  }, []);

  const handleAddChat = () => {
    let idToUse;

    if (availableIds.length > 0) {
      idToUse = availableIds[0];
      setAvailableIds((prev) => prev.slice(1)); // remove the id used
    } else {
      idToUse = nextId;
      console.log(nextId);
      setNextId((prev) => prev + 1);
    }

    setNewChatsbtnIndex((prev) => [...prev, idToUse].sort((a, b) => a - b));
    setCurrentChat(idToUse);
  };

  const handleDeleteChat = (chatIdToDelete) => {
    setNewChatsbtnIndex((prev) => prev.filter((id) => id !== chatIdToDelete));
    setAvailableIds((prev) => [...prev, chatIdToDelete].sort((a, b) => a - b));
    handleDeleteChatContent(chatIdToDelete);

    if (chatIdToDelete === currentChat) {
      const remaining = chatsbtnIndex.filter((id) => id !== chatIdToDelete);
      setCurrentChat(remaining.length > 0 ? remaining[0] : null);
    }
  };

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
          <button className="addchat-btn" onClick={handleAddChat}>
            new chat
          </button>
        </div>

        <div className="navlinks">
          {chatsbtnIndex.map((chatId) => (
            <div key={chatId} className="chatlink-wrapper">
              <button
                className="chatlink"
                id={`chatlink-${chatId}`}
                onClick={() => setCurrentChat(chatId)}
              >
                CHAT {chatId}
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
