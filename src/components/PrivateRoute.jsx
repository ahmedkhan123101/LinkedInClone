import { Spin } from 'antd'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useSelector((state) => state.auth)
    if (loading) return <Spin />
    return isAuthenticated ? children : <Navigate to="/signin" replace />
}

export default PrivateRoute