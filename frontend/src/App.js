import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./layout/Layout.js";
import HomePage from "./home/HomePage.js";
import SignIn from "./account_pages/SignIn.js";
import SignUp from "./account_pages/SignUp.js";
import Community from "./community_page/Community.js";
import UploadSong from "./upload/UploadSong.js";
import AuthProvider from "./AuthContext.js";

import "./App.css";

function App() {
    return (
        <div className="App">
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<HomePage />}/>
                            <Route path="/signin" element={<SignIn />}/>
                            <Route path="/signup" element={<SignUp />}/>
                            <Route path="/community" element={<Community />}/>
                            <Route path="/upload" element={<UploadSong />}/>
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </div>
    );
}

export default App;