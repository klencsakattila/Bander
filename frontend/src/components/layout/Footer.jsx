import './Footer.css';
import { FaInstagram, FaFacebook, FaYoutube, FaSpotify } from "react-icons/fa";


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
                        <h3>Artists</h3>
                    </div>

                    <div className="footer-column">
                        <h3>Bands</h3>
                    </div>

                    <div className="footer-column">
                        <h3>Events</h3>
                    </div>

                    </div>
                </div>
            </footer>



        </>
    )
}