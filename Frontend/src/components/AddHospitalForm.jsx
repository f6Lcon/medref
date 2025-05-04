"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { FaHospital, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaClock, FaBuilding, FaMapPin } from "react-icons/fa"

// Fix the marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

// Component to handle map clicks and marker placement
const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
    },
  })

  return position ? (
    <Marker
      position={position}
      icon={
        new L.Icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })
      }
    />
  ) : null
}

const AddHospitalForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    contactInfo: {
      email: "",
      phone: "",
      website: "",
    },
    facilities: "",
    departments: "",
    accreditation: "",
    operatingHours: {
      weekdays: {
        open: "",
        close: "",
      },
      weekends: {
        open: "",
        close: "",
      },
    },
    location: {
      type: "Point",
      coordinates: [0, 0], // [longitude, latitude]
    },
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]) // Default to London
  const [markerPosition, setMarkerPosition] = useState(null)
  const [addressLookupLoading, setAddressLookupLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Get user's location for initial map center
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setMapCenter([latitude, longitude])
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }, [])

  // Update coordinates when marker position changes
  useEffect(() => {
    if (markerPosition) {
      const [lat, lng] = markerPosition
      setFormData({
        ...formData,
        location: {
          type: "Point",
          coordinates: [lng, lat], // MongoDB uses [longitude, latitude]
        },
      })
    }
  }, [markerPosition])

  const handleChange = (e) => {
    const { name, value } = e.target

    // Handle nested objects
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleOperatingHoursChange = (e) => {
    const { name, value } = e.target
    const [day, type] = name.split(".")

    setFormData({
      ...formData,
      operatingHours: {
        ...formData.operatingHours,
        [day]: {
          ...formData.operatingHours[day],
          [type]: value,
        },
      },
    })
  }

  const handleArrayChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value.split(",").map((item) => item.trim()),
    })
  }

  const lookupCoordinates = async () => {
    const { street, city, state, zipCode, country } = formData.address

    if (!street || !city) {
      setError("Street and city are required for geocoding")
      return
    }

    setAddressLookupLoading(true)
    setError("")

    try {
      const address = `${street}, ${city}, ${state} ${zipCode}, ${country}`
      const encodedAddress = encodeURIComponent(address)

      // Using OpenStreetMap Nominatim API for geocoding
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`)

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0]

        // Update marker position and map center
        setMarkerPosition([Number.parseFloat(lat), Number.parseFloat(lon)])
        setMapCenter([Number.parseFloat(lat), Number.parseFloat(lon)])

        // Update form data
        setFormData({
          ...formData,
          location: {
            type: "Point",
            coordinates: [Number.parseFloat(lon), Number.parseFloat(lat)], // MongoDB uses [longitude, latitude]
          },
        })
      } else {
        setError("Could not find coordinates for this address")
      }
    } catch (err) {
      console.error("Error geocoding address:", err)
      setError("Error looking up coordinates. Please place the marker manually.")
    } finally {
      setAddressLookupLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      // Validate form data
      if (
        !formData.name ||
        !formData.address.street ||
        !formData.address.city ||
        !formData.contactInfo.email ||
        !formData.contactInfo.phone
      ) {
        setError("Please fill in all required fields")
        setLoading(false)
        return
      }

      // Format the hospital data
      const hospitalData = {
        name: formData.name,
        address: formData.address,
        contactInfo: formData.contactInfo,
        facilities:
          typeof formData.facilities === "string"
            ? formData.facilities.split(",").map((item) => item.trim())
            : formData.facilities,
        departments:
          typeof formData.departments === "string"
            ? formData.departments.split(",").map((item) => item.trim())
            : formData.departments,
        accreditation:
          typeof formData.accreditation === "string"
            ? formData.accreditation.split(",").map((item) => item.trim())
            : formData.accreditation,
        operatingHours: formData.operatingHours,
        location: formData.location,
      }

      // Submit the hospital
      const response = await axios.post(`${API_URL}/api/hospitals`, hospitalData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Hospital created:", response.data)
      setSuccess(true)

      // Reset form
      setFormData({
        name: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        contactInfo: {
          email: "",
          phone: "",
          website: "",
        },
        facilities: "",
        departments: "",
        accreditation: "",
        operatingHours: {
          weekdays: {
            open: "",
            close: "",
          },
          weekends: {
            open: "",
            close: "",
          },
        },
        location: {
          type: "Point",
          coordinates: [0, 0],
        },
      })

      setMarkerPosition(null)

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response.data)
      }
    } catch (err) {
      console.error("Error creating hospital:", err)
      setError(err.response?.data?.message || "Failed to add hospital. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Add New Hospital</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Hospital added successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hospital Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            <FaHospital className="inline mr-2" /> Basic Information
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Hospital Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter hospital name"
                required
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            <FaMapMarkerAlt className="inline mr-2" /> Address Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address*
              </label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="123 Main St"
                required
              />
            </div>

            <div>
              <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                City*
              </label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="New York"
                required
              />
            </div>

            <div>
              <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
                State/Province*
              </label>
              <input
                type="text"
                id="address.state"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="NY"
                required
              />
            </div>

            <div>
              <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                Zip/Postal Code*
              </label>
              <input
                type="text"
                id="address.zipCode"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="10001"
                required
              />
            </div>

            <div>
              <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
                Country*
              </label>
              <input
                type="text"
                id="address.country"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="United States"
                required
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={lookupCoordinates}
                className="bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition flex items-center"
                disabled={addressLookupLoading}
              >
                {addressLookupLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Looking up coordinates...
                  </>
                ) : (
                  <>
                    <FaMapPin className="mr-2" />
                    Find Coordinates from Address
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Map for Location Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            <FaMapPin className="inline mr-2" /> Hospital Location
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            Click on the map to set the hospital's exact location or use the button above to find coordinates from the
            address.
          </p>

          <div className="h-[400px] rounded-lg overflow-hidden border border-gray-300 mb-2">
            <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={markerPosition} setPosition={setMarkerPosition} />
            </MapContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="text"
                value={markerPosition ? markerPosition[0] : ""}
                className="w-full border border-gray-300 rounded-md p-2 bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="text"
                value={markerPosition ? markerPosition[1] : ""}
                className="w-full border border-gray-300 rounded-md p-2 bg-gray-50"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            <FaPhone className="inline mr-2" /> Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactInfo.email" className="block text-sm font-medium text-gray-700 mb-1">
                <FaEnvelope className="inline mr-1" /> Email Address*
              </label>
              <input
                type="email"
                id="contactInfo.email"
                name="contactInfo.email"
                value={formData.contactInfo.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="info@hospital.com"
                required
              />
            </div>

            <div>
              <label htmlFor="contactInfo.phone" className="block text-sm font-medium text-gray-700 mb-1">
                <FaPhone className="inline mr-1" /> Phone Number*
              </label>
              <input
                type="tel"
                id="contactInfo.phone"
                name="contactInfo.phone"
                value={formData.contactInfo.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="(123) 456-7890"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="contactInfo.website" className="block text-sm font-medium text-gray-700 mb-1">
                <FaGlobe className="inline mr-1" /> Website
              </label>
              <input
                type="url"
                id="contactInfo.website"
                name="contactInfo.website"
                value={formData.contactInfo.website}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://www.hospital.com"
              />
            </div>
          </div>
        </div>

        {/* Hospital Details */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            <FaBuilding className="inline mr-2" /> Hospital Details
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="departments" className="block text-sm font-medium text-gray-700 mb-1">
                Departments
              </label>
              <input
                type="text"
                id="departments"
                name="departments"
                value={formData.departments}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Cardiology, Neurology, Pediatrics (comma separated)"
              />
              <p className="text-xs text-gray-500 mt-1">Enter departments separated by commas</p>
            </div>

            <div>
              <label htmlFor="facilities" className="block text-sm font-medium text-gray-700 mb-1">
                Facilities
              </label>
              <input
                type="text"
                id="facilities"
                name="facilities"
                value={formData.facilities}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="MRI, CT Scan, Laboratory (comma separated)"
              />
              <p className="text-xs text-gray-500 mt-1">Enter facilities separated by commas</p>
            </div>

            <div>
              <label htmlFor="accreditation" className="block text-sm font-medium text-gray-700 mb-1">
                Accreditation
              </label>
              <input
                type="text"
                id="accreditation"
                name="accreditation"
                value={formData.accreditation}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="JCI, NABH (comma separated)"
              />
              <p className="text-xs text-gray-500 mt-1">Enter accreditations separated by commas</p>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            <FaClock className="inline mr-2" /> Operating Hours
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weekdays</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="weekdays.open" className="block text-xs text-gray-500 mb-1">
                    Open
                  </label>
                  <input
                    type="time"
                    id="weekdays.open"
                    name="weekdays.open"
                    value={formData.operatingHours.weekdays.open}
                    onChange={handleOperatingHoursChange}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="weekdays.close" className="block text-xs text-gray-500 mb-1">
                    Close
                  </label>
                  <input
                    type="time"
                    id="weekdays.close"
                    name="weekdays.close"
                    value={formData.operatingHours.weekdays.close}
                    onChange={handleOperatingHoursChange}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weekends</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="weekends.open" className="block text-xs text-gray-500 mb-1">
                    Open
                  </label>
                  <input
                    type="time"
                    id="weekends.open"
                    name="weekends.open"
                    value={formData.operatingHours.weekends.open}
                    onChange={handleOperatingHoursChange}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="weekends.close" className="block text-xs text-gray-500 mb-1">
                    Close
                  </label>
                  <input
                    type="time"
                    id="weekends.close"
                    name="weekends.close"
                    value={formData.operatingHours.weekends.close}
                    onChange={handleOperatingHoursChange}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-white py-2 px-6 rounded-md hover:bg-accent transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Hospital"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddHospitalForm
