import Footer from './components/layout/Footer.jsx';
import './styles/global.css'
import Navbar from './components/layout/Navbar.jsx';
import AppRouter from './routes/AppRouter.jsx';



function App() {
  return (
    <>
      <Navbar />
      <AppRouter />
      
      <Footer />
    </>
  );
}

export default App;
