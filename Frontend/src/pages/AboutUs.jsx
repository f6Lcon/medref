import React from 'react';
import { FaHeartbeat, FaCogs, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion'; // Import motion for animation
import profilePic from '../assets/profile.png'; // Import the profile picture

const AboutUs = () => {
  const features = [
    {
      icon: FaHeartbeat,
      title: 'Our Mission',
      description: 'To empower healthcare systems with innovative technology that enhances efficiency, reduces barriers, and ensures better patient care.',
    },
    {
      icon: FaCogs,
      title: 'Our Vision',
      description: 'To revolutionize healthcare management by creating trusted, technology-driven tools that empower healthcare professionals and improve patient outcomes.',
    },
    {
      icon: FaUsers,
      title: 'Our Values',
      description: 'We are committed to innovation, reliability, and simplicity—delivering user-friendly solutions that empower healthcare providers across Kenya.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="bg-light p-8 rounded-lg mb-12 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">About Us</h1>
        <p className="text-lg text-secondary mb-4">
        MEDREF is an innovative platform built to transform healthcare referral systems and optimize care delivery.


        </p>
        <p className="text-lg text-secondary">
        Our mission is to redefine healthcare management through smart, technology-driven solutions that streamline operations, minimize errors, and ensure better outcomes for both patients and providers.
        </p>
      </div>

      {/* Mission, Vision, Values Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-white p-8 rounded-3xl shadow-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -10 }}
          >
            <feature.icon className="text-5xl sm:text-6xl text-accent mb-6 mx-auto" />
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-primary">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-base sm:text-lg">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Team Section */}
      <div className="bg-light p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-center text-primary mb-8">Lead Developer</h2>
        <div className="flex justify-center">
          <motion.div
            className="team-member bg-white p-6 shadow-md rounded-lg text-center border border-accent max-w-sm"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={profilePic}
              alt="Team Member"
              className="w-48 h-48 rounded-full mx-auto mb-6 object-cover"
            />
            <h3 className="text-xl font-semibold mb-2 text-primary">Muriithi Dennis</h3>
            <p className="text-lg text-secondary">ALX, certified BackEnd Engineer</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
