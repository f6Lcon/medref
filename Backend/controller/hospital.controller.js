import Hospital from "../models/hospital.model.js"
import { catchAsync } from "../utils/catchAsync.js"
import { AppError } from "../utils/appError.js"

// Create a new hospital
export const createHospital = catchAsync(async (req, res, next) => {
  const {
    name,
    address,
    contactNumber,
    email,
    website,
    type,
    specialties,
    facilities,
    emergencyServices,
    acceptingNewPatients,
    insuranceAccepted,
  } = req.body

  // Check if hospital with same name and location already exists
  const existingHospital = await Hospital.findOne({
    name,
    "address.city": address.city,
    "address.state": address.state,
  })

  if (existingHospital) {
    return next(new AppError("Hospital with this name already exists in this location", 400))
  }

  // Create hospital
  const hospital = await Hospital.create({
    name,
    address,
    contactNumber,
    email,
    website,
    type,
    specialties,
    facilities,
    emergencyServices,
    acceptingNewPatients,
    insuranceAccepted,
  })

  res.status(201).json({
    status: "success",
    data: {
      hospital,
    },
  })
})

// Get all hospitals
export const getAllHospitals = catchAsync(async (req, res, next) => {
  const { name, city, state, type, specialty, emergencyServices, acceptingNewPatients } = req.query

  // Build query
  const query = {}

  if (name) query.name = { $regex: name, $options: "i" }
  if (city) query["address.city"] = { $regex: city, $options: "i" }
  if (state) query["address.state"] = { $regex: state, $options: "i" }
  if (type) query.type = type
  if (specialty) query.specialties = { $in: [specialty] }
  if (emergencyServices) query.emergencyServices = emergencyServices === "true"
  if (acceptingNewPatients) query.acceptingNewPatients = acceptingNewPatients === "true"

  // Execute query with pagination
  const page = Number.parseInt(req.query.page, 10) || 1
  const limit = Number.parseInt(req.query.limit, 10) || 10
  const skip = (page - 1) * limit

  const hospitals = await Hospital.find(query).sort({ name: 1 }).skip(skip).limit(limit)

  const total = await Hospital.countDocuments(query)

  res.status(200).json({
    status: "success",
    results: hospitals.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: {
      hospitals,
    },
  })
})

// Get hospital by ID
export const getHospitalById = catchAsync(async (req, res, next) => {
  const hospital = await Hospital.findById(req.params.id)

  if (!hospital) {
    return next(new AppError("Hospital not found", 404))
  }

  res.status(200).json({
    status: "success",
    data: {
      hospital,
    },
  })
})

// Update hospital
export const updateHospital = catchAsync(async (req, res, next) => {
  const {
    name,
    address,
    contactNumber,
    email,
    website,
    type,
    specialties,
    facilities,
    emergencyServices,
    acceptingNewPatients,
    insuranceAccepted,
    isActive,
  } = req.body

  const hospital = await Hospital.findByIdAndUpdate(
    req.params.id,
    {
      name: name || undefined,
      address: address || undefined,
      contactNumber: contactNumber || undefined,
      email: email || undefined,
      website: website || undefined,
      type: type || undefined,
      specialties: specialties || undefined,
      facilities: facilities || undefined,
      emergencyServices: emergencyServices !== undefined ? emergencyServices : undefined,
      acceptingNewPatients: acceptingNewPatients !== undefined ? acceptingNewPatients : undefined,
      insuranceAccepted: insuranceAccepted || undefined,
      isActive: isActive !== undefined ? isActive : undefined,
      updatedAt: Date.now(),
    },
    { new: true, runValidators: true },
  )

  if (!hospital) {
    return next(new AppError("Hospital not found", 404))
  }

  res.status(200).json({
    status: "success",
    data: {
      hospital,
    },
  })
})

// Delete hospital
export const deleteHospital = catchAsync(async (req, res, next) => {
  const hospital = await Hospital.findByIdAndUpdate(
    req.params.id,
    {
      isActive: false,
    },
    { new: true },
  )

  if (!hospital) {
    return next(new AppError("Hospital not found", 404))
  }

  res.status(200).json({
    status: "success",
    message: "Hospital deactivated successfully",
  })
})

// Search hospitals by specialty
export const searchHospitalsBySpecialty = catchAsync(async (req, res, next) => {
  const { specialty } = req.params

  if (!specialty) {
    return next(new AppError("Specialty is required", 400))
  }

  const hospitals = await Hospital.find({
    specialties: { $in: [specialty] },
    isActive: true,
  }).sort({ rating: -1 })

  res.status(200).json({
    status: "success",
    results: hospitals.length,
    data: {
      hospitals,
    },
  })
})

// Search hospitals by location
export const searchHospitalsByLocation = catchAsync(async (req, res, next) => {
  const { city, state } = req.params

  if (!city || !state) {
    return next(new AppError("City and state are required", 400))
  }

  const hospitals = await Hospital.find({
    "address.city": { $regex: city, $options: "i" },
    "address.state": { $regex: state, $options: "i" },
    isActive: true,
  }).sort({ rating: -1 })

  res.status(200).json({
    status: "success",
    results: hospitals.length,
    data: {
      hospitals,
    },
  })
})

// Rate hospital
export const rateHospital = catchAsync(async (req, res, next) => {
  const { rating } = req.body

  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError("Rating must be between 1 and 5", 400))
  }

  const hospital = await Hospital.findById(req.params.id)

  if (!hospital) {
    return next(new AppError("Hospital not found", 404))
  }

  // Calculate new rating
  const newTotalRatings = hospital.totalRatings + 1
  const newRating = (hospital.rating * hospital.totalRatings + rating) / newTotalRatings

  // Update hospital
  const updatedHospital = await Hospital.findByIdAndUpdate(
    req.params.id,
    {
      rating: newRating,
      totalRatings: newTotalRatings,
    },
    { new: true },
  )

  res.status(200).json({
    status: "success",
    data: {
      hospital: updatedHospital,
    },
  })
})
