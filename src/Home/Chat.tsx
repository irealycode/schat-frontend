import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { ChatType, ReceivedMessage, ReplyType, TallMessage, Typer, UserType } from './HomeLogged';
import { Socket } from 'socket.io-client';
import axios from 'axios';
import { host, port } from '../Imps';




type Messages = {
    userId : string | undefined,
    message : {
        id : string,
        text : string,
        time : Date,
        reply : ReplyType | null
        media : string | null,
        link : string | null,
        seen : boolean,
    }
};





interface ChatComponentProps {
    selectedChat: null | ChatType;
    userId: string | undefined;
    chatRemoved: boolean;
    setChatRemoved: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedChat: React.Dispatch<React.SetStateAction<ChatType | null>>;
    socket: Socket | null;
    initialMessages: TallMessage[] | null;
    setFriends: React.Dispatch<React.SetStateAction<ChatType[]>>;
    setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
    isTyping: boolean;
    selectedChatRef:React.RefObject<ChatType | null>;
    typer: Typer | null;
    userStatus: string;
    setChatSettings: React.Dispatch<React.SetStateAction<boolean>>;
    token: string;
    getImage: (media: string) => Promise<any>;
}

export interface sendRefComp{
    sendFriendsMessage : (msg : ReceivedMessage) => void;
    addMessageId : (id : string) => void;
    readMessage : () => void;
}


const width = window.innerWidth

