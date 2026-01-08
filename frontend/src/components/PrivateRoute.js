import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import {
  selectAuthUser,
  selectAuthStatus,
  selectAuthInited,
} from "../store/slices/authSlice";

export default function PrivateRoute({ children }) {
  const user = useSelector(selectAuthUser);
  const status = useSelector(selectAuthStatus);
  const inited = useSelector(selectAuthInited);
  const location = useLocation();

  if (!inited || status === "loading") {
    return null; 
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
