import React, { useEffect } from "react";
import "../styles.css";

const Home = () => {
    useEffect(() => {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem("email");
    },[]);

    return(
        <div id="home">
            <h1>Trello makes it easier for team to manage projects and tasks</h1>
        </div>
    );
}

export default Home;