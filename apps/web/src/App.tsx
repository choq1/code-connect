import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './components/pages/LoginPage/LoginPage'
import { SignupPage } from './components/pages/SignupPage/SignupPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<SignupPage />} />
    </Routes>
  )
}

export default App
