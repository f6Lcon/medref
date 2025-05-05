import asyncHandler from "express-async-handler"
import Hospital from "../models/hospital.model.js"

// @desc    Get all hospitals
// @route   GET /api/hospitals
// @access  Public
const getHospitals = asyncHandler(async (req, res) => {
  const hospitals = await Hospital.find({})
  res.json(hospitals)
})

// @desc    Get hospital by ID
// @route   GET /api/hospitals/:id
// @access  Public
const getHospitalById = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id)

  if (hospital) {
    res.json(hospital)
  } else {
    res.status(404)
    throw new Error("Hospital not found")
  }
})

// @desc    Create a hospital
// @route   POST /api/hospitals
// @access  Private/Admin
const createHospital = asyncHandler(async (req, res) => {
  const { name, address, contactInfo, departments, facilities, operatingHours, location } = req.body

  const hospital = new Hospital({
    name,
    address,
    contactInfo,
    departments,
    facilities,
    operatingHours,
    location: location || { type: "Point", coordinates: [0, 0] },
  })

  const createdHospital = await hospital.save()
  res.status(201).json(createdHospital)
})

// @desc    Update a hospital
// @route   PUT /api/hospitals/:id
// @access  Private/Admin
const updateHospital = asyncHandler(async (req, res) => {
  const { name, address, contactInfo, departments, facilities, operatingHours, location } = req.body

  const hospital = await Hospital.findById(req.params.id)

  if (hospital) {
    hospital.name = name || hospital.name
    hospital.address = address || hospital.address
    hospital.contactInfo = contactInfo || hospital.contactInfo
    hospital.departments = departments || hospital.departments
    hospital.facilities = facilities || hospital.facilities
    hospital.operatingHours = operatingHours || hospital.operatingHours

    // Update location if provided
    if (location) {
      hospital.location = location
    }

    const updatedHospital = await hospital.save()
    res.json(updatedHospital)
  } else {
    res.status(404)
    throw new Error("Hospital not found")
  }
})

// @desc    Delete a hospital
// @route   DELETE /api/hospitals/:id
// @access  Private/Admin
const deleteHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id)

  if (hospital) {
    await hospital.deleteOne()
    res.json({ message: "Hospital removed" })
  } else {
    res.status(404)
    throw new Error("Hospital not found")
  }
})

// @desc    Get hospitals near a location
// @route   GET /api/hospitals/near
// @access  Public
const getNearbyHospitals = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 20 } = req.query // radius in kilometers, default 20km

  if (!lat || !lng) {
    res.status(400)
    throw new Error("Latitude and longitude are required")
  }

  // Convert radius from km to meters
  const radiusInMeters = Number.parseInt(radius) * 1000

  try {
    const hospitals = await Hospital.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number.parseFloat(lng), Number.parseFloat(lat)],
          },
          $maxDistance: radiusInMeters,
        },
      },
    })

    res.json(hospitals)
  } catch (error) {
    console.error("Error finding nearby hospitals:", error)

    // If geospatial query fails (e.g., no index), fall back to all hospitals
    const allHospitals = await Hospital.find({})
    res.json(allHospitals)
  }
})

export { getHospitals, getHospitalById, createHospital, updateHospital, deleteHospital, getNearbyHospitals }
