import React from 'react'
import coll from "./assets/college_img.png"

function Header() {
  return (
    <>
    
      <div className='w-full h-24 sticky z-50 shadow-md top-0 overflow-auto bg-white flex items-center mx- justify-between '>
        <h6 className='bg-white text-3xl mt-1 ml-3 inline '>Project Register</h6>
        <img className=' inline mr-9 bg-white size-20' src={coll} alt="" />
      </div>
    </>
  )
}

export default Header