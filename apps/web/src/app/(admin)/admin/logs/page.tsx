'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/apiClient';
import { Activity, ShieldAlert, Terminal } from 'lucide-react';
import clsx from 'clsx';

interface AuditLog {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  organization: {
    name: string;
  } | null;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setIsLoading(true);
      try {
        const data = await fetchApi<AuditLog[]>('/admin/logs');
        setLogs(data);
      } catch (err) {
        console.error('Failed to load logs', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in p-8">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">System Logs</h2>
        <p className="text-neutral-400 mt-2">Platform-wide audit trail of security and system events.</p>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-neutral-500" />
            <h3 className="text-sm font-bold text-neutral-300 font-mono">Live Audit Stream</h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Monitoring Active
          </div>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12 text-neutral-500 flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              Fetching audit stream...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 bg-white/[0.01] rounded-xl border border-white/5 border-dashed flex flex-col items-center">
              <ShieldAlert size={32} className="opacity-20 mb-3" />
              No audit logs recorded yet.
            </div>
          ) : (
            <div className="space-y-3 font-mono text-sm max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {logs.map(log => (
                <div key={log.id} className="flex gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                  <div className="text-neutral-600 shrink-0 whitespace-nowrap">
                    {new Date(log.createdAt).toISOString().replace('T', ' ').substring(0, 19)}
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <span className="font-bold text-indigo-400">[{log.action}]</span>
                    
                    <span className="text-neutral-300">
                      {log.user.firstName} {log.user.lastName} <span className="opacity-50">({log.user.email})</span>
                    </span>

                    {log.organization && (
                      <>
                        <span className="text-neutral-600">in</span>
                        <span className="text-purple-400 bg-purple-500/10 px-2 rounded">{log.organization.name}</span>
                      </>
                    )}

                    {log.entityType && (
                      <>
                        <span className="text-neutral-600">on</span>
                        <span className="text-emerald-400">{log.entityType}</span>
                        {log.entityId && <span className="text-neutral-500 text-xs">#{log.entityId.substring(0,8)}</span>}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
