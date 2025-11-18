import { Outlet } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import Register from "./Register"

// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
export const Layout = () => {
   return (
        <ScrollToTop>
            <div className="d-flex flex-column min-vh-100">
                <Navbar />

                <main className="flex-grow-1">
                    <Outlet />
                </main>

                <Footer />
            </div>
        </ScrollToTop>
    )
}
