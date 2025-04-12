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
import AppointmentStatusUpdate from "./AppointmentStatusUpdate"
import ReferralActions from "./ReferralActions"
import CreateReferralForm from "./CreateReferralForm"
import AppointmentFromReferral from "./AppointmentFromReferral"

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
  const [selectedReferral, setSelectedReferral] = useState(null)
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const navigate = useNavigate()
  const { setIsLoggedIn, setUserRole } = useContext(LoginContext)
  const [showCreateReferralForm, setShowCreateReferralForm] = useState(false)

  const fetchData = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }

    try {
      setLoading(true)
      setError("")

      // Fetch user profile data
      const userResponse = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setUserData(userResponse.data)
      console.log("User data:", userResponse.data)

      // Fetch appointments
      try {
        const appointmentsResponse = await axios.get(`${API_URL}/api/appointments/doctor`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log("Doctor appointments:", appointmentsResponse.data)
        setAppointments(appointmentsResponse.data)
      } catch (aptErr) {
        console.error("Error fetching appointments:", aptErr)
        setError((prev) => prev + " Failed to load appointments.")
      }

      // Fetch referrals (both made by this doctor and to this doctor)
      try {
        const referringResponse = await axios.get(`${API_URL}/api/referrals/referring`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log("Referring referrals:", referringResponse.data)

        const referredResponse = await axios.get(`${API_URL}/api/referrals/referred`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log("Referred to referrals:", referredResponse.data)

        // Combine both types of referrals
        const allReferrals = [...referringResponse.data, ...referredResponse.data]
        console.log("Combined referrals:", allReferrals)
        setReferrals(allReferrals)
      } catch (refErr) {
        console.error("Error fetching referrals:", refErr)
        setError((prev) => prev + " Failed to load referrals.")
      }

      // Fetch patients
      try {
        const patientsResponse = await axios.get(`${API_URL}/api/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log("Patients:", patientsResponse.data)
        setPatients(patientsResponse.data)
      } catch (patErr) {
        console.error("Error fetching patients:", patErr)
        setError((prev) => prev + " Failed to load patients.")
      }

      // Fetch hospitals
      try {
        const hospitalsResponse = await axios.get(`${API_URL}/api/hospitals`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log("Hospitals:", hospitalsResponse.data)
        setHospitals(hospitalsResponse.data)
      } catch (hospErr) {
        console.error("Error fetching hospitals:", hospErr)
        setError((prev) => prev + " Failed to load hospitals.")
      }
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

  useEffect(() => {
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

  const handleReferralSuccess = (newReferral) => {
    console.log("New referral created:", newReferral)
    // Add the new referral to the existing referrals
    setReferrals((prevReferrals) => [newReferral, ...prevReferrals])
    // Hide the create referral form
    setShowCreateReferralForm(false)
    // Show a success message
    alert("Referral created successfully!")
  }

  const handleAppointmentStatusUpdate = (updatedAppointment) => {
    console.log("Updating appointment status:", updatedAppointment)
    setAppointments(appointments.map((apt) => (apt._id === updatedAppointment._id ? updatedAppointment : apt)))
  }

  const handleReferralUpdate = (updatedReferral) => {
    console.log("Updating referral:", updatedReferral)
    setReferrals(referrals.map((ref) => (ref._id === updatedReferral._id ? updatedReferral : ref)))
  }

  const handleScheduleAppointment = (referral) => {
    console.log("Scheduling appointment for referral:", referral)
    setSelectedReferral(referral)
    setShowAppointmentForm(true)
    setActiveTab("referrals")
  }

  const handleAppointmentFromReferralSuccess = (newAppointment) => {
    console.log("New appointment created from referral:", newAppointment)
    // Add the new appointment to the list
    setAppointments([newAppointment, ...appointments])

    // Update the referral to mark that an appointment has been created
    const updatedReferral = {
      ...selectedReferral,
      appointmentCreated: true,
      status: "accepted",
    }

    handleReferralUpdate(updatedReferral)

    // Hide the appointment form
    setShowAppointmentForm(false)
    setSelectedReferral(null)

    // Show a success message
    alert("Appointment scheduled successfully!")

    // Refresh data
    fetchData()
  }

  const handleViewPatientRecords = (patient) => {
    setSelectedPatient(patient)
    setActiveTab("records")
  }

  const toggleCreateReferralForm = () => {
    setShowCreateReferralForm(!showCreateReferralForm)
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
                          ? selectedPatient
                            ? `Medical Records: ${selectedPatient.user?.name || "Patient"}`
                            : "Medical Records"
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
                          <AppointmentStatusUpdate
                            appointment={appointment}
                            onStatusUpdate={handleAppointmentStatusUpdate}
                          />
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
                          <ReferralActions
                            referral={referral}
                            onReferralUpdate={handleReferralUpdate}
                            onScheduleAppointment={handleScheduleAppointment}
                          />
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
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">All Appointments</h2>
            {appointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment._id}>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {appointment.patient?.user?.name || "Unknown Patient"}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {formatDate(appointment.date)}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{appointment.time}</td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{appointment.reason}</td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{appointment.status}</td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <AppointmentStatusUpdate
                            appointment={appointment}
                            onStatusUpdate={handleAppointmentStatusUpdate}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No appointments found.</p>
            )}
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === "patients" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">All Patients</h2>
            {patients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient._id}>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {patient.user?.name || "Unknown"}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {patient.email || patient.user?.email || "N/A"}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {patient.phoneNumber || "N/A"}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <button
                            onClick={() => handleViewPatientRecords(patient)}
                            className="text-primary hover:underline"
                          >
                            View Records
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No patients found.</p>
            )}
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === "referrals" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">All Referrals</h2>
              <button
                onClick={toggleCreateReferralForm}
                className="flex items-center space-x-2 bg-primary text-white p-2 rounded-md hover:bg-primary-dark transition"
              >
                <FaPlus />
                <span>Create Referral</span>
              </button>
            </div>

            {showCreateReferralForm && (
              <div className="mb-4">
                <CreateReferralForm
                  onReferralSuccess={handleReferralSuccess}
                  onClose={() => setShowCreateReferralForm(false)}
                />
              </div>
            )}

            {showAppointmentForm && selectedReferral && (
              <div className="mb-4">
                <AppointmentFromReferral
                  referral={selectedReferral}
                  onSuccess={handleAppointmentFromReferralSuccess}
                  onCancel={() => {
                    setShowAppointmentForm(false)
                    setSelectedReferral(null)
                  }}
                />
              </div>
            )}

            {referrals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Referring Doctor
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Referred To Doctor
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((referral) => (
                      <tr key={referral._id}>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {referral.patient?.user?.name || "Unknown Patient"}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          Dr. {referral.referringDoctor?.user?.name || "Unknown"}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          Dr. {referral.referredToDoctor?.user?.name || "Unknown"}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{referral.reason}</td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{referral.status}</td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <ReferralActions
                            referral={referral}
                            onReferralUpdate={handleReferralUpdate}
                            onScheduleAppointment={handleScheduleAppointment}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No referrals found.</p>
            )}
          </div>
        )}

        {/* Hospitals Tab */}
        {activeTab === "hospitals" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">All Hospitals</h2>
            {hospitals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Departments
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {hospitals.map((hospital) => (
                      <tr key={hospital._id}>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{hospital.name}</td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {hospital.address?.street}, {hospital.address?.city}, {hospital.address?.state}{" "}
                          {hospital.address?.zipCode}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {hospital.contactInfo?.phone}
                          <br />
                          {hospital.contactInfo?.email}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {hospital.departments?.join(", ") || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No hospitals found.</p>
            )}
          </div>
        )}

        {/* Medical Records Tab */}
        {activeTab === "records" && selectedPatient && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Medical Records for {selectedPatient.user?.name || "Patient"}
            </h2>
            {/* Display medical records here - Placeholder */}
            <p className="text-gray-500 text-sm">Medical records will be displayed here. This is a placeholder.</p>
          </div>
        )}

        {/* My Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">My Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                <p className="text-gray-600">{userData?.name || "N/A"}</p>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                <p className="text-gray-600">{userData?.email || "N/A"}</p>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Specialization:</label>
                <p className="text-gray-600">{userData?.doctorData?.specialization || "N/A"}</p>
              </div>
              {/* Add more profile details here */}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorDashboard
