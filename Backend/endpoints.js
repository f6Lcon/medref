/**
 * Medical Referral System API Endpoints
 * 
 * This file provides documentation for all available API endpoints
 */

/**
 * Authentication Endpoints
 * -----------------------
 * POST /api/auth/login - Login a user
 * POST /api/auth/register - Register a new user
 * GET /api/auth/profile - Get user profile (requires authentication)
 * PUT /api/auth/profile - Update user profile (requires authentication)
 */

/**
 * Patient Endpoints
 * ----------------
 * POST /api/patients - Create a patient profile (requires authentication)
 * GET /api/patients - Get all patients (requires doctor/admin role)
 * GET /api/patients/profile - Get current patient's profile (requires authentication)
 * PUT /api/patients/profile - Update current patient's profile (requires authentication)
 * GET /api/patients/:id - Get patient by ID (requires doctor/admin role)
 */

/**
 * Doctor Endpoints
 * ---------------
 * POST /api/doctors - Create a doctor profile (requires authentication)
 * GET /api/doctors - Get all doctors (public)
 * GET /api/doctors/profile - Get current doctor's profile (requires authentication)
 * PUT /api/doctors/profile - Update current doctor's profile (requires authentication)
 * GET /api/doctors/specialization/:specialization - Get doctors by specialization (public)
 * GET /api/doctors/hospital/:hospitalId - Get doctors by hospital (public)
 * GET /api/doctors/:id - Get doctor by ID (public)
 */

/**
 * Hospital Endpoints
 * ----------------
 * POST /api/hospitals - Create a hospital (requires admin role)
 * GET /api/hospitals - Get all hospitals (public)
 * GET /api/hospitals/search - Search hospitals by name or location (public)
 * GET /api/hospitals/:id - Get hospital by ID (public)
 * PUT /api/hospitals/:id - Update hospital (requires admin role)
 * DELETE /api/hospitals/:id - Delete hospital (requires admin role)
 */

/**
 * Appointment Endpoints
 * -------------------
 * POST /api/appointments - Create a new appointment (requires authentication)
 * GET /api/appointments/patient - Get all appointments for current patient (requires authentication)
 * GET /api/appointments/doctor - Get all appointments for current doctor (requires doctor role)
 * GET /api/appointments/:id - Get appointment by ID (requires authentication, restricted to relevant users)
 * PUT /api/appointments/:id/status - Update appointment status (requires doctor role)
 * PUT /api/appointments/:id/cancel - Cancel appointment (requires authentication, restricted to relevant users)
 */

/**
 * Referral Endpoints
 * ----------------
 * POST /api/referrals - Create a new referral (requires doctor role)
 *    - Body: { patient, referredToHospital, referredToDoctor (optional), reason, notes, urgency, medicalRecords }
 * GET /api/referrals/patient - Get all referrals for current patient (requires authentication)
 * GET /api/referrals/referring - Get all referrals made by current doctor (requires doctor role)
 * GET /api/referrals/referred - Get all referrals to current doctor (requires doctor role)
 * GET /api/referrals/:id - Get referral by ID (requires authentication, restricted to relevant users)
 * PUT /api/referrals/:id/status - Update referral status (requires doctor role)
 * POST /api/referrals/:id/appointment - Create appointment from referral (requires doctor role)
 *    - Body: { date, time, duration, notes }
 */

