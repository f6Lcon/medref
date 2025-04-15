/**
 * API Endpoints Documentation
 * ===========================
 *
 * Authentication Endpoints
 * -----------------------
 * POST /api/auth/register - Register a new user
 *    - Body: { name, username, email, password, role }
 * POST /api/auth/login - Login a user
 *    - Body: { email/username, password }
 * POST /api/auth/verify - Verify user email with OTP
 *    - Body: { email, otp }
 * POST /api/auth/resend-otp - Resend verification OTP
 *    - Body: { email }
 * GET /api/auth/profile - Get user profile (requires authentication)
 * PUT /api/auth/profile - Update user profile (requires authentication)
 *    - Body: { name, email, username, password (optional) }
 *
 * User Management Endpoints
 * ------------------------
 * GET /api/auth/users - Get all users (requires admin role)
 * GET /api/auth/users/:id - Get user by ID (requires admin role)
 * PUT /api/auth/users/:id - Update user (requires admin role)
 *    - Body: { name, email, username, role }
 * DELETE /api/auth/users/:id - Delete user (requires admin role)
 *
 * Patient Endpoints
 * ----------------
 * POST /api/patients - Create a patient profile (requires authentication)
 *    - Body: { email, dateOfBirth, gender, address, phoneNumber, medicalHistory, allergies, currentMedications, insuranceInfo, emergencyContact }
 * GET /api/patients/profile - Get patient profile (requires authentication)
 * PUT /api/patients/profile - Update patient profile (requires authentication)
 * GET /api/patients - Get all patients (requires doctor/admin role)
 * GET /api/patients/:id - Get patient by ID (requires doctor/admin role)
 *
 * Doctor Endpoints
 * ---------------
 * POST /api/doctors - Create a doctor profile (requires authentication)
 *    - Body: { email, specialization, licenseNumber, hospital, education, experience, availability, contactInfo }
 * GET /api/doctors/profile - Get doctor profile (requires authentication)
 * PUT /api/doctors/profile - Update doctor profile (requires authentication)
 * GET /api/doctors - Get all doctors (public)
 * GET /api/doctors/:id - Get doctor by ID (public)
 * GET /api/doctors/specialization/:specialization - Get doctors by specialization (public)
 * GET /api/doctors/hospital/:hospitalId - Get doctors by hospital (public)
 *
 * Hospital Endpoints
 * -----------------
 * POST /api/hospitals - Create a hospital (requires admin role)
 *    - Body: { name, address, contactInfo, facilities, departments, accreditation, operatingHours }
 * GET /api/hospitals - Get all hospitals (public)
 * GET /api/hospitals/:id - Get hospital by ID (public)
 * PUT /api/hospitals/:id - Update hospital (requires admin role)
 * DELETE /api/hospitals/:id - Delete hospital (requires admin role)
 * GET /api/hospitals/search - Search hospitals by name or location (public)
 *    - Query: { keyword }
 *
 * Appointment Endpoints
 * --------------------
 * POST /api/appointments - Create a new appointment (requires authentication)
 *    - Body: { doctor, hospital, date, time, duration, type, reason, notes, referral }
 * GET /api/appointments/patient - Get all appointments for current patient (requires authentication)
 * GET /api/appointments/doctor - Get all appointments for current doctor (requires doctor role)
 * GET /api/appointments/all - Get all appointments (requires admin role)
 * GET /api/appointments/:id - Get appointment by ID (requires authentication, restricted to relevant users)
 * PUT /api/appointments/:id - Update appointment (requires authentication, restricted to relevant users)
 *    - Body: { doctor, hospital, date, time, duration, type, reason, notes }
 * PUT /api/appointments/:id/status - Update appointment status (requires doctor role)
 *    - Body: { status }
 * PUT /api/appointments/:id/cancel - Cancel appointment (requires authentication)
 * DELETE /api/appointments/:id - Delete appointment (requires admin or doctor role)
 *
 * Referral Endpoints
 * ----------------
 * POST /api/referrals - Create a new referral (requires doctor role)
 *    - Body: { patient, referredToHospital, referredToDoctor (optional), reason, notes, urgency, medicalRecords }
 * GET /api/referrals/patient - Get all referrals for current patient (requires authentication)
 * GET /api/referrals/referring - Get all referrals made by current doctor (requires doctor role)
 * GET /api/referrals/referred - Get all referrals to current doctor (requires doctor role)
 * GET /api/referrals/all - Get all referrals (requires admin role)
 * GET /api/referrals/:id - Get referral by ID (requires authentication, restricted to relevant users)
 * PUT /api/referrals/:id - Update referral (requires doctor role)
 *    - Body: { reason, notes, urgency }
 * PUT /api/referrals/:id/status - Update referral status (requires doctor role)
 *    - Body: { status }
 * DELETE /api/referrals/:id - Delete referral (requires admin or referring doctor role)
 * POST /api/referrals/:id/appointment - Create appointment from referral (requires doctor role)
 *    - Body: { date, time, duration, notes }
 *
 * Medical Records Endpoints
 * -----------------------
 * POST /api/medical-records/upload - Upload a medical record (requires authentication)
 *    - Body: { title, description, patientId, tags, file }
 * GET /api/medical-records/patient/:patientId - Get all medical records for a patient (requires authentication, restricted to relevant users)
 * GET /api/medical-records/:id - Get medical record by ID (requires authentication, restricted to relevant users)
 * GET /api/medical-records/download/:id - Download a medical record (requires authentication, restricted to relevant users)
 * DELETE /api/medical-records/:id - Delete a medical record (requires authentication, restricted to relevant users)
 *
 * Admin Endpoints
 * --------------
 * POST /api/admins - Create an admin profile (requires authentication)
 *    - Body: { email, department, permissions, contactInfo }
 * GET /api/admins/profile - Get admin profile (requires admin role)
 * PUT /api/admins/profile - Update admin profile (requires admin role)
 * GET /api/admin/db-stats - Get database statistics (requires admin role)
 */
