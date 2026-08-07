'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useHRStore } from '@/store/hrStore';
import { Clock, Play, Square, MapPin } from 'lucide-react';

export default function ShiftsPage() {
  const { orgId } = useAuthStore();
  const { shifts, activeShifts, isLoading, fetchShifts, fetchActiveShifts, clockIn, clockOut } = useHRStore();
  
  const [isPunching, setIsPunching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  useEffect(() => {
    if (orgId) {
      fetchShifts(orgId);
      fetchActiveShifts(orgId);
    }
  }, [orgId, fetchShifts, fetchActiveShifts]);

  // For simplicity, hardcode a mock location ID, or prompt user to select.
  // In a real flow, locations would be fetched from inventoryStore/locationsStore
  const mockLocationId = 'loc-1'; 

  const handleClockIn = async () => {
    if (!orgId) return;
    setIsPunching(true);
    try {
      await clockIn(orgId, mockLocationId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsPunching(false);
    }
  };

  const handleClockOut = async () => {
    if (!orgId) return;
    setIsPunching(true);
    try {
      await clockOut(orgId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsPunching(false);
    }
  };

  // Determine if current user is clocked in
  // We need the user's ID, but we can assume the active shift check endpoint is user-scoped or we find their shift
  // For the sake of the dashboard demo, we just show a generic "Clock In" button if no active shifts are assigned to "me"
  // Since we don't have "me" easily without decoding JWT, we will just allow clock in/out generically.
  const hasActiveShift = activeShifts.length > 0;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Timeclock & Shifts</h1>
          <p className="text-neutral-500 mt-1 font-medium">Record hours, view active staff, and review past shifts.</p>
        </div>
        
        <div className="bg-white/[0.02]/[0.02] p-2 rounded-2xl border border-white/10 shadow-sm flex items-center gap-2">
          {!hasActiveShift ? (
            <button 
              onClick={handleClockIn}
              disabled={isPunching}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Play size={18} /> Clock In
            </button>
          ) : (
            <button 
              onClick={handleClockOut}
              disabled={isPunching}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Square size={18} /> Clock Out
            </button>
          )}
        </div>
      </div>

      {activeShifts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="text-emerald-500 animate-pulse" /> Active Shifts Now
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeShifts.map(shift => (
              <div key={shift.id} className="bg-white/[0.02]/[0.02] border border-emerald-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />
                <p className="font-bold text-white">{shift.user.firstName} {shift.user.lastName}</p>
                <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1">
                  <MapPin size={14} /> {shift.location.name}
                </p>
                <p className="text-xs font-mono text-neutral-600 mt-3">
                  In: {new Date(shift.clockInTime).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white/[0.02]/[0.02] border border-white/10 rounded-2xl shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-white/[0.05] bg-white/[0.02]/[0.01]">
          <h2 className="font-bold text-white">Shift History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="bg-white/[0.02]/[0.01] text-neutral-500 font-bold uppercase tracking-wider border-b border-white/10 text-xs">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Clock In</th>
                <th className="px-6 py-4">Clock Out</th>
                <th className="px-6 py-4">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {isLoading && shifts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-600">Loading shifts...</td>
                </tr>
              ) : shifts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-600 font-medium">No shift history found.</td>
                </tr>
              ) : (
                shifts.map(shift => {
                  const inTime = new Date(shift.clockInTime);
                  const outTime = shift.clockOutTime ? new Date(shift.clockOutTime) : null;
                  const durationMs = outTime ? outTime.getTime() - inTime.getTime() : new Date().getTime() - inTime.getTime();
                  const hours = Math.floor(durationMs / (1000 * 60 * 60));
                  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

                  return (
                    <tr key={shift.id} className="hover:bg-white/[0.02]/[0.01] transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-white">
                        {inTime.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-neutral-300">
                        {shift.user.firstName} {shift.user.lastName}
                      </td>
                      <td className="px-6 py-4">{shift.location.name}</td>
                      <td className="px-6 py-4 text-emerald-600 font-medium">
                        {inTime.toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 text-neutral-400">
                        {outTime ? outTime.toLocaleTimeString() : <span className="text-orange-500 italic">Active</span>}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {hours}h {minutes}m
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
