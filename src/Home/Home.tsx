import React from 'react';
import { Route, BrowserRouter, Routes } from 'react-router-dom';

const Home: React.FC = () => {
  const [email,setEmail] = React.useState("")
  return (
    <div
    className='home'
      style={{
        backgroundColor: "#121212",
        color: "#E0E0E0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0",
        fontFamily: "Arial, sans-serif",
        height: "100vh",width:'100vw'
      }}
    >
      <header
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          position:'relative'
        }}
      >
        <h1 style={{ color:"white",fontSize:35,margin:0,fontWeight:500,position:'absolute',top:10,left:10,display:'flex',flexDirection:'row',alignItems:"center",justifyContent:'center',cursor:'default' }}>Ch<img src='/assets/imgs/chat.svg' style={{width:40,filter:'brightness(0) saturate(100%) invert(49%) sepia(66%) saturate(575%) hue-rotate(88deg) brightness(102%) contrast(87%)'}} />tify</h1>
        <button
        onClick={()=>window.location.assign("/login")}
          style={{
            backgroundColor: "#1DB954",
            color: "#121212",
            padding: "8px 15px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            position:'absolute',
            top:'2vh',
            right:'2vh',
            fontWeight:500,
            fontSize:16
          }}
        >
          Log in
        </button>
      </header>

      {/* Hero Section */}
      <main
        style={{
          textAlign: "center",
          marginTop: "5rem",
          maxWidth: "calc(100% - 40px)",
        }}
      >
        <h2 style={{ fontSize: "clamp(25px,5vw,50px)", fontWeight: "bold", marginBottom: 16 }}>
          Seamless Conversations.<br/> Anytime, Anywhere.
        </h2>
        <p style={{ fontSize: "clamp(13px,3vw,20px)", marginBottom: "2rem" }}>
          Connect with friends and colleagues with our fast, secure, and modern
          chat app.<br/>  Join millions who trust Chatify for their conversations.
        </p>
        <input
          onChange={(event)=>setEmail(event.target.value)}
          value={email}
          type="email"
          placeholder="Enter your email to get started"
          style={{
            width: "calc(100% - 40px)",
            maxWidth: "400px",
            padding: "12px 18px",
            margin: '0 0 16px 0',
            borderRadius: "8px",
            border: "1px solid #333",
            backgroundColor: "#1E1E1E",
            color: "#E0E0E0",
          }}
        />
        <button
        onClick={()=>window.location.assign(`/register/${email}`)}
          style={{
            backgroundColor: "#1DB954",
            color: "#121212",
            fontSize: 16,
            padding: "11px 18px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginLeft:10,
            fontWeight:500
          }}
        >
          Get Started
        </button>
      </main>

      {/* Footer */}
      <footer
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "5rem",
        }}
      >
        <p style={{ fontSize: "0.875rem" }}>© 2025 Chatify. All rights reserved.</p>
        <div style={{ display: "flex", gap: 16 }}>
          <a href="#" style={{ color: "#1DB954", textDecoration: "none" }}>
            Privacy Policy
          </a>
          <a href="#" style={{ color: "#1DB954", textDecoration: "none" }}>
            Terms of Service
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;