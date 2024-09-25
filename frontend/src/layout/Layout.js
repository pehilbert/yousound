import { Outlet, Link } from "react-router-dom";
import "./Layout.css";

function Layout() {
    return (
        <div className="Layout-container">
            <div className="Layout">
                <div className="nav-bar">
                    <h1 className="title">YouSound</h1>
                    <div className="links">
                        <Link className="nav-link" to="/">Home</Link>
                        <Link className="nav-link" to="/community">Community</Link>
                        <Link className="nav-link" to="/upload">Upload</Link>
                        <Link className="nav-link emphasized" to="/signup">Sign Up</Link>
                    </div>
                </div>
            </div>

            <Outlet />
        </div>
    );
}

export default Layout;