import React, { use, useEffect, useRef } from 'react';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import Chat, { sendRefComp } from './Chat';
import axios from 'axios';
import { host, port, Notif } from '../Imps';
import { io, Socket } from 'socket.io-client';


interface HomeProps {
    token : string    
}
export type UserType = {
    user_id : string,
    username: string,
    
};

export type Message = {
    chatId : string,
    userId: string,
    content: string,
    new: boolean
}


export type ReplyType = {
    id : string,
    content : string
};


export type TallMessage = {
    chatId: string,
    content: string,
    id: string,
    media: boolean | null,
    reply: ReplyType | null,
    sentAt: string,
    userId: string,
}

export type ChatType = {
    id: string,
    last_message: Message | null,
    status:boolean
    number: number,
    user: {
        id: string,
        username: string,
        avatar: string,
    },
    
}

export type ReceivedMessage = {
    userId : string | undefined,
    chatId : string | undefined,
    id : string,
    content : string,
    sentAt : string,
    reply : ReplyType | null
};


type DumbChatType = {
    id: string,
    last_message: Message | null,
    status:boolean
    number: number,
    user1: {
        id: string,
        username: string,
        avatar: string,
    },
    user2: {
        id: string,
        username: string,
        avatar: string,
    },
    
}

type Typer = {
    typerId: string,
    chatId: string,
    isTyping: boolean
}


