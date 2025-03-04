import React from 'react';
import axios from 'axios';
import { host, Notif, port } from '../Imps';

const Verify: React.FC = () => {
    const params = new URLSearchParams(window.location.search);
    const paramValue = params.get('token');

    const [notifs,setNotifs] = React.useState<Notif[]>([])
    
    
    React.useEffect(()=>{
        if (paramValue) {
            console.log(paramValue)
            axios.post(`http://${host}:${port}/api/verify?token=${encodeURIComponent(paramValue)}`,{}).then((respose)=>{
                console.log(respose.data)
                console.log(respose.status)
                if (respose.status === 200) {
                    customNotif("Your email has been verified","rgb(27, 203, 42)")
                    localStorage.setItem("token",respose.data.token)
                    window.location.href = "/"

                }
            }).catch(()=>{
                customNotif("Your token is invalid !","rgb(203, 27, 27)")
            })
        }else{
            customNotif("Your token is invalid !","rgb(203, 27, 27)")
        }
    },[])

    const customNotif = (msg : string,color : string) => {
        setNotifs(prev=> [{text:msg,color:color},...prev])
        setTimeout(() => {
            setNotifs(prev=> prev.slice(1))
        }, 5000);
        
    };


    return (
        <div style={{backgroundColor: "#121212",color: "#E0E0E0",height: "111.111111vh",width:'111.11111111vw',display: "flex",flexDirection: "column",alignItems: "center",justifyContent:'center'}}>
            {/* <p style={{color:'white',fontWeight:'500',width:'100%',textAlign:'center',fontSize:'5vw',margin:0}} >404</p> */}
            <p className='dot-holder' style={{color:'white',fontWeight:'500',width:'100%',textAlign:'center',fontSize:'2vw',margin:0,display:'flex',flexDirection:'row',alignItems:"center",justifyContent:'center'}} >Verifying<p className='dot one' >.</p><p className='dot two' >.</p><p className='dot three' >.</p></p>
            {/* <img src='/assets/imgs/ghostLooking.svg' style={{width:'15vw',margin:'0 0 0 2vw'}} /> */}


            {
                notifs.map((err,i)=>{
                    return (
                        <div id={i.toString()} style={{top:i*49 + 20,transition:'0.3s',backgroundColor:err.color}} className='error-pod' >
                            <p style={{color:err.color}} >{err.text}</p>
                        </div>
                    )
                })
            }
        </div>
    );
};

export default Verify;