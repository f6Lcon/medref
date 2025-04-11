"use client"

import { useContext } from "react"
import LoginContext from "../context/LoginContext"

/**
 * A component that conditionally renders its children based on user permissions
 *
 * @param {Object} props
 * @param {string|string[]} props.requiredPermission - The permission(s) required to view the content
 * @param {React.ReactNode} props.children - The content to render if the user has permission
 * @param {React.ReactNode} props.fallback - Optional content to render if the user doesn't have permission
 */
const PermissionGuard = ({ requiredPermission, children, fallback = null }) => {
  const { checkPermission } = useContext(LoginContext)

  // If requiredPermission is an array, check if the user has any of the permissions
  if (Array.isArray(requiredPermission)) {
    const hasAnyPermission = requiredPermission.some((permission) => checkPermission(permission))
    return hasAnyPermission ? children : fallback
  }

  // Otherwise, check for a single permission
  return checkPermission(requiredPermission) ? children : fallback
}

export default PermissionGuard
