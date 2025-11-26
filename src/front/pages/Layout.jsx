import { Outlet } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar"; 
import { Footer } from "../components/Footer"; 
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useEffect } from "react"; 
import useTheme from '../hooks/useTheme.jsx';

const Layout = () => {
    const { theme } = useTheme();

    return (
        <div style={{ 
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
        }}>
            <ScrollToTop>
                <Navbar />

                <main style={{ flex: 1 }}>
                    <Outlet />
                </main>

                <Footer />
            </ScrollToTop>
        </div>
    );
}

export default Layout;