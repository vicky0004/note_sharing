import React, { createContext, useContext, useState } from 'react'
export const AuthContext = createContext();


export const AuthProvider = ({children})=> {
  const [authClient, setAuthClient] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  return (
    <AuthContext.Provider value={[authClient, setAuthClient,authenticated, setAuthenticated]}>
        {children}
    </AuthContext.Provider>
  )
}
export const  useAuth=()=>useContext(AuthContext);
