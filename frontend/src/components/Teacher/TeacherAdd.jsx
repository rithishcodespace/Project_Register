import React from 'react';

function TeacherAdd() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white-50 p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl bg-white font-semibold mb-6 text-center text-gray-800">Post New Project</h2>
        <form className="space-y-6 bg-white">
          {/* Project and Cluster Name */}
          <div className="grid grid-cols-1  bg-white md:grid-cols-2 gap-6">
            <div className=' bg-white '>
              <label className="block  bg-white text-sm font-medium text-gray-700">Project Name</label>
              <input
                type="text" required 
                placeholder="Enter Project Name"
                className="mt-1 w-full bg-white  border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className=' bg-white '>
              <label className="block text-sm bg-white  font-medium text-gray-700">Cluster Name</label>
              <input
                type="text" required 
                placeholder="Enter Cluster Name"
                className="mt-1 w-full border border-gray-300  bg-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className=' bg-white '>
            <label className="block  bg-white text-sm font-medium text-gray-700">Description</label>
            <input
              type="text" required 
              placeholder="Enter Description"
              className="mt-1 w-full border bg-white  border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phases */}
          {[1, 2, 3, 4, 5].map((phase) => (
            <div key={phase} className="grid grid-cols-1 bg-white  md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="col-span-2 bg-white ">
                <label className="block text-sm bg-white  font-medium text-gray-700">
                  Phase {phase} Requirements
                </label>
                <input
                  type="text" required 
                  placeholder="Requirements"
                  className="mt-1 w-full border bg-white  border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2  bg-white ">
                <label className="block bg-white  text-sm font-medium text-gray-700">
                  Phase {phase} Deadline (days)
                </label>
                <input
                  type="number"
                  placeholder="No. of days"
                  className="mt-1 w-full  bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}

          {/* Submit */}
          <div className="text-center bg-white ">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md shadow-md transition duration-200"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeacherAdd;
