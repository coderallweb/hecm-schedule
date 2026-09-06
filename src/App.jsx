//import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/login.jsx'
import HomePage from './pages/dashboard.jsx'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/layout.jsx'
import EditSchedule from './pages/view_edit_schedule.jsx'
import ExportPlanning from './pages/exportPlanning.jsx'


function App() {
  
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/export/schedule/:filiereId/:niveauCode" element={<ExportPlanning />} />
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/schedule/:filiereId" element={<EditSchedule />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;
