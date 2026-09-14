import { Routes, Route, Navigate } from "react-router-dom"

import Profile from "./pages/Profile.jsx"
import Feed from "./pages/Feed.jsx"
import SignUp from "./pages/SignUp.jsx"
import SignIn from "./pages/SignIn.jsx"
import PrivateRoute from "./components/PrivateRoute.jsx"
import PublicRoute from "./components/PublicRoute.jsx"
import Network from "./pages/Network.jsx"
import MyActivity from "./pages/MyActivity.jsx"

import { message } from 'antd';
import { useDispatch } from "react-redux"
import { fetchCurrentUser } from './redux/slices/authSlice.js'
import { useEffect } from "react"

message.config({
  duration: 3,
  rtl: false,
});

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/feed" replace />} />

      {/* For logged out users only. */}
      {/* Outlet in PublicRoute shows either SignIn or Up. */}
      <Route element={<PublicRoute />}>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
      </Route>

      {/* For logged in users only */}
      <Route path='/' element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } />

      <Route path='/feed' element={
        <PrivateRoute>
          <Feed />
        </PrivateRoute>
      } />

      <Route path='/network' element={
        <PrivateRoute>
          <Network />
        </PrivateRoute>
      } />

      <Route path='/my-activity' element={
        <PrivateRoute>
          <MyActivity />
        </PrivateRoute>
      } />
      <Route path='/profile' element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } />

      <Route path="/*" element={<p>Not found</p>} />
    </Routes>
  )
}

export default App
