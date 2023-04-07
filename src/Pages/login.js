import React, {useState, useContext, useEffect} from "react";
import eyeopen from "../assets/eyeopen.png"
import eyeclose from "../assets/eyeclose.png"
import closewhite from "../assets/close-white.png"
import { Link } from "react-router-dom";
import { axiosHandler, errorHandler } from "../helper";
import { LOGIN_URL } from "../urls";
import Loader from "../components/loader";
import { useNavigate } from "react-router-dom";
import { checkAuthState, tokenName } from "./authController";
import { store } from "../stateManagement/store";


export const loginRequest = async (data, setError, navigate) => {
    const result = await axiosHandler({
        method: "post",
        url: LOGIN_URL,
        data: data,
    }).catch(e => { setError(errorHandler(e))});
    
    if(result) {
        localStorage.setItem(tokenName, JSON.stringify(result.data))
        navigate("/")
    }
}

const Login = (props) => {
    const [loginData, setLoginData] = useState({});
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState()
    const [checking, setChecking] = useState(localStorage.getItem(tokenName));
    const navigate = useNavigate(store);

    useEffect(() => {
        if (checking) {
          checkAuthState(
            () => null,
            () => navigate("/"),
            props
          );
        }
      }, []);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        await loginRequest(loginData, setError, navigate)
        setLoading(false);
    };

    const onChange = (e) => {
        setLoginData(
            {
                ...loginData,
                [e.target.name]: e.target.value,
            }
        )
    }
    return (
        <div className="loginContainer">
            {checking ? 
            (<div className="centerAll">
                <Loader />
                </div>) : 
            (<div className="inner">
            <div className="logo">DEVTOT</div>
            <div className="title">Sign in</div>
            <AuthForm 
                login  
                data={loginData} 
                onSubmit={submit}
                onChange={onChange}
                error = {error}
                setError = {setError}
                loading = {loading}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
            />
            <div className="switchOption">
                Don't have an account yet? <Link to="/register/">sign up</Link>
            </div>
        </div>)
            }
            
        </div>
    )
};


export const AuthForm = (props) => {
    return (
        <>
            {props.error && (
                <div className="errorHolder" >
                    <div dangerouslySetInnerHTML={ {__html: props.error} }  />
                    <img src={closewhite} onClick={() => props.setError(null)} />
                </div>
            )}
            <form onSubmit={props.onSubmit} >
            <input
                value={props.data.username}
                name = "username"
                onChange={props.onChange}
                type="text" 
                className="input-field" 
                placeholder="Username"
                required 
            />
            {!props.login && (
                <div className="input-container">
                    <input
                        value={props.data.email}
                        name = "email"
                        onChange={props.onChange} 
                        type="email" 
                        className="input-field" 
                        placeholder="Email Address" 
                        required
                    />
                </div>      
            )}
            <div className="input-container">
                <input
                    value={props.data.password}
                    name = "password"
                    onChange={props.onChange} 
                    type={!props.showPassword ? "password" : "text"} 
                    className="input-field" 
                    placeholder="password" 
                    autoComplete="new-password"
                    required
                />
                <img src={!props.showPassword ? eyeopen : eyeclose } onClick={() => props.setShowPassword(!props.showPassword)}  />
            </div>
            <button type="submit" disabled={props.loading} >
                { props.loading ? ( 
                    <center>
                        <Loader />
                    </center> 
                ) : (
                    props.login ? (
                        "Login"
                    ) : (
                        "Register"
                    )
                ) }
            </button>
        </form>
        </>
    )
}

export default Login;