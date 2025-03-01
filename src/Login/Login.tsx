import React from 'react';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { host, Notif, port } from '../Imps';
import axios from 'axios';

const Login: React.FC = () => {
  const [email,setEmail] = React.useState("")
  const [notifs,setNotifs] = React.useState<Notif[]>([])
  const [error,setError] = React.useState(-1)
  const [pass,setPass] = React.useState("")



  const customNotif = (msg : string,color : string) => {
    setNotifs(prev=> [{text:msg,color:color},...prev])
    setTimeout(() => {
        setNotifs(prev=> prev.slice(1))
    }, 5000);
      
  };

  const login = () =>{
    if (email.trim() === "") {
      customNotif("Email field is empty !","rgb(203, 27, 27)");
      setError(0);
      return;
    } 

    if (pass.trim() === "") {
      customNotif("Password field is empty !","rgb(203, 27, 27)");
      setError(2);
      return;
    }

    axios.post(`http://${host}:${port}/api/login`,{email:email,password:pass}).then((res)=>{
      if (res.status === 200) {
        localStorage.setItem("token",res.data.token)
        window.location.href = "/"
        customNotif("Login successful.","rgb(27, 203, 42)")
        setError(-1)
        setEmail("")
        setPass("")
      }
    }).catch(()=>{
      customNotif("Wrong email or password !","rgb(203, 27, 27)")
      setError(-1)

    })
  }


  return (
    <div
      style={{
        backgroundColor: "#121212",
        color: "#E0E0E0",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        boxSizing:'border-box'
      }}
    >

        {
            notifs.map((err,i)=>{
                return (
                    <div id={i.toString()} style={{top:i*49 + 20,transition:'0.3s',backgroundColor:err.color}} className='error-pod' >
                        <p style={{color:err.color}} >{err.text}</p>
                    </div>
                )
            })
        }


      <header
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1 onClick={()=>window.location.assign("/")} style={{ color:"white",fontSize:35,margin:0,fontWeight:500,display:'flex',flexDirection:'row',alignItems:"center",justifyContent:'center',cursor:'pointer' }}>Ch<img src='/assets/imgs/chat.svg' style={{width:40,filter:'brightness(0) saturate(100%) invert(49%) sepia(66%) saturate(575%) hue-rotate(88deg) brightness(102%) contrast(87%)'}} />tify</h1>
      </header>

      <main
        style={{
          textAlign: "center",
          maxWidth: "400px",
          width: "100%",
          backgroundColor: "#1E1E1E",
          padding: 24,
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
        }}
      >
        <h2 style={{ fontSize:23, fontWeight: 500, marginBottom:22,color:'white'}}>
          Welcome Back
        </h2>
        <input
          onChange={(event) => setEmail(event.target.value)}
          value={email}
          type="email"
          placeholder="Email Address"
          style={{
            width: "100%",
            padding: "11px 18px",
            marginBottom: 16,
            borderRadius: 8,
            border: "1px solid #333",
            backgroundColor: "#2A2A2A",
            color: "#E0E0E0",
            boxSizing:'border-box'
          }}
        />
        <input
          onChange={(event) => setPass(event.target.value)}
          value={pass}
          type="password"
          placeholder="Password"
          style={{
            width: "100%",
            padding: "11px 18px",
            marginBottom: 20,
            borderRadius: 8,
            border: "1px solid #333",
            backgroundColor: "#2A2A2A",
            color: "#E0E0E0",
            boxSizing:'border-box'
          }}
        />
        <button
        onClick={()=>login()}
          style={{
            backgroundColor: "#1DB954",
            color: "#121212",
            fontSize: 16,
            padding: "0.75rem 2rem",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            width: "100%",
            fontWeight:500
          }}
        >
          Login
        </button>
        <p onClick={()=>window.location.assign("/register")} style={{ marginTop: 16, fontSize: 14, fontWeight:500,cursor:'pointer' }}>
          Don’t have an account? <span style={{ color: "#1DB954", textDecoration: "none" }}>Sign Up</span>
        </p>
      </main>

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

export default Login;