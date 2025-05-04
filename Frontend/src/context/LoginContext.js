"use client"

import { createContext, useContext } from "react"

const LoginContext = createContext({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  userRole: null,
  setUserRole: () => {},
  user: null,
  setUser: () => {},
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

export const useLoginContext = () => useContext(LoginContext)

export default LoginContext
