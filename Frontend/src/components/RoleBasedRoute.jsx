"use client"

import { useContext } from "react"
import { Navigate } from "react-router-dom"
import LoginContext from "../context/LoginContext"

/**
 * A component that restricts access to routes based on user roles
 *
 * @param {Object} props
 * @param {string|string[]} props.allowedRoles - The role(s) allowed to access this route
 * @param {React.ReactNode} props.children - The route content to render if authorized
 * @param {string} props.redirectTo - Where to redirect if not authorized (default: "/login")
 */
const RoleBasedRoute = ({ allowedRoles, children, redirectTo = "/login" }) => {
  const { isLoggedIn, userRole } = useContext(LoginContext)

  // If not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace />
  }

  // Check if user role is in the allowed roles
  const hasAllowedRole = Array.isArray(allowedRoles) ? allowedRoles.includes(userRole) : userRole === allowedRoles

  // If user doesn't have an allowed role, redirect
  if (!hasAllowedRole) {
    // Redirect to appropriate dashboard based on role
    if (userRole === "admin") {
      return <Navigate to="/admin-dashboard" replace />
    } else if (userRole === "doctor") {
      return <Navigate to="/doctor-dashboard" replace />
    } else if (userRole === "patient") {
      return <Navigate to="/patient-dashboard" replace />
    } else {
      return <Navigate to="/" replace />
    }
  }

  // User is authorized, render the route
  return children
}

export default RoleBasedRoute
