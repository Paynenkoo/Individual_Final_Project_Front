// frontend/src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import PrivateRoute from "./components/PrivateRoute";
import ScrollToTop from "./components/ScrollToTop";

// Сторінки
import Home from "./pages/Home/Home";
import Search from "./pages/Search/Search";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

import Guides from "./pages/Guides/Guides";
import GuideDetails from "./pages/GuideDetails/GuideDetails";

import Quizzes from "./pages/Quizzes/Quizzes";
import QuizDetails from "./pages/QuizDetails/QuizDetails";

import Bazilka from "./pages/Bazilka/Bazilka";

import Notes from "./pages/Notes/Notes";
import Profile from "./pages/Profile/Profile";

import Awards from "./pages/Awards/Awards";
import ProgressPage from "./pages/Progress/Progress";

import FollowerList from "./pages/followers/FollowerList";
import AccountSettings from "./pages/AccountSettings/AccountSettings";
import Account from "./pages/Account/Account";

import Logout from "./pages/Logout/Logout";

import { fetchMeThunk, selectAuthUser } from "./store/slices/authSlice";

export default function App() {
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      dispatch(fetchMeThunk());
    }
  }, [dispatch, user]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <main className="app-container">
        <Routes>
          {/* Публічні сторінки */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Guides */}
          <Route path="/guides" element={<Guides />} />
          <Route path="/guides/:id" element={<GuideDetails />} />

          {/* Quizzes */}
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/quizzes/:id" element={<QuizDetails />} />

          {/* Bazilka */}
          <Route path="/bazilka" element={<Bazilka />} />

          {/* Профілі/акаунт */}
          <Route path="/account/:id" element={<Account />} />
          <Route path="/profile/:id" element={<Profile />} />
           {/* Досягнення */}
          <Route path="/awards" element={<Awards />} />


          {/* Список фоловерів (можна зробити захищеним, якщо хочеш) */}
          <Route
            path="/followers"
            element={
              <PrivateRoute>
                <FollowerList />
              </PrivateRoute>
            }
          />

          {/* Приватні сторінки (потрібен логін) */}
          <Route
            path="/progress/:id"
            element={
              <PrivateRoute>
                <ProgressPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/notes"
            element={
              <PrivateRoute>
                <Notes />
              </PrivateRoute>
            }
          />

          <Route
            path="/account/settings"
            element={
              <PrivateRoute>
                <AccountSettings />
              </PrivateRoute>
            }
          />

          {/* Вихід */}
          <Route path="/logout" element={<Logout />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

/** Проста 404-сторінка */
function NotFound() {
  return (
    <div className="card">
      <h1 className="h1">404</h1>
      <p className="muted">Сторінку не знайдено. Перевір URL або повернись на головну.</p>
    </div>
  );
}
