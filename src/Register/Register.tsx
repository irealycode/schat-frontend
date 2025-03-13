import React from 'react';
import { Route,BrowserRouter,Routes,useParams } from 'react-router-dom';
// import"../../public/assets/style/style.css"
import { host, Notif, port } from '../Imps';
import ImageCropper, { getCroppedImg } from './Cropper/ImageCropper';



const Register: React.FC = () => {

    const { email } = useParams<{ email?: string }>();
    const [error,setError] = React.useState(-1)
    const [emailDef,setEmail] = React.useState(email??"")
    const [pass,setPass] = React.useState("")
    const [passC,setPassC] = React.useState("")
    const [username,setUsername] = React.useState("")
    const [bio,setBio] = React.useState("")
    const [img,setImg] = React.useState<string | null>(null);
    const [croppedImg, setCroppedImg] = React.useState<File | null>(null);
    const [finishedCropping, setFinishedCropping] = React.useState<boolean>(false);
    const [notifs,setNotifs] = React.useState<Notif[]>([])
    const [loading,setLoading] = React.useState(false)
    const [registered,setRegistered] = React.useState(false)

    const customNotif = (msg : string,color : string) => {
        setNotifs(prev=> [{text:msg,color:color},...prev])
        setTimeout(() => {
            setNotifs(prev=> prev.slice(1))
        }, 5000);
        
    };

    const resizeImage = (file: File, callback: (resizedBlob: File | null) => void): void => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
      
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
      
          if (!ctx) {
            console.error("Canvas context is not supported.");
            return;
          }
      
          canvas.width = 500;
          canvas.height = 500;
      
          ctx.drawImage(img, 0, 0, 500, 500);
      
          canvas.toBlob(
            (blob) => {
                if (blob) {
                    const resizedFile = new File([blob], file.name, { type: file.type });
                    callback(resizedFile);
                  } else {
                    callback(null);
                  }
            },
            file.type,
            1.0 // quality
          );
        };
      
        img.onerror = () => {
          console.error("Error loading image.");
          callback(null);
        };
    };


    const fileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFinishedCropping(false)
            setImg(URL.createObjectURL(file));
        }
    };

    const handleCropComplete = async (_: any, croppedAreaPixels: any) => {
        if (img) {
          const croppedImg = await getCroppedImg(img, croppedAreaPixels);
          setCroppedImg(croppedImg);
        }
    };


      

    const register = async () => {

        

        

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

        if (username.trim() === "") {
            customNotif("Username field is empty !","rgb(203, 27, 27)");
            setError(1);
            return;
        }

        if (username.trim().search(/[!@#$%^&*()}{"\|\\\/]/) !== -1) {
            customNotif("Username is Invalid !","rgb(203, 27, 27)");
            setError(1);
            return;
        }

        if (username.trim().length > 15) {
            customNotif("Username length must be less that 15 characters !","rgb(203, 27, 27)");
            setError(1);
            return;
        }

        if (pass.length < 8) {
            customNotif("Password length must be more that 8 characters !","rgb(203, 27, 27)");
            setError(2);
            return;
        }

        if (pass.trim() === "") {
            customNotif("Password field is empty !","rgb(203, 27, 27)");
            setError(2);
            return;
        }

        if (passC.trim() === "") {
            customNotif("Confirm password field is empty !","rgb(203, 27, 27)");
            setError(3);
            return;
        }

        if (pass.trim() !== passC.trim()) {
            customNotif("Unmatched passwords !","rgb(203, 27, 27)");
            setError(3);
            return;
        }

        if (bio.trim() === "") {
            customNotif("Bio field is empty !","rgb(203, 27, 27)");
            setError(4);
            return;
        }

        if (!croppedImg) {
            customNotif("Image field is empty !","rgb(203, 27, 27)");
            setError(5);
            return;
        }
        
        setLoading(true)
        const formData = new FormData();
        formData.append("username", username.trim());
        formData.append("bio", bio.trim());
        formData.append("email", emailDef.trim());
        formData.append("password", pass.trim());
        formData.append("avatar", croppedImg);
      
        try {
          const response = await fetch(`http://${host}:${port}/api/register`, {
            method: "POST",
            body: formData,
          });
      
          const result = await response.json();
          if (response.status === 201) {
            setLoading(false)
            setRegistered(true)
            customNotif("Please go verify your email.","rgb(27, 203, 42)")
            setError(-1)
            setBio("")
            setEmail("")
            setPass("")
            setPassC("")
            setUsername("")
            setCroppedImg(null)
            setFinishedCropping(false)
            setImg(null)
            return
          }
          console.log("Success:", result);
          if (result.response === "invalid email") {
            setLoading(false)
            customNotif("Email is already used !","rgb(203, 27, 27)");
            setError(0);
            return;
          }
          if (result.response === "invalid username") {
            setLoading(false)
            customNotif("Username is already used !","rgb(203, 27, 27)");
            setError(1);
            return;
          }
          if (result.response === "invalid avatar") {
            setLoading(false)
            customNotif("Invalid Avatar !","rgb(203, 27, 27)");
            setError(1);
            return;
          }else{
            setLoading(false)
            customNotif("Some error !","rgb(203, 27, 27)");
            return;
          }
        } catch (error) {
            setLoading(false)
            customNotif("Some error !","rgb(203, 27, 27)");
            return;
        }
    };
      

  return (
    <div style={{ backgroundColor:"#121212",color:"#E0E0E0",minHeight:"111.1111111111vh",height: "100vh",width:'100vw',display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding: 24,fontFamily:"Arial,sans-serif",boxSizing:"border-box" }}>
        <header style={{ width:"100%",maxWidth:"1200px",display:"flex",justifyContent:"center",alignItems:"center",marginBottom: 24 }}>
            <h1 onClick={() => window.location.assign("/")} style={{ color:"white",fontSize: 35,margin: 0,fontWeight: 500,display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>
            Ch<img src="/assets/imgs/chat.svg" style={{width:40,filter:"brightness(0) saturate(100%) invert(49%) sepia(66%) saturate(575%) hue-rotate(88deg) brightness(102%) contrast(87%)" }} />tify
            </h1>
        </header>

        {
            notifs.map((err,i)=>{
                return (
                    <div id={i.toString()} style={{top:i*49 + 20,transition:'0.3s',backgroundColor:err.color}} className='error-pod' >
                        <p style={{color:err.color}} >{err.text}</p>
                    </div>
                )
            })
        }

        <div style={{width:'100%',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:"center",flexWrap:'wrap',gap:20}} >
            <div style={{ textAlign:"center",maxWidth:"448px",width:"100%",boxSizing:"border-box",backgroundColor:"#1E1E1E",padding: '32px 24px',borderRadius:"8px",boxShadow:"0 4px 10px rgba(0,0,0,0.5)" }}>
                <h2 style={{ fontSize: 23,fontWeight:500,marginBottom: 22,color:'white',overflow:'hidden',width:'100%',textOverflow:'ellipsis',textWrap:'nowrap' }}>Join Chatify. Make it yours.</h2>
                <input onChange={(event) => setEmail(event.target.value)} value={emailDef} type="email" placeholder="Email Address" style={{ width:"100%",padding:"11px 18px",marginBottom: 16,borderRadius: 8,border:`1px solid ${error===0?"red":"#333"}`,backgroundColor:"#2A2A2A",color:"#E0E0E0",boxSizing:"border-box",outline:"none" }} />
                <input onChange={(event) => setUsername(event.target.value)} value={username} placeholder="Username" style={{ width:"100%",padding:"11px 18px",marginBottom: 16,borderRadius: 8,border:`1px solid ${error===1?"red":"#333"}`,backgroundColor:"#2A2A2A",color:"#E0E0E0",boxSizing:"border-box",outline:"none" }} />
                <input onChange={(event) => setPass(event.target.value)} value={pass} type="password" placeholder="Password" style={{ width:"100%",padding:"11px 18px",marginBottom: 16,borderRadius: 8,border:`1px solid ${error===2?"red":"#333"}`,backgroundColor:"#2A2A2A",color:"#E0E0E0",boxSizing:"border-box",outline:"none" }} />
                <input onChange={(event) => setPassC(event.target.value)} value={passC} type="password" placeholder="Confirm password" style={{ width:"100%",padding:"11px 18px",marginBottom: 16,borderRadius: 8,border:`1px solid ${error===3?"red":"#333"}`,backgroundColor:"#2A2A2A",color:"#E0E0E0",boxSizing:"border-box",outline:"none" }} />
            </div>
            <div style={{ textAlign:"center",maxWidth:"400px",width:"100%",backgroundColor:"#1E1E1E",padding: 24,borderRadius:"8px",boxShadow:"0 4px 10px rgba(0,0,0,0.5)" }}>
                <textarea onChange={(event) => setBio(event.target.value)} value={bio}  placeholder="Bio" style={{ width:"100%",height:125,resize:'none',padding:"11px 18px",marginBottom: 16,borderRadius: 8,border:`1px solid ${error===4?"red":"#333"}`,backgroundColor:"#2A2A2A",color:"#E0E0E0",boxSizing:"border-box",outline:"none" }} />
                <div className='ns-02' style={{height:img && finishedCropping?'auto':39,cursor:'pointer',position:'relative',textAlign:'center',display:"flex",alignItems:'center',justifyContent:"center",width:"100%",marginBottom: 16,borderRadius: 8,border:`1px solid ${error===5?"red":"#333"}`,backgroundColor:"#2A2A2A",color:"#E0E0E0",boxSizing:"border-box",outline:"none" }} >
                    <input onChange={fileChange} type="file" accept="image/*" style={{width:"100%",position:"absolute",height:'100%',top:0,left:0,cursor:'pointer',opacity:0}} />
                    {img && !finishedCropping?<ImageCropper image={img} onCropComplete={handleCropComplete} setFinishedCropping={setFinishedCropping} />:null}
                    {croppedImg && finishedCropping?<img src={URL.createObjectURL(croppedImg)} style={{width:100,objectFit:'contain',margin:'10px 0',borderRadius:10}} />:null}
                    {!croppedImg?<h3 style={{fontSize:15,margin:0,fontWeight:'lighter'}} >Choose an avatar</h3>:null}
                </div>

                <button onClick={()=>{register()}} disabled={loading} style={{ backgroundColor:"#1DB954",color:"#121212",fontSize: 16,padding:"0.75rem 2rem",border:"none",borderRadius: 8,cursor:loading?"default":"pointer",width:"100%",fontWeight: 500,position:'relative',display:'flex',alignItems:'center',justifyContent:'center',height:43 }}>{!registered?loading?<img className='loading' src='/assets/imgs/loading.svg' style={{height:30,position:'absolute'}} />:'Sign Up':<img src='/assets/imgs/check.svg' style={{height:30,filter:'invert(94%)',position:'absolute'}} />}</button>
                <p onClick={() => window.location.assign("/login")} style={{ marginTop: 16,fontSize: 14,fontWeight: 500,cursor:"pointer" }}>
                    Already have an account? <span  style={{ color:"#1DB954",textDecoration:"none" }}>Log in</span>
                </p>
                <p onClick={() => window.location.assign("/reverify")} style={{ margin:0,fontSize: 14,fontWeight: 500,cursor:"pointer",color:'#777' }}>
                    Verification not sent?
                </p>
            </div>
        </div>

        
        

        <footer style={{ width:"100%",maxWidth:"1200px",display:"flex",justifyContent:"center",alignItems:"center",marginTop: 24,fontSize: 14 }}>
            <p>© 2025 Chatify. All rights reserved.</p>
        </footer>
    </div>

  );
};

export default Register;