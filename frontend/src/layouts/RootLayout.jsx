import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-white">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}

export default RootLayout;

