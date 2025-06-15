import { useEffect, useRef, useState } from "react";
import "./App.css";
import "./SideNav.css";
import SideNav from "./SideNav";
import axiosInstance from "./api/axiosInstance";
import LoginPage from "./LoginPage";
import { useAuth } from "./context/AuthContext";
export default function App() {
  const [value, setvalue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const [currentChat, setCurrentChat] = useState("");
  const [chatTitles, setChatTitles] = useState({});
  const bottomRef = useRef(null);
  const [chatLog, setChatLog] = useState({});
  const { auth } = useAuth(); //accessing the token

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  function handleDeleteChatContent(chatIdToDelete) {
    axiosInstance
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post("http://localhost:8080/chat", {
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
      const titleRes = await axiosInstance.get(
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
      if (!currentChat) {
        try {
          const res = await axiosInstance.get(`http://localhost:8080/chat`);
          if (res.data && res.data.length > 0) {
            const replacedSessionId = res.data[0].session_id;
            console.log("The new assigned session_id:", replacedSessionId);

            setCurrentChat(replacedSessionId);
          }
        } catch (error) {
          console.error("Failed get a new replaced id session :", error);
        }
      } else {
        try {
          //console.log("current chat :", currentChat);
          const res = await axiosInstance.get(
            `http://localhost:8080/chat/${currentChat}`
          );
          console.log("response is ", res.data);

          setChatLog((prev) => ({
            ...prev,
            [currentChat]: res.data,
          }));
          console.log("chatlog =", chatLog);
        } catch (error) {
          console.error("Failed to fetch chat history:", error);
        }
      }
    }

    fetchChat();
  }, [currentChat]);

  if (!auth) {
    return <LoginPage />;
  }
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
                <div className="emtpychatcontainer">
                  <p className="empty-chat-message">
                    This chat is empty. Start a conversation!
                  </p>
                </div>
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
