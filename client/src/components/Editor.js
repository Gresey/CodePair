import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import {useLocation} from "react-router-dom";
import CodeMirror from "codemirror";

const Editor = forwardRef(({ socketRef, roomId, onCodeChange, onCommentsChange }, ref) => {
  const editorRef = useRef(null);
  const location = useLocation();


  useImperativeHandle(ref, () => ({
    scrollToLine: (lineNumber) => {
      editorRef.current.scrollIntoView({ line: lineNumber, ch: 0 });
    }
  }));

  useEffect(() => {
    const init = async () => {
      const editor = CodeMirror.fromTextArea(
        document.getElementById("realTimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
          gutters: ["CodeMirror-linenumbers", "comments"], 
        }
      );
      editorRef.current = editor;
      editor.setSize(null, '100%');

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);  // Send code back to parent

        if (origin !== 'setValue') {
          socketRef.current.emit('code-change', {
            roomId,
            code,
          });
        }
      });

      // Handle click to add comments
      editorRef.current.on("gutterClick", (cm, lineNumber) => {
        const comment = prompt("Add Comment");
        if (comment) {
          const commentId = new Date().getTime(); 
   
          // Emit comment to the server
          socketRef.current.emit("add-comment", {
            roomId,
            comment: { lineNumber, comment, user: location.state?.username, id: commentId }, // Emit the comment with the line number
          });
        }
      });
    };
    init();
  }, []);

  // Function to add a comment to the editor
  const addComment = (cm, lineNumber, comment, user, id) => {
    const marker = document.createElement("div");
    marker.style.color = "#ffcc00";
    marker.innerHTML = "|"; // Visual marker for comment

    cm.setGutterMarker(lineNumber, "comments", marker); // Add gutter marker
    // Update the comments state in the parent component
    onCommentsChange(prev => [...prev, { lineNumber, comment, user, id }]);
  };

  // Sync code in real-time
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("code-change", ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      socketRef.current.off("code-change");
    };
  }, [socketRef.current]);

  // Listen for the 'add-comment' event from the server to update the comments
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("add-comment", ({ comment }) => {
        if (comment) {
          const { lineNumber, comment: text, user, id } = comment;
          addComment(editorRef.current, lineNumber, text, user, id);
        }
      });
    }
    return () => {
      socketRef.current.off("add-comment");
    };
  }, [socketRef.current]);

  return (
    <div className="mt-1 pt-2" style={{ height: "710px" }}>
      <textarea id="realTimeEditor"></textarea>
    </div>
  );
});

export default Editor;
