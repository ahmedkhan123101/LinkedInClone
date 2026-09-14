import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Spin } from "antd";

const PublicRoute = () => {
    const { isAuthenticated, loading } = useSelector((state) => state.auth);
    if (loading) return <Spin />;
    return isAuthenticated ? <Navigate to='/feed' replace /> : <Outlet />
}

export default PublicRoute;