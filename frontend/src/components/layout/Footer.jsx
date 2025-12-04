import './Footer.css';


export default function Footer(){
    return(
        <>
            <footer class="footer">
                <div class="footer-container">

                    <div class="footer-left">
                    <h2 class="footer-logo">Bander</h2>

                    <div class="footer-socials">
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-linkedin"></i></a>
                        <a href="#"><i class="fab fa-youtube"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                    </div>
                    </div>

                    <div class="footer-links">

                    <div class="footer-column">
                        <h3>Artists</h3>
                        <a href="#">Page</a>
                        <a href="#">Page</a>
                        <a href="#">Page</a>
                    </div>

                    <div class="footer-column">
                        <h3>Bands</h3>
                        <a href="#">Page</a>
                        <a href="#">Page</a>
                        <a href="#">Page</a>
                    </div>

                    <div class="footer-column">
                        <h3>Events</h3>
                        <a href="#">Page</a>
                        <a href="#">Page</a>
                        <a href="#">Page</a>
                    </div>

                    </div>
                </div>
            </footer>


        <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>

        </>
    )
}