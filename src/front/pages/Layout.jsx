
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import useTheme from '../hooks/useTheme.jsx';

const Layout = () => {
    // Inicializar el hook. El hook se encarga de aplicar la clase 'dark-mode' al <html>.
    const { theme } = useTheme();

    return (
        <div className="app-container">
            <Navbar />
            <main>
                { }
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default Layout;