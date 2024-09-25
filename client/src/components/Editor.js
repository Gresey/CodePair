import React ,{useEffect,useRef} from 'react';
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import CodeMirror from "codemirror";

function Editor({socketRef,roomId,onCodeChange}) {
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
        editorRef.current=editor;
        editor.setSize(null,'100%');

        editorRef.current.on("change",(instance,changes)=>{           //jo bhi editor pr user write krega usko detect krega 
          //console.log(`changes`,instance,changes);
           const {origin}=changes;
           const code=instance.getValue();
           onCodeChange(code);                    //display previous code to new user

           if(origin!=='setValue'){
            socketRef.current.emit('code-change',{
              roomId,
              code,
            });
           }
        });

     
    };
    init();
  },[]);
  useEffect(()=>{
       if(socketRef.current){
        socketRef.current.on("code-change",({code})=>{
             if(code!==null){
              editorRef.current.setValue(code);
             }
        });
       }
       return () =>{
        socketRef.current.off("code-change");
       };
  },[socketRef.current]);
  return (

    <div style={{ height:"600px"}}>
     
      <textarea id="realTimeEditor"></textarea>
    </div>
  )
}

export default Editor;
