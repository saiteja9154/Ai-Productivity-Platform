import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Toaster } from 'sonner';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-white">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
      <Toaster richColors position="top-right" theme="dark" />
    </div>
  );
}

export default RootLayout;

