"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaDirections } from "react-icons/fa"

// Fix the marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const HospitalMap = ({ selectedHospital, onSelectHospital }) => {
  const [hospitals, setHospitals] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]) // Default to London
  const [zoom, setZoom] = useState(10)

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          setMapCenter([latitude, longitude])

          // Fetch nearby hospitals
          fetchNearbyHospitals(latitude, longitude)
        },
        (error) => {
          console.error("Error getting location:", error)
          setError("Could not get your location. Showing all hospitals instead.")
          fetchAllHospitals()
        },
      )
    } else {
      setError("Geolocation is not supported by your browser. Showing all hospitals instead.")
      fetchAllHospitals()
    }
  }, [])

  useEffect(() => {
    // If a hospital is selected, center the map on it
    if (selectedHospital && selectedHospital.location?.coordinates) {
      const [lng, lat] = selectedHospital.location.coordinates
      setMapCenter([lat, lng])
      setZoom(15)
    }
  }, [selectedHospital])

  const fetchNearbyHospitals = async (lat, lng) => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/hospitals/near?lat=${lat}&lng=${lng}&radius=20`)
      setHospitals(response.data)
    } catch (err) {
      console.error("Error fetching nearby hospitals:", err)
      setError("Failed to load nearby hospitals. Showing all hospitals instead.")
      fetchAllHospitals()
    } finally {
      setLoading(false)
    }
  }

  const fetchAllHospitals = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/hospitals`)
      setHospitals(response.data)
    } catch (err) {
      console.error("Error fetching hospitals:", err)
      setError("Failed to load hospitals.")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkerClick = (hospital) => {
    if (onSelectHospital) {
      onSelectHospital(hospital)
    }
  }

  const getDirectionsUrl = (hospital) => {
    if (!userLocation) return "#"

    const { lat, lng } = userLocation
    const [hospitalLng, hospitalLat] = hospital.location.coordinates

    return `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${hospitalLat},${hospitalLng}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-2">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Hospital Locations</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="h-[500px] rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(map) => {
            map.on("moveend", () => {
              const center = map.getCenter()
              setMapCenter([center.lat, center.lng])
            })
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User location marker */}
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={
                new L.Icon({
                  iconUrl:
                    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
                  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41],
                })
              }
            >
              <Popup>
                <div className="text-center">
                  <p className="font-medium">Your Location</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Hospital markers */}
          {hospitals.map((hospital) => {
            // Check if hospital has valid coordinates
            if (
              !hospital.location?.coordinates ||
              !Array.isArray(hospital.location.coordinates) ||
              hospital.location.coordinates.length !== 2 ||
              (hospital.location.coordinates[0] === 0 && hospital.location.coordinates[1] === 0)
            ) {
              return null
            }

            const [lng, lat] = hospital.location.coordinates
            const isSelected = selectedHospital?._id === hospital._id

            return (
              <Marker
                key={hospital._id}
                position={[lat, lng]}
                icon={
                  new L.Icon({
                    iconUrl: isSelected
                      ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"
                      : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
                    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                  })
                }
                eventHandlers={{
                  click: () => handleMarkerClick(hospital),
                }}
              >
                <Popup>
                  <div className="max-w-xs">
                    <h3 className="font-medium text-lg">{hospital.name}</h3>
                    <p className="text-sm flex items-start mt-1">
                      <FaMapMarkerAlt className="text-gray-500 mr-1 mt-1 flex-shrink-0" />
                      <span>
                        {hospital.address?.street}, {hospital.address?.city}, {hospital.address?.state}
                      </span>
                    </p>
                    <p className="text-sm flex items-center mt-1">
                      <FaPhone className="text-gray-500 mr-1 flex-shrink-0" />
                      <span>{hospital.contactInfo?.phone}</span>
                    </p>
                    {hospital.contactInfo?.email && (
                      <p className="text-sm flex items-center mt-1">
                        <FaEnvelope className="text-gray-500 mr-1 flex-shrink-0" />
                        <span>{hospital.contactInfo.email}</span>
                      </p>
                    )}
                    {hospital.contactInfo?.website && (
                      <p className="text-sm flex items-center mt-1">
                        <FaGlobe className="text-gray-500 mr-1 flex-shrink-0" />
                        <a
                          href={
                            hospital.contactInfo.website.startsWith("http")
                              ? hospital.contactInfo.website
                              : `https://${hospital.contactInfo.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Website
                        </a>
                      </p>
                    )}
                    <div className="mt-2">
                      <a
                        href={getDirectionsUrl(hospital)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500 hover:underline"
                      >
                        <FaDirections className="mr-1" />
                        Get Directions
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>
          {hospitals.length} hospitals shown on the map.
          {userLocation ? " Showing hospitals within 20km of your location." : " Your location is not available."}
        </p>
      </div>
    </div>
  )
}

export default HospitalMap
