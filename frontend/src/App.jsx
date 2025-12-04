import Footer from './components/layout/Footer.jsx';
import './styles/global.css'
import Navbar from './components/layout/Navbar.jsx';
import AppRouter from './routes/AppRouter.jsx';



export default function App() {
  return (
    <div className="app-wrapper">
      <Navbar />

      <main className="page-content">
        <AppRouter />
      </main>

      <Footer />
    </div>
  );
}

