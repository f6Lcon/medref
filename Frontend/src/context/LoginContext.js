import { createContext } from "react"

const LoginContext = createContext({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  userRole: null,
  setUserRole: () => {},
  permissions: {
    canManageHospitals: false,
    canManageUsers: false,
    canCreateReferrals: false,
    canViewReferrals: false,
    canCreateAppointments: false,
    canViewAppointments: false,
    canViewDoctors: false,
    canBookAppointments: false,
  },
  checkPermission: () => false,
})

export default LoginContext
