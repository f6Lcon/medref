"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  FaCalendarAlt,
  FaClipboardList,
  FaUserCircle,
  FaHospital,
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaExchangeAlt,
  FaFileMedical,
  FaUserMd,
  FaUsers,
  FaPlus,
} from "react-icons/fa"
import LoginContext from "../context/LoginContext"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [userData, setUserData] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [referrals, setReferrals] = useState([])
  const [patients, setPatients] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { setIsLoggedIn, setUserRole } = useContext(LoginContext)

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      try {
        setLoading(true)
        // Fetch user profile data
        const userResponse = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setUserData(userResponse.data)

        // Fetch appointments
        const appointmentsResponse = await axios.get(`${API_URL}/api/appointments/doctor`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setAppointments(appointmentsResponse.data)

        // Fetch referrals (both made by this doctor and to this doctor)
        const referringResponse = await axios.get(`${API_URL}/api/referrals/referring`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const referredResponse = await axios.get(`${API_URL}/api/referrals/referred`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setReferrals([...referringResponse.data, ...referredResponse.data])

        // Fetch patients
        const patientsResponse = await axios.get(`${API_URL}/api/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setPatients(patientsResponse.data)

        // Fetch hospitals
        const hospitalsResponse = await axios.get(`${API_URL}/api/hospitals`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setHospitals(hospitalsResponse.data)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load dashboard data. Please try again.")
        if (err.response?.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("userRole")
          setIsLoggedIn(false)
          setUserRole(null)
          navigate("/login")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate, setIsLoggedIn, setUserRole])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")
    setIsLoggedIn(false)
    setUserRole(null)
    navigate("/login")
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="bg-white w-full md:w-64 shadow-md md:min-h-screen">
        <div className="p-4 border-b">
          <h2 className="text-2xl font-bold text-primary">MEDREF</h2>
          <p className="text-sm text-gray-500">Doctor Portal</p>
        </div>

        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center text-white">
              <FaUserMd size={24} />
            </div>
            <div>
              <p className="font-medium">Dr. {userData?.name || "Doctor"}</p>
              <p className="text-xs text-gray-500">{userData?.doctorData?.specialization || "Specialist"}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "overview" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaClipboardList />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("appointments")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "appointments" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaCalendarAlt />
              <span>Appointments</span>
            </button>

            <button
              onClick={() => setActiveTab("patients")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "patients" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaUsers />
              <span>Patients</span>
            </button>

            <button
              onClick={() => setActiveTab("referrals")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "referrals" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaExchangeAlt />
              <span>Referrals</span>
            </button>

            <button
              onClick={() => setActiveTab("hospitals")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "hospitals" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaHospital />
              <span>Hospitals</span>
            </button>

            <button
              onClick={() => setActiveTab("records")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "records" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaFileMedical />
              <span>Medical Records</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "profile" ? "bg-primary text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaUserCircle />
              <span>My Profile</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 text-red-500 transition"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === "overview"
                ? "Doctor Dashboard"
                : activeTab === "appointments"
                  ? "Appointments"
                  : activeTab === "patients"
                    ? "My Patients"
                    : activeTab === "referrals"
                      ? "Referrals"
                      : activeTab === "hospitals"
                        ? "Hospitals"
                        : activeTab === "records"
                          ? "Medical Records"
                          : "My Profile"}
            </h1>
            <p className="text-gray-500">
              Welcome back, Dr. {userData?.name || "Doctor"}. Here's your practice overview.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex space-x-2">
            <button className="flex items-center space-x-2 bg-white p-2 rounded-md shadow-sm">
              <FaBell className="text-gray-400" />
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                5
              </span>
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Dashboard Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Today's Appointments Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Today's Appointments</h2>
                <button
                  onClick={() => setActiveTab("appointments")}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  View All
                </button>
              </div>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments
                    .filter(
                      (apt) =>
                        new Date(apt.date).toDateString() === new Date().toDateString() &&
                        apt.status !== "cancelled" &&
                        apt.status !== "completed",
                    )
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .slice(0, 3)
                    .map((appointment) => (
                      <div key={appointment._id} className="border-l-4 border-primary pl-4 py-2">
                        <p className="font-medium">
                          {appointment.patient?.user?.name || "Unknown Patient"} - {appointment.time}
                        </p>
                        <p className="text-sm text-gray-500">{appointment.reason}</p>
                        <div className="flex mt-1">
                          <button className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mr-2">Start</button>
                          <button className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Reschedule</button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No appointments scheduled for today.</p>
              )}
            </div>

            {/* Pending Referrals Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Pending Referrals</h2>
                <button
                  onClick={() => setActiveTab("referrals")}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  View All
                </button>
              </div>
              {referrals.length > 0 ? (
                <div className="space-y-4">
                  {referrals
                    .filter(
                      (ref) => ref.status === "pending" && ref.referredToDoctor?._id === userData?.doctorData?._id,
                    )
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 3)
                    .map((referral) => (
                      <div key={referral._id} className="border-l-4 border-yellow-500 pl-4 py-2">
                        <p className="font-medium">Patient: {referral.patient?.user?.name || "Unknown Patient"}</p>
                        <p className="text-sm text-gray-500">
                          From: Dr. {referral.referringDoctor?.user?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-400">{referral.reason}</p>
                        <div className="flex mt-1">
                          <button className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mr-2">Accept</button>
                          <button className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Decline</button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No pending referrals.</p>
              )}
            </div>

            {/* Practice Stats Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Practice Statistics</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Appointments This Week</span>
                    <span className="text-sm font-medium text-gray-700">
                      {
                        appointments.filter(
                          (apt) =>
                            new Date(apt.date) >=
                              new Date(new Date().setDate(new Date().getDate() - new Date().getDay())) &&
                            new Date(apt.date) <=
                              new Date(new Date().setDate(new Date().getDate() + (6 - new Date().getDay()))),
                        ).length
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{
                        width: `${Math.min(
                          (appointments.filter(
                            (apt) =>
                              new Date(apt.date) >=
                                new Date(new Date().setDate(new Date().getDate() - new Date().getDay())) &&
                              new Date(apt.date) <=
                                new Date(new Date().setDate(new Date().getDate() + (6 - new Date().getDay()))),
                          ).length /
                            20) *
                            100,
                          100,
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Referrals Made</span>
                    <span className="text-sm font-medium text-gray-700">
                      {referrals.filter((ref) => ref.referringDoctor?._id === userData?.doctorData?._id).length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-yellow-500 h-2.5 rounded-full"
                      style={{
                        width: `${Math.min(
                          (referrals.filter((ref) => ref.referringDoctor?._id === userData?.doctorData?._id).length /
                            10) *
                            100,
                          100,
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Patients Seen</span>
                    <span className="text-sm font-medium text-gray-700">
                      {appointments.filter((apt) => apt.status === "completed").length}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{
                        width: `${Math.min(
                          (appointments.filter((apt) => apt.status === "completed").length / 50) * 100,
                          100,
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setActiveTab("appointments")}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded-md text-sm transition"
                    >
                      View Schedule
                    </button>
                    <button
                      onClick={() => setActiveTab("referrals")}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded-md text-sm transition"
                    >
                      Create Referral
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Patients Card */}
            <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Patients</h2>
                <button
                  onClick={() => setActiveTab("patients")}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Patient
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Last Visit
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Reason
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 5)
                      .map((appointment) => (
                        <tr key={appointment._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <FaUserCircle className="text-gray-500" size={20} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {appointment.patient?.user?.name || "Unknown Patient"}
                                </div>
                                <div className="text-sm text-gray-500">{appointment.patient?.email || "No email"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(appointment.date)}</div>
                            <div className="text-sm text-gray-500">{appointment.time}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{appointment.reason}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                appointment.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : appointment.status === "scheduled"
                                    ? "bg-blue-100 text-blue-800"
                                    : appointment.status === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-primary hover:text-accent mr-3">View</button>
                            <button className="text-primary hover:text-accent">Notes</button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Upcoming Schedule Card */}
            <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2 lg:col-span-3">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Schedule</h2>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, index) => {
                  const date = new Date()
                  date.setDate(date.getDate() + index)
                  const dayAppointments = appointments.filter(
                    (apt) => new Date(apt.date).toDateString() === date.toDateString(),
                  )

                  return (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="text-center mb-2">
                        <p className="text-sm font-medium text-gray-500">
                          {date.toLocaleDateString("en-US", { weekday: "short" })}
                        </p>
                        <p className="text-lg font-bold">{date.getDate()}</p>
                      </div>
                      <div className="space-y-2">
                        {dayAppointments.length > 0 ? (
                          dayAppointments
                            .sort((a, b) => a.time.localeCompare(b.time))
                            .slice(0, 3)
                            .map((apt) => (
                              <div key={apt._id} className="text-xs p-1 rounded bg-blue-50 border-l-2 border-primary">
                                <p className="font-medium">{apt.time}</p>
                                <p className="truncate">{apt.patient?.user?.name || "Unknown"}</p>
                              </div>
                            ))
                        ) : (
                          <p className="text-xs text-gray-500 text-center">No appointments</p>
                        )}
                        {dayAppointments.length > 3 && (
                          <p className="text-xs text-primary text-center">+{dayAppointments.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Appointment Management</h2>
                <button className="bg-primary text-white py-2 px-4 rounded-md hover:bg-accent transition flex items-center">
                  <FaPlus className="mr-2" />
                  New Appointment
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div className="flex space-x-2 mb-4 md:mb-0">
                  <button className="bg-primary text-white px-3 py-1 rounded-md">All</button>
                  <button className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md">Today</button>
                  <button className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md">Upcoming</button>
                  <button className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md">Completed</button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Patient
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date & Time
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Reason
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.length > 0 ? (
                      appointments
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((appointment) => (
                          <tr key={appointment._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <FaUserCircle className="text-gray-500" size={20} />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {appointment.patient?.user?.name || "Unknown Patient"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {appointment.patient?.email || "No email"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatDate(appointment.date)}</div>
                              <div className="text-sm text-gray-500">{appointment.time}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  appointment.type === "regular"
                                    ? "bg-blue-100 text-blue-800"
                                    : appointment.type === "follow-up"
                                      ? "bg-green-100 text-green-800"
                                      : appointment.type === "emergency"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">{appointment.reason}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  appointment.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : appointment.status === "scheduled"
                                      ? "bg-blue-100 text-blue-800"
                                      : appointment.status === "cancelled"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-primary hover:text-accent mr-3">View</button>
                              {appointment.status === "scheduled" && (
                                <>
                                  <button className="text-green-600 hover:text-green-900 mr-3">Complete</button>
                                  <button className="text-red-600 hover:text-red-900">Cancel</button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          No appointments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === "referrals" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Create New Referral</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Patient
                  </label>
                  <select
                    id="patient"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a patient</option>
                    {patients.map((patient) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.user?.name || "Unknown Patient"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="referredDoctor" className="block text-sm font-medium text-gray-700 mb-1">
                    Refer To Doctor (Optional)
                  </label>
                  <select
                    id="referredDoctor"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a doctor</option>
                    {/* Populate with doctors from API */}
                  </select>
                </div>
                <div>
                  <label htmlFor="referredHospital" className="block text-sm font-medium text-gray-700 mb-1">
                    Refer To Hospital
                  </label>
                  <select
                    id="referredHospital"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select a hospital</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital._id} value={hospital._id}>
                        {hospital.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency
                  </label>
                  <select
                    id="urgency"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium" selected>
                      Medium
                    </option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Referral
                  </label>
                  <textarea
                    id="reason"
                    rows={3}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Please describe the reason for this referral"
                    required
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Any additional notes or information"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <button className="bg-primary text-white py-2 px-4 rounded-md hover:bg-accent transition">
                    Create Referral
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Referrals</h2>
                <div className="flex space-x-2">
                  <button className="bg-primary text-white px-3 py-1 rounded-md">All</button>
                  <button className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md">Sent</button>
                  <button className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md">Received</button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Patient
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Referred To/From
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {referrals.length > 0 ? (
                      referrals
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map((referral) => {
                          const isSent = referral.referringDoctor?._id === userData?.doctorData?._id
                          return (
                            <tr key={referral._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {referral.patient?.user?.name || "Unknown Patient"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    isSent ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {isSent ? "Sent" : "Received"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {isSent
                                    ? `Dr. ${referral.referredToDoctor?.user?.name || "Unknown"}`
                                    : `Dr. ${referral.referringDoctor?.user?.name || "Unknown"}`}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {referral.referredToHospital?.name || "Unknown Hospital"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatDate(referral.createdAt)}</div>
                                <div
                                  className={`text-xs ${
                                    referral.urgency === "low"
                                      ? "text-green-600"
                                      : referral.urgency === "medium"
                                        ? "text-yellow-600"
                                        : referral.urgency === "high"
                                          ? "text-orange-600"
                                          : "text-red-600"
                                  }`}
                                >
                                  {referral.urgency.charAt(0).toUpperCase() + referral.urgency.slice(1)} Urgency
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    referral.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : referral.status === "accepted"
                                        ? "bg-green-100 text-green-800"
                                        : referral.status === "completed"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-primary hover:text-accent mr-3">View</button>
                                {!isSent && referral.status === "pending" && (
                                  <>
                                    <button className="text-green-600 hover:text-green-900 mr-3">Accept</button>
                                    <button className="text-red-600 hover:text-red-900">Decline</button>
                                  </>
                                )}
                                {!isSent && referral.status === "accepted" && !referral.appointmentCreated && (
                                  <button className="text-primary hover:text-accent">Schedule Appointment</button>
                                )}
                              </td>
                            </tr>
                          )
                        })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          No referrals found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would be implemented similarly */}
      </div>
    </div>
  )
}

export default DoctorDashboard
