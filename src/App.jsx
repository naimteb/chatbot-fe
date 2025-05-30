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
  const bottomRef = useRef(null);
  useEffect(() => {
    inputRef.current.focus();
  }, []);
  useEffect(() => {});


  const [chatLog, setChatLog] = useState(() => {
    const stored = localStorage.getItem("entry");
    return stored ? JSON.parse(stored) : {};
  });
  function handleDeleteChatContent(chatIdToDelete) {
    setChatLog((prevchatlog) => {
      const newChatlog = { ...prevchatlog };
      delete newChatlog[chatIdToDelete];
      console.log(newChatlog);
      return newChatlog;
    });
  }
 
  const chatContainerRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8080/chat", {
        request: value,
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
    } catch (error) {
      console.log("Error communicating with server", error);
    }
  };

  useEffect(() => {
    localStorage.setItem("entry", JSON.stringify(chatLog));
  }, [chatLog]);

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
  return (
    <>
      <div id="main">
        <SideNav
          setIsOpen={setIsOpen}
          isOpen={isOpen}
          setCurrentChat={setCurrentChat}
          currentChat={currentChat}
          handleDeleteChatContent={handleDeleteChatContent}
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
                    autoComplete={false}
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
