import React,{useState} from "react";
import {v4 as uuid} from "uuid";
import {toast} from "react-hot-toast";

function Home() {
 const [roomId,setRoomId]=useState("");
 const [username,setUserName]=useState("");
 const generateRoomid=(e)=>{
  e.preventDefault();
  const id=uuid();
  setRoomId(id);
  toast.success("Room ID is generated");
 }

  return (
    <div className="container-fluid">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-12 col-md-4">
          <div className="card shadow-sm p-2 mb-5 bg-secondary rounded">
            <div className="card-body text-center bg-dark p-4">
              <h1 className="text-white mb-4">Welcome to Code Editor</h1>
             
              <h5 className="text-light mb-4">Enter the Room ID</h5>

              <div className="form-group">
                <input
                  type="text"
                  placeholder="Username"
                  className="mb-2 form-control"
                ></input>
              </div>
              <div className="form-group">
                <input
                value={roomId}
                onChange={(e)=>setRoomId(e.target.value)}
                  type="text"
                  placeholder="Room ID"
                  className="mb-4 form-control"
                ></input>
              </div>
              <button style={{ backgroundColor: '#1E90FF', color: 'white' }} className="btn btn-md mb-3 btn-block">JOIN</button>
              <p className="mt-3 text-light"> Don't have a room Id? 
                <span style={{ color: '#1E90FF',cursor:"pointer" }}
                onClick={generateRoomid}
                >
                    New Room</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;