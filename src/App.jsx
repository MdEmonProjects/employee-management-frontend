import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
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
import TimeShiftList from './pages/TimeShiftList';
import TimeCheckList from './pages/TimeCheckList';
import TimeSetting from './pages/TimeSettings';
import SessionList from './pages/SessionList';
import InstituteInfo from './pages/InstituteInfo';
import StaffEntry from './pages/StaffEntry';
import GuardianList from './pages/GuardianList';
import GuardianLinks from './pages/GuardianLinks';
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
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="academic">
            <Route path="userlist" element={<UserList userType={1} />} />
            <Route path="user_edit/:userId" element={<UserEdit />} />
            <Route path="user_entry/:classid" element={<UserEntry />} />
            <Route path="classlist" element={<ClassList />} />
            <Route path="sessionlist" element={<SessionList />} />
          </Route>
          <Route path="staff">
            <Route index element={<Navigate to="list" replace />} />
            <Route path="list" element={<UserList userType={2} />} />
            <Route path="new" element={<StaffEntry />} />
            <Route path="edit/:userId" element={<UserEdit />} />
          </Route>
          <Route path="guardians">
            <Route index element={<Navigate to="list" replace />} />
            <Route path="list" element={<GuardianList />} />
            <Route path="new" element={<StaffEntry userType={3} />} />
            <Route path="edit/:userId" element={<UserEdit />} />
            <Route path="link" element={<GuardianLinks />} />
            <Route path=":guardianId/students" element={<GuardianLinks />} />
          </Route>
          <Route path="timesetting">
            <Route index element={<TimeSetting />} />
            <Route path="shiftlist" element={<TimeShiftList />} />
            <Route path="timechecklist" element={<TimeCheckList />} />
          </Route>

          <Route path="settings" element={<Settings />} />
          <Route path="settings/institute-info" element={<InstituteInfo />} />
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
