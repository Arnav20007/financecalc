import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import AdSlot from '../common/AdSlot';

export default function Layout() {
    const location = useLocation();

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className="page-wrapper">
            <Header />
            <AdSlot type="header" />
            <main className="main-content">
                <div className="container">
                    <Outlet />
                </div>
            </main>
            <AdSlot type="bottom" />
            <Footer />
        </div>
    );
}
