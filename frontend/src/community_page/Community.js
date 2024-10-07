import "./Community.css";
import React, { useState, useEffect, useRef  } from 'react';


function Community() {

    const ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
    const audioSrc = ENDPOINT + `/api/songs/random`;

    const [songTitle, setSongTitle] = useState('');
    const [songDescription, setSongDescription] = useState('');

    useEffect(() => {
        // Fetch song metadata by making a HEAD request to get the headers
        fetch(audioSrc, { method: 'HEAD' })
            .then(response => {
                setSongTitle(response.headers.get('X-Song-Title') || 'Unknown Title');
                setSongDescription(response.headers.get('X-Song-Description') || 'No Description');
            })
            .catch(error => {
                console.error('Failed to fetch song metadata:', error);
            });
    }, [audioSrc]);

    console.log(songTitle);

    return (
        <div>
            <h3>Random Community Song</h3>
            <p><strong>Title:</strong> {songTitle}</p>
            <p><strong>Description:</strong> {songDescription}</p>
            <audio controls>
                <source src={audioSrc} type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>
        </div>
    );

}

export default Community;