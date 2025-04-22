import React from 'react'
import coll from "./assets/college_img.png"

function Header() {
  return (
    <>
      <div className='w-full h-24 bg-white flex items-center justify-between '>
        <h6 className='bg-white text-3xl font-serif mt-1 ml-3 inline '>Project Register</h6>
        <img className=' inline mr-3 bg-white size-20' src={coll} alt="" />
      </div>
    </>
  )
}

export default Header