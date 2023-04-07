import React, { useEffect, useState, useContext } from 'react'
import favorite from "../assets/star.png"
import favoriteActive from "../assets/favActive.png"
import send from "../assets/send.png"
import smiley from "../assets/smiley.png"
import menu from "../assets/menu.svg";
import { ChatBubble, ProfileModal, UserAvatar } from './homeComponents';
import Loader from '../components/loader';
import { axiosHandler, errorHandler, getToken } from '../helper';
import { CHECK_FAVORITE_URL, MESSAGE_URL, READ_MESSAGE_URL, UPDATE_FAVORITE_URL } from '../urls';
import moment from 'moment/moment';
import { store } from '../stateManagement/store';
import { activeChatAction, triggerRefreshUserListAction } from '../stateManagement/actions';


let goneNext = false;




const ChatInterface = (props) => {

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [fetching, setFetching ] = useState(true)
    const [nextPage, setNextPage ] = useState(1)
    const [canGoNext, setCanGoNext ] = useState(false)
    const [isFavorite, setIsFavorite] = useState(false)
    const [shouldHandleScroll, setShouldHandleScroll] = useState(false)


    
    const {state: {activeChat}, dispatch} = useContext(store)

    const checkIsFav = async() => {
        const token = await getToken()
        const result = await axiosHandler({
            method:"get",
            url: CHECK_FAVORITE_URL + `${props.activeUser.user?.id}`, 
            token,
        }).catch(e => console.log(e))

        if(result){
            setIsFavorite(result.data)
        }
        
    
    }

    console.log(props)

    const getMessages = async (append=false, page) => {
        const token = await getToken()
        setCanGoNext(false)

        const result = await axiosHandler({
            method: "get",
            url: MESSAGE_URL + `?user_id=${props.activeUser?.user?.id}&page=${page ? page : nextPage}`,
            token,
        }).catch(e => console.log(errorHandler(e)))


        // console.log(result)
        if(result){
            if(append){
                setMessages([...result?.data?.results?.reverse(), ...messages])
                goneNext = false
            }else{
                setMessages(result?.data?.results?.reverse())
            }

            const messages_not_read = []
            result.data.results.map(item => {
                if(item.is_read) return null
                if(item.receiver.user?.id === props.loggedUser.user?.id){
                    messages_not_read.push(item?.id)
                }
                return null
            })

            if(messages_not_read.length > 0){
                updateMessage(messages_not_read)
            }

            if(result.data.next){
                setCanGoNext(true)
                setNextPage(nextPage + 1)
            }
            // console.log(result.data)
            setFetching(false)
            if(!append){
                scrollTobottom()
                setTimeout(() => setShouldHandleScroll(true), 1000)
            }
        }
    }

    const updateMessage = async(message_ids) => {
        let token = await getToken()
        axiosHandler({method: "patch", url:READ_MESSAGE_URL, token, data: {message_ids}})
        dispatch({type: triggerRefreshUserListAction, payload: true})
    }

    const reset = () => {
        setMessages([])
        setFetching(true)
        setCanGoNext(false)
      }

    useEffect(() => {
        reset()
        getMessages();
        checkIsFav();
    }, [props.activeUser])

    const updateFav = async () => {
        setIsFavorite(!isFavorite)
        const token = await getToken()
        const result = await axiosHandler({  
            method: "post",
            url: UPDATE_FAVORITE_URL, 
            token, 
            data: { favorite_id: props.activeUser?.id }
        }).catch(e => console.log(e))

        if(!result){
            setIsFavorite(!isFavorite);
        }
    }

    useEffect(()=> {
        if(activeChat){
           getMessages();
           dispatch({type: activeChatAction, payload: null}) 
        }
    }, [activeChat])

    const submitMessage = async (e) => {
        e.preventDefault();
        let data = {
            sender_id: props?.loggedUser?.user?.id,
            receiver_id: props?.activeUser?.user?.id,
            message,
        };
        const lastIndex = message.length
        setMessages([...messages, data]);
        setMessage("")



        const token = await getToken()
        const result = await axiosHandler({
            method: "post",
            url: MESSAGE_URL,
            token, data
        }).catch(e => console.log(errorHandler(e)))

        if(result) {
            messages[lastIndex] = result.data

            setMessage(messages)
            scrollTobottom()
        }
    };

    const handleBubbleType = (item) => {
       if(item.sender_id) return "sender"

       if(item?.sender?.user?.id === props?.loggedUser?.user?.id) 
       {
            return "sender"
       }
       else {
            return ""
       }
    }

    const scrollTobottom = () => {
        setTimeout(() => {
            let chatArea = document.getElementById("chatArea")
            chatArea.scrollTop = chatArea.scrollHeight;
        }, 300);
    }


    const handleScroll = e => {
        if(!shouldHandleScroll <= 100 ){
            if(e.target.scrollTop && !goneNext){
                goneNext = true;
                getMessages(true)
            }
        }
    }
    return (
        <>
        {/* {console.log(props)} */}
        <div className="flex align-center justify-between heading">
            <div className="flex align-center">
                <div className="mobile">
                    <img src={menu} alt="" onClick={props.toggleSideBar}/>
                </div>
            <UserAvatar
                name={`${props.activeUser?.first_name} ${props.activeUser?.last_name}`}
                profilePicture={props.activeUser.profile_picture && props.activeUser.profile_picture.file_upload} 
                caption={props.activeUser?.caption} 
            />
            </div>
                <div className="flex align-center rightItems">
                    <img src={isFavorite ? favoriteActive : favorite } onClick={updateFav} />
                    <img src={menu} onClick={() =>props.setShowProfileModel(true)} />
                </div>
            </div>
            {/* {console.log(messages)} */}
            <div className="chatArea" id="chatArea" onScroll={handleScroll} >
                {
                    fetching ? (<center><Loader /></center>) :  ( messages.length < 1 ? <div className='noUser'> No message yet </div> : 
                    messages.map((item, key) => (
                        <ChatBubble 
                            bubbleType={handleBubbleType(item)} 
                            key={key}
                            message = {item.message}
                            time = {item?.created_at ? moment(item.created_at).format("YYYY-MM-DD hh:mm a") : ""}
                        />
                    ))
                )}
            </div>
            <form  onSubmit={submitMessage}  className="messageZone"  >
                <div className="flex align-center justify-between topPart">
                    <div/>
                    <button type='submit'  >
                        <img src={send} />
                    </button>
                </div>
                <input
                    placeholder="Typer your message here....." 
                    value={message} onChange={e => setMessage(e.target.value)} 
                />
            </form>
        </>
    )
}

export default ChatInterface