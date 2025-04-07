import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaHospital, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [hospitalData, setHospitalData] = useState({
    name: "",
    location: "",
    contact: "",
    specialization: "",
  });

  const handleInputChange = (e) => {
    setHospitalData({ ...hospitalData, [e.target.name]: e.target.value });
  };

  const fetchHospitals = async () => {
    try {
      const response = await axios.get("/api/hospitals/get-hospitals");
      setHospitals(response.data);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // UPDATE
        await axios.put(`/api/hospitals/update-hospital/${editingId}`, hospitalData);
      } else {
        // CREATE
        await axios.post("/api/hospitals/create-hospital", hospitalData);
      }
      setHospitalData({ name: "", location: "", contact: "", specialization: "" });
      setEditingId(null);
      setShowForm(false);
      fetchHospitals();
    } catch (error) {
      console.error("Error saving hospital:", error);
    }
  };

  const handleEdit = (hospital) => {
    setHospitalData(hospital);
    setEditingId(hospital._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/hospitals/delete-hospital/${id}`);
      fetchHospitals();
    } catch (error) {
      console.error("Error deleting hospital:", error);
    }
  };

  const filteredHospitals = hospitals.filter((hospital) =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-light min-h-screen p-4 sm:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-6 sm:mb-8">
        Hospital Management
      </h1>

      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-accent text-primary px-6 py-2 rounded-full font-bold flex items-center"
          onClick={() => {
            setShowForm(!showForm);
            setHospitalData({ name: "", location: "", contact: "", specialization: "" });
            setEditingId(null);
          }}
        >
          <FaHospital className="mr-2" />
          {showForm ? "Cancel" : "Add New Hospital"}
        </motion.button>

        <div className="relative w-full sm:w-auto">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search hospitals..."
            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-accent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-lg mb-8"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Hospital Name"
              className="p-2 border border-gray-300 rounded"
              value={hospitalData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              className="p-2 border border-gray-300 rounded"
              value={hospitalData.location}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="contact"
              placeholder="Contact Number"
              className="p-2 border border-gray-300 rounded"
              value={hospitalData.contact}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="specialization"
              placeholder="Specialization"
              className="p-2 border border-gray-300 rounded"
              value={hospitalData.specialization}
              onChange={handleInputChange}
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-accent text-primary px-6 py-2 rounded-full font-bold"
          >
            {editingId ? "Update Hospital" : "Add Hospital"}
          </button>
        </motion.form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hospital) => (
          <motion.div
            key={hospital._id}
            className="bg-white p-6 rounded-lg shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-xl font-semibold text-primary mb-2">{hospital.name}</h3>
            <p className="text-gray-600 mb-1">Location: {hospital.location}</p>
            <p className="text-gray-600 mb-1">Contact: {hospital.contact}</p>
            <p className="text-gray-600 mb-4">Specialization: {hospital.specialization}</p>
            <div className="flex justify-end">
              <button
                className="text-blue-500 mr-2"
                onClick={() => handleEdit(hospital)}
              >
                <FaEdit />
              </button>
              <button
                className="text-red-500"
                onClick={() => handleDelete(hospital._id)}
              >
                <FaTrash />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Hospitals;
