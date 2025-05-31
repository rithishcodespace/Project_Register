import React, { useState } from 'react'
import coll from "./assets/college_img.png"
import { useSelector } from 'react-redux';

function Header() {

  const selector = useSelector((state) => state.userSlice);
  const [showPopup, setShowPopup] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  return (
    <>
    
      <div className='w-full h-24 relative z-50 shadow-md top-0 overflow-auto bg-white flex items-center mx- justify-between absolute z-10 '>
        <h6 className='bg-white text-3xl mt-1 ml-3 inline '>Project Register</h6>
        <div className='w-10 h-10 mr-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-semibold'
         onClick={() => setShowPopup(!showPopup)}>
          {selector.emailId[0]}
        </div>

         {/* Popup */}
      {showPopup && (
        <div className='absolute right-0 top-12 w-80 bg-white shadow-lg rounded-lg p-4 border z-50'>
          <h2 className='text-xl font-bold mb-2'>User Info</h2>
          <div className='text-sm space-y-1'>
            <p><strong>Name:</strong> {selector.name}</p>
            <p><strong>Email:</strong> {selector.emailId}</p>
            <p><strong>Reg. Number:</strong> {selector.reg_num}</p>
            <p><strong>Department:</strong> {selector.department}</p>
            <p><strong>Password:</strong> ******</p>
          </div>

          {/* Change Password Toggle */}
          {!showChangePassword ? (
            <button
              className='mt-4 text-blue-500 underline'
              onClick={() => setShowChangePassword(true)}
            >
              Change Password
            </button>
          ) : (
            <div className='mt-4 space-y-2'>
              <input
                type='password'
                placeholder='New Password'
                className='w-full border px-2 py-1 rounded'
              />
              <input
                type='password'
                placeholder='Confirm Password'
                className='w-full border px-2 py-1 rounded'
              />
              <button className='bg-blue-500 text-white px-4 py-1 rounded mt-1'>
                Submit
              </button>
              <button
                className='text-red-500 ml-4 underline'
                onClick={() => setShowChangePassword(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}



      </div>
    </>
  )
}

export default Header