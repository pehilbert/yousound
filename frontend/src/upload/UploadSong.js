import "./UploadSong.css";
import React, { useState , useRef  } from 'react';

function UploadSong() {

    // todo
    // need to check if user is signed 
        // if user not signed in input on page that user is not signed in
        // redirect to login page


    // state to store a selected file
    const [selectedFile, setSelectedFile] = useState(null);
    const [songTitle, setSongTitle] = useState('');
    const [songDescription, setDescription] = useState('');

    // ref for file input
    const fileInputRef = useRef(null);

    // set null song title 
    const handleTitleChange = (event) => {
        setSongTitle(event.target.value);
    };

    // set description
    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    };

    // handle file selection
    const handleFileChange = (event) =>{
        setSelectedFile(event.target.files[0]);
    };

    const handleFileUpload = () => {
        if(selectedFile && songTitle)
        {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('title', songTitle);
            formData.append('description', songDescription);
            // TODO : add an append data for user 
            // TODO : add an append data for the users

            
            
            // temp for upload use
            console.log('Uploaded file: ', selectedFile);
            console.log('Song title: ', songTitle);
            console.log('Song Description: ', songDescription);

            // temperary clear fields
            clearInputs();
            fileInputRef.current.value = null;
            alert('File successfully uploaded!');

            // TODO 

            // file upload use case will occur here

            // check if file is uploaded properly

                // clear fields
                // pop up that file was successfully uploaded
                
            // else

                // error has occured try again
        }
        else
        {
            alert('please select a file to upload');
        }
    };

    // Function to clear the inputs
    const clearInputs = () => {
        setSelectedFile(null);
        setSongTitle('');
        setDescription('');
    };

    return (

        <>
            <div class="UploadSong">
                <h1>Please Enter A Song To Upload</h1>
            </div>
            <br></br>
            <div class="uploadFile">
                <span>Enter Song Name </span>
                <input
                    type="text" 
                    placeholder="Enter Song Title"
                    value={songTitle}
                    onChange={handleTitleChange} 
                />
                <br /><br />
                <span>Enter Description </span>
                <input
                    type="text" 
                    placeholder="Enter Description"
                    value={songDescription}
                    onChange={handleDescriptionChange} 
                />
                <br /><br />
                <input type="file"  ref={fileInputRef} onChange={handleFileChange} />
                {selectedFile && <p>Selected File: {selectedFile.name}</p>}
                <button onClick={handleFileUpload}>Upload</button>
                
            </div>
        </>

    );
}

export default UploadSong;