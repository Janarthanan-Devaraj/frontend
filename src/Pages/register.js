import React, {useState} from 'react'
import { AuthForm } from './login';
import { Link } from 'react-router-dom';
import { REGISTER_URL } from "../urls";
import { axiosHandler, errorHandler } from "../helper";
import { useNavigate } from 'react-router-dom';

const Register = (props) => {
    const navigate = useNavigate();
    const [registerData, setRegisterData] = useState({});
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState()

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const result = await axiosHandler({
            method: "post",
            url: REGISTER_URL,
            data: registerData
        }).catch(e => setError(errorHandler(e)));
        
        if(result){
            navigate("/login")
        }
        setLoading(false);
    }

    const onChange = (e) => {
        setRegisterData(
            {
                ...registerData,
                [e.target.name]: e.target.value,
            }
        )
    }

    return (
        <div className="loginContainer">
                <div className="inner">
                    <div className="logo">DEVTOT</div>
                    <div className="title">Sign up</div>
                    <AuthForm 
                        data={registerData} 
                        onSubmit={submit}
                        onChange={onChange}
                        error = {error}
                        setError = {setError}
                        loading = {loading}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                    />
                    <div className="switchOption">
                        Already got an account <Link to="/login/">sign in</Link>
                    </div>
                </div>
        </div>
    )
}

export default Register;