import React from 'react';
import { useParams } from 'react-router-dom';

const sampleData = {
  CSE: [
    {
      projectName: "AI Chatbot",
      description: "A chatbot that helps students navigate the college website.",
      teamLead: "Sanjay",
      members: ["Sanjay", "Kavya", "Arun", "Meena"]
    },
    {
      projectName: "College Event Tracker",
      description: "A web app to track upcoming college events and fests.",
      teamLead: "Nisha",
      members: ["Nisha","nix", "Raj", "Divya"]
    }
  ],
  AIDS: [
    {
      projectName: "Data Leak Detection",
      description: "System that detects leaks in sensitive databases.",
      teamLead: "Vikram",
      members: ["Vikram", "Lavanya", "Suresh"]
    }
  ],
};

const ProjDetails = () => {
  const { cluster, id } = useParams();
  const project = sampleData[cluster]?.[id];

  if (!project) {
    return <h1 className="text-2xl text-center mt-10">Project not found</h1>;
  }

  return (
    <div className="p-6 min-h-screen bg-white-100">
      <h1 className="text-3xl font-bold text-center mb-8">{project.description}</h1>
    </div>
  );
};

export default ProjDetails;
