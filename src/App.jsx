import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmptyPage from './pages/EmptyPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Settings from './pages/Settings';
import Departments from './pages/Departments';
import UserEntry from './pages/UserEntry';
import ClassList from './pages/ClassList';
// npx prisma generate
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserList from './pages/UserList';
import UserEdit from './pages/UserEdit';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<EmptyPage />} />

          <Route path="academic">
            <Route path="userlist" element={<UserList />} />
            <Route path="user_edit/:userId" element={<UserEdit />} />
            <Route path="user_entry/:classid" element={<UserEntry />} />
            <Route path="classlist" element={<ClassList />} />
          </Route>
          
          <Route path="settings" element={<Settings />} />
          <Route path="departments" element={<Departments />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
        toastClassName="custom-toast"
        progressClassName="custom-toast-progress"
      />
    </BrowserRouter>
  );
}
