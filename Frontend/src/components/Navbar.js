import "./../css/navbar.css";
import { Link, useNavigate } from "react-router-dom";


const Navbar = (props) => {
    let user = sessionStorage.getItem("user");
    let isLoggedIn = false;


    if (user !== null) {
        user = JSON.parse(user);
        if (user.username !== undefined && user.email !== undefined && user.userId !== undefined) isLoggedIn = true;
    }

    const navigator = useNavigate();

    function logout() {
        sessionStorage.removeItem("user");
        navigator("/login");
    }

    return (
        <nav className="navbar navbar-expand-lg bg-primary navbar-dark">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">Meetingo</Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>
                        {isLoggedIn ? (
                            <li className="nav-item">
                                <Link className="nav-link" to="/chat">Chats</Link>
                            </li>
                        ) : (
                            <span></span>
                        )}
                    </ul>

                    <ul className="navbar-nav">
                        {isLoggedIn ? (
                            <li className="nav-item">
                                <button onClick={logout} className="btn btn-outline-light">Logout</button>
                            </li>
                        ) : (
                            <li className="nav-item">
                                <Link className="btn btn-light" to="/login">Login</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;