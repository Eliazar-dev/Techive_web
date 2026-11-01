import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import { AuthProvider } from './lib/auth'
import './index.css'

const GID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const app = (
  <BrowserRouter>
    <AuthProvider><App /></AuthProvider>
  </BrowserRouter>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>{GID ? <GoogleOAuthProvider clientId={GID}>{app}</GoogleOAuthProvider> : app}</React.StrictMode>
)