const HomeLogged: React.FC<HomeProps> = ({token}) => {
    
    type MainUserType = {
        id : string,
        email: string;
        status: string;
        username: string;
        verified: boolean;
    };

    type UserSearch = {
        id : string,
        username : string
    }

    type ReplyType = {
            id : string,
            text : string
    };

    

    
    const user_id = "nsl2";
    const [filterType,setFilterType] = React.useState(0)
    const [user,setUser] = React.useState<MainUserType | null>(null)
    const [chatRemoved,setChatRemoved] = React.useState(true)
    const [openSettings,setOpenSettings] = React.useState(false)
    const [searchFriends,setSearchFriends] = React.useState("")
    const [friends,setFriends] = React.useState<ChatType[]>([]);
    const friendsRef = useRef<ChatType[]>([])
    const [messages,setMessages] = React.useState<TallMessage[] | null>([]);
    
    const [selectedChat,setSelectedChat] = React.useState<null | ChatType>(null);
    const selectedChatRef = useRef<ChatType | null>(null)

    const [openSearch,setOpenSearch] = React.useState(false)
    const [searchUsers,setSearchUsers] = React.useState("")
    const [foundUsers,setFoundUsers] = React.useState<UserSearch[]>([])
    const [notifs,setNotifs] = React.useState<Notif[]>([])
    const [sockett,setSockett] = React.useState<Socket | null>(null)
    const chatRef = React.useRef<sendRefComp | null>(null)
    const [outsideMessage,setOutsideMessage] = React.useState<ReplyType | null>(null)
    const [isTyping, setIsTyping] = React.useState(false);
    const [typer, setTyper] = React.useState<Typer | null>(null);
    
    const customNotif = (msg : string,color : string) => {
        setNotifs(prev=> [{text:msg,color:color},...prev])
        setTimeout(() => {
            setNotifs(prev=> prev.slice(1))
        }, 5000);
        
    };
    //8012fb65-13d6-45f8-ac92-589028edfcf9
    //
    
    useEffect(()=>{
        const socket = io(`http://${host}:${port}`,{
            auth : { token : token },
        })
        socket.on("connect",()=>{
            console.log("connected")
        })

        socket.on('message', (data) => {
            console.log(data)
            if (data.message) {
                console.log(data.message.chatId , ' | ', selectedChatRef.current?.id)
                console.log(data.message)
                if (selectedChatRef.current && data.message.chatId === selectedChatRef.current.id) {
                    addMessageReceived(data.message)
                }
                setFriends(prev =>  prev.map((fs) => (fs.id === data.message.chatId?{...fs,last_message:{chatId:data.message.chatId,userId:data.message.userId,content:data.message.content,new:data.message.chatId !== selectedChatRef.current?.id}}:fs)))
                const fr = friendsRef.current.find((f)=>f.id===data.message.chatId)
                if (!fr) {
                    getOneChat(data.message.chatId);
                }
                
            }
        });

        socket.on('messageCallBack', (data) => {
            console.log('Received back:', data);
            if(data){
                addMessageId(data.id)
            }
        });

        socket.on('typing', (data) => {
            console.log(data)
            if(data.isTyping){
                setTyper(data)
            }else{
                setTyper(null)
            }
            
        });
        setSockett(socket)
        getUser()

        return(()=>{
            socket.disconnect()
        })
    },[])

    const getFriendsImages = (chats : ChatType[]) =>{
        chats.forEach(chat => {
            axios.get(`http://${host}:${port}/api/download/images?imageId=${encodeURIComponent(chat.user.avatar)}`,{headers:{'Authorization':`Bearer ${token}`}}).then((res)=>{
                if (res.status === 200) {
                    setFriends(prev=>prev.map((f)=>f.id === chat.id?({...f,user:{...f.user,avatar:res.data.url}}):f))
                }
            }).catch((err)=>{
                console.log(err)
            })
        });
        
    }

    const getUser = () =>{
        console.log(token)
        axios.get(`http://${host}:${port}/api/users`,{headers:{'Authorization':`Bearer ${token}`}}).then((res)=>{
            if (res.status === 200) {
                setUser(res.data.user)
                axios.get(`http://${host}:${port}/api/chats`,{headers:{'Authorization':`Bearer ${token}`}}).then((res1)=>{
                    if (res1.status === 200) {
                        // console.log(res1.data.chats.map((chat : DumbChatType)=> ({id:chat.id,last_message:chat.last_message,status:chat.status,number:0,user:chat.user1.id === res.data.user.id?chat.user2:chat.user1})))
                        const filteredFriends = res1.data.chats.map((chat : DumbChatType)=> ({id:chat.id,last_message:chat.last_message,status:chat.status,number:0,user:chat.user1.id === res.data.user.id?chat.user2:chat.user1}))
                        console.log(filteredFriends)
                        setFriends(filteredFriends)
                        getFriendsImages(filteredFriends)
                        friendsRef.current = filteredFriends
                        // setUser(res.data.user)
                    }
                }).catch((res1)=>{
                    customNotif(`An error has accured ! ${res1.status}`,"rgb(203, 27, 27)")
                })
            }
        }).catch((res)=>{
            customNotif(`An error has accured ! ${res.status}`,"rgb(203, 27, 27)")
        })
    }

    


    const addMessageReceived = (msg : ReceivedMessage) => {
        chatRef.current?.sendFriendsMessage(msg)
    }
    const addMessageId = (id : string) => {
        chatRef.current?.addMessageId(id)
    }


    const logOut = () =>{
        localStorage.removeItem('token')
        window.location.reload()
    }

    const searchUserFunc = (user : string) => {
        setSearchUsers(user.trim())
        if (user.trim() === "") {
            setFoundUsers([])
            return
        }
        axios.get(`http://${host}:${port}/api/search/users?username=${user.trim()}`,{headers:{'Authorization':`Bearer ${token}`}}).then((res)=>{
            setFoundUsers(res.data.users)
        }).catch(()=>{
            setFoundUsers([])
        })
    }


    // const capFirstChar = (s : string | undefined) => s?s.charAt(0).toUpperCase() + s.slice(1).toLowerCase():null;
    const getParsedNumber = (i : number) =>{
        if(i > 0 && i < 1000){
            return i.toString()
        }else if(i > 999 && i < 1000000){
            return (i/1000).toFixed(1) + "k"
        }else{
            return (i/1000000).toFixed(1) + "m"
        }
    }

    const getOneChat = (id : string) =>{
        axios.get(`http://${host}:${port}/api/chats`,{headers:{'Authorization':`Bearer ${token}`}}).then((res1)=>{
            if (res1.status === 200) {
                // console.log(res1.data.chats.map((chat : DumbChatType)=> ({id:chat.id,last_message:chat.last_message,status:chat.status,number:0,user:chat.user1.id === user?.id?chat.user2:chat.user1})))
                const fr = res1.data.chats.find((chat : DumbChatType)=> chat.id === id)
                setFriends(prev=> [...prev,{id:fr.id,last_message:fr.last_message,status:fr.status,number:0,user:fr.user1.id === user?.id?fr.user2:fr.user1}])
                friendsRef.current = [...friendsRef.current,fr]
                getFriendsImages(friendsRef.current)

            }
        }).catch((res)=>{
            customNotif(`An error has accured ! ${res.status}`,"rgb(203, 27, 27)")
        })
    }

    const getChats = () =>{
        axios.get(`http://${host}:${port}/api/chats`,{headers:{'Authorization':`Bearer ${token}`}}).then((res1)=>{
            if (res1.status === 200) {
                // console.log(res1.data.chats.map((chat : DumbChatType)=> ({id:chat.id,last_message:chat.last_message,status:chat.status,number:0,user:chat.user1.id === user?.id?chat.user2:chat.user1})))
                const filteredFriends = res1.data.chats.map((chat : DumbChatType)=> ({id:chat.id,last_message:chat.last_message,status:chat.status,number:0,user:chat.user1.id === user?.id?chat.user2:chat.user1}))
                setFriends(filteredFriends)
                friendsRef.current = filteredFriends
                getFriendsImages(filteredFriends)
            }
        }).catch((res)=>{
            customNotif(`An error has accured ! ${res.status}`,"rgb(203, 27, 27)")
        })
    }

    const addChat = (id : string) =>{
        axios.post(`http://${host}:${port}/api/chats?userId=${id}`,{}, {headers : {'Authorization':`Bearer ${token}`}}).then((res)=>{

            if (res.status === 201) {
                getChats()
                setSearchUsers("")
                setOpenSearch(false)
                setChatRemoved(true)
                setFoundUsers([])
            }
        }).catch(()=>{
            const chat = friends.filter((chat)=>chat.user.id === id)[0]
            if (chat) {
                setSearchUsers("")
                setOpenSearch(false)
                setChatRemoved(false)
                setSelectedChat(chat)
                setFoundUsers([])

            }
        })
    }

    const selectChat = (friend : ChatType) =>{
        axios.get(`http://${host}:${port}/api/messages?chatId=${friend.id}`,{headers:{'Authorization':`Bearer ${token}`}}).then((res)=>{
            console.log(res.data.messages)
            if (res.status === 200) {
                setMessages(res.data.messages)
            }
        }).catch((err)=>{
            console.error(err)
        })
        setFriends(prev=> prev.map((f)=>f.id === friend.id?{ ...f, last_message: f.last_message?{ ...f.last_message, new: false }:null }:f))
        setSelectedChat(friend)
        selectedChatRef.current = friend
        setChatRemoved(false)
        setOpenSearch(false)
    }
    

    const openOneBanner = (type : number) => {
        if (type === 0) {
            setOpenSearch(!openSearch);
            setOpenSettings(false);
        }else if(type === 1){
            setOpenSearch(false);
            setOpenSettings(!openSettings);
        }
    }


    return (
    <div style={{backgroundColor: "#121212",color: "#E0E0E0",height: "100vh",display: "flex",flexDirection: "column",alignItems: "center"}}>

        {
            notifs.map((err,i)=>{
                return (
                    <div id={i.toString()} style={{top:i*49 + 20,transition:'0.3s',backgroundColor:err.color}} className='error-pod' >
                        <p style={{color:err.color}} >{err.text}</p>
                    </div>
                )
            })
        }
        
        <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'start'}}>
            <div style={{height:'100%',width:'50%',position:'relative',zIndex:11,maxWidth:350,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:"start",backgroundColor:'#393939'}} >
                <img onClick={()=>openOneBanner(0)} src='/assets/imgs/addUser.svg' style={{cursor:'pointer',position:'absolute',top:15,right:45,height:30}} />
                <img onClick={()=>openOneBanner(1)} src='/assets/imgs/settings.svg' style={{cursor:'pointer',position:'absolute',top:15,right:10,height:30}} />
                <h1 style={{ color:"white",fontSize:30,margin:'10px 0 0 15px',alignSelf:'start',fontWeight:500,display:'flex',flexDirection:'row',alignItems:"center",justifyContent:'center',cursor:'default' }}>Ch<img src='/assets/imgs/chat.svg' style={{height:30,filter:'brightness(0) saturate(100%) invert(49%) sepia(66%) saturate(575%) hue-rotate(88deg) brightness(102%) contrast(87%)'}} />tify</h1>
                
                <div className='cm-47' style={{width:'calc(100% - 30px)',height:35,border:'2px solid #999',borderRadius:10,display:"flex",boxSizing:'border-box',alignItems:"center",justifyContent:"center",overflow:'hidden',padding:4,marginTop:20}} >
                    <img src='/assets/imgs/search.svg' style={{height:17,padding:3,opacity:0.7}} />
                    <input onChange={(event)=>setSearchFriends(event.target.value)} value={searchFriends} placeholder='Search' style={{height:'calc(100% - 2px)',fontFamily:'Quicksand',fontWeight:'bolder',width:'calc(100% - 36px)',color:'white',outline:'none',marginLeft:10,padding:0,border:0,backgroundColor:"transparent",fontSize:15}} />
                </div>
                <div className='ms-21' style={{width:'calc(100% - 30px)',display:"flex",boxSizing:'border-box',alignItems:"center",justifyContent:"start",overflow:'hidden',padding:4,marginTop:6}} >
                    <p onClick={()=>setFilterType(0)} style={{fontWeight:'lighter',margin:'0 5px',color:'white',cursor:'pointer',backgroundColor:filterType === 0?'#1DB954':'#1db95425',padding:'4px 10px',borderRadius:20}} >All</p>
                    <p onClick={()=>setFilterType(1)} style={{fontWeight:'lighter',margin:'0 5px',color:'white',cursor:'pointer',backgroundColor:filterType === 1?'#1DB954':'#1db95425',padding:'4px 10px',borderRadius:20}} >Read</p>
                    <p onClick={()=>setFilterType(2)} style={{fontWeight:'lighter',margin:'0 5px',color:'white',cursor:'pointer',backgroundColor:filterType === 2?'#1DB954':'#1db95425',padding:'4px 10px',borderRadius:20}} >Unread</p>
                </div>
                <div style={{height:'calc(100% - 107px)',width:'100%',overflowY:'scroll'}} >
                    {friends.filter((friend)=>friend.user.username.trim().toLocaleLowerCase().includes(searchFriends.toLocaleLowerCase()) && (filterType === 0 || (filterType === 2 && friend.last_message && friend.last_message.new) || (filterType === 1 && friend.last_message && !friend.last_message.new))).map((friend,i)=>{
                            return(
                                <div onClick={()=>{selectChat(friend)}} className='nf-73' style={{height:70,transition:'0.3s',cursor:'pointer',width:'100%',display:'flex',alignItems:'center',justifyContent:'start',padding:'0 10px',position:'relative',boxSizing:'border-box'}} >
                                    {friend.last_message && friend.last_message.new?<div style={{position:'absolute',top:15,right:15,backgroundColor:'#1DB954',height:10,width:10,borderRadius:10}} ></div>:null}
                                    {i!=0?<div style={{height:2,width:'80%',borderRadius:4,backgroundColor:'#666',position:"absolute",top:-1,left:'50%',transform:'translateX(-50%)'}} ></div>:null}
                                    <img src={friend.user.avatar} style={{height:45,width:45,borderRadius:25}}/>
                                    <div style={{width:'calc(100% - 55px)',display:'flex',flexDirection:'column',alignItems:'start',justifyContent:'center',boxSizing:'border-box'}} >
                                        <p style={{width:'100%',fontWeight:'500',fontSize:18,margin:'0 5px',color:'white',cursor:'pointer',padding:'4px 10px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}} ><span style={{color:'#1DB954',fontSize:20}} ># </span>{friend.user.username}</p>
                                        {/* <p style={{width:'calc(100% - 65px)',fontWeight:'lighter',margin:'0 5px',fontSize:14,color:'white',cursor:'pointer',padding:'0px 10px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}} ><span style={{color:friend.number?"#1DB954":"white"}}>{friend.last_message?.content}</span></p> */}
                                        {!friend.number && !friend.last_message && (typer && typer.chatId !== friend.id || !typer)?<p style={{color:friend.status?'#1DB954':'#999',fontWeight:500,fontSize:13,margin:'0 0 0 15px',cursor:'default',height:18}} >{friend.status?'Online':'Offline'}</p>:null}
                                        {!typer && friend.last_message?<p style={{color:'#999',fontWeight:500,fontSize:13,margin:'0 0 0 15px',cursor:'default',width:'100%',textOverflow:'ellipsis',whiteSpace:'nowrap',overflow:'hidden',height:18}} >{friend.last_message.userId === user?.id?'you':'text'} : <span style={{color:'#1DB954',fontSize:15}} >{friend.last_message.content}</span></p>:null}
                                        {typer && typer.chatId === friend.id?<p className='dot-holder' style={{color:'#1DB954',fontWeight:'500',textAlign:'center',fontSize:15,margin:'0 0 0 15px',display:'flex',height:18,flexDirection:'row',alignItems:"center",justifyContent:'center'}} >Typing<p className='dot one' >.</p><p className='dot two' >.</p><p className='dot three' >.</p></p>:null}
                                        
                                        
                                        {friend.number?<div style={{position:'absolute',right:10,bottom:10,backgroundColor:'#1DB954',alignSelf:'end',padding:'2px 8px 2px 7px',borderRadius:20,display:'flex',alignItems:"center",justifyContent:'center',fontSize:13}} >{getParsedNumber(friend.number)}</div>:null}
                                    </div>
                                </div>
                            )
                    })}
                    {friends.filter((friend)=>friend.user.username.trim().includes(searchFriends)).length === 0?
                    <div className='search-friends' style={{width:'100%',marginTop:20,display:'flex',flexDirection:"column",alignItems:"center",justifyContent:'center'}} >
                        <img src='/assets/imgs/ghost1.svg' style={{width:'35%',opacity:1}} />
                        <p style={{color:'#999',width:'100%',textAlign:'center',fontSize:17,margin:'-10px 0 0 -15px'}} >{searchFriends.trim() === ""?"You have no chats yet.":'No chats found.'}</p>
                    </div>:null}

                    
                </div>
            </div>
            
            <div className='settings' style={{position:'absolute',zIndex:4,width:200,backgroundColor:'#252525',left:350,transform:openSettings?'translateX(0%)':'translateX(-100%)',top:(!chatRemoved)?60:0,transition:'0.2s ease-in-out',borderRadius:'0 0 2px 0'}} >
                <div style={{width:'100%',cursor:'pointer',display:'flex',flexDirection:"row",alignItems:'center',justifyContent:"center",padding:'10px 0'}} >
                    <p style={{color:'#1DB954',margin:'0 0 0 6px'}} >Privacy Policy</p>
                </div>
                <div style={{width:'100%',cursor:'pointer',display:'flex',flexDirection:"row",alignItems:'center',justifyContent:"center",padding:'10px 0'}} >
                    <p style={{color:'#1DB954',margin:'0 0 0 6px'}} >Terms & Services</p>
                </div>
                <div style={{width:'100%',cursor:'pointer',display:'flex',flexDirection:"row",alignItems:'center',justifyContent:"center",padding:'10px 0'}} >
                    <img src="/assets/imgs/themes.svg" style={{height:25,opacity:0.5}} />
                    <p style={{color:'white',margin:'0 0 0 6px'}} >Themes</p>
                </div>
                <div style={{width:'100%',cursor:'pointer',display:'flex',flexDirection:"row",alignItems:'center',justifyContent:"center",padding:'10px 0'}} >
                    <img src="/assets/imgs/settings1.svg" style={{height:25,opacity:0.5}} />
                    <p style={{color:'white',margin:'0 0 0 6px'}} >Settings</p>
                </div>
                <div onClick={()=>logOut()} style={{width:'100%',cursor:'pointer',display:'flex',flexDirection:"row",alignItems:'center',justifyContent:"center",padding:'10px 0'}} >
                    <img src="/assets/imgs/logout.svg" style={{height:25,opacity:0.5}} />
                    <p style={{color:'white',margin:'0 0 0 6px'}} >Log out</p>
                </div>
            </div>

            <div style={{position:'absolute',zIndex:10,width:'50%',maxWidth:350,height:'100%',backgroundColor:'#252525',left:0,transform:!openSearch?'translateX(0%)':'translateX(100%)',top:0,transition:'0.2s ease-in-out',borderRadius:'0 0 2px 0',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}} >
                <div className='cm-47' style={{width:'calc(100% - 30px)',position:'absolute',top:0,height:35,border:'2px solid #999',borderRadius:10,display:"flex",boxSizing:'border-box',alignItems:"center",justifyContent:"center",overflow:'hidden',padding:4,marginTop:15}} >
                    <img src='/assets/imgs/search.svg' style={{height:17,padding:3,opacity:0.7}} />
                    <input onChange={(event)=>searchUserFunc(event.target.value)} value={searchUsers}  placeholder='Search' style={{height:'calc(100% - 2px)',fontFamily:'Quicksand',fontWeight:'bolder',width:'calc(100% - 36px)',color:'white',outline:'none',marginLeft:10,padding:0,border:0,backgroundColor:"transparent",fontSize:15}} />
                </div>
                <div style={{position:'absolute',top:65,width:'100%'}} >
                    {
                        foundUsers.map((usr,i)=>{
                            return(
                                <div onClick={()=>addChat(usr.id)} className='nf-73' style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'start',transition:'0.3s',padding:'10px 0px',cursor:'pointer'}} >
                                    <img src="https://placehold.co/400x400" style={{height:35,width:35,borderRadius:25,marginLeft:15}}/>
                                    <p style={{width:'100%',fontWeight:'500',fontSize:16,margin:'0 5px',color:'white',padding:'4px 10px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}} ><span style={{color:'#1DB954',fontSize:18}} ># </span>{usr.username}</p>
                                </div>
                            )
                        })
                    }
                </div>
                
                {foundUsers.length === 0 && searchUsers.trim() !== "" ?<img className='fadein' src='/assets/imgs/ghost404.svg' style={{width:'40%'}} />:null}
                {foundUsers.length === 0 && searchUsers.trim() !== "" ?<p className='fadein' style={{color:'white',width:'100%',textAlign:'center',fontSize:17,margin:'0px 0 0 -15px'}} >Can't find them.</p>:null}

                {foundUsers.length === 0 && searchUsers.trim() === "" ?<img src='/assets/imgs/ghostLooking.svg' style={{width:'40%'}} />:null}
                {foundUsers.length === 0 && searchUsers.trim() === "" ?<p style={{color:'white',width:'100%',textAlign:'center',fontSize:17,margin:'0px 0 0 -15px'}} >Search for new friends</p>:null}
            </div>



            {/* INSIDE */}
            {/* INSIDE */}
            {/* INSIDE */}


            <Chat ref={chatRef} selectedChatRef={selectedChatRef} socket={sockett} selectedChat={selectedChat} setSelectedChat={setSelectedChat} initialMessages={messages} userId={user?.id} chatRemoved={chatRemoved} setChatRemoved={setChatRemoved} setFriends={setFriends} setIsTyping={setIsTyping} isTyping={isTyping} />

        </div>
    </div>
  );
};

export default HomeLogged;