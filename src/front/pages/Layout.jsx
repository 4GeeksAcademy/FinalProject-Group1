import { Outlet } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import useGlobalReducer from "../hooks/useGlobalReducer"
import { useEffect } from "react"
// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
export const Layout = () => {
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
