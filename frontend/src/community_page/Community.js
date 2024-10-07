import "./Community.css";
import React, { useState, useEffect, useRef  } from 'react';


function Community() {

    const audioSrc = `http://localhost:5000/api/songs/random`;

    return (
        <div>
            <h3>Random Community Song</h3>
            <audio controls>
                <source src={audioSrc} type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>
        </div>
    );
    /*
    const ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
    const [audioSrc, setAudioSrc] = useState(null);
    const [playing, setPlaying] = useState(false);

    const response = axios.get(ENDPOINT + "/api/songs/random", {
        responseType: 'blob', // Important to handle binary data
    });
    


    return (
        <div>
            {audioSrc && (
                <audio controls>
                    <source src={audioSrc} type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
            )}
        </div>
    )
        */
}

export default Community;