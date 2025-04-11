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
  FaPlus,
  FaSearch,
  FaExchangeAlt,
  FaFileMedical,
  FaUserMd,
} from "react-icons/fa"
import LoginContext from "../context/LoginContext"
import BookAppointmentForm from "./BookAppointmentForm"
import HospitalSearch from "./HospitalSearch"
import DoctorSearch from "./DoctorSearch"
import MedicalRecordUpload from "./MedicalRecordUpload"
import MedicalRecordsList from "./MedicalRecordsList"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [userData, setUserData] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedHospital, setSelectedHospital] = useState(null)
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
        const appointmentsResponse = await axios.get(`${API_URL}/api/appointments/patient`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setAppointments(appointmentsResponse.data)

        // Fetch referrals
        const referralsResponse = await axios.get(`${API_URL}/api/referrals/patient`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setReferrals(referralsResponse.data)
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

  const handleAppointmentSuccess = (newAppointment) => {
    setAppointments([newAppointment, ...appointments])
    setActiveTab("appointments")
  }

  const handleMedicalRecordSuccess = (newRecord) => {
    // You would typically refresh the medical records list here
    // For now, we'll just show a success message
    alert("Medical record uploaded successfully!")
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
          <p className="text-sm text-gray-500">Patient Portal</p>
        </div>

        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-accent rounded-full w-10 h-10 flex items-center justify-center text-white">
              <FaUserCircle size={24} />
            </div>
            <div>
              <p className="font-medium">{userData?.name || "Patient"}</p>
              <p className="text-xs text-gray-500">{userData?.email || ""}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "overview" ? "bg-accent text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaClipboardList />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("appointments")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "appointments" ? "bg-accent text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaCalendarAlt />
              <span>Appointments</span>
            </button>

            <button
              onClick={() => setActiveTab("referrals")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "referrals" ? "bg-accent text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaExchangeAlt />
              <span>Referrals</span>
            </button>

            <button
              onClick={() => setActiveTab("doctors")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "doctors" ? "bg-accent text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaUserMd />
              <span>Find Doctors</span>
            </button>

            <button
              onClick={() => setActiveTab("hospitals")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "hospitals" ? "bg-accent text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaHospital />
              <span>Hospitals</span>
            </button>

            <button
              onClick={() => setActiveTab("records")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "records" ? "bg-accent text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaFileMedical />
              <span>Medical Records</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center space-x-3 p-3 rounded-md transition ${
                activeTab === "profile" ? "bg-accent text-white" : "hover:bg-gray-100"
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
                ? "Dashboard Overview"
                : activeTab === "appointments"
                  ? "My Appointments"
                  : activeTab === "referrals"
                    ? "My Referrals"
                    : activeTab === "doctors"
                      ? "Find Doctors"
                      : activeTab === "hospitals"
                        ? "Hospitals"
                        : activeTab === "records"
                          ? "Medical Records"
                          : "My Profile"}
            </h1>
            <p className="text-gray-500">
              Welcome back, {userData?.name || "Patient"}. Here's what's happening with your health.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex space-x-2">
            <button className="flex items-center space-x-2 bg-white p-2 rounded-md shadow-sm">
              <FaBell className="text-gray-400" />
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Upcoming Appointments Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h2>
                <button
                  onClick={() => setActiveTab("appointments")}
                  className="text-accent hover:underline text-sm font-medium"
                >
                  View All
                </button>
              </div>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments
                    .filter((apt) => new Date(apt.date) >= new Date())
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 3)
                    .map((appointment) => (
                      <div key={appointment._id} className="border-l-4 border-accent pl-4 py-2">
                        <p className="font-medium">Dr. {appointment.doctor?.user?.name || "Unknown Doctor"}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(appointment.date)} at {appointment.time}
                        </p>
                        <p className="text-xs text-gray-400">{appointment.reason}</p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No upcoming appointments.</p>
              )}
              <button
                onClick={() => setActiveTab("appointments")}
                className="mt-4 w-full bg-accent text-white py-2 rounded-md hover:bg-primary hover:text-accent transition flex items-center justify-center space-x-2"
              >
                <FaPlus size={14} />
                <span>Schedule New Appointment</span>
              </button>
            </div>

            {/* Recent Referrals Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Referrals</h2>
                <button
                  onClick={() => setActiveTab("referrals")}
                  className="text-accent hover:underline text-sm font-medium"
                >
                  View All
                </button>
              </div>
              {referrals.length > 0 ? (
                <div className="space-y-4">
                  {referrals
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 3)
                    .map((referral) => (
                      <div key={referral._id} className="border-l-4 border-primary pl-4 py-2">
                        <div className="flex justify-between">
                          <p className="font-medium">
                            To: Dr. {referral.referredToDoctor?.user?.name || "Unknown Doctor"}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
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
                        </div>
                        <p className="text-sm text-gray-500">
                          From: Dr. {referral.referringDoctor?.user?.name || "Unknown Doctor"}
                        </p>
                        <p className="text-xs text-gray-400">{referral.reason}</p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No referrals found.</p>
              )}
            </div>

            {/* Health Stats Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Health</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Appointments Completed</span>
                    <span className="text-sm font-medium text-gray-700">
                      {appointments.filter((apt) => apt.status === "completed").length}/{appointments.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{
                        width: `${
                          appointments.length
                            ? (appointments.filter((apt) => apt.status === "completed").length / appointments.length) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Referrals Completed</span>
                    <span className="text-sm font-medium text-gray-700">
                      {referrals.filter((ref) => ref.status === "completed").length}/{referrals.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full"
                      style={{
                        width: `${
                          referrals.length
                            ? (referrals.filter((ref) => ref.status === "completed").length / referrals.length) * 100
                            : 0
                        }%`,
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
                      Book Appointment
                    </button>
                    <button
                      onClick={() => setActiveTab("doctors")}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded-md text-sm transition"
                    >
                      Find Doctor
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2 lg:col-span-3">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
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
                        Activity
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Details
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Combine appointments and referrals for activity feed */}
                    {[
                      ...appointments.map((apt) => ({
                        id: apt._id,
                        date: new Date(apt.createdAt || apt.date),
                        type: "appointment",
                        title: `Appointment with Dr. ${apt.doctor?.user?.name || "Unknown"}`,
                        details: apt.reason,
                        status: apt.status,
                      })),
                      ...referrals.map((ref) => ({
                        id: ref._id,
                        date: new Date(ref.createdAt),
                        type: "referral",
                        title: `Referral to Dr. ${ref.referredToDoctor?.user?.name || "Unknown"}`,
                        details: ref.reason,
                        status: ref.status,
                      })),
                    ]
                      .sort((a, b) => b.date - a.date)
                      .slice(0, 5)
                      .map((activity) => (
                        <tr key={`${activity.type}-${activity.id}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(activity.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                  activity.type === "appointment" ? "bg-accent" : "bg-primary"
                                } text-white`}
                              >
                                {activity.type === "appointment" ? (
                                  <FaCalendarAlt size={14} />
                                ) : (
                                  <FaExchangeAlt size={14} />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                                <div className="text-sm text-gray-500">
                                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.details}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                activity.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : activity.status === "scheduled" || activity.status === "accepted"
                                    ? "bg-blue-100 text-blue-800"
                                    : activity.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                              }`}
                            >
                              {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {activeTab === "appointments" && (
          <div className="space-y-6">
            <BookAppointmentForm
              onSuccess={handleAppointmentSuccess}
              selectedDoctor={selectedDoctor}
              selectedHospital={selectedHospital}
            />

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Appointments</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Doctor
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Hospital
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
                              <div className="text-sm font-medium text-gray-900">
                                Dr. {appointment.doctor?.user?.name || "Unknown"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {appointment.doctor?.specialization || "Specialist"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {appointment.hospital?.name || "Unknown Hospital"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatDate(appointment.date)}</div>
                              <div className="text-sm text-gray-500">{appointment.time}</div>
                            </td>
                            <td className="px-6 py-4">
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
                              <button className="text-accent hover:text-primary mr-3">View</button>
                              {appointment.status === "scheduled" && (
                                <button className="text-red-600 hover:text-red-900">Cancel</button>
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

        {activeTab === "referrals" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Referrals</h2>
            {referrals.length > 0 ? (
              <div className="space-y-6">
                {referrals
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((referral) => (
                    <div key={referral._id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center mb-2">
                            <span
                              className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                referral.status === "pending"
                                  ? "bg-yellow-500"
                                  : referral.status === "accepted"
                                    ? "bg-green-500"
                                    : referral.status === "completed"
                                      ? "bg-blue-500"
                                      : "bg-red-500"
                              }`}
                            ></span>
                            <h3 className="text-lg font-medium text-gray-900">
                              Referral to Dr. {referral.referredToDoctor?.user?.name || "Unknown"}
                            </h3>
                            <span
                              className={`ml-3 text-xs px-2 py-1 rounded-full ${
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
                          </div>
                          <p className="text-sm text-gray-500 mb-1">
                            <span className="font-medium">From:</span> Dr.{" "}
                            {referral.referringDoctor?.user?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500 mb-1">
                            <span className="font-medium">Hospital:</span>{" "}
                            {referral.referredToHospital?.name || "Unknown Hospital"}
                          </p>
                          <p className="text-sm text-gray-500 mb-1">
                            <span className="font-medium">Date:</span> {formatDate(referral.createdAt)}
                          </p>
                          <p className="text-sm text-gray-500 mb-1">
                            <span className="font-medium">Urgency:</span>{" "}
                            <span
                              className={`${
                                referral.urgency === "low"
                                  ? "text-green-600"
                                  : referral.urgency === "medium"
                                    ? "text-yellow-600"
                                    : referral.urgency === "high"
                                      ? "text-orange-600"
                                      : "text-red-600"
                              }`}
                            >
                              {referral.urgency.charAt(0).toUpperCase() + referral.urgency.slice(1)}
                            </span>
                          </p>
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">Reason:</p>
                            <p className="text-sm text-gray-600">{referral.reason}</p>
                          </div>
                          {referral.notes && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700">Notes:</p>
                              <p className="text-sm text-gray-600">{referral.notes}</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 md:mt-0">
                          {referral.status === "accepted" && !referral.appointmentCreated && (
                            <button className="bg-accent text-white py-2 px-4 rounded-md hover:bg-primary hover:text-accent transition">
                              Schedule Appointment
                            </button>
                          )}
                          <button className="ml-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500">No referrals found.</p>
            )}
          </div>
        )}

        {activeTab === "doctors" && (
          <div className="space-y-6">
            <DoctorSearch
              onSelectDoctor={(doctor) => {
                setSelectedDoctor(doctor)
                setActiveTab("appointments")
              }}
            />
          </div>
        )}

        {activeTab === "hospitals" && (
          <div className="space-y-6">
            <HospitalSearch
              onSelectHospital={(hospital) => {
                setSelectedHospital(hospital)
                setActiveTab("appointments")
              }}
            />
          </div>
        )}

        {activeTab === "records" && (
          <div className="space-y-6">
            <MedicalRecordUpload patientId={userData?.patientData?._id} onUploadSuccess={handleMedicalRecordSuccess} />
            <MedicalRecordsList patientId={userData?.patientData?._id} />
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={userData?.name || ""}
                    readOnly
                    className="w-full border border-gray-300 rounded-md p-2 bg-gray-50"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={userData?.email || ""}
                    readOnly
                    className="w-full border border-gray-300 rounded-md p-2 bg-gray-50"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={userData?.patientData?.phoneNumber || ""}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dob"
                    value={userData?.patientData?.dateOfBirth?.split("T")[0] || ""}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    id="gender"
                    value={userData?.patientData?.gender || ""}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Address Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="street"
                    value={userData?.patientData?.address?.street || ""}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={userData?.patientData?.address?.city || ""}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={userData?.patientData?.address?.state || ""}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Zip/Postal Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    value={userData?.patientData?.address?.zipCode || ""}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    value={userData?.patientData?.address?.country || ""}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button className="bg-accent text-white py-2 px-4 rounded-md hover:bg-primary hover:text-accent transition">
                  Save Changes
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Medical Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-1">
                    Medical History
                  </label>
                  <textarea
                    id="medicalHistory"
                    rows={4}
                    value={userData?.patientData?.medicalHistory || ""}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Enter any relevant medical history"
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                    Allergies
                  </label>
                  <input
                    type="text"
                    id="allergies"
                    value={(userData?.patientData?.allergies || []).join(", ")}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Enter allergies separated by commas"
                  />
                </div>
                <div>
                  <label htmlFor="medications" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Medications
                  </label>
                  <input
                    type="text"
                    id="medications"
                    value={(userData?.patientData?.currentMedications || []).join(", ")}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Enter current medications separated by commas"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button className="bg-accent text-white py-2 px-4 rounded-md hover:bg-primary hover:text-accent transition">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would be implemented similarly */}
      </div>
    </div>
  )
}

export default PatientDashboard
