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
    media: string | null,
    reply: ReplyType | null,
    sentAt: string,
    userId: string,
}

export type ChatType = {
    id: string,
    last_message: Message | null,
    number: number,
    status:string,
    user: {
        id: string,
        username: string,
        avatar: string,
        status:string,
    },
    
}

export type ReceivedMessage = {
    userId : string | undefined,
    chatId : string | undefined,
    media : string | null,
    id : string,
    content : string,
    sentAt : string,
    reply : ReplyType | null
};


type DumbChatType = {
    id: string,
    last_message: Message | null,
    number: number,
    user1: {
        id: string,
        username: string,
        avatar: string,
        status:string,
    },
    user2: {
        id: string,
        username: string,
        avatar: string,
        status:string,
    },
    
}

export type Typer = {
    typerId: string,
    chatId: string,
    isTyping: boolean
}

const width = window.innerWidth
const height = window.innerHeight
const HomeLogged: React.FC<HomeProps> = ({token}) => {
    
    type MainUserType = {
        id : string,
        email: string;
        status: string;
        username: string;
        verified: boolean;
        avatar: string;
        bio:string;
    };

    type UserSearch = {
        id : string,
        username : string
    }

    type ReplyType = {
            id : string,
            text : string
    };

    

    
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
    const [openAccount,setOpenAccount] = React.useState(false)
    const [searchUsers,setSearchUsers] = React.useState("")
    const [foundUsers,setFoundUsers] = React.useState<UserSearch[]>([])
    const [notifs,setNotifs] = React.useState<Notif[]>([])
    const [sockett,setSockett] = React.useState<Socket | null>(null)
    const chatRef = React.useRef<sendRefComp | null>(null)
    const [isTyping, setIsTyping] = React.useState(false);
    const [typer, setTyper] = React.useState<Typer | null>(null);
    const [selectedImage,setSelectedImage] = React.useState<string | null>(null)
    const [userStatus,setUserStatus] = React.useState("")
    const [loadingUsers,setLoadingUsers] = React.useState(false)
    const [loadingFriends,setLoadingFriends] = React.useState(false)
    const [chatSettings, setChatSettings] = React.useState(false);
    
    const isMobile = width < 769;
    
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

        socket.on('unauthorized', (data) => {
            console.log('Un back:', data);
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
            axios.get(`http://${host}:${port}/api/users/avatar?imageId=${encodeURIComponent(chat.user.avatar)}`,{headers:{'Authorization':`Bearer ${token}`}}).then((res)=>{
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
        setLoadingFriends(true)
        axios.get(`http://${host}:${port}/api/users`,{headers:{'Authorization':`Bearer ${token}`}}).then((res)=>{
            if (res.status === 200) {
                
                axios.get(`http://${host}:${port}/api/users/avatar?imageId=${encodeURIComponent(res.data.user.avatar)}`,{headers:{'Authorization':`Bearer ${token}`}}).then((res1)=>{
                    setUser({...res.data.user,avatar:res1.data.url})
                }).catch((err)=>{
                    console.log(err)
                })
                axios.get(`http://${host}:${port}/api/chats`,{headers:{'Authorization':`Bearer ${token}`}}).then((res1)=>{
                    setLoadingFriends(false)
                    if (res1.status === 200) {
                        // console.log(res1.data.chats.map((chat : DumbChatType)=> ({id:chat.id,last_message:chat.last_message,status:chat.status,number:0,user:chat.user1.id === res.data.user.id?chat.user2:chat.user1})))
                        const filteredFriends = res1.data.chats.map((chat : DumbChatType)=> ({id:chat.id,last_message:chat.last_message,number:0,status:chat.user1.id !== res.data.user.id?chat.user2.status:chat.user1.status,user:chat.user1.id === res.data.user.id?chat.user2:chat.user1}))
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
        setLoadingUsers(true)
        if (user.trim() === "") {
            setLoadingUsers(false)
            setFoundUsers([])
            return
        }
        axios.get(`http://${host}:${port}/api/search/users?username=${user.trim()}`,{headers:{'Authorization':`Bearer ${token}`}}).then((res)=>{
            setLoadingUsers(false)
            setFoundUsers(res.data.users)
        }).catch(()=>{
            setLoadingUsers(false)
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
                const parsedFr = {id:fr.id,last_message:fr.last_message,status:fr.status,number:0,user:fr.user1.id === user?.id?fr.user2:fr.user1}
                setFriends(prev=> [parsedFr,...prev])
                friendsRef.current = [parsedFr,...friendsRef.current]
                getFriendsImages([parsedFr,...friendsRef.current])

            }
        }).catch((res)=>{
            customNotif(`An error has accured ! ${res.status}`,"rgb(203, 27, 27)")
        })
    }

    const getChats = () =>{
        axios.get(`http://${host}:${port}/api/chats`,{headers:{'Authorization':`Bearer ${token}`}}).then((res1)=>{
            if (res1.status === 200) {
                // console.log(res1.data.chats.map((chat : DumbChatType)=> ({id:chat.id,last_message:chat.last_message,status:chat.status,number:0,user:chat.user1.id === user?.id?chat.user2:chat.user1})))
                const filteredFriends = res1.data.chats.map((chat : DumbChatType)=> ({id:chat.id,last_message:chat.last_message,number:0,user:chat.user1.id === user?.id?chat.user2:chat.user1}))
                setFriends(filteredFriends)
                friendsRef.current = filteredFriends
                getFriendsImages(filteredFriends)
            }
        }).catch((res)=>{
            customNotif(`An error has accured ! ${res.status}`,"rgb(203, 27, 27)")
        })
    }

    const getImage = async(media : string) =>{
        const res = await axios.get(`http://${host}:${port}/api/media/images?imageId=${encodeURIComponent(media)}&chatId=${selectedChat?.id}`,{headers:{'Authorization':`Bearer ${token}`}})
        return res.data.url
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
                axios.get(`http://${host}:${port}/api/users/status?userId=${friend.user.id}`,{headers:{'Authorization':`Bearer ${token}`}}).then((res1)=>{
                    console.log(res1)
                    if (res1.data.status) {
                        setUserStatus(res1.data.status)
                    }
                }).catch(()=>{

                })
            }
        }).catch((err)=>{
            console.error(err)
        })
        setFriends(prev=> prev.map((f)=>f.id === friend.id?{ ...f, last_message: f.last_message?{ ...f.last_message, new: false }:null }:f))
        setSelectedChat(friend)
        selectedChatRef.current = friend
        setChatRemoved(false)
        setOpenAccount(false)
        setOpenSearch(false)
    }

    const block = () =>{
        console.log(selectedChat?.id)
        axios.post(`http://${host}:${port}/api/chats/block`,{chatId:selectedChat?.id},{headers:{'Authorization':`Bearer ${token}`}}).then((res)=>{
            if (res.status === 200) {
                setFriends(prev => prev.map((f)=> f.id === selectedChat?.id?({...f,user:{...f.user,status:'2'}}):f) )
                setSelectedChat(prev => prev?({...prev,user:{...prev.user,status:'2'}}):null)
            }
        }) 
    }

    const mute = () =>{
        console.log(selectedChat?.id)
        if (!selectedChat) {
            return
        }
        axios.post(`http://${host}:${port}/api/chats/mute`,{chatId:selectedChat?.id},{headers:{'Authorization':`Bearer ${token}`}}).then((res)=>{
            if (res.status === 200) {
                setFriends(prev => prev.map((f)=> f.id === selectedChat?.id?({...f,user:{...f.user,status:'1'}}):f) )
                setSelectedChat(prev => prev?({...prev,user:{...prev.user,status:'1'}}):null)

            }
        }) 
    }

    const normal = () =>{
        console.log(selectedChat?.id)
        axios.post(`http://${host}:${port}/api/chats/normal`,{chatId:selectedChat?.id},{headers:{'Authorization':`Bearer ${token}`}}).then((res)=>{
            if (res.status === 200) {
                setFriends(prev => prev.map((f)=> f.id === selectedChat?.id?({...f,user:{...f.user,status:'0'}}):f) )
                setSelectedChat(prev => prev?({...prev,user:{...prev.user,status:'0'}}):null)

            }
        }) 
    }
    

    const openOneBanner = (type : number) => {
        if (type === -1) {
            setOpenSearch(false);
            setOpenSettings(false);
            setOpenAccount(false);
            setChatSettings(false)
        }else if (type === 0) {
            setOpenSearch(!openSearch);
            setOpenSettings(false);
            setOpenAccount(false);
        }else if(type === 1){
            setOpenAccount(false);
            setOpenSearch(false);
            setOpenSettings(!openSettings);
        }
        else if(type === 2){
            setOpenAccount(!openAccount);
            setOpenSearch(false);
            setOpenSettings(false);
        }
    }

    // const viewAccount = () =>{
    //     setOpenAccount(true)
    //     setOpenSettings(false)
    // }

    const closeAll = () =>{
        setOpenAccount(false)
        setOpenSearch(false)
        setOpenSettings(false)
    }


    return (
    <div  style={{backgroundColor: "#121212",color: "#E0E0E0",height: '100vh',width:'100vw',overflow:'hidden',display: "flex",flexDirection: "column",alignItems: "center"}}>

        {
            notifs.map((err,i)=>{
                return (
                    <div id={i.toString()} style={{top:i*49 + 20,transition:'0.3s',backgroundColor:err.color}} className='error-pod' >
                        <p style={{color:err.color}} >{err.text}</p>
                    </div>
                )
            })
        }
        
        <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'start',overflow:'hidden'}}>
            <div  style={{height:'100%',width:isMobile?'100%':'50%',position:isMobile?'absolute':'relative',zIndex:isMobile?3:11,maxWidth:!isMobile?350:'100%',display:'flex',transform:selectedChat && isMobile?'translateX(-100%)':'translateX(0%)',transition:'0.3s',flexDirection:'column',alignItems:'center',justifyContent:"start",backgroundColor:'#393939'}} >
                {(openAccount || openSearch || openSettings || chatSettings) && <div onClick={()=>openOneBanner(-1)} style={{position:'absolute',top:0,left:0,height:'100%',width:'100%',zIndex:-1}} ></div>}


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
                {selectedImage?<div onClick={()=>setSelectedImage(null)} className='front-banner' style={{width:'100%',height:'calc(100% - 107px)',position:'absolute',top:137,left:0,backdropFilter:'blur(5px)',background:'rgba(0, 0, 0, 0.3)',zIndex:4,display:'flex',alignItems:'center',justifyContent:'center'}} >
                        <img src={selectedImage} style={{width:'50%',borderRadius:'100%'}} />
                </div>:null}
                <div style={{height:'calc(100% - 107px)',width:'100%',overflowY:'scroll',position:'relative'}} >
                    {(openAccount || openSearch || openSettings || chatSettings) && <div onClick={()=>openOneBanner(-1)} style={{position:'absolute',top:0,left:0,height:'100%',width:'100%',zIndex:0}} ></div>}


                    
                    {friends.filter((friend)=>friend.user.username.trim().toLocaleLowerCase().includes(searchFriends.toLocaleLowerCase()) && (filterType === 0 || (filterType === 2 && friend.last_message && friend.last_message.new) || (filterType === 1 && friend.last_message && !friend.last_message.new))).map((friend,i)=>{
                            return(
                                <div onClick={()=>{selectChat(friend)}} className='nf-73' style={{height:70,transition:'0.3s',opacity:friend.status === '2'?0.5:1,cursor:'pointer',width:'100%',display:'flex',alignItems:'center',justifyContent:'start',padding:'0 10px',position:'relative',boxSizing:'border-box'}} >
                                    {friend.last_message && friend.last_message.new?<div style={{position:'absolute',top:15,right:15,backgroundColor:'#1DB954',height:10,width:10,borderRadius:10}} ></div>:null}
                                    {i!=0?<div style={{height:2,width:'80%',borderRadius:4,backgroundColor:'#666',position:"absolute",top:-1,left:'50%',transform:'translateX(-50%)'}} ></div>:null}
                                    {friend.status !== '2'?<img onClick={()=>setSelectedImage(friend.user.avatar)} src={friend.user.avatar} style={{height:45,width:45,borderRadius:25}}/>:<img  src='/assets/imgs/blocked.svg' style={{height:45,width:45,borderRadius:25,filter:'invert(50%)'}}/>}
                                    <div style={{width:'calc(100% - 55px)',display:'flex',flexDirection:'column',alignItems:'start',justifyContent:'center',boxSizing:'border-box'}} >
                                        <p style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'start',fontWeight:'500',fontSize:18,margin:'0 5px',color:'white',cursor:'pointer',padding:'4px 10px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}} >{friend.user.status === '0'?<span style={{color:'#1DB954',fontSize:20,marginRight:5}} >#</span>:friend.user.status === '2'?<img style={{height:18,marginRight:5,filter:'brightness(0) saturate(100%) invert(31%) sepia(68%) saturate(5275%) hue-rotate(347deg) brightness(100%) contrast(101%)'}} src='/assets/imgs/blocked.svg' />:<img style={{height:20,marginRight:5}} src='/assets/imgs/muted.svg' />}{friend.user.username}</p>
                                        {/* <p style={{width:'calc(100% - 65px)',fontWeight:'lighter',margin:'0 5px',fontSize:14,color:'white',cursor:'pointer',padding:'0px 10px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}} ><span style={{color:friend.number?"#1DB954":"white"}}>{friend.last_message?.content}</span></p> */}
                                        {!friend.number && !friend.last_message && (typer && typer.chatId !== friend.id || !typer) && friend.user.status !== '1'?<p style={{color:'#999',fontWeight:500,fontSize:13,margin:'0 0 0 15px',cursor:'default',height:18}} >{'Say hi !'}</p>:null}
                                        {(typer && typer.chatId !== friend.id || !typer) && friend.last_message && friend.user.status !== '1'?<p style={{color:'#999',fontWeight:500,fontSize:13,margin:'0 0 0 15px',cursor:'default',width:'100%',textOverflow:'ellipsis',whiteSpace:'nowrap',overflow:'hidden',height:18}} >{friend.last_message.userId === user?.id?'you':'text'} : <span style={{color:'#1DB954',fontSize:15}} >{friend.last_message.content}</span></p>:null}
                                        {typer && typer.chatId === friend.id && friend.user.status !== '1'?<p className='dot-holder' style={{color:'#1DB954',fontWeight:'500',textAlign:'center',fontSize:15,margin:'0 0 0 15px',display:'flex',height:18,flexDirection:'row',alignItems:"center",justifyContent:'center'}} >Typing<p className='dot one' >.</p><p className='dot two' >.</p><p className='dot three' >.</p></p>:null}
                                        {friend.user.status === '1'?<p style={{color:'#999',fontWeight:500,fontSize:13,margin:'0 0 0 15px',cursor:'default',height:18}} >{'Muted'}</p>:null}
                                        
                                        
                                        {friend.number?<div style={{position:'absolute',right:10,bottom:10,backgroundColor:'#1DB954',alignSelf:'end',padding:'2px 8px 2px 7px',borderRadius:20,display:'flex',alignItems:"center",justifyContent:'center',fontSize:13}} >{getParsedNumber(friend.number)}</div>:null}
                                    </div>
                                </div>
                            )
                    })}
                    {friends.filter((friend)=>friend.user.username.trim().includes(searchFriends)).length === 0 && !loadingFriends?
                    <div className='search-friends' style={{width:'100%',marginTop:20,display:'flex',flexDirection:"column",alignItems:"center",justifyContent:'center'}} >
                        <img src='/assets/imgs/ghost1.svg' style={{width:'35%',opacity:1}} />
                        <p style={{color:'#999',width:'100%',textAlign:'center',fontSize:17,margin:'-10px 0 0 -15px'}} >{searchFriends.trim() === ""?"You have no chats yet.":'No chats found.'}</p>
                    </div>:null}
                    {loadingFriends?<img className='loading' src='/assets/imgs/loading.svg' style={{height:30,filter:'invert(30%)',alignSelf:'center',marginLeft:'calc(50% - 15px)',marginTop:50}} />:null}


                    
                </div>
            </div>
            
            <div className='settings' style={{position:'absolute',zIndex:10,width:isMobile?'100%':'50%',maxWidth:!isMobile?200:'100%',backgroundColor:'#252525',left:0,transform:!openSettings?!isMobile?'translateX(0%)':'translateX(-100%)':isMobile?'translateX(0%)':`translateX(${(width/2)>350?'350px':`${(width/2)}px`})`,top:(!chatRemoved)?60:isMobile?60:0,transition:'0.2s ease-in-out',borderRadius:'0 0 2px 0'}} >
                <div style={{width:'100%',cursor:'pointer',display:'flex',flexDirection:"row",alignItems:'center',justifyContent:"center",padding:'10px 0'}} >
                    <p style={{color:'#1DB954',margin:'0 0 0 6px'}} >Privacy Policy</p>
                </div>
                <div style={{width:'100%',cursor:'pointer',display:'flex',flexDirection:"row",alignItems:'center',justifyContent:"center",padding:'10px 0'}} >
                    <p style={{color:'#1DB954',margin:'0 0 0 6px'}} >Terms & Services</p>
                </div>
                <div onClick={()=>openOneBanner(2)} style={{width:'100%',cursor:'pointer',display:'flex',flexDirection:"row",alignItems:'center',justifyContent:"center",padding:'10px 0'}} >
                    <img src="/assets/imgs/profile.svg" style={{height:25,opacity:0.5}} />
                    <p style={{color:'white',margin:'0 0 0 6px'}} >Account</p>
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

            <div style={{position:'absolute',zIndex:10,width:isMobile?'100%':'50%',maxWidth:!isMobile?350:'100%',height:'100%',backgroundColor:'#252525',left:0,transform:!openSearch?!isMobile?'translateX(0%)':'translateX(-100%)':isMobile?'translateX(0%)':'translateX(100%)',top:0,transition:'0.2s ease-in-out',borderRadius:'0 0 2px 0',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}} >
                <img onClick={()=>openOneBanner(0)} src="/assets/imgs/arrow.svg" style={{height:36,cursor:'pointer',position:'absolute',left:2,top:14}} />
                <div className='cm-47' style={{width:'calc(100% - 50px)',position:'absolute',top:0,right:10,height:35,border:'2px solid #999',borderRadius:10,display:"flex",boxSizing:'border-box',alignItems:"center",justifyContent:"center",overflow:'hidden',padding:4,marginTop:15}} >
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

                {loadingUsers?<img className='loading' src='/assets/imgs/loading.svg' style={{height:30,position:'absolute'}} />:null}
                
                {foundUsers.length === 0 && searchUsers.trim() !== "" && !loadingUsers ?<img className='fadein' src='/assets/imgs/ghost404.svg' style={{width:'40%'}} />:null}
                {foundUsers.length === 0 && searchUsers.trim() !== "" && !loadingUsers ?<p className='fadein' style={{color:'white',width:'100%',textAlign:'center',fontSize:17,margin:'0px 0 0 -15px'}} >Can't find them.</p>:null}

                {foundUsers.length === 0 && searchUsers.trim() === "" ?<img src='/assets/imgs/ghostLooking.svg' style={{width:'40%'}} />:null}
                {foundUsers.length === 0 && searchUsers.trim() === "" && !loadingUsers ?<p style={{color:'white',width:'100%',textAlign:'center',fontSize:17,margin:'0px 0 0 -15px'}} >Search for new friends</p>:null}
            </div>

            {/* CHAT SETTINGS */}
            {/* CHAT SETTINGS */}
            {/* CHAT SETTINGS */}

            {<div className='settings' style={{position:'absolute',zIndex:10,width:isMobile?'100%':'50%',maxWidth:!isMobile?200:'100%',backgroundColor:'#252525',right:0,transform:chatSettings?!isMobile?'translateX(0%)':'translateX(0%)':isMobile?'translateX(100%)':`translateX(${(width/2)>350?'350px':`${(width/2)}px`})`,top:(!chatRemoved)?60:isMobile?60:0,transition:'0.2s ease-in-out',borderRadius:'0 0 2px 0'}} >
                <div style={{width:'100%',display:'flex',flexDirection:"row",alignItems:'center',justifyContent:"center",padding:'10px 0',borderBottom:'1px solid #333',cursor:'default'}} >
                    {selectedChat?.status === '0' && <p style={{color:selectedChat?.user.status === '0'?'#1DB954':selectedChat?.user.status === '2'?'#f22':'white',margin:'0 0 0 6px'}} >{selectedChat?.user.status === '0'?'Friend':selectedChat?.user.status === '2'?'Blocked':'Muted'}</p>}
                    {selectedChat?.status === '2' && <p style={{color:'white',margin:'0 0 0 6px'}} >You've been Blocked</p>}
                </div>
                {selectedChat?.user.status !== '1' ? 
                <div onClick={()=>mute()} style={{width:'100%',cursor:'pointer',display:'flex',flexDirection:"row",alignItems:'center',justifyContent:"center",padding:'10px 0'}} >
                    <img src="/assets/imgs/mute.svg" style={{height:25,opacity:0.5}} />
                    <p style={{color:'white',margin:'0 0 0 6px'}} >Mute</p>
                </div>:
                <div onClick={()=>normal()} style={{width:'100%',cursor:'pointer',display:'flex',flexDirection:"row",alignItems:'center',justifyContent:"center",padding:'10px 0'}} >
                    <img src="/assets/imgs/mute.svg" style={{height:25,opacity:0.5}} />
                    <p style={{color:'#1DB954',margin:'0 0 0 6px'}} >UnMute</p>
                </div>}


                {selectedChat?.user.status !== '2' ? 
                <div onClick={()=>block()} style={{width:'100%',cursor:'pointer',display:'flex',flexDirection:"row",alignItems:'center',justifyContent:"center",padding:'10px 0'}} >
                    <img src="/assets/imgs/block.svg" style={{height:25,opacity:0.5}} />
                    <p style={{color:'#f22',margin:'0 0 0 6px'}} >Block</p>
                </div>:
                <div onClick={()=>normal()} style={{width:'100%',cursor:'pointer',display:'flex',flexDirection:"row",alignItems:'center',justifyContent:"center",padding:'10px 0'}} >
                    <img src="/assets/imgs/block.svg" style={{height:25,opacity:0.5}} />
                    <p style={{color:'#1DB954',margin:'0 0 0 6px'}} >UnBlock</p>
                </div>}
            </div>}

            {/* CHAT SETTINGS */}
            {/* CHAT SETTINGS */}
            {/* CHAT SETTINGS */}

            <div style={{position:'absolute',zIndex:10,width:isMobile?'100%':'50%',maxWidth:!isMobile?350:'100%',height:'100%',padding:30,boxSizing:'border-box',backgroundColor:'#252525',left:0,overflowY:'scroll',transform:!openAccount?!isMobile?'translateX(0%)':'translateX(-100%)':isMobile?'translateX(0%)':'translateX(100%)',top:0,transition:'0.2s ease-in-out',borderRadius:'0 0 2px 0',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'start'}} >
                <img onClick={()=>openOneBanner(2)} src="/assets/imgs/arrow.svg" style={{height:36,cursor:'pointer',position:'absolute',left:18,top:10}} />
                <img src={user?.avatar} style={{width:'40%',borderRadius:'100%'}} />
                <p style={{color:'#999',alignSelf:'start',fontSize:15,marginTop:50,}} >Email </p>
                <input
                    value={user?.email}
                    placeholder="Email"
                    disabled
                    style={{
                        width: "100%",
                        padding: "11px 18px",
                        marginBottom: 20,
                        borderRadius: 8,
                        border: "1px solid #333",
                        backgroundColor: "#2A2A2A",
                        color: "#E0E0E0",
                        boxSizing:'border-box',
                        fontWeight:500,fontSize:14
                    }}
                />
                <p style={{color:'#999',alignSelf:'start',fontSize:15,marginTop:0,}} >Username </p>
                <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'start',padding: "11px 18px",boxSizing:'border-box',border: "1px solid #333",backgroundColor: "#2A2A2A",borderRadius: 8,width:'100%'}} >
                    <p style={{color:'#1DB954',fontSize:18,margin:0}} ># </p>
                    <input disabled value={user?.username} style={{color: "#E0E0E0",border:0,backgroundColor: "#2A2A2A",outline:'none',marginLeft:10,fontWeight:500,fontSize:15,width:'calc(100% - 30px)'}} ></input>
                </div>
                <p style={{color:'#999',alignSelf:'start',fontSize:15,marginTop:20,}} >Bio </p>

                <textarea
                    value={user?.bio}
                    placeholder="Email"
                    disabled
                    style={{
                        width: "100%",
                        height:120,
                        minHeight:120,
                        padding: "11px 18px",
                        marginBottom: 20,
                        borderRadius: 8,
                        border: "1px solid #333",
                        backgroundColor: "#2A2A2A",
                        color: "#E0E0E0",
                        boxSizing:'border-box',
                        fontWeight:500,fontSize:14,
                        resize:'none'
                    }}
                />
            </div>
            

            {/* CLOSER */}
            {/* CLOSER */}
            {/* CLOSER */}

            {(openAccount || openSearch || openSettings || chatSettings) && <div onClick={()=>openOneBanner(-1)} style={{position:'absolute',top:0,left:0,height:'100%',width:'100%',zIndex:9}} ></div>}

            

            {/* INSIDE */}
            {/* INSIDE */}
            {/* INSIDE */}

            
            <Chat ref={chatRef} token={token} selectedChatRef={selectedChatRef} typer={typer} socket={sockett} userStatus={userStatus} selectedChat={selectedChat} setSelectedChat={setSelectedChat} initialMessages={messages} userId={user?.id} chatRemoved={chatRemoved} setChatRemoved={setChatRemoved} setFriends={setFriends} setIsTyping={setIsTyping} isTyping={isTyping} setChatSettings={setChatSettings} getImage={getImage} />

        </div>
    </div>
  );
};

export default HomeLogged;