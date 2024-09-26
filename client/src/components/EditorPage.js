import React, { useEffect, useState, useRef } from "react";
import Client from './Client.js';
import Editor from './Editor.js';
import { initSocket } from "../socket.js";
import { useNavigate, useLocation, useParams, Navigate } from "react-router-dom";
import toast from "react-hot-toast";

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [comments, setComments] = useState([]); 
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
    };

    init();

    return () => {
      socketRef.current.disconnect();
      socketRef.current.off('joined');
      socketRef.current.off("disconnected");
      socketRef.current.off('add-comment');
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

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        <div
          className="col-md-2 bg-dark text-light d-flex flex-column h-100"
          style={{ boxShadow: "2px 0px 4px rgba(0,0,0,0.1)" }}>
          <h3 className="mt-3">CodePair</h3>
          <hr />
          <h5 className="p-1 md-3">Members</h5>

          {/* client list container */}
          <div className="d-flex flex-column overflow-auto p-2">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>

          {/* buttons */}
          <div className="mt-auto">
            <hr />
            <button className="btn btn-outline-success" onClick={copyRoomId}>Copy Room Id</button>
            <button onClick={leaveRoom} className="btn btn-danger mt-2 mb-2 px-3 btn-block">
              Leave Room
            </button>
            <button className="btn btn-outline-primary m-1">Video Call</button>
          </div>
        </div>

        {/* Editor */}
        <div className="col-md-8 text-light d-flex flex-column h-100">
          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => (codeRef.current = code)}
            onCommentsChange={(updatedComments) => setComments(updatedComments)} // Handle comment updates
            ref={editorRef}  // Pass the ref for scrolling
          />
        </div>

        {/* Comments Sidebar */}
        <div className="col-md-2 bg-dark text-light h-100">
          <h5 className="p-1 md-3">Comments</h5>
          <ul className="list-group">
            {comments.map((comment) => (
              <li key={comment.id} className="list-group-item">
                <div>
                  <strong>User:</strong> {comment.user}
                </div>
                <div>
                  <strong>Comment:</strong> {comment.comment}
                </div>
                <button
                  className="btn btn-sm btn-primary mt-2"
                  onClick={() => {
                    // Scroll to the line in the editor when the comment is clicked
                    editorRef.current.scrollToLine(comment.lineNumber);
                  }}
                >
                  Line {comment.lineNumber + 1}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
