# Medical Referral Appointment System API Documentation and Endpoints

This is the backend API documentation for the Medical Referral Appointment System. The system allows patients, doctors, and admins to manage medical referrals and appointments efficiently.

---

## Authentication

| Method | Endpoint              | Description                         | Access            |
|--------|-----------------------|-------------------------------------|-------------------|
| POST   | `/api/auth/login`     | Login a user                        | Public            |
| POST   | `/api/auth/register`  | Register a new user                 | Public            |
| GET    | `/api/auth/profile`   | Get current user profile            | Private           |
| PUT    | `/api/auth/profile`   | Update current user profile         | Private           |

---

## Patients

| Method | Endpoint                  | Description                              | Access            |
|--------|---------------------------|------------------------------------------|-------------------|
| POST   | `/api/patients`           | Create a patient profile                 | Private           |
| GET    | `/api/patients`           | Get all patients                         | Private/Admin/Doctor |
| GET    | `/api/patients/profile`   | Get current patient’s profile            | Private           |
| PUT    | `/api/patients/profile`   | Update current patient’s profile         | Private           |
| GET    | `/api/patients/:id`       | Get patient by ID                        | Private/Admin/Doctor |

---

## Doctors

| Method | Endpoint                                 | Description                             | Access    |
|--------|------------------------------------------|-----------------------------------------|-----------|
| POST   | `/api/doctors`                           | Create a doctor profile                 | Private   |
| GET    | `/api/doctors`                           | Get all doctors                         | Public    |
| GET    | `/api/doctors/profile`                   | Get current doctor’s profile            | Private   |
| PUT    | `/api/doctors/profile`                   | Update current doctor’s profile         | Private   |
| GET    | `/api/doctors/specialization/:spec`      | Get doctors by specialization           | Public    |
| GET    | `/api/doctors/hospital/:hospitalId`      | Get doctors by hospital                 | Public    |
| GET    | `/api/doctors/:id`                       | Get doctor by ID                        | Public    |

---

## Hospitals

| Method | Endpoint                     | Description                              | Access    |
|--------|------------------------------|------------------------------------------|-----------|
| POST   | `/api/hospitals`             | Create a new hospital                    | Private/Admin |
| GET    | `/api/hospitals`             | Get all hospitals                        | Public    |
| GET    | `/api/hospitals/search`      | Search hospitals by name/location        | Public    |
| GET    | `/api/hospitals/:id`         | Get hospital by ID                       | Public    |
| PUT    | `/api/hospitals/:id`         | Update hospital                          | Private/Admin |
| DELETE | `/api/hospitals/:id`         | Delete hospital                          | Private/Admin |

---

## Appointments

| Method | Endpoint                                | Description                                  | Access              |
|--------|-----------------------------------------|----------------------------------------------|---------------------|
| POST   | `/api/appointments`                     | Create a new appointment                     | Private             |
| GET    | `/api/appointments/patient`             | Get all appointments for current patient     | Private             |
| GET    | `/api/appointments/doctor`              | Get all appointments for current doctor      | Private/Doctor      |
| GET    | `/api/appointments/:id`                 | Get appointment by ID                        | Private/Related User |
| PUT    | `/api/appointments/:id/status`          | Update appointment status                    | Private/Doctor      |
| PUT    | `/api/appointments/:id/cancel`          | Cancel appointment                           | Private/Related User |

---

## Referrals

| Method | Endpoint                                  | Description                                      | Access          |
|--------|-------------------------------------------|--------------------------------------------------|-----------------|
| POST   | `/api/referrals`                          | Create a new referral to a hospital (or doctor)  | Private/Doctor  |
| GET    | `/api/referrals/patient`                  | Get all referrals for current patient            | Private         |
| GET    | `/api/referrals/referring`                | Get all referrals made by current doctor         | Private/Doctor  |
| GET    | `/api/referrals/referred`                 | Get all referrals to current doctor              | Private/Doctor  |
| GET    | `/api/referrals/:id`                      | Get referral by ID                               | Private*        |
| PUT    | `/api/referrals/:id/status`               | Update referral status                           | Private/Doctor  |
| POST   | `/api/referrals/:id/appointment`          | Create appointment from referral                 | Private/Doctor  |

---

### Notes
- **Private** endpoints require the user to be authenticated.
- **Doctor** and **Admin** roles are enforced where specified.
- API uses **JWT authentication** and returns appropriate status codes for all operations.

---

# 📚 Medical Referral Appointment System - API Documentation

This API serves the backend of the **Medical Referral Appointment System**, supporting patient referrals, hospital management, doctor scheduling, and user authentication.

---

## 🔑 Authentication

All protected routes require a **Bearer Token** (JWT) in the `Authorization` header.

**Header Example:**

---

## 🚀 Base URL


---

## 📦 Postman Collection

- Import the Postman collection file `medical-referral.postman_collection.json` from the `/docs` folder *(you can generate this from Postman > Export)*.
- Make sure to set the correct environment for base URL and tokens.

---

## 📂 API Endpoints

### 🔐 Auth Endpoints

| Method | Endpoint         | Description               | Access     |
|--------|------------------|---------------------------|------------|
| POST   | /auth/login      | Log in a user             | Public     |
| POST   | /auth/register   | Register a new user       | Public     |
| GET    | /auth/profile    | Get user profile          | Private    |
| PUT    | /auth/profile    | Update user profile       | Private    |

