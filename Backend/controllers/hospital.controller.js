import asyncHandler from "express-async-handler"
import Hospital from "../models/hospital.model.js"

// @desc    Create a hospital
// @route   POST /api/hospitals
// @access  Private/Admin
const createHospital = asyncHandler(async (req, res) => {
  const { name, address, contactInfo, facilities, departments, accreditation, operatingHours, location } = req.body

  const hospital = await Hospital.create({
    name,
    address,
    contactInfo,
    facilities,
    departments,
    accreditation,
    operatingHours,
    location: location || {
      type: "Point",
      coordinates: [0, 0], // Default coordinates if none provided
    },
  })

  if (hospital) {
    res.status(201).json(hospital)
  } else {
    res.status(400)
    throw new Error("Invalid hospital data")
  }
})

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

// @desc    Update hospital
// @route   PUT /api/hospitals/:id
// @access  Private/Admin
const updateHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id)

  if (hospital) {
    hospital.name = req.body.name || hospital.name
    hospital.address = req.body.address || hospital.address
    hospital.contactInfo = req.body.contactInfo || hospital.contactInfo
    hospital.facilities = req.body.facilities || hospital.facilities
    hospital.departments = req.body.departments || hospital.departments
    hospital.accreditation = req.body.accreditation || hospital.accreditation
    hospital.operatingHours = req.body.operatingHours || hospital.operatingHours

    // Update location if provided
    if (req.body.location) {
      hospital.location = req.body.location
    }

    const updatedHospital = await hospital.save()
    res.json(updatedHospital)
  } else {
    res.status(404)
    throw new Error("Hospital not found")
  }
})

// @desc    Delete hospital
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

// @desc    Search hospitals by name or location
// @route   GET /api/hospitals/search
// @access  Public
const searchHospitals = asyncHandler(async (req, res) => {
  const { keyword, lat, lng, radius } = req.query

  // If lat, lng, and radius are provided, search by proximity
  if (lat && lng && radius) {
    const hospitals = await Hospital.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number.parseFloat(lng), Number.parseFloat(lat)],
          },
          $maxDistance: Number.parseInt(radius) * 1000, // Convert km to meters
        },
      },
    })
    return res.json(hospitals)
  }

  // Otherwise, search by name or city
  const nameFilter = keyword ? { name: { $regex: keyword, $options: "i" } } : {}
  const cityFilter = keyword ? { "address.city": { $regex: keyword, $options: "i" } } : {}

  const hospitals = await Hospital.find({
    $or: [nameFilter, cityFilter],
  })

  res.json(hospitals)
})

// @desc    Get hospitals near a location
// @route   GET /api/hospitals/near
// @access  Public
const getNearbyHospitals = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 10 } = req.query // Default radius is 10km

  if (!lat || !lng) {
    res.status(400)
    throw new Error("Latitude and longitude are required")
  }

  const hospitals = await Hospital.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [Number.parseFloat(lng), Number.parseFloat(lat)],
        },
        $maxDistance: Number.parseInt(radius) * 1000, // Convert km to meters
      },
    },
  })

  res.json(hospitals)
})

export {
  createHospital,
  getHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
  searchHospitals,
  getNearbyHospitals,
}
