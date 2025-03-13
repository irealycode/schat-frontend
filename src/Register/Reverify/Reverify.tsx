import axios from "axios";
import React, { useState, useCallback } from "react";
import { host, Notif, port } from "../../Imps";


const Reverify: React.FC = () => {
    const [emailDef,setEmail] = React.useState("")
    const [error,setError] = React.useState(-1)
    const [loading,setLoading] = React.useState(false)
    const [sent,setSent] = React.useState(false)
    const [notifs,setNotifs] = React.useState<Notif[]>([])

    const customNotif = (msg : string,color : string) => {
        setNotifs(prev=> [{text:msg,color:color},...prev])
        setTimeout(() => {
            setNotifs(prev=> prev.slice(1))
        }, 5000);
        
    };

    const reverify = () =>{

        if (!emailDef || emailDef?.trim() === "") {
            customNotif("Email field is empty !","rgb(203, 27, 27)");
            setError(0);
            return;
        }

        if (emailDef.trim().search(/^\S+@\S+\.\S+$/) === -1) {
            customNotif("Email is invalid !","rgb(203, 27, 27)");
            setError(0);
            return;
        }
        
        setLoading(true)
        axios.post(`http://${host}:${port}/api/send/email`,{email:emailDef}).then((res)=>{
            setLoading(false)
            if (res.status === 200) {
                customNotif("Email sent !","rgb(27, 203, 42)");
                setSent(true)
                setError(-1);
                return;
            }
            if (res.status === 401) {
                customNotif("Email does not exist !","rgb(203, 27, 27)");
                setError(0);
                return;
            }
            if (res.status === 403) {
                customNotif("Account already verified !","rgb(203, 27, 27)");
                setError(0);
                return;
            }
        }).catch((res)=>{
            setLoading(false)

            
            if (res.status === 401) {
                customNotif("Email does not exist !","rgb(203, 27, 27)");
                setError(0);
                return;
            }
            if (res.status === 403) {
                customNotif("Account already verified !","rgb(203, 27, 27)");
                setError(0);
                return;
            }
        })
    }
  return (

    
    <div style={{ backgroundColor:"#121212",color:"#E0E0E0",minHeight:"111.111111vh",height: "100vh",width:'100vw',display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding: 24,fontFamily:"Arial,sans-serif",boxSizing:"border-box" }}>
        
        {
            notifs.map((err,i)=>{
                return (
                    <div id={i.toString()} style={{top:i*49 + 20,transition:'0.3s',backgroundColor:err.color}} className='error-pod' >
                        <p style={{color:err.color}} >{err.text}</p>
                    </div>
                )
            })
        }
        <header style={{ width:"100%",maxWidth:"1200px",display:"flex",justifyContent:"center",alignItems:"center",marginBottom: 24 }}>
            <h1 onClick={() => window.location.assign("/")} style={{ color:"white",fontSize: 35,margin: 0,fontWeight: 500,display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>
            Ch<img src="/assets/imgs/chat.svg" style={{width:40,filter:"brightness(0) saturate(100%) invert(49%) sepia(66%) saturate(575%) hue-rotate(88deg) brightness(102%) contrast(87%)" }} />tify
            </h1>
        </header>
        
        <div style={{ textAlign:"center",maxWidth:"448px",width:"100%",boxSizing:"border-box",backgroundColor:"#1E1E1E",padding: '32px 24px',borderRadius:"8px",boxShadow:"0 4px 10px rgba(0,0,0,0.5)" }}>
            <h2 style={{ fontSize: 23,fontWeight:500,marginBottom: 22,color:'white',overflow:'hidden',width:'100%',textOverflow:'ellipsis',textWrap:'nowrap' }}>Please enter your email.</h2>
            <input onChange={(event) => setEmail(event.target.value)} value={emailDef} type="email" placeholder="Email Address" style={{ width:"100%",padding:"11px 18px",marginBottom: 16,borderRadius: 8,border:`1px solid ${error===0?"red":"#333"}`,backgroundColor:"#2A2A2A",color:"#E0E0E0",boxSizing:"border-box",outline:"none" }} />
            <button onClick={()=>{reverify()}} disabled={loading} style={{ backgroundColor:"#1DB954",color:"#121212",fontSize: 16,padding:"0.75rem 2rem",border:"none",borderRadius: 8,cursor:loading?"default":"pointer",width:"100%",fontWeight: 500,position:'relative',display:'flex',alignItems:'center',justifyContent:'center',height:43 }}>{!sent?loading?<img className='loading' src='/assets/imgs/loading.svg' style={{height:30,position:'absolute'}} />:'Send verification':<img src='/assets/imgs/check.svg' style={{height:30,filter:'invert(94%)',position:'absolute'}} />}</button>
            <p onClick={()=>window.location.assign("/register")} style={{ marginTop: 16, fontSize: 14, fontWeight:500,cursor:'pointer' }}>
                Don’t have an account? <span style={{ color: "#1DB954", textDecoration: "none" }}>Sign Up</span>
            </p>
        </div>
        <footer
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 24,
          fontSize: 14,
        }}
      >
        <p>© 2025 Chatify. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Reverify;