---

### 🧑‍🤝‍🧑 Patient Endpoints

| Method | Endpoint              | Description                      | Access          |
|--------|-----------------------|----------------------------------|-----------------|
| POST   | /patients             | Create patient profile           | Private         |
| GET    | /patients             | Get all patients                 | Doctor/Admin    |
| GET    | /patients/profile     | Get current patient’s profile    | Private         |
| PUT    | /patients/profile     | Update patient’s profile         | Private         |
| GET    | /patients/:id         | Get patient by ID                | Doctor/Admin    |

---

### 🩺 Doctor Endpoints

| Method | Endpoint                               | Description                          | Access     |
|--------|----------------------------------------|--------------------------------------|------------|
| POST   | /doctors                               | Create doctor profile                | Private    |
| GET    | /doctors                               | Get all doctors                      | Public     |
| GET    | /doctors/profile                       | Get current doctor profile           | Private    |
| PUT    | /doctors/profile                       | Update current doctor profile        | Private    |
| GET    | /doctors/specialization/:spec          | Get doctors by specialization        | Public     |
| GET    | /doctors/hospital/:hospitalId          | Get doctors by hospital              | Public     |
| GET    | /doctors/:id                           | Get doctor by ID                     | Public     |

---

### 🏥 Hospital Endpoints

| Method | Endpoint            | Description                   | Access        |
|--------|---------------------|-------------------------------|---------------|
| POST   | /hospitals          | Create hospital               | Admin         |
| GET    | /hospitals          | Get all hospitals             | Public        |
| GET    | /hospitals/search   | Search hospitals by name/location | Public    |
| GET    | /hospitals/:id      | Get hospital by ID            | Public        |
| PUT    | /hospitals/:id      | Update hospital               | Admin         |
| DELETE | /hospitals/:id      | Delete hospital               | Admin         |

---

### 📅 Appointment Endpoints

| Method | Endpoint                        | Description                              | Access               |
|--------|----------------------------------|------------------------------------------|----------------------|
| POST   | /appointments                    | Create a new appointment                 | Private              |
| GET    | /appointments/patient           | Get patient appointments                 | Private              |
| GET    | /appointments/doctor            | Get doctor appointments                  | Doctor               |
| GET    | /appointments/:id               | Get appointment by ID                    | Patient/Doctor/Admin |
| PUT    | /appointments/:id/status        | Update appointment status                | Doctor               |
| PUT    | /appointments/:id/cancel        | Cancel an appointment                    | Patient/Doctor       |

---

### 📤 Referral Endpoints

| Method | Endpoint                          | Description                                   | Access        |
|--------|-----------------------------------|-----------------------------------------------|---------------|
| POST   | /referrals                        | Create a new referral                         | Doctor        |
| GET    | /referrals/patient                | Get referrals for patient                     | Patient       |
| GET    | /referrals/referring              | Get referrals made by current doctor          | Doctor        |
| GET    | /referrals/referred               | Get referrals sent to current doctor          | Doctor        |
| GET    | /referrals/:id                    | Get referral by ID                            | Patient/Doctor|
| PUT    | /referrals/:id/status             | Update referral status                        | Doctor        |
| POST   | /referrals/:id/appointment        | Create appointment from referral              | Doctor        |

# API Documentation

## API Endpoints

### Referrals

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/referrals` | Create a new referral to a hospital (and optionally a doctor) | Private/Doctor |
| GET | `/api/referrals/patient` | Get all referrals for current patient | Private |
| GET | `/api/referrals/referring` | Get all referrals made by current doctor | Private/Doctor |
| GET | `/api/referrals/referred` | Get all referrals to current doctor | Private/Doctor |
| GET | `/api/referrals/:id` | Get referral by ID | Private* |
| PUT | `/api/referrals/:id/status` | Update referral status | Private/Doctor |
| POST | `/api/referrals/:id/appointment` | Create appointment from referral | Private/Doctor |

### Appointments

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/appointments` | Create a new appointment | Private |
| POST | `/api/appointments/from-referral` | Create a new appointment from a referral | Private/Doctor |
| GET | `/api/appointments/patient` | Get all appointments for current patient | Private |
| GET | `/api/appointments/doctor` | Get all appointments for current doctor | Private/Doctor |
| GET | `/api/appointments/all` | Get all appointments | Private/Admin |
| GET | `/api/appointments/:id` | Get appointment by ID | Private* |
| PUT | `/api/appointments/:id/status` | Update appointment status | Private/Doctor |
| PUT | `/api/appointments/:id/cancel` | Cancel appointment | Private* |
| PUT | `/api/appointments/:id/complete` | Complete appointment and send summary email | Private/Doctor |

*Private with restrictions: The user must be related to the resource (patient, doctor, or admin)

\`\`\`

Now, let's create a component for doctors to complete appointments:


---

## 📘 Example Usage (Frontend Devs)

### Login Request

```js
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
```


```js
fetch('/api/auth/profile', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

```


✅ Status Codes

    200 OK – Successful request

    201 Created – Resource created

    400 Bad Request – Invalid input

    401 Unauthorized – Missing or invalid token

    403 Forbidden – Access denied

    404 Not Found – Resource not found

    500 Internal Server Error – Server issue


