import React, { useEffect } from "react";
import "./home.css";

const Home = () => {
    useEffect(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedIn');
    },[]);

    return(
        <div id="home">
            <h1>Trello makes it easier for team to manage projects and tasks</h1>
        </div>
    );
}

export default Home;