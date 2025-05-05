// API Endpoints Documentation

const API_BASE_URL = "/api"

const endpoints = {
  // Auth Routes
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
    profile: `${API_BASE_URL}/auth/profile`,
    updateProfile: `${API_BASE_URL}/auth/profile`,
    verifyEmail: `${API_BASE_URL}/auth/verify-email`,
    resendVerification: `${API_BASE_URL}/auth/resend-verification`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
  },

  // User Routes
  users: {
    getAll: `${API_BASE_URL}/users`,
    getById: (id) => `${API_BASE_URL}/users/${id}`,
    update: (id) => `${API_BASE_URL}/users/${id}`,
    delete: (id) => `${API_BASE_URL}/users/${id}`,
  },

  // Patient Routes
  patients: {
    create: `${API_BASE_URL}/patients`,
    getAll: `${API_BASE_URL}/patients`,
    getById: (id) => `${API_BASE_URL}/patients/${id}`,
    update: (id) => `${API_BASE_URL}/patients/${id}`,
    delete: (id) => `${API_BASE_URL}/patients/${id}`,
    getMedicalRecords: (id) => `${API_BASE_URL}/patients/${id}/medical-records`,
  },

  // Doctor Routes
  doctors: {
    create: `${API_BASE_URL}/doctors`,
    getAll: `${API_BASE_URL}/doctors`,
    getById: (id) => `${API_BASE_URL}/doctors/${id}`,
    update: (id) => `${API_BASE_URL}/doctors/${id}`,
    delete: (id) => `${API_BASE_URL}/doctors/${id}`,
    search: `${API_BASE_URL}/doctors/search`,
  },

  // Hospital Routes
  hospitals: {
    create: `${API_BASE_URL}/hospitals`,
    getAll: `${API_BASE_URL}/hospitals`,
    getById: (id) => `${API_BASE_URL}/hospitals/${id}`,
    update: (id) => `${API_BASE_URL}/hospitals/${id}`,
    delete: (id) => `${API_BASE_URL}/hospitals/${id}`,
    search: `${API_BASE_URL}/hospitals/search`,
    near: `${API_BASE_URL}/hospitals/near`,
  },

  // Appointment Routes
  appointments: {
    create: `${API_BASE_URL}/appointments`,
    createFromReferral: `${API_BASE_URL}/appointments/from-referral`,
    getPatientAppointments: `${API_BASE_URL}/appointments/patient`,
    getDoctorAppointments: `${API_BASE_URL}/appointments/doctor`,
    getAllAppointments: `${API_BASE_URL}/appointments/all`,
    getById: (id) => `${API_BASE_URL}/appointments/${id}`,
    updateStatus: (id) => `${API_BASE_URL}/appointments/${id}/status`,
    cancel: (id) => `${API_BASE_URL}/appointments/${id}/cancel`,
    complete: (id) => `${API_BASE_URL}/appointments/${id}/complete`, // New endpoint for completing appointments
  },

  // Referral Routes
  referrals: {
    create: `${API_BASE_URL}/referrals`,
    getPatientReferrals: `${API_BASE_URL}/referrals/patient`,
    getReferringDoctorReferrals: `${API_BASE_URL}/referrals/referring`,
    getReferredDoctorReferrals: `${API_BASE_URL}/referrals/referred`,
    getAllReferrals: `${API_BASE_URL}/referrals/all`,
    getById: (id) => `${API_BASE_URL}/referrals/${id}`,
    updateStatus: (id) => `${API_BASE_URL}/referrals/${id}/status`,
    createAppointment: (id) => `${API_BASE_URL}/referrals/${id}/appointment`,
  },

  // Medical Record Routes
  medicalRecords: {
    create: `${API_BASE_URL}/medical-records`,
    getAll: `${API_BASE_URL}/medical-records`,
    getById: (id) => `${API_BASE_URL}/medical-records/${id}`,
    update: (id) => `${API_BASE_URL}/medical-records/${id}`,
    delete: (id) => `${API_BASE_URL}/medical-records/${id}`,
    getPatientRecords: (patientId) => `${API_BASE_URL}/medical-records/patient/${patientId}`,
  },

  // Messaging Routes
  messages: {
    getConversations: `${API_BASE_URL}/messages/conversations`,
    getMessages: (conversationId) => `${API_BASE_URL}/messages/conversations/${conversationId}`,
    sendMessage: `${API_BASE_URL}/messages`,
    createConversation: `${API_BASE_URL}/messages/conversations`,
    markAsRead: (messageId) => `${API_BASE_URL}/messages/${messageId}/read`,
  },
}

export default endpoints
