import React from 'react';
import Teacher_navbar from './Teacher_navbar';
import Header from '../../Header';
import { Outlet } from 'react-router-dom';

function Teacher() {
  return (
    <div className="flex min-h-screen bg-white">
      <Teacher_navbar />
      <div className="flex-1">
        <Header />
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Teacher;
