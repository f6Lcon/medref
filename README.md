# Medical Referral Appointment System API

This is the backend API for the **Medical Referral Appointment System**, built with Node.js, Express, and MongoDB.

## 🔗 Project Links

- **Frontend:** [GitHub - MRAS (MERN)](https://github.com/initials101/mras_finalYear.git)
- **Postman Collection:** [medical_referral_api.postman_collection.json](./medical_referral_api.postman_collection.json)

---

## 🛠️ Technologies Used

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Role-based Access Control
- RESTful APIs

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/initials101/mras_finalYear.git
cd mras_finalYear

1. cd Backend

2. Install dependencies

npm install

3. Create a .env file

Create a .env file in the root directory and add the following:

PORT=8000
MONGO_URI=mongodb://localhost:27017/medical_referral
JWT_SECRET=your_jwt_secret
NODE_ENV=development

4. Start MongoDB

Ensure MongoDB is running locally or use MongoDB Atlas and update the MONGO_URI.
5. Run the application

npm run dev

The server will start on http://localhost:8000.
📬 API Documentation

6. cd Frontend

7. install dependancies

8. yarn

9. npm run dev

The frontend will run on http://localhost:5173.

You can explore and test the API endpoints using the included Postman collection:

    Open Postman

    Click Import → Upload medical_referral_api.postman_collection.json

    Test endpoints like:

        Auth: /api/auth/register, /api/auth/login

        Patients: /api/patients

        Doctors: /api/doctors

        Hospitals: /api/hospitals

        Appointments: /api/appointments

        Referrals: /api/referrals

📝 Scripts

npm run dev        # Run in development mode using nodemon
npm start          # Run the server in production

📁 Folder Structure

mras_finalYear/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── .env
├── server.js
├── README.md
└── medical_referral_api.postman_collection.json

👨‍⚕️ Roles & Permissions
Role	Description
Admin	Manage hospitals, users
Doctor	View/create referrals, appointments
Patient	View doctors, book appointments
🧪 Testing

You can use Postman, Insomnia, or your frontend app to test API functionality.
🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you would like to change.
