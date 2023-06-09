import React, { useState, useContext, useEffect } from "react";
import settings from "../assets/settings.png";
import menu from "../assets/menu.svg"
import logoutPng from "../assets/logout.png";
import { UserAvatar, ProfileModal} from "./homeComponents";
import { store } from "../stateManagement/store";
import Loader from "../components/loader";
import { logout } from "./authController";
import { useNavigate } from "react-router-dom";
import UsersList from "./usersList";
import ChatInterface from "./chatInterface";
import close from "../assets/close.png" 


const Home = (props) => {
    const [showProfile, setShowProfile] = useState(false);
    const [profileClosable, setProfileClosable] = useState(true);
    const [userdetail, setUserDetail] = useState({});
    const [activeUser, setActiveUser] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false)
    const navigate = useNavigate();

    const {state: {userDetail, activeChatUser }} = useContext(store)
    
    useEffect(() => {
        
        if (userDetail !== userdetail) {
            setUserDetail(userDetail);
            if (!userDetail.first_name) { /* Note */
            //    setShowProfile(false);
            //    setProfileCloseable(true);
            setShowProfile(true);
            setProfileClosable(false);
            }
          }

        if(activeUser !== activeChatUser){
            setActiveUser(activeChatUser)
            closeSideBar();
        }
        console.log(activeChatUser)
    },[userDetail, activeChatUser])

    // console.log(userDetail.first_name)
    if(!userDetail){
        return (
            <div className="centerall">
                <Loader />
            </div>
        )
    }
    const toggleSideBar = () => {
        const sideBar = document.getElementById("sideBar")
        if(sideBar.classList.contains("close")){
          sideBar.classList.remove("close")
        }
        else{
          sideBar.classList.add("close")
        }
      }
    
      const closeSideBar = () => {
        const sideBar = document.getElementById("sideBar")
        if(!sideBar.classList.contains("close")){
          sideBar.classList.add("close")
        }
      }
    

    return (
        <>
            <ProfileModal
                {...props}
                close={() => setShowProfile(false)}
                userDetail={userdetail}
                visible={showProfile}
                closable={profileClosable}
                setClosable={() => setProfileClosable(true)}
            />

            {
                activeUser && <ProfileModal
                    {...props}
                    close={() => setShowProfileModal(false)}
                    userDetail={activeChatUser}
                    visible={showProfileModal}
                    closable={true}
                    setClosable={() => null}
                    view
                />
            }
            <div className="home-container">
                <div className="side close" id="sideBar">
                    <div className="flex align-center justify-between top">
                        {/* {console.log(userDetail)} */}
                        <UserAvatar
                            noStatus
                            isV2
                            name={`${userDetail?.first_name || ""} ${
                                userDetail?.last_name || ""
                            }`}
                            profilePicture={userdetail.profile_picture ? userdetail.profile_picture.file_upload : ""}
                        />
                        <div>
                            <img src={settings} onClick={() => {
                                setShowProfile(true);
                                closeSideBar();
                            }} />
                            <div className="mobile">
                            </div>
                            <div>
                                <img src={close} alt="" onClick={toggleSideBar} style={{width:15}}/>
                            </div>
                        </div>
                    </div>
                    <UsersList />
                    <div className="logout"   onClick={() => logout(props, navigate)}>
                        <img src={logoutPng}/>
                        <div>logout</div>
                    </div>
                </div>
                <div className="mobile overlay" onClick={toggleSideBar}/>
                <div className="main">
                    {/* {console.log(userdetail)} */}
                    {activeUser ? (
                        <ChatInterface activeUser={activeUser} loggedUser={userDetail} toggleSideBar={toggleSideBar}
                        showProfileModal={showProfileModal} setShowProfileModal={setShowProfileModal} />
                        ) : (
                            <div>
                                <div className="heading mobile">
                                    <div style={{height:"100%"}} className="flex align-center">
                                        <img src={menu} alt="" onClick={toggleSideBar}/></div>
                                    </div>
                                <div className="noUser">Click on a user to start clicking</div> 
                            </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Home;