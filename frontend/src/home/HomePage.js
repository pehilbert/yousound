import "./HomePage.css";
import {useEffect, useState} from "react";
import axios from "axios";

function HomePage() {
    const [data, setData] = useState(null);
    const ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

    useEffect(() => {
        axios.get(ENDPOINT + "/api")
            .then(response => {
                setData(response.data.message);
            })
            .catch(error => console.error(error));
    });

    return (
        <h1 className="home-title">{data ? data : 'Loading...'}</h1>
    )
}

export default HomePage;