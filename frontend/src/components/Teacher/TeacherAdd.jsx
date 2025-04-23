import React from 'react';

function TeacherAdd() {
  return (
    <div className="flex justify-center bg-white rounded-md mt-1 b px-4">
      <div className="rounded-9xl bg-white ">
        <h2 className="text-2xl bg-white font-semibold mb-6 text-center text-gray-800">Post New Project</h2>
        <form className="space-y-6">
          
          {/* Project and Cluster Name */}
          <div className="grid grid-cols-1 bg-white md:grid-cols-2 gap-6">
            <div className=' bg-white '>
              <label className="block bg-white  text-sm font-medium text-gray-700">Project Name</label>
              <input type="text" bg-white  placeholder="Enter Project Name" className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cluster Name</label>
              <input type="text" placeholder="Enter Cluster Name" className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input type="text" placeholder="Enter Description" className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Phases */}
          {[1, 2, 3, 4, 5].map((phase) => (
            <div key={phase} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">Phase {phase} Requirements</label>
                <input type="text" placeholder="Requirements" className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">Phase {phase} Deadline (days)</label>
                <input type="number" placeholder="No. of days" className="mt-1 w-full border text-red  border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          ))}

          {/* Submit */}
          <div className="text-center">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md shadow-md transition duration-200">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeacherAdd;