const Chat = forwardRef<sendRefComp, ChatComponentProps>(function ChatFunc({socket,selectedChatRef,selectedChat,userId,chatRemoved,initialMessages,isTyping,typer,userStatus,setChatRemoved,setSelectedChat,setFriends,setIsTyping,setChatSettings,token,getImage} : ChatComponentProps,ref) {

    useImperativeHandle(ref ,() =>({
        sendFriendsMessage(msg){
            rcvMessage(msg)
        },
        addMessageId(id){
            setMessageId(id)
        },
        readMessage(){
            setMessages(prev => prev.map((m,i)=>i === (prev.length -1)?({...m,message:{...m.message,seen:true}}):m))
        },
    }))
    
    let typingTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
    const chatRef = React.useRef<HTMLDivElement | null>(null);
    const [reply,setReply] = React.useState<null | ReplyType>(null);
    const [messages,setMessages] = React.useState<Messages[]>([]);
    const [messageInput,setMessageInput] = React.useState("")
    const [isInputFocused, setIsInputFocused] = React.useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const isMobile = width < 769;
    const [imageChosen,setImageChosen] = React.useState<File | undefined>(undefined)
    const readLastMessage = useRef(false);
    
    
    // React.useEffect(()=>{
    //     window.addEventListener("keydown", handleKeyDown);

    //     return () => {
    //         window.removeEventListener("keydown", handleKeyDown);
    //       };
    // },[isTyping,isInputFocused,typingTimeout])
    const placeImages = (messages : TallMessage[]) =>{
        messages.forEach(async msg => {
            if (msg.media || msg.reply?.media) {
                if (msg.media) {
                    const t = await getImage(msg.media)
                    setMessages(prev => prev.map((m)=> msg.id === m.message.id?({...m,message:{...m.message,link:t}}):m))
                }
                if(msg.reply?.media){
                    const t = await getImage(msg.reply.media)
                    setMessages(prev => prev.map((m)=> msg.id === m.message.id && m.message.reply?({...m,message:{...m.message,reply:{...m.message.reply,link:t}}}):m))
                }
            }
        });
    }

    React.useEffect(()=>{
        if (initialMessages) {
            setMessages(initialMessages.map((msg)=> ({userId:msg.userId,message:{id:msg.id,text:msg.content,time:new Date(msg.sentAt),reply:msg.reply,media:msg.media,link:null,seen : msg.seen}})).reverse())
            setReply(null)
            setMessageInput("")
            placeImages(initialMessages)
        }else{
            setMessages([])
        }
    },[initialMessages])

    React.useEffect(()=>{
        const div = chatRef.current;
        if (div) div.scrollTop = div.scrollHeight + 77;
    },[messages]);
    
    const handleKeyDown = () => {
        if (!isTyping) {
            setIsTyping(true);
            handleTypingStarted();
        }
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            setIsTyping(false);
            handleTypingStopped();
        }, 1500);
        
        
    };    

    const handleTypingStarted = () => {
        socket?.emit('typing',{
            "receiverId": selectedChat?.user.id,
            "chatId": selectedChat?.id,
            "isTyping": true
        })
        console.log("User started typing in the input!");
    };
    const handleTypingStopped = () => {
        if (selectedChat) {
            socket?.emit('typing',{
            "receiverId": selectedChat?.user.id,
            "chatId": selectedChat?.id,
            "isTyping": false
        })
        console.log("User stopped typing in the input!");
        }
        
    };
    
    const rcvMessage = async(msg : ReceivedMessage) =>{
        if(msg.media){
            const t = await getImage(msg.media)
            setMessages(msgs => [...msgs,{userId:selectedChat?.user.id,message:{id:msg.id,text:msg.content,time:(new Date(msg.sentAt)),reply:msg.reply,media:msg.media,link:t,seen:false}}])
            return
        }
        setMessages(msgs => [...msgs,{userId:selectedChat?.user.id,message:{id:msg.id,text:msg.content,time:(new Date(msg.sentAt)),reply:msg.reply,media:null,link:null,seen:false}}])
    }

    const setMessageId = (id : string) =>{
        setMessages(msgs => msgs.map((m,i)=>i === (msgs.length - 1)?{...m,message:{...m.message,id:id}}:m))
    }
    
    const sendMessage = () =>{
        if (messageInput.trim() !== "" && !imageChosen && selectedChat?.status !== '2') {
            console.log('ook')
            setMessages(msgs => [...msgs,{userId:userId,message:{id:'none',text:messageInput,time:(new Date()),reply:reply,media:null,link:null,seen:false}}])
            setMessageInput("")
            socket?.emit('message',{
                chatId : selectedChat?.id,
                receiverId: selectedChat?.user.id,
                content: messageInput,
                reply:reply,
            })
            setFriends(prev =>  prev.map((fs) => (fs.id === selectedChat?.id?{...fs,last_message:{chatId:selectedChat?.id,userId:userId??'error',content:messageInput,new:false}}:fs)))
            setReply(null)
            return
        }

        if (imageChosen && selectedChat?.status !== '2') {
            uploadImage().then(async(res)=>{
                if(res){
                    const t = await getImage(res)
                    console.log(t)
                    setMessages(msgs => [...msgs,{userId:userId,message:{id:'none',text:messageInput,time:(new Date()),reply:reply,media:res,link:t,seen:false}}])
                    setMessageInput("")
                    socket?.emit('message',{
                        chatId : selectedChat?.id,
                        receiverId: selectedChat?.user.id,
                        content: messageInput,
                        reply:reply,
                        media:res,
                    })
                    setImageChosen(undefined)
                    setFriends(prev =>  prev.map((fs) => (fs.id === selectedChat?.id?{...fs,last_message:{chatId:selectedChat?.id,userId:userId??'error',content:messageInput,new:false}}:fs)))
                }
            })
        }
    }

    const formatTime = (date: Date) => date.toTimeString().slice(0, 5);

    const removeChat = async() =>{
        setChatRemoved(true);
        setChatSettings(false)
        selectedChatRef.current = null;
        setTimeout(()=>{
            setSelectedChat(null);
        },300);
    }

    


    // function getTextDimentions(text : string, maxWidth : number, fontSize : number, lineHeight : number) {
    //     const tempElement = document.createElement('p');
    //     tempElement.style.fontFamily = 'Rubik';
    //     tempElement.style.position = 'absolute';
    //     tempElement.style.visibility = 'hidden';
    //     tempElement.style.whiteSpace = 'pre-wrap'; 
    //     tempElement.style.width = `${maxWidth}px`; 
    //     tempElement.style.fontSize = `${fontSize}px`; 
    //     tempElement.style.wordBreak='break-word';
    //     tempElement.style.overflowWrap='break-word';
    //     tempElement.style.hyphens='auto';
    //     tempElement.innerText = text; 
      
    //     document.body.appendChild(tempElement);
      
    //     const height = tempElement.offsetHeight;
    //     const width = tempElement.offsetWidth;
      
    //     document.body.removeChild(tempElement);
      
    //     return {height:height,width:width};
    // }

    function isDateLessThan1SecondAgo(date : Date) {
        const now = new Date();
        const oneSecondAgo = new Date(now.getTime() - 100);
        return date > oneSecondAgo;
    }

    const pushReply = (id : string,text: string,media: string | undefined,link : string | null) =>{
        setReply({id:id,content:text,media:media,link});
        inputRef.current?.focus();
    }

    const timeAgo = (date : string) => {
        const now = new Date();
        const past = new Date(parseInt(date));
        const diff = Math.floor((now.getTime() - past.getTime()) / 1000);
      
        if (diff < 60) return `Last online ${diff} seconde${diff > 1 ? 's' : ''} ago`;
        const minutes = Math.floor(diff / 60);
        if (minutes < 60) return `Last online ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Last online ${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `Last online ${days} day${days > 1 ? 's' : ''} ago`;
        const months = Math.floor(days / 30);
        if (months < 12) return `Last online ${months} month`;
        const years = Math.floor(months / 12);
        return `Last online ${years} year${years > 1 ? 's' : ''} ago`;
    }

    const uploadImage = async() => {
        if(!imageChosen){
            return
        }

        const formData = new FormData();
        formData.append("media", imageChosen);

        try {
            const response = await fetch(`http://${host}:${port}/api/media/images?chatId=${selectedChat?.id}`, {
            method: "POST",
            body: formData,
            headers:{'Authorization':`Bearer ${token}`}
            });
        
            const result = await response.json();
            if (response.status === 200) {
                return result.id;                
            }
            return null
        }catch{
            return null
        }
    }

    

    // const capFirstChar = (s : string | undefined) => s?s.charAt(0).toUpperCase() + s.slice(1).toLowerCase():null;

    
    return(
        <div style={{height:'100%',overflow:'hidden',width:'calc(100% - 350px)',minWidth:isMobile?'100%':'50%',position:'relative',}} >
                {selectedChat?<div className={chatRemoved?'ls-48':'ls-49'} style={{height:60,width:'100%',backgroundColor:'#393939',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'start',position:'relative'}} >
                    <div style={{height:'100%',width:'100%',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'start'}} >
                        <img onClick={()=>removeChat()} src="/assets/imgs/arrow.svg" style={{height:36,cursor:'pointer'}} />
                        <div style={{width:'calc(100% - 5vh)',height:'100%',display:'flex',flexDirection:'column',alignItems:'start',justifyContent:'center'}} >
                            <p style={{width:'100%',color:'white',fontWeight:500,fontSize:26,margin:0,cursor:'default',whiteSpace:"nowrap",overflow:'hidden',textOverflow:'ellipsis'}} ><span style={{color:'#1DB954'}} ># </span>{selectedChat?.user.username}</p>
                            {(typer && typer.chatId !== selectedChat.id || !typer)?<p style={{color:userStatus==="online"?'#1DB954':'#999',fontWeight:500,fontSize:14,margin:0,cursor:'default'}} >{userStatus==="online"?'Online':timeAgo(userStatus)}</p>:null}
                            {typer && typer.chatId === selectedChat.id?<p className='dot-holder' style={{color:'#1DB954',fontWeight:'500',textAlign:'center',fontSize:14,margin:0,display:'flex',height:16.67,flexDirection:'row',alignItems:"center",justifyContent:'center'}} >Typing<p className='dot one' >.</p><p className='dot two' >.</p><p className='dot three' >.</p></p>:null}
                        </div>
                    </div>
                    <img onClick={()=>setChatSettings(prev=> !prev)} src="/assets/imgs/command.svg" style={{height:30,position:'absolute',right:10,cursor:'pointer'}} />
                </div>:null}

                

                
                {/* MESSAGE INPUT */}
                {/* MESSAGE INPUT */}
                {/* MESSAGE INPUT */}

                {selectedChat?<div className={chatRemoved?'message-input close':'message-input open'} style={{position:'absolute',zIndex:7,backgroundColor:"#252525",bottom:10,width:'calc(100% - 20px)',overflow:"hidden",boxSizing:'border-box',borderRadius:25,minHeight:50,left:10,display:'flex',flexDirection:"column",alignItems:'center',justifyContent:'end',boxShadow:'0px 20px 15px #121212'}} >
                    {reply && !reply.link?<div className='reply' style={{width:'calc(100% - 10px)',overflow:'hidden',height:40,margin:'5px 0 10px 0',borderRadius:20,backgroundColor:'#393939',display:'flex',alignItems:"center",justifyContent:'start',padding:'0 15px',boxSizing:'border-box',position:"relative"}} >
                        <p style={{color:'white',width:'calc(100% - 35px)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}} >{reply.content}</p>
                        <img src="/assets/imgs/close.svg" onClick={()=>setReply(null)} style={{position:'absolute',cursor:'pointer',height:20,right:10}} />
                    </div>:null}

                    {reply && reply.link?
                    <div className='image' style={{height:110,width:"100%",position:'relative',overflow:'hidden'}} >
                        <img onClick={()=>setReply(null)} style={{position:'absolute',top:15,right:15,height:25,cursor:'pointer'}} src='/assets/imgs/close.svg' />
                        <img style={{height:95,marginTop:10,marginLeft:10,borderRadius:'15px 5px 5px 5px',width:'auto',maxWidth:'100%'}} src={reply.link}/>
                    </div>
                    :null}


                    {imageChosen && 
                    <div className='image' style={{height:110,width:"100%",position:'relative',overflow:'hidden'}} >
                        <img onClick={()=>setImageChosen(undefined)} style={{position:'absolute',top:15,right:15,height:25,cursor:'pointer'}} src='/assets/imgs/close.svg' />
                        <img style={{height:95,marginTop:10,marginLeft:10,borderRadius:'15px 5px 5px 5px',width:'auto',maxWidth:'100%'}} src={URL.createObjectURL(imageChosen)} />
                    </div>}
                    <div style={{width:'100%',height:50,display:'flex',flexDirection:"row",alignItems:'center',justifyContent:'start'}} >
                        <div style={{height:38,width:38,position:'relative',overflow:'hidden',borderRadius:'50%',marginLeft:5}} >
                            <input onChange={(e)=>setImageChosen(e.target.files?.[0])} type='file' accept='image/*' style={{position:'absolute',width:'100%',height:'calc(100% + 21px)',cursor:'pointer',top:-21,opacity:0}} />
                            <img src="/assets/imgs/image.svg" style={{height:24,backgroundColor:'#1DB954',padding:7,borderRadius:'50%'}} />
                        </div>
                        <input ref={inputRef} onKeyDown={(e)=>{if(e.key === "Enter"){sendMessage();handleTypingStopped()}}} onFocus={() => setIsInputFocused(true)} onBlur={() => setIsInputFocused(false)} onChange={(event)=>{setMessageInput(event.target.value);handleKeyDown()}} value={messageInput} placeholder='Type...' style={{width:isMobile?'calc(100% - 112px)':'calc(100% - 170px)',color:'white',border:0,outline:'none',fontSize:16,backgroundColor:'transparent',padding:isMobile?'5px 10px':'5px 20px'}} />
                        <div onClick={()=>sendMessage()}  className='send' style={{height:24,position:'absolute',right:5,cursor:'pointer',backgroundColor:'#1DB954',borderRadius:24,padding:7,display:'flex',flexDirection:"row",alignItems:'center',justifyContent:'center'}} >
                            {!isMobile && <p style={{color:'white',fontWeight:'500',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}} >Send</p>}
                            <img src="/assets/imgs/send.svg" style={{height:24}} />
                        </div>
                    </div>
                    
                </div>:null}

                {/* MESSAGES */}
                {/* MESSAGES */}
                {/* MESSAGES */}

                {!chatRemoved?<div ref={chatRef}  className='messages-container' style={{width:'100%',height:reply?reply.link?'calc(100% - 160px)':'calc(100% - 110px)':'calc(100% - 60px)',padding:'0 15px 77px 15px',boxSizing:'border-box',overflowY:"scroll",display:'flex',flexDirection:'column-reverse',alignItems:"center",justifyContent:'end'}} >
                    {/* <div className='messages-container' style={{width:'100%',transition:'0.2s',padding:'0 15px 77px 15px',overflow:'visible',position:"relative",boxSizing:'border-box',display:'flex',flexDirection:'column'}}> */}
                    {messages.length > 0 && messages.slice(-1)[0].message.seen && messages.slice(-1)[0].userId === userId ? <div style={{display:"flex",flexDirection:'row',alignSelf:'end'}} >
                        <p style={{fontSize:16,color:'#999',margin:0}} >seen</p>
                        <img style={{height:20,marginLeft:5, filter: 'brightness(0) saturate(100%) invert(60%) sepia(33%) saturate(1105%) hue-rotate(88deg) brightness(90%) contrast(85%)'}} src="/assets/imgs/seen.svg" />
                    </div>:null}

                        {
                            messages.map((msg,i)=>{
                                const mine = msg.userId === userId;
                                console.log( msg.message.reply)
                                // const txtDims = getTextDimentions(msg.message.text,322,16,19);
                                // const lastSent = msg.new && i === (messages.length - 1);
                                const justSent = isDateLessThan1SecondAgo(msg.message.time);
                                if (mine) {
                                    
                                    return(
                                        <div key={i} className={`message mine ${justSent?'new':'old'}`} style={{padding:'10px 14px',maxWidth:isMobile?'calc(100% - 70px)':320,position:'relative',cursor:'default',marginTop:5,borderRadius:"7px 7px 2px 7px",backgroundColor:"#1DB954",alignSelf:"end",display:'flex',flexDirection:'column',alignItems:"start",justifyContent:"center"}} >
                                            {msg.message.media && msg.message.link ?<img style={{width:'100%',borderRadius:5,marginBottom:5}} src={msg.message.link} />:null}
                                            {msg.message.reply?<div style={{height:msg.message.reply.link?'auto':30,backgroundColor:'white',opacity:0.9,borderRadius:5,display:'flex',alignSelf:'end',alignItems:'center',padding:'0 10px',width:"calc(100% - 20px)",marginBottom:10}} >
                                                <p style={{color:"black",margin:0,fontWeight:'lighter',fontSize:16,overflow:'hidden',textOverflow:'ellipsis',textWrap:'nowrap'}} >{msg.message.reply.content}</p>
                                                {msg.message.reply.link ?<img style={{width:'100%',borderRadius:5,margin:'10px 0 10px 0',zoom:0.7}} src={msg.message.reply.link} />:null}
                                            </div>:null}
                                            <p style={{color:"#fff",margin:0,fontWeight:'lighter',fontSize:16,wordBreak:'break-word',overflowWrap:'break-word',hyphens:'auto',alignSelf:'end'}} >{msg.message.text}</p>
                                            <p className="time" style={{color:'#ddd',position:'absolute',fontWeight:'lighter',fontSize:10,margin:0}} >{formatTime(msg.message.time)}</p>
                                            <img onClick={()=>{pushReply(msg.message.id,msg.message.text,msg.message.media??undefined,msg.message.link)}} className='reply-btn' src="/assets/imgs/reply.svg" style={{cursor:'pointer',height:20,zIndex:2,position:'absolute',left:0,transform:'translateX(calc(-100% - 10px)) rotateY(180deg)'}}  />
                                        </div>
                                    )
                                }
                                return(
                                    <div key={i} className={`message hes ${justSent?'new':'old'}`} style={{padding:'10px 14px',maxWidth:isMobile?'calc(100% - 70px)':320,position:'relative',cursor:'default',marginTop:5,boxSizing:'border-box',borderRadius:"7px 7px 7px 2px",backgroundColor:"white",alignSelf:"start",display:'flex',flexDirection:'column',alignItems:"end",justifyContent:"center"}} >
                                        {msg.message.media && msg.message.link ?<img style={{width:'100%',borderRadius:5}} src={msg.message.link} />:null}
                                        {msg.message.reply?<div style={{height:msg.message.reply.link?'auto':30,backgroundColor:'#1DB954',opacity:0.9,borderRadius:5,display:'flex',alignSelf:'start',alignItems:'center',padding:'0 10px',width:"calc(100% - 20px)",marginBottom:10}} >
                                            <p style={{color:"white",margin:0,fontWeight:'lighter',fontSize:16,overflow:'hidden',textOverflow:'ellipsis',textWrap:'nowrap'}} >{msg.message.reply.content}</p> 
                                            {msg.message.reply.link ?<img style={{width:'100%',borderRadius:5,margin:'10px 0 10px 0',zoom:0.7}} src={msg.message.reply.link} />:null}

                                        </div>:null}
                                        <p style={{color:"#121212",margin:0,fontWeight:'lighter',fontSize:16,wordBreak:'break-word',overflowWrap:'break-word',hyphens:'auto',alignSelf:'start'}} >{msg.message.text}</p> 
                                        <p className="time" style={{color:'#ddd',position:'absolute',fontWeight:'lighter',fontSize:10,margin:0}} >{formatTime(msg.message.time)}</p>
                                        <img onClick={()=>pushReply(msg.message.id,msg.message.text,msg.message.media??undefined,msg.message.link)} className='reply-btn' src="/assets/imgs/reply.svg" style={{cursor:'pointer',height:20,position:'absolute',right:0,transform:'translateX(calc(100% + 10px))'}}  />
                                    </div>
                                )
                            }).reverse()
                        }
                    {/* </div> */}
                    
                </div>:null}
                


                {/*  */}
                {/*  */}
                {/* CHAT NOT SELECTED */}
                {/*  */}
                {/*  */}

            {!selectedChat && !isMobile?<div className='front-banner' style={{height:'100%',width:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:0}} >
                <div style={{position:'absolute',transform:'translateY(-4vw)',display:'flex',alignItems:'center',justifyContent:"center"}} >
                    <img src="/assets/imgs/blob2.svg" style={{width:'23vw'}} />
                    <h1 style={{position:'absolute',top:'50%',transform:'translateY(-50%)',color:"#121212",fontSize:'3vw',margin:'10px 0 0 15px',alignSelf:'start',fontWeight:500,display:'flex',flexDirection:'row',alignItems:"center",justifyContent:'center',cursor:'default' }}>Ch<img src='/assets/imgs/chat.svg' style={{height:'3vw',filter:'brightness(0) saturate(100%) invert(49%) sepia(66%) saturate(575%) hue-rotate(88deg) brightness(102%) contrast(87%)'}} />tify</h1>
                </div>
                <div style={{marginBottom:'-12vw',textAlign:'center'}} >
                    <p style={{fontWeight:'lighter',fontSize:'1.2vw',color:"white",marginBottom:5}} >Start a conversation and make new friends today,</p>
                    <p style={{fontWeight:'lighter',fontSize:'1.2vw',color:"white",margin:0}} >connect with confidence in a safe and welcoming space!</p>
                </div>
            </div>:null}


        </div>
    )
})


export default Chat;
