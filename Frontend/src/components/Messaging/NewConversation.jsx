"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { FaSearch, FaUserMd, FaUser, FaUserShield, FaArrowLeft } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { useLoginContext } from "../../context/LoginContext"

const NewConversation = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState(null)
  const navigate = useNavigate()
  const { userRole } = useLoginContext()

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([])
      return
    }

    const searchUsers = async () => {
      try {
        setLoading(true)
        setError("")
        setDebugInfo(null)
        const token = localStorage.getItem("token")

        if (!token) {
          setError("Authentication required")
          setLoading(false)
          return
        }

        // Determine which endpoint to use based on user role
        let endpoint = "/api/users/search"

        if (userRole === "doctor") {
          endpoint = "/api/patients/search" // Doctors can message patients
        } else if (userRole === "patient") {
          endpoint = "/api/doctors/search" // Patients can message doctors
        }

        console.log(`Searching ${endpoint} with term: ${searchTerm}`)

        // For debugging, let's try a direct fetch instead of axios
        const response = await fetch(`http://localhost:5000${endpoint}?search=${searchTerm}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        // Check if the response is ok
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`API error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        console.log("Search results:", data)

        setSearchResults(data || [])
        setDebugInfo({
          endpoint,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries([...response.headers.entries()]),
          resultCount: data?.length || 0,
        })
      } catch (err) {
        console.error("Error searching users:", err)
        setError(`Search failed: ${err.message}`)
        setDebugInfo({
          error: err.message,
          stack: err.stack,
        })
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(() => {
      searchUsers()
    }, 500)

    return () => clearTimeout(debounce)
  }, [searchTerm, userRole])

  const handleCreateConversation = async (userId) => {
    try {
      setError("")
      const token = localStorage.getItem("token")

      if (!token) {
        setError("Authentication required")
        return
      }

      await axios.post(
        "http://localhost:5000/api/messages/conversations",
        { participantId: userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      navigate("/messages")
    } catch (err) {
      console.error("Error creating conversation:", err)
      setError(`Failed to create conversation: ${err.response?.data?.message || err.message}`)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case "doctor":
        return <FaUserMd className="text-blue-500" />
      case "admin":
        return <FaUserShield className="text-purple-500" />
      default:
        return <FaUser className="text-green-500" />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/messages")}
          className="mr-4 text-gray-600 hover:text-primary flex items-center"
        >
          <FaArrowLeft className="mr-1" /> Back
        </button>
        <h2 className="text-xl font-semibold">New Conversation</h2>
      </div>

      <div className="mb-6">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
          Search for a {userRole === "doctor" ? "patient" : userRole === "patient" ? "doctor" : "user"}
        </label>
        <div className="relative">
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search by name or email...`}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            autoComplete="off"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        {searchTerm.length === 1 && <p className="mt-1 text-sm text-gray-500">Type at least 2 characters to search</p>}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {debugInfo && (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded mb-4 text-xs">
          <p className="font-medium">Debug Info</p>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Searching...</p>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="border rounded-md divide-y divide-gray-200">
          {searchResults.map((result) => (
            <div key={result._id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  {getRoleIcon(result.role)}
                </div>
                <div>
                  <p className="font-medium">{result.name}</p>
                  <p className="text-sm text-gray-600">{result.email}</p>
                  {result.specialization && <p className="text-xs text-gray-500">{result.specialization}</p>}
                </div>
              </div>
              <button
                onClick={() => handleCreateConversation(result._id)}
                className="bg-accent text-white py-2 px-4 rounded-md hover:bg-primary hover:text-accent transition"
              >
                Message
              </button>
            </div>
          ))}
        </div>
      ) : searchTerm.length >= 2 ? (
        <div className="text-center py-8 text-gray-500">No users found matching "{searchTerm}"</div>
      ) : null}
    </div>
  )
}

export default NewConversation
