import { useState } from 'react';
import { note_sharing_backend } from '../../declarations/note_sharing_backend';
import { useAuth } from './context/Authprovider';
import Home from './components/Home';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

function App() {
  const [greeting, setGreeting] = useState('');
  const [authClient, setAuthClient,authenticated, setAuthenticated] = useAuth();

  function getPrincipal(event) {
    event.preventDefault();
    note_sharing_backend.get_principal().then((greeting) => {
      setGreeting(greeting);
    });
    return false;
  }

  return (
    <>
      <Navbar />
        <Routes>
          <Route
            path="/"
            element={authenticated ? <Home /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={authenticated ? <Navigate to="/" /> : <Login />}
          />
        </Routes>
      <Footer />
      <Toaster />
    </>
  );
}

export default App;
