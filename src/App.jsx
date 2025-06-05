import { useEffect, useRef, useState } from "react";
import "./App.css";
import "./SideNav.css";
import SideNav from "./SideNav";
import axios from "axios";

export default function App() {
  const [value, setvalue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const [currentChat, setCurrentChat] = useState("1");
  const [chatTitles, setChatTitles] = useState({});
  const bottomRef = useRef(null);
  useEffect(() => {
    inputRef.current.focus();
  }, []);
  useEffect(() => {});

  const [chatLog, setChatLog] = useState({});
  function handleDeleteChatContent(chatIdToDelete) {
    axios
      .delete(`http://localhost:8080/chat/${chatIdToDelete}`)
      .then(() => {
        setChatLog((prevchatLog) => {
          console.log("prevChatslog:", prevchatLog);
          const newchatLog = { ...prevchatLog };
          delete newchatLog[chatIdToDelete];
          return newchatLog;
        });
      })
      .catch((error) => {
        console.error("FAILED TO DELETE CHAT ", error);
      });
  }

  const chatContainerRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8080/chat", {
        request: value,
        session_id: currentChat,
      });

      const response = res.data.response;

      setChatLog((prevLog) => {
        const newLog = { ...prevLog };
        if (!newLog[currentChat]) {
          newLog[currentChat] = [{ request: value, response: response }]; // Create a new block at this index
        } else {
          // Append to existing block

          newLog[currentChat] = [
            ...newLog[currentChat],
            { request: value, response: response },
          ];
        }
        return newLog;
      });

      setvalue("");
      const titleRes = await axios.get(
        `http://localhost:8080/chat-title/${currentChat}`
      );
      const title = titleRes.data.title;
      setChatTitles((prev) => ({ ...prev, [currentChat]: title }));
    } catch (error) {
      console.log("Error communicating with server", error);
    }
  };

  // useEffect(() => {
  //   localStorage.setItem("entry", JSON.stringify(chatLog));
  // }, [chatLog]); no need beacuse now the server keeps the data

  // useEffect(() => {
  //   if (chatContainerRef.current) {
  //     /*is like querySelector (".chatcontent") */ chatContainerRef.current.scrollTop =
  //       chatContainerRef.current.scrollHeight;
  //   }
  // }, [chatLog]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatLog]);
  useEffect(() => {
    async function fetchChat() {
      try {
        const res = await axios.get(
          `http://localhost:8080/chat/${currentChat}`
        );
        setChatLog((prev) => ({
          ...prev,
          [currentChat]: res.data,
        }));
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    }

    fetchChat();
  }, [currentChat]);

  return (
    <>
      <div id="main">
        <SideNav
          setIsOpen={setIsOpen}
          isOpen={isOpen}
          setCurrentChat={setCurrentChat}
          currentChat={currentChat}
          handleDeleteChatContent={handleDeleteChatContent}
          chatLog={chatLog}
          setChatLog={setChatLog}
          chatTitles={chatTitles}
          setChatTitles={setChatTitles}
        />
        <div className="fullscreen">
          <div className="chatbody">
            <div className="chatcontent">
              {chatLog[currentChat]?.length > 0 ? (
                chatLog[currentChat].map((entry, index) => (
                  <div key={index}>
                    <div className="requestContainer">
                      <p className="response">{entry.request}</p>
                    </div>
                    <div className="responseContainer">
                      <p className="response">{entry.response}</p>
                    </div>
                    <div ref={bottomRef}></div>
                  </div>
                ))
              ) : (
                <p className="empty-chat-message">
                  This chat is empty. Start a conversation!
                </p>
              )}
            </div>
            <div className="formcontainer">
              <form onSubmit={handleSubmit}>
                <div className="inputwrapper">
                  <input
                    className="inputfield"
                    type="text"
                    name="datafromuser"
                    id="request"
                    value={value}
                    onChange={(e) => setvalue(e.target.value)}
                    autoComplete="off"
                    ref={inputRef}
                  />
                  <button
                    type="submit"
                    className="submitbtn"
                    disabled={value.trim() === ""}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="20"
                      width="20"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M4 21v-7l12-2-12-2V3l18 9z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
