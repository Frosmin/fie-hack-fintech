import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { Dashboard } from './features/dashboard/Dashboard'
import { Business } from './features/business/Business'
import { Calculator } from './features/calculator/Calculator'
import { Chatbot } from './features/chatbot/Chatbot'
import { AuthPage } from './features/auth/AuthPage'
import { ActivityDetails } from './features/activityDetails/ActivityDetails'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'business', element: <Business /> },
      { path: 'calculator', element: <Calculator /> },
      { path: 'chatbot', element: <Chatbot /> },
      { path: 'activity/:id', element: <ActivityDetails /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)