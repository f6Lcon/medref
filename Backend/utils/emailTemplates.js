/**
 * Email templates for the application
 */

// Appointment confirmation email to patient
const appointmentConfirmationToPatient = (appointment, patient, doctor, hospital) => {
  const appointmentDate = new Date(appointment.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return {
    subject: `Appointment Confirmation - ${appointmentDate} at ${appointment.time}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #2c3e50; text-align: center;">Your Appointment is Confirmed</h2>
        <p>Hello ${patient.user?.name || "Patient"},</p>
        <p>Your appointment has been successfully scheduled. Here are the details:</p>
        
        <div style="background-color: #f5f7fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${appointment.time}</p>
          <p><strong>Doctor:</strong> Dr. ${doctor.user?.name || "Unknown"} (${doctor.specialization})</p>
          <p><strong>Hospital:</strong> ${hospital.name}</p>
          <p><strong>Address:</strong> ${hospital.address?.street}, ${hospital.address?.city}, ${hospital.address?.state} ${hospital.address?.zipCode}</p>
          <p><strong>Reason:</strong> ${appointment.reason}</p>
          ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ""}
        </div>
        
        <p>Please arrive 15 minutes before your scheduled appointment time. If you need to reschedule or cancel, please contact us at least 6 hours in advance.</p>
        
        <p>For any questions, please contact the hospital at ${hospital.contactInfo?.phone || "N/A"} or email at ${hospital.contactInfo?.email || "N/A"}.</p>
        
        <p>Thank you for choosing our services.</p>
        <p>Best regards,<br>MEDREF Team</p>
      </div>
    `,
  }
}

// Appointment notification email to doctor
const appointmentNotificationToDoctor = (appointment, patient, doctor, hospital) => {
  const appointmentDate = new Date(appointment.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return {
    subject: `New Appointment - ${appointmentDate} at ${appointment.time}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #2c3e50; text-align: center;">New Appointment Scheduled</h2>
        <p>Hello Dr. ${doctor.user?.name || "Doctor"},</p>
        <p>A new appointment has been scheduled with you. Here are the details:</p>
        
        <div style="background-color: #f5f7fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Patient:</strong> ${patient.user?.name || "Unknown"}</p>
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${appointment.time}</p>
          <p><strong>Hospital:</strong> ${hospital.name}</p>
          <p><strong>Reason:</strong> ${appointment.reason}</p>
          ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ""}
        </div>
        
        <p>Please review your schedule and prepare for this appointment.</p>
        
        <p>Thank you for your dedication to patient care.</p>
        <p>Best regards,<br>MEDREF Team</p>
      </div>
    `,
  }
}

// Referral notification email to patient
const referralNotificationToPatient = (referral, patient, referringDoctor, referredToDoctor, referredToHospital) => {
  const referralDate = new Date(referral.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return {
    subject: `Medical Referral - ${referralDate}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #2c3e50; text-align: center;">Medical Referral Information</h2>
        <p>Hello ${patient.user?.name || "Patient"},</p>
        <p>Dr. ${referringDoctor.user?.name || "Unknown"} has referred you to ${referredToDoctor ? `Dr. ${referredToDoctor.user?.name || "Unknown"}` : "a specialist"} at ${referredToHospital.name}. Here are the details:</p>
        
        <div style="background-color: #f5f7fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Referring Doctor:</strong> Dr. ${referringDoctor.user?.name || "Unknown"} (${referringDoctor.specialization})</p>
          ${referredToDoctor ? `<p><strong>Referred To:</strong> Dr. ${referredToDoctor.user?.name || "Unknown"} (${referredToDoctor.specialization})</p>` : ""}
          <p><strong>Hospital:</strong> ${referredToHospital.name}</p>
          <p><strong>Address:</strong> ${referredToHospital.address?.street}, ${referredToHospital.address?.city}, ${referredToHospital.address?.state} ${referredToHospital.address?.zipCode}</p>
          <p><strong>Reason for Referral:</strong> ${referral.reason}</p>
          <p><strong>Urgency:</strong> ${referral.urgency.charAt(0).toUpperCase() + referral.urgency.slice(1)}</p>
          ${referral.notes ? `<p><strong>Additional Notes:</strong> ${referral.notes}</p>` : ""}
        </div>
        
        <p>Please contact ${referredToHospital.name} at ${referredToHospital.contactInfo?.phone || "N/A"} to schedule your appointment with ${referredToDoctor ? `Dr. ${referredToDoctor.user?.name}` : "the specialist"}.</p>
        
        <p>For any questions about this referral, please contact your referring doctor's office.</p>
        
        <p>Best regards,<br>MEDREF Team</p>
      </div>
    `,
  }
}

// Referral notification email to referred doctor
const referralNotificationToDoctor = (referral, patient, referringDoctor, referredToDoctor, referredToHospital) => {
  const referralDate = new Date(referral.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return {
    subject: `New Patient Referral - ${referralDate}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #2c3e50; text-align: center;">New Patient Referral</h2>
        <p>Hello Dr. ${referredToDoctor.user?.name || "Doctor"},</p>
        <p>Dr. ${referringDoctor.user?.name || "Unknown"} has referred a patient to you. Here are the details:</p>
        
        <div style="background-color: #f5f7fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Patient:</strong> ${patient.user?.name || "Unknown"}</p>
          <p><strong>Referring Doctor:</strong> Dr. ${referringDoctor.user?.name || "Unknown"} (${referringDoctor.specialization})</p>
          <p><strong>Reason for Referral:</strong> ${referral.reason}</p>
          <p><strong>Urgency:</strong> ${referral.urgency.charAt(0).toUpperCase() + referral.urgency.slice(1)}</p>
          ${referral.notes ? `<p><strong>Additional Notes:</strong> ${referral.notes}</p>` : ""}
        </div>
        
        <p>The patient has been instructed to contact your office to schedule an appointment. Please review the patient's information and prepare for their visit.</p>
        
        <p>Thank you for your collaboration in providing quality care to our patients.</p>
        
        <p>Best regards,<br>MEDREF Team</p>
      </div>
    `,
  }
}

// Referral status update email to patient
const referralStatusUpdateToPatient = (referral, patient, referringDoctor, referredToDoctor, referredToHospital) => {
  const referralDate = new Date(referral.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const statusText =
    referral.status === "accepted"
      ? "Accepted"
      : referral.status === "rejected"
        ? "Declined"
        : referral.status === "completed"
          ? "Completed"
          : "Updated"

  return {
    subject: `Referral ${statusText} - ${referralDate}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #2c3e50; text-align: center;">Medical Referral Status Update</h2>
        <p>Hello ${patient.user?.name || "Patient"},</p>
        <p>We're writing to inform you that your referral has been <strong>${statusText.toLowerCase()}</strong> by ${referredToDoctor ? `Dr. ${referredToDoctor.user?.name || "Unknown"}` : "the specialist"} at ${referredToHospital.name}.</p>
        
        <div style="background-color: #f5f7fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Referral Date:</strong> ${referralDate}</p>
          <p><strong>Referring Doctor:</strong> Dr. ${referringDoctor.user?.name || "Unknown"} (${referringDoctor.specialization})</p>
          ${referredToDoctor ? `<p><strong>Referred To:</strong> Dr. ${referredToDoctor.user?.name || "Unknown"} (${referredToDoctor.specialization})</p>` : ""}
          <p><strong>Hospital:</strong> ${referredToHospital.name}</p>
          <p><strong>Reason for Referral:</strong> ${referral.reason}</p>
          <p><strong>Current Status:</strong> <span style="color: ${
            referral.status === "accepted"
              ? "#16a34a"
              : referral.status === "rejected"
                ? "#dc2626"
                : referral.status === "completed"
                  ? "#2563eb"
                  : "#6b7280"
          }; font-weight: bold;">${statusText}</span></p>
        </div>
        
        ${
          referral.status === "accepted"
            ? `
        <p>Next Steps:</p>
        <ol>
          <li>Please contact ${referredToHospital.name} at ${referredToHospital.contactInfo?.phone || "N/A"} to schedule your appointment with Dr. ${referredToDoctor?.user?.name || "the specialist"}.</li>
          <li>Bring any relevant medical records or test results to your appointment.</li>
          <li>Prepare a list of questions or concerns you may have for the specialist.</li>
        </ol>
        `
            : referral.status === "rejected"
              ? `
        <p>Please contact your referring doctor, Dr. ${referringDoctor.user?.name || "Unknown"}, to discuss alternative options for your care.</p>
        `
              : referral.status === "completed"
                ? `
        <p>Your referral process has been completed. If you have any follow-up questions, please contact your healthcare provider.</p>
        `
                : `
        <p>If you have any questions about this update, please contact your referring doctor's office.</p>
        `
        }
        
        <p>For any questions about this referral, please contact your referring doctor's office at ${referringDoctor.contactInfo?.phone || "N/A"}.</p>
        
        <p>Best regards,<br>MEDREF Team</p>
      </div>
    `,
  }
}

export {
  appointmentConfirmationToPatient,
  appointmentNotificationToDoctor,
  referralNotificationToPatient,
  referralNotificationToDoctor,
  referralStatusUpdateToPatient,
}
