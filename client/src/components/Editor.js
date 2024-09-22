import React ,{useEffect,useRef} from 'react';
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import CodeMirror from "codemirror";

function Editor() {
  const editorRef=useRef(null);
  useEffect(()=>{
    const init=async () => {
        const editor=CodeMirror.fromTextArea(
            document.getElementById("realTimeEditor"),
            {
                mode:{name:"javascript",json:true},
                theme:"dracula",
                autoCloseTags:true,
                autoCloseBrackets:true,
                lineNumbers:true,
            }
        );
        editor.setSize(null,'100%');
    };
    init();
  },[]);
  return (
    <div style={{ height:"600px"}}>
      <textarea id="realTimeEditor"></textarea>
    </div>
  )
}

export default Editor;
