import React, { useEffect, useState, useRef } from "react";
import Client from './Client.js';
import Editor from './Editor.js';
import { initSocket } from "../socket.js";
import { useNavigate, useLocation, useParams, Navigate } from "react-router-dom";
import toast from "react-hot-toast";

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [comments, setComments] = useState([]); 
  const [chatMessages, setChatMessages] = useState([]); 
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const editorRef = useRef(null);  
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err) => handleError(err));
      socketRef.current.on('connect_failed', (err) => handleError(err));

      const handleError = (e) => {
        console.log('socket error=>', e);
        toast.error("Socket connection failed");
        navigate("/");
      };

      // Join the room with username
      socketRef.current.emit('join', {
        roomId,
        username: location.state?.username,
      });

      // Listen for when a new user joins
      socketRef.current.on("joined", ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined`);
        }
        setClients(clients);
        // Sync initial code with new user
        socketRef.current.emit('sync-code', {
          code: codeRef.current,
          socketId,
        });
      });

      // Handle user disconnection
      socketRef.current.on('disconnected', ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });

      // Sync comments when they are added
      socketRef.current.on('add-comment', ({ comment }) => {
        if (comment) {
          const { id, lineNumber, comment: text, user } = comment;
          addComment(text, lineNumber, user, id);
        }
      });

      socketRef.current.on('chat-message', ({ username, message }) => {
        setChatMessages((prev) => [...prev, { username, message }]);
      });
    };

    init();

    return () => {
      socketRef.current.disconnect();
      socketRef.current.off('joined');
      socketRef.current.off("disconnected");
      socketRef.current.off('add-comment');
      socketRef.current.off('chat-message');
    };
  }, []);

  if (!location.state) {
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room Id copied");
    } catch (error) {
      toast.error("Unable to copy Room Id");
    }
  };

  const leaveRoom = async () => {
    navigate("/");
  };

  // Add a comment locally and sync with others
  const addComment = (text, lineNumber, user, id) => {
    // Check if the comment already exists
    const exists = comments.some(comment => comment.id === id);
    if (!exists) {
      const newComment = { id, lineNumber, comment: text, user }; // Store the user who made the comment
      const updatedComments = [...comments, newComment];
      setComments(updatedComments);  // Update state with new comment

      // Sync with other users
      socketRef.current.emit('add-comment', {
        roomId,
        comment: newComment,
      });
    } else {
      toast.error("Duplicate comment detected, not added.");
    }
  };

  // Handle sending a chat message
  const sendMessage = () => {
    if (newMessage.trim()) {
      const messageData = { username: location.state?.username, message: newMessage.trim() };
      socketRef.current.emit('chat-message', messageData);
 
      setNewMessage(""); // Clear the message input
    }
  };

  return (
    <div className="container-fluid vh-100 bg-dark text-light">
      <div className="row h-100">
        <div
          className="col-md-2 bg-dark d-flex flex-column h-100"
          style={{ boxShadow: "2px 0px 4px rgba(0,0,0,0.1)" }}>
          <h3 className="mt-3 text-light">CodePair</h3>
          <hr />
          <h5 className="p-1 md-3">Members</h5>
          <div className="d-flex flex-column overflow-auto p-2">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
          <div className="mt-auto">
            <hr />
            <button className="btn btn-success mb-2" onClick={copyRoomId}>Copy Room Id</button>
            <button onClick={leaveRoom} className="btn btn-danger mb-2 btn-block">
              Leave Room
            </button>
              </div>
        </div>

        <div className="col-md-7 d-flex flex-column h-100">
          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => (codeRef.current = code)}
            onCommentsChange={(updatedComments) => setComments(updatedComments)} 
            ref={editorRef}
          />
        </div>

        {/* Comments and Chat Section */}
        <div className="col-md-3 p-2 bg-dark d-flex flex-column h-100"  
             style={{ boxShadow: "-2px 0px 4px rgba(0,0,0,0.1)" }}> {/* Added the boxShadow here */}
          {/* Comments Section */}
          <h5 className="p-1">Comments</h5>
          <div className="comments-section overflow-auto" style={{ flex: 1, marginBottom: '10px' }}>
            <ul className="list-group">
              {comments.map((comment) => (
                <li key={comment.id} className="list-group-item bg-secondary text-light mb-2">
                  <div>
                    <strong>User:</strong> {comment.user}
                  </div>
                  <div>
                    <strong>Comment:</strong> {comment.comment}
                  </div>
                  <button
                    className="btn btn-sm btn-primary mt-2"
                    onClick={() => {
                      editorRef.current.scrollToLine(comment.lineNumber);
                    }}>
                    Line {comment.lineNumber + 1}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Chat Section */}
          <hr />
          <h5 className="">Chat</h5>
          <div className="chat-box overflow-auto" style={{ flex: 1, marginBottom: '10px', padding: '10px' }}>
            <div className="d-flex flex-column">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`message-bubble p-2 mb-1 ${msg.username === location.state?.username ? 'align-self-end bg-primary text-white' : 'align-self-start bg-secondary text-white'}`}
                  style={{ borderRadius: '10px', maxWidth: '75%' }}>
                  <strong>{msg.username}: </strong> {msg.message}
                </div>
              ))}
            </div>
          </div>
          <div className="d-flex">
            <input
              type="text"
              className="form-control"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
    
            />
            <button className="btn btn-sm btn-primary" onClick={sendMessage} style={{ padding: '10px 20px' }}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
