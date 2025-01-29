import React from 'react'
import { useAuth } from '../context/Authprovider';
import { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';

function Login() {
  const [authClient, setAuthClient,authenticated, setAuthenticated] = useAuth();
  
  
  const handleLogin = async ()=> {
    await authClient.login({
      identityProvider: process.env.DFX_NETWORK === "ic"
                            ? "https://identity.ic0.app/"
                            : "http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943",
      onError: (error) => {
        setAuthenticated(false);
        console.error(error);
      },
      onSuccess: (response) => {
        console.log(response);
        setAuthenticated(true);
        console.log('Logged in');
      },
    });
  }


  useEffect(() => {
    (async () => {
      const authClient = await AuthClient.create();
      setAuthClient(authClient);
    })();
  }, []);

  return (
    <div className="home grid">
      <div className="place-self-center card bg-base-100 w-96 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Login with!</h2>
          <p></p>
          <div className="card-actions">
            <button
              onClick={handleLogin}
              className="flex gap-2 justify-center items-center py-1 px-4 border-2  rounded-xl cursor-pointer border-blue-900 hover:bg-blue-900 hover:text-white duration-300 ease-in-out">
              <span className="text-md lg:text-lg md:text-lg font-semibold">
                Internet Identity
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login;