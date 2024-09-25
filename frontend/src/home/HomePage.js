import "./HomePage.css";
import {useEffect, useState} from "react";

function HomePage() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('/api')
          .then((res) => res.json())
          .then((data) => setData(data.message))
          .catch((error) => console.error('Error fetching data:', error));
      }, []);

    return (
        <h1 className="home-title">{data ? data : 'Loading...'}</h1>
    )
}

export default HomePage;