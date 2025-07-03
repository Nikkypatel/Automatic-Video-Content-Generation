import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, Container } from '@mui/material'

// Layout components
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

// Page components
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ImageGeneration from './pages/ImageGeneration'
import VideoGeneration from './pages/VideoGeneration'
import VideoTranslation from './pages/VideoTranslation'

// Auth context
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function AppContent() {
  return (
    <Box className="page-container">
      <Header />
      <Box component="main" className="content-container">
        <Container maxWidth="lg">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/image-generation" element={
              <ProtectedRoute>
                <ImageGeneration />
              </ProtectedRoute>
            } />
            <Route path="/video-generation" element={
              <ProtectedRoute>
                <VideoGeneration />
              </ProtectedRoute>
            } />
            <Route path="/video-translation" element={
              <ProtectedRoute>
                <VideoTranslation />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </Box>
      <Footer />
    </Box>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App