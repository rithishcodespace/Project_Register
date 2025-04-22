import React from 'react'
import Navbar from './Student_Navbar'
import Header from '../../Header'
import Student_navbar from './Student_Navbar'
import { Outlet } from 'react-router-dom'

function Student() {
  return (
    <div className="flex min-h-screen bg-white">
    <Student_navbar />
    <div className="flex-1">
      <Header />
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  </div>
  )
}

export default Student