import './Footer.css';


export default function Footer(){
    return(
        <>
            <footer className="footer">
                <div className="footer-container">

                    <div className="footer-left">
                        <h2 className="footer-logo">Bander</h2>

                        <div className="footer-socials">
                            <a href="#">asd</a>
                            <a href="#">asd</a>
                            <a href="#">asd</a>
                            <a href="#">asd</a>
                        </div>
                    </div>

                    <div className="footer-links">

                    <div className="footer-column">
                        <h3>Artists</h3>
                        <a href="#">Page</a>
                        <a href="#">Page</a>
                        <a href="#">Page</a>
                    </div>

                    <div className="footer-column">
                        <h3>Bands</h3>
                        <a href="#">Page</a>
                        <a href="#">Page</a>
                        <a href="#">Page</a>
                    </div>

                    <div className="footer-column">
                        <h3>Events</h3>
                        <a href="#">Page</a>
                        <a href="#">Page</a>
                        <a href="#">Page</a>
                    </div>

                    </div>
                </div>
            </footer>



        </>
    )
}