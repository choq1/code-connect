import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './components/pages/LoginPage/LoginPage'
import { SignupPage } from './components/pages/SignupPage/SignupPage'
import { HomePage } from './components/pages/HomePage/HomePage'
import { FeedPage } from './components/pages/FeedPage/FeedPage'
import { PostDetailPage } from './components/pages/PostDetailPage/PostDetailPage'
import { CreatePostPage } from './components/pages/CreatePostPage/CreatePostPage'
import { RequireAuth } from './components/molecules/RequireAuth/RequireAuth'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/feed" replace />} />
      <Route path="/feed" element={<FeedPage />} />
      <Route path="/posts/:id" element={<PostDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<SignupPage />} />
      <Route
        path="/publicar"
        element={
          <RequireAuth>
            <CreatePostPage />
          </RequireAuth>
        }
      />
      <Route
        path="/home"
        element={
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        }
      />
    </Routes>
  )
}

export default App
