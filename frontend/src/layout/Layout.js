import { Outlet, Link, useNavigate } from "react-router-dom";
import {useAuth} from "../AuthContext";
import "./Layout.css";

function Layout() {
    const authContext = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await authContext.logout();
        navigate("/");
    }

    return (
        <div className="Layout-container">
            <div className="Layout">
                <div className="nav-bar">
                    <h1 className="title">YouSound</h1>
                    <div className="links">
                        <Link className="nav-link" to="/">Home</Link>
                        <Link className="nav-link" to="/community">Community</Link>
                        <Link className="nav-link" to="/upload">Upload</Link>
                        {authContext.authToken ? 
                        (<button className="nav-link emphasized" onClick={handleLogout}>Sign Out</button>) 
                        : (<Link className="nav-link emphasized" to="/signup">Sign Up</Link>)}
                    </div>
                </div>
            </div>

            <Outlet />
        </div>
    );
}

export default Layout;