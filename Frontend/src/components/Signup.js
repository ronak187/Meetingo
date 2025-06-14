import { Link } from "react-router-dom";
import "../css/login-signup-form.css";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import useFetchToGetData from "../utils/useFetchToGetData";

const Signup = () => {

    const [newUserData, setNewUserData] = useState(null);
    const [triggerSignup, setTriggerSignup] = useState(false);

    const { data, loading: signingUp, error } = useFetchToGetData("/user/add-user", newUserData);

    function signupUser() {
        console.log("Signing up user");

        let name = document.getElementById("name").value;
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        let confirmPassword = document.getElementById("confirm-password").value;

        if (name === "" || email === "" || password === "" || confirmPassword === "") {
            Swal.fire({
                allowOutsideClick: false,
                icon: "error",
                title: "Empty Fields",
                text: "Please fill all the fields",
                confirmButtonText: "Okay",
                buttonsStyling: true,
                customClass: {
                    confirmButton: "btn btn-primary",
                }
            });

            return;
        }

        if (password !== confirmPassword) {
            Swal.fire({
                allowOutsideClick: false,
                icon: "error",
                title: "Password Mismatch",
                text: "Password and Confirm Password do not match",
                confirmButtonText: "Okay",
                buttonsStyling: true,
                customClass: {
                    confirmButton: "btn btn-primary",
                }
            });
            return;
        }

        let user = {
            username: name,
            email: email,
            password: password
        };

        setNewUserData(user);
        setTriggerSignup(true);
        console.log(newUserData);
    }



    useEffect(() => {
        if (triggerSignup) {
            if (data.username !== undefined && data.email !== undefined && data.userId !== undefined) {
                Swal.fire({
                    icon: "success",
                    title: "Signup Successful",
                    text: "You have successfully signed up!",
                    confirmButtonText: "Okay",
                });
                setTriggerSignup(false);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Signup Failed",
                    text: "Something went wrong! Please try again later.",
                    confirmButtonText: "Okay",
                });
                setTriggerSignup(false);
                console.log(error);
            }
        }
    }, [data, triggerSignup]);


    return (
        <div className="wrapper">
            <div className="form-wrapper">
                <h2>Sign up</h2>
                <div>
                    <div className="form-group">
                        <input type="name" id="name" className="form-control" placeholder="Enter Full Name" />
                    </div>
                    <div className="form-group">
                        <input type="email" id="email" className="form-control" placeholder="Enter Email" />
                    </div>
                    <div className="form-group">
                        <input type="password" id="password" className="form-control" placeholder="Enter Password" />
                    </div>
                    <div className="form-group">
                        <input type="password" id="confirm-password" className="form-control" placeholder="Confirm Password" />
                    </div>
                    <button onClick={signupUser} className="btn btn-primary">
                        {signingUp ? "Signing Up..." : "Signup"}
                    </button>
                    <div className="signup-text text-muted">
                        Already have an account ?
                        &nbsp;
                        <Link to="/login" className="signup-link">Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;