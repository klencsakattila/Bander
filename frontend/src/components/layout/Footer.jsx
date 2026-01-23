import React from 'react';
import './Footer.css';
import { FaInstagram, FaFacebook, FaYoutube, FaSpotify } from "react-icons/fa";
import { Link } from 'react-router-dom';


export default function Footer(){
    return(
        <>
            <footer className="footer">
                <div className="footer-container">

                    <div className="footer-left">
                        <h2 className="footer-logo">Bander</h2>

                        <div className="footer-socials">
                            <FaSpotify />
                            <FaInstagram />
                            <FaFacebook />
                            <FaYoutube />
                        </div>
                    </div>

                    <div className="footer-links">

                    <div className="footer-column">
                        <Link to="/artists"><h3>Artists</h3></Link>
                    </div>

                    <div className="footer-column">
                        <Link to="/bands"><h3>Bands</h3></Link>
                    </div>

                    <div className="footer-column">
                        <Link to="/about"><h3>About Us</h3></Link>
                    </div>

                    </div>
                </div>
            </footer>



        </>
    )
}