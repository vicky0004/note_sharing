import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/Authprovider';

function Navbar() {
    const [authClient,setAuthClient,authenticated, setAuthenticated] = useAuth();
    const handleLogout = async() => {
        await authClient?.logout();
        setAuthenticated(false);
        console.log('Logged out');
    }
    return (
        <div className="navbar ">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                        <li><Link to="/">Homepage</Link></li>
                        <li><a>Portfolio</a></li>
                        <li><a>About</a></li>
                    </ul>
                </div>

            <div className="navbar-center ">
                <Link to="/" className="btn btn-ghost text-xl">Note Sharing App</Link>
            </div>
            </div>
            <div className="navbar-end">
                {authenticated ?
                    <button className="btn btn-error " onClick={handleLogout}>Logout</button>
                    :
                    <button className="btn btn-outline "><Link to="/login"> Login</Link></button>
                }
            </div>
        </div>
    )
}

export default Navbar;
