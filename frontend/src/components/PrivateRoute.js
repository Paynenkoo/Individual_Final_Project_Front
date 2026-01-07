import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectAuthUser } from "../store/slices/authSlice";

export default function PrivateRoute({ children }) {
  const user = useSelector(selectAuthUser);
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}
