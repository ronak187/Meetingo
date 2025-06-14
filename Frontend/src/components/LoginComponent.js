import "../css/login-signup-form.css";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useFetchToGetData from "../utils/useFetchToGetData";
import { useEffect, useState } from "react";

function LoginComponent() {

    const [credentials, setCredentials] = useState(null);
    const {data, loading, error} = useFetchToGetData("/user/login-user", credentials);

    function handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (email === "" || password === "") {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Email or Password cannot be empty"
            });
            return;
        }

        const requestBody = {
            email: email,
            password: password
        };

        console.log("requestBody: ", requestBody);
        setCredentials(requestBody);
    }

    const navigator = useNavigate();

    useEffect(() => {
        if (credentials !== null) {
            console.log("data: ", data);

            if (data !== null) {
                if (data.username !== undefined  &&  data.email !== undefined  &&  data.userId !== undefined) {
                    sessionStorage.setItem("user", JSON.stringify(data));
                    Swal.fire({
                        icon: "success",
                        title: "Login Successful",
                        text: "You have successfully logged in"
                    }).then(() => {
                        navigator("/");
                    }); 
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Login Failed",
                        text: "Invalid Email or Password"
                    });
                }
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Login Failed",
                    text: "Invalid Email or Password"
                });
            }
        }
    }, [credentials, data, navigator]);


    return (
        <div className="wrapper">
            <div className="form-wrapper">
                <h2>Login</h2>
                <form onSubmit={handleLogin} method="POST">
                    <div className="form-group">
                        <input type="email" id="email" className="form-control" placeholder="Enter Email" />
                    </div>
                    <div className="form-group">
                        <input type="password" id="password" className="form-control" placeholder="Enter Password" />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        {loading ? "Logging in..." : "Login"}
                    </button>
                    <div className="signup-text text-muted">
                        Do not have an account ?
                        &nbsp;
                        <Link to="/signup" className="signup-link">Sign up</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginComponent;