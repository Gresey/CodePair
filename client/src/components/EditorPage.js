import React,{useEffect, useState,useRef} from "react";
import Client from './Client.js';
import Editor from './Editor.js';
import { initSocket } from "../socket.js";
import { useNavigate,useLocation,useParams ,Navigate} from "react-router-dom";
import toast from "react-hot-toast";

function EditorPage() {
    
    const [clients,setClient]=useState([
    ]);
    const socketRef=useRef(null);
    const codeRef=useRef(null);    
    const location=useLocation();
    const { roomId }=useParams();
    const navigate=useNavigate();
    useEffect(()=>{                                   //jb editor page render hoga tb connection established hoga with backend i.e tb initsocket run krega
        const init=async()=>{
           socketRef.current=await initSocket();      //jb initSocket call hoga tb backend se connection hojayga
           socketRef.current.on('connect_error',(err)=>handleError(err));
           socketRef.current.on('connect_failed',(err)=>handleError(err));
           
           const handleError=(e)=>{
            console.log('socket error=>',e);
            toast.error("Socket connection failed");
            navigate("/");
           }

           socketRef.current.emit('join',{           
            roomId,
            username:location.state?.username,
           });
            
           socketRef.current.on("joined",({clients,username,socketId})=>{         
            
           if(username!==location.state?.username){
            toast.success(`${username} joined`);
           
           }
           setClient(clients);
           socketRef.current.emit('sync-code',{
            code:codeRef.current,
            socketId,

           });
           

        });     
        //disconnected
        socketRef.current.on('disconnected',({socketId,username})=>{
          toast.success(`${username} left the room`);

          setClient((prev)=>{                      //sidebar me se user ko remove krna pdega ,uska data setClient me he to usme se remove krege
            return prev.filter(
              (client)=>client.socketId!=socketId
            )
          })
        })    

        };
        init();

        return ()=>{
          socketRef.current.disconnect();
          socketRef.current.off('joined');
          socketRef.current.off("disconnected");
        };
    },[]);

    if(!location.state){
        return <Navigate to="/" />
    }

    const copyRoomId= async()=>{
      try{
            await navigator.clipboard.writeText(roomId);
            toast.success("Room Id copied");
      }catch(error){
        toast.error("unable to copy room Id");
      }
    };
    const leaveRoom=async()=>{
      navigate("/");
    }
  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        <div
          className="col-md-2 bg-dark text-light d-flex flex-column h-100"
          style={{ boxShadow: "2px 0px 4px rgba(0,0,0,0.1)" }} >
            <h3 className=" mt-3">CodePair</h3>
            <hr/>
          <h5 className="p-1 md-3">Members</h5>
          
          
          {/* client list container */}
          <div className="d-flex flex-column overflow-auto p-2
          ">
            {clients.map((client) => (
                <Client key={client.socketId} username={client.username}/>
        ))}
          </div>

          {/* buttons */}
          <div className="mt-auto">
            <hr/>
            <button className="btn btn-success" onClick={copyRoomId}>Copy Room Id</button>
            <button  onClick={leaveRoom}className="btn btn-danger mt-2 mb-2 px-3 btn-block">
              Leave Room
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="col-md-10 text-light d-flex flex-column h-100">
         <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code)=> (codeRef.current=code)}/>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
