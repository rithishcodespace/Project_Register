import React from 'react'
import Admin_Navbar from './Admin_Navbar'
import Header from '../../Header'
import { Outlet } from 'react-router-dom'

function Admin() {
    return (
        <div className="flex min-h-screen bg-white">
        <Admin_Navbar />
        <div className="flex-1">
          <Header />
          <div className="p-4">
            <Outlet />
          </div>
        </div>
      </div>
      )
}

export default Admin