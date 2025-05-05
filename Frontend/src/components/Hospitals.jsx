"use client"

import { useState } from "react"
import { FaHospital, FaPlus } from "react-icons/fa"
import AddHospitalForm from "./AddHospitalForm"
import HospitalsView from "./HospitalsView"
import LoginContext from "../context/LoginContext"
import { useContext } from "react"

const Hospitals = () => {
  const [showAddForm, setShowAddForm] = useState(false)
  const { isLoggedIn, userRole, checkPermission } = useContext(LoginContext)

  const handleHospitalAdded = () => {
    setShowAddForm(false)
    // The HospitalsView component will fetch the updated list
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <FaHospital className="mr-2" /> Hospitals
        </h1>
        {isLoggedIn && userRole === "admin" && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-accent transition flex items-center"
          >
            <FaPlus className="mr-2" />
            {showAddForm ? "Cancel" : "Add Hospital"}
          </button>
        )}
      </div>

      {showAddForm ? <AddHospitalForm onSuccess={handleHospitalAdded} /> : <HospitalsView />}
    </div>
  )
}

export default Hospitals
