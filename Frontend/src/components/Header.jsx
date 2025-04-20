"use client"

import { useState, useEffect, useContext } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FaUser, FaSignInAlt, FaBars, FaTimes, FaSignOutAlt, FaUserMd, FaUserCog, FaUserInjured } from "react-icons/fa"
import Logo from "../assets/logo.svg"
import LoginContext from "../context/LoginContext"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeItem, setActiveItem] = useState("/")
  const location = useLocation()
  const navigate = useNavigate()
  const { isLoggedIn, setIsLoggedIn, userRole, setUserRole } = useContext(LoginContext)

  useEffect(() => {
    setActiveItem(location.pathname)
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")
    setIsLoggedIn(false)
    setUserRole(null)
    navigate("/login")
    setIsMenuOpen(false)
  }

  // Define navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      { title: "Home", path: "/" },
    ]

    if (!isLoggedIn) {
      return commonItems
    }

    if (userRole === "admin") {
      return [
        ...commonItems,
        { title: "Dashboard", path: "/admin-dashboard" },
      ]
    }

    if (userRole === "doctor") {
      return [
        ...commonItems,
        { title: "Dashboard", path: "/doctor-dashboard" },
      ]
    }

    if (userRole === "patient") {
      return [
        ...commonItems,
        { title: "Dashboard", path: "/patient-dashboard" },

      ]
    }

    return commonItems
  }

  const navItems = getNavItems()

  const getRoleIcon = () => {
    if (userRole === "admin") return <FaUserCog className="inline-block mr-1" />
    if (userRole === "doctor") return <FaUserMd className="inline-block mr-1" />
    if (userRole === "patient") return <FaUserInjured className="inline-block mr-1" />
    return null
  }

  return (
    <header className="bg-gradient-to-r from-primary to-secondary py-3 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src={Logo || "/placeholder.svg"} alt="MEDREF Logo" className="h-10 w-auto" />
            <span className="text-2xl font-bold text-accent">MEDREF</span>
          </Link>

          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 py-2 text-base font-medium text-light hover:text-accent transition-colors duration-300 ${
                  activeItem === item.path ? "text-accent" : ""
                }`}
              >
                {item.title}
                {activeItem === item.path && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                    layoutId="underline"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <div className="text-light mr-2">
                  {getRoleIcon()}
                  <span className="text-sm font-medium">{userRole}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-light text-primary px-4 py-1.5 rounded-full hover:bg-accent transition duration-300 text-sm font-medium"
                >
                  <FaSignOutAlt className="inline-block mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-accent text-primary px-4 py-1.5 rounded-full hover:bg-light transition duration-300 text-sm font-medium"
                >
                  <FaUser className="inline-block mr-1" />
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="bg-light text-primary px-4 py-1.5 rounded-full hover:bg-accent transition duration-300 text-sm font-medium"
                >
                  <FaSignInAlt className="inline-block mr-1" />
                  Log In
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-light focus:outline-none" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-3"
            >
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block py-2 px-3 text-base font-medium text-light hover:text-accent transition duration-300 ${
                    activeItem === item.path ? "text-accent" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}

              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 px-3 text-base font-medium text-light hover:text-accent transition duration-300"
                >
                  <FaSignOutAlt className="inline-block mr-1" />
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="block py-2 px-3 text-base font-medium text-light hover:text-accent transition duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUser className="inline-block mr-1" />
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    className="block py-2 px-3 text-base font-medium text-light hover:text-accent transition duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaSignInAlt className="inline-block mr-1" />
                    Log In
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

export default Header
