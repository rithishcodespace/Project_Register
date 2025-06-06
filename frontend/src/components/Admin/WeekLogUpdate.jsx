import React, { useState } from 'react';
import { Calendar, CheckCircle2, AlertTriangle, FileText, Save } from 'lucide-react';

function WeekLogUpdate() {
  const [weeks, setWeeks] = useState(Array(12).fill(''));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (index, value) => {
    const newWeeks = [...weeks];
    newWeeks[index] = value;
    setWeeks(newWeeks);
  };

  const isValidFutureDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    return !isNaN(date) && date >= new Date(today.toDateString());
  };

  const handleSubmit = async () => {
    const allValid = weeks.every(isValidFutureDate);
    if (!allValid) {
      setError('Please enter only valid future dates for all weeks.');
      setMessage(null);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Simulating API call since we don't have the actual instance
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessage('Weekly deadlines have been successfully updated in the system.');
    } catch (err) {
      setError('An error occurred while updating the deadline information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filledWeeks = weeks.filter(week => week !== '').length;
return (
  <div className="min-h-screen bg-gradient-to-brpy-10 px-4">
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header Section */}
      <div className=" rounded-2xl p-6">
        <div className="flex justify-center gap-4">
          <div>
            <h1 className="text-3xl flex justify-center font-bold text-gray-900">Weekly Deadline Management</h1>
          </div>
        </div>
      </div>


      {/* Form Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="mb-4 flex bg-white items-center gap-3">
          <FileText className="w-5 h-5 bg-white text-gray-600" />
          <h2 className="text-xl font-semibold bg-white text-gray-900">Set Weekly Deadlines</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6 bg-white ">Please provide future dates for each week.</p>

        <div className="grid bg-white  grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {weeks.map((week, index) => {
            const isValid = week === '' || isValidFutureDate(week);
            return (
              <div key={index} className=' bg-white '>
                <label className="block bg-white  text-sm font-medium text-gray-700 mb-1">
                  Week {String(index + 1).padStart(2, '0')}
                </label>
                <input
                  type="date"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-all ${
                    week && !isValid
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : week && isValid
                      ? 'border-green-300 focus:ring-green-500 bg-green-50'
                      : 'border-gray-300 focus:ring-blue-500 bg-white'
                  }`}
                  value={week}
                  onChange={(e) => handleChange(index, e.target.value)}
                />
                {week && (
                  <div className="text-xs mt-1  bg-white flex items-center gap-1">
                    {isValid ? (
                      <span className="text-green-600 bg-white flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4  bg-white " /> Valid
                      </span>
                    ) : (
                      <span className="text-red-600  bg-white flex items-center gap-1">
                        <AlertTriangle className="w-4  bg-white     h-4" /> Invalid
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Alerts */}
        { error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-red-700 bg-red-50 text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 bg-red-50 h-4" /> {error}
            </p>
          </div>
        )}
        { message && (
          <div className="mt-6 p-4 bg-green-50 border border-green-300 rounded-lg">
            <p className="text-green-700 text-sm bg-green-50 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4  bg-green-50 h-4" /> {message}
            </p>
          </div>
        )}

        {/* Sticky Action Bar */}
        <div className="sticky bottom-0 mt-10 bg-white border-t pt-4 pb-2 flex justify-between items-center">
          <div className="text-xs bg-white text-gray-500">
            ⚠️ All deadlines apply to every team automatically after saving.
          </div>
          <div className="flex bg-white gap-2">
            <button
              type="button"
              onClick={() => setWeeks(Array(12).fill(''))}
              className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Clear All
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || filledWeeks === 0}
              className="px-5 py-2 text-sm font-medium bg-blue-600 group text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2  border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing
                </>
              ) : (
                <>
                  <Save className="w-4 bg-blue-600 700 transition disabled:opacity-50 group-hover:bg-blue-700 h-4" />
                  Submit
                </>
              )}
            </button>
          </div>
        </div>
      </div>


    </div>
  </div>
);

}

export default WeekLogUpdate;