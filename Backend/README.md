# Medical Referral Appointment System API

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

Feel free to expand this README with environment setup, testing instructions, or usage examples!
