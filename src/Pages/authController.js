// src/Pages/authController.js
import React, { useContext, useEffect, useState } from "react";
import Loader from "../components/loader";
import { useNavigate } from "react-router-dom";
import { LastUserChat, axiosHandler, getToken } from "../helper";
import { ME_URL, MY_PROFILE_URL, REFRESH_URL } from "../urls";
import { store } from "../stateManagement/store";
import { userDetailAction } from "../stateManagement/actions";

export const tokenName = "tokenName";

export const logout = (props, navigate) => {
  localStorage.removeItem(tokenName)
  localStorage.removeItem(LastUserChat)
  navigate("/login")
}

const getMyprofile = async (dispatch) => {
  const token = await getToken();
  const profile = await axiosHandler({
      method: "get",
      url: MY_PROFILE_URL,
      token: token
  }).catch((e) => console.log(e))

  if(profile){
    dispatch({type: userDetailAction, payload: profile.data});
  }
}

export const checkAuthState = async (props, navigate, dispatch, setChecking) => {
  let token = localStorage.getItem(tokenName);
  
  if(token){
    getMyprofile(dispatch)
  }
  else {
    logout(props, navigate)
    return;
  }

  token = JSON.parse(token);
  const userProfile = await axiosHandler({
      method: "get",
      url: ME_URL,
      token: token.access,
  }).catch((e) => console.log(e))

  if(userProfile) {
      setChecking(false);
      // console.log(userProfile)
      dispatch({type: userDetailAction, payload: userProfile.data});
  }else{
    const getNewAccess = await axiosHandler({
      method: "post",
      url: REFRESH_URL,
      data: {
        refresh: token.refresh,
      },
    }).catch((e) => console(e));

    if(getNewAccess){
      localStorage.setItem(tokenName, JSON.stringify(getNewAccess.data))
      checkAuthState(setChecking, dispatch, props, navigate)
    }else{
      logout(props, navigate)
    }
  }
  };


const AuthController = ({ props, children }) => {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate(store);

  const {dispatch} = useContext(store)

  useEffect(() => {
    checkAuthState(props, navigate, dispatch, setChecking);
  }, []);

  return (
    <div className="authContainer">
      {checking ? (
        <div className="centerAll">
          <Loader />
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default AuthController;
