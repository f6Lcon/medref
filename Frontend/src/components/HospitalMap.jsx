"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const HospitalMap = ({ selectedHospital, onSelectHospital }) => {
  const [hospitals, setHospitals] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const leafletLoadedRef = useRef(false)

  // Load Leaflet scripts and CSS
  useEffect(() => {
    const loadLeaflet = async () => {
      if (leafletLoadedRef.current) return

      try {
        // Add Leaflet CSS
        const linkEl = document.createElement("link")
        linkEl.rel = "stylesheet"
        linkEl.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        linkEl.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        linkEl.crossOrigin = ""
        document.head.appendChild(linkEl)

        // Add Leaflet JS
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        script.crossOrigin = ""

        // Wait for script to load
        await new Promise((resolve) => {
          script.onload = resolve
          document.head.appendChild(script)
        })

        leafletLoadedRef.current = true
        console.log("Leaflet loaded successfully")

        // Get user location after Leaflet is loaded
        getUserLocation()
      } catch (err) {
        console.error("Error loading Leaflet:", err)
        setError("Failed to load map library. Please try again later.")
        setLoading(false)
      }
    }

    loadLeaflet()

    return () => {
      // Clean up map instance when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Get user location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          console.log("User location obtained:", latitude, longitude)
          setUserLocation({ lat: latitude, lng: longitude })

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
  }

  // Initialize map after component is mounted and Leaflet is loaded
  useEffect(() => {
    if (!leafletLoadedRef.current || !mapContainerRef.current || mapInstanceRef.current) return

    console.log("Initializing map")
    const defaultCenter = userLocation ? [userLocation.lat, userLocation.lng] : [51.505, -0.09]

    try {
      // Create map instance
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        attributionControl: true,
      })

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Add user location marker if available
      if (userLocation) {
        const userIcon = L.icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })

        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .bindPopup('<div class="text-center"><p class="font-medium">Your Location</p></div>')
          .addTo(map)
      }

      mapInstanceRef.current = map

      // Force a resize after map is created to fix rendering issues
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
          console.log("Map size invalidated")
        }
      }, 100)
    } catch (err) {
      console.error("Error initializing map:", err)
      setError("Failed to initialize map. Please try again later.")
    }
  }, [userLocation, leafletLoadedRef.current, mapContainerRef.current])

  // Update markers when hospitals change
  useEffect(() => {
    if (!mapInstanceRef.current || hospitals.length === 0) return

    console.log("Updating markers for", hospitals.length, "hospitals")
    updateMarkers()
  }, [hospitals])

  // Center map on selected hospital
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedHospital || !selectedHospital.location?.coordinates) return

    const [lng, lat] = selectedHospital.location.coordinates
    mapInstanceRef.current.setView([lat, lng], 15)

    // Highlight the selected marker
    updateMarkers()
  }, [selectedHospital])

  const updateMarkers = () => {
    if (!mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => mapInstanceRef.current.removeLayer(marker))
    markersRef.current = []

    // Add hospital markers
    hospitals.forEach((hospital) => {
      // Check if hospital has valid coordinates
      if (
        !hospital.location?.coordinates ||
        !Array.isArray(hospital.location.coordinates) ||
        hospital.location.coordinates.length !== 2 ||
        (hospital.location.coordinates[0] === 0 && hospital.location.coordinates[1] === 0)
      ) {
        console.log("Hospital has invalid coordinates:", hospital.name)
        return
      }

      const [lng, lat] = hospital.location.coordinates
      const isSelected = selectedHospital?._id === hospital._id

      try {
        const hospitalIcon = L.icon({
          iconUrl: isSelected
            ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"
            : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })

        const marker = L.marker([lat, lng], { icon: hospitalIcon }).bindPopup(`
          <div class="max-w-xs">
            <h3 class="font-medium text-lg">${hospital.name}</h3>
            <p class="text-sm mt-1">
              <span class="text-gray-500 mr-1">📍</span>
              <span>
                ${hospital.address?.street}, ${hospital.address?.city}, ${hospital.address?.state}
              </span>
            </p>
            <p class="text-sm mt-1">
              <span class="text-gray-500 mr-1">📞</span>
              <span>${hospital.contactInfo?.phone}</span>
            </p>
            ${
              hospital.contactInfo?.email
                ? `
              <p class="text-sm mt-1">
                <span class="text-gray-500 mr-1">✉️</span>
                <span>${hospital.contactInfo.email}</span>
              </p>
            `
                : ""
            }
            ${
              hospital.contactInfo?.website
                ? `
              <p class="text-sm mt-1">
                <span class="text-gray-500 mr-1">🌐</span>
                <a
                  href="${hospital.contactInfo.website.startsWith("http") ? hospital.contactInfo.website : `https://${hospital.contactInfo.website}`}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-500 hover:underline"
                >
                  Website
                </a>
              </p>
            `
                : ""
            }
            <div class="mt-2">
              <a
                href="${getDirectionsUrl(hospital)}"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:underline"
              >
                <span class="mr-1">🧭</span>
                Get Directions
              </a>
            </div>
          </div>
        `)

        // Add click handler
        marker.on("click", () => {
          if (onSelectHospital) {
            onSelectHospital(hospital)
          }
        })

        marker.addTo(mapInstanceRef.current)
        markersRef.current.push(marker)
      } catch (err) {
        console.error("Error adding marker for hospital:", hospital.name, err)
      }
    })
  }

  const fetchNearbyHospitals = async (lat, lng) => {
    try {
      setLoading(true)
      console.log("Fetching nearby hospitals at", lat, lng)

      try {
        const response = await axios.get(`${API_URL}/api/hospitals/near?lat=${lat}&lng=${lng}&radius=20`)
        console.log("Nearby hospitals response:", response.data)
        setHospitals(response.data)
      } catch (err) {
        console.error("Error fetching nearby hospitals, falling back to all hospitals:", err)
        fetchAllHospitals()
      }
    } catch (err) {
      console.error("Error in fetchNearbyHospitals:", err)
      setError("Failed to load nearby hospitals. Showing all hospitals instead.")
      fetchAllHospitals()
    } finally {
      setLoading(false)
    }
  }

  const fetchAllHospitals = async () => {
    try {
      setLoading(true)
      console.log("Fetching all hospitals")

      const response = await axios.get(`${API_URL}/api/hospitals`)
      console.log("All hospitals response:", response.data)
      setHospitals(response.data)
    } catch (err) {
      console.error("Error fetching hospitals:", err)
      setError("Failed to load hospitals.")
    } finally {
      setLoading(false)
    }
  }

  const getDirectionsUrl = (hospital) => {
    if (!userLocation) return "#"

    const { lat, lng } = userLocation
    const [hospitalLng, hospitalLat] = hospital.location.coordinates

    return `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${hospitalLat},${hospitalLng}`
  }

  if (loading && !mapInstanceRef.current) {
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

      <div
        ref={mapContainerRef}
        className="h-[500px] rounded-lg overflow-hidden border border-gray-300"
        style={{ width: "100%" }}
      ></div>

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
