import React, { useState } from 'react';
import { User, Tool, BorrowRequest } from '../types';
import { formatFriendlyDate } from '../utils';
import { 
  Check, 
  X, 
  ArrowLeftRight, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Undo2 
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardPanelProps {
  currentUser: User;
  tools: Tool[];
  requests: BorrowRequest[];
  onApproveRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  onMarkReturned: (requestId: string) => void;
}

export default function DashboardPanel({
  currentUser,
  tools,
  requests,
  onApproveRequest,
  onDeclineRequest,
  onMarkReturned
}: DashboardPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'lending' | 'borrowing'>('lending');
  const [selectedRequestForReturn, setSelectedRequestForReturn] = useState<string | null>(null);

  // Group listings
  const myTools = tools.filter((t) => t.ownerId === currentUser.id);
  const incomingRequests = requests.filter((r) => r.ownerId === currentUser.id);
  const mySentRequests = requests.filter((r) => r.borrowerId === currentUser.id);

  const handleReturnSubmit = (reqId: string) => {
    onMarkReturned(reqId);
    setSelectedRequestForReturn(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Selector sub-tabs toggle */}
      <div className="flex border-b border-stone-200">
        <button
          id="btn-subtab-lending"
          onClick={() => setActiveSubTab('lending')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-all font-display cursor-pointer ${
            activeSubTab === 'lending'
              ? 'border-emerald-800 text-emerald-850 font-bold text-base'
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span>My Lending Garage ({myTools.length})</span>
        </button>
        <button
          id="btn-subtab-borrowing"
          onClick={() => setActiveSubTab('borrowing')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-all font-display cursor-pointer ${
            activeSubTab === 'borrowing'
              ? 'border-emerald-800 text-emerald-855 font-bold text-base'
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>My Rental Log ({mySentRequests.length})</span>
        </button>
      </div>

      {/* RENDER LENDING PANEL */}
      {activeSubTab === 'lending' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Area: Incoming Requests & Loans */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="font-display text-lg font-bold text-stone-900 border-l-4 border-emerald-800 pl-2.5">
              Pending Rental Approvals
            </h2>

            {incomingRequests.filter((r) => r.status === 'Pending').length > 0 ? (
              <div className="space-y-4">
                {incomingRequests
                  .filter((r) => r.status === 'Pending')
                  .map((req) => (
                    <motion.div
                      key={req.id}
                      id={`req-incoming-${req.id}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row gap-4 justify-between"
                    >
                      <div className="flex gap-3 items-start">
                        <img 
                          src={req.toolPhoto} 
                          alt={req.toolName} 
                          referrerPolicy="no-referrer"
                          className="h-14 w-14 rounded-lg object-cover bg-stone-50 border border-stone-200 shrink-0"
                        />
                        <div className="space-y-1">
                          <span className="inline-flex rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-800 uppercase tracking-wider font-mono">
                            Pending Approval
                          </span>
                          <h4 className="text-sm font-bold text-stone-900 leading-tight">
                            {req.borrowerName} <span className="font-normal text-stone-500">requests to rent</span> {req.toolName}
                          </h4>
                          <p className="mt-2 text-xs text-stone-700 bg-stone-50 rounded-lg p-2.5 italic border border-stone-150">
                            "{req.message || 'No additional message left.'}"
                          </p>
                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-bold font-mono text-stone-400">
                            <span>Pickup proposed: {formatFriendlyDate(req.proposedDate)}</span>
                            <span>•</span>
                            <span>Requested: {formatFriendlyDate(req.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Approve / Decline Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          id={`btn-decline-req-${req.id}`}
                          onClick={() => onDeclineRequest(req.id)}
                          className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                          Decline
                        </button>
                        <button
                          id={`btn-approve-req-${req.id}`}
                          onClick={() => onApproveRequest(req.id)}
                          className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-800 px-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-emerald-900 transition-colors cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </button>
                      </div>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/50 p-8 text-center text-stone-550">
                <CheckCircle2 className="mx-auto h-8 w-8 text-stone-400" />
                <p className="mt-2 text-xs font-semibold">No pending borrow requests for your tools.</p>
              </div>
            )}

            {/* Currently Loaned Section */}
            <h2 className="font-display text-lg font-bold text-stone-900 border-l-4 border-emerald-800 pl-2.5 pt-4">
              Tools Currently Loaned Out
            </h2>

            {incomingRequests.filter((r) => r.status === 'Approved').length > 0 ? (
              <div className="space-y-4">
                {incomingRequests
                  .filter((r) => r.status === 'Approved')
                  .map((req) => (
                    <motion.div
                      key={req.id}
                      id={`req-loaned-${req.id}`}
                      className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row gap-4 justify-between"
                    >
                      <div className="flex gap-3">
                        <img 
                          src={req.toolPhoto} 
                          alt={req.toolName} 
                          referrerPolicy="no-referrer"
                          className="h-14 w-14 rounded-lg object-cover bg-stone-50 border border-stone-200 shrink-0"
                        />
                        <div className="space-y-1">
                          <span className="inline-flex rounded border border-emerald-900/10 bg-[#EAF2EC] px-2 py-0.5 text-[9px] font-bold text-emerald-850 uppercase tracking-wider font-mono">
                            In Renter's Possession
                          </span>
                          <h4 className="text-sm font-bold text-stone-900 leading-tight">
                            {req.toolName} <span className="font-normal text-stone-500">is with</span> {req.borrowerName}
                          </h4>
                          <p className="mt-1 text-xs text-stone-500 font-medium">
                            Lent on: {formatFriendlyDate(req.proposedDate)}
                          </p>
                        </div>
                      </div>

                      {/* Return Control */}
                      <div className="flex items-center shrink-0 self-end sm:self-center">
                        {selectedRequestForReturn === req.id ? (
                          <div className="flex items-center gap-2 border border-stone-200 p-2 rounded bg-[#FCFAF7] shadow-xs">
                            <button
                              id={`btn-confirm-return-${req.id}`}
                              onClick={() => handleReturnSubmit(req.id)}
                              className="rounded bg-emerald-800 text-white px-2.5 py-1 text-[11px] font-bold uppercase shadow-2xs cursor-pointer"
                            >
                              Confirm Return
                            </button>
                            <button
                              onClick={() => setSelectedRequestForReturn(null)}
                              className="text-xs text-stone-500 font-bold hover:text-stone-700 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            id={`btn-trigger-return-${req.id}`}
                            onClick={() => setSelectedRequestForReturn(req.id)}
                            className="flex h-9 items-center gap-1.5 rounded-lg border border-emerald-850 bg-emerald-50 px-3.5 text-xs font-bold uppercase tracking-wider text-emerald-800 hover:bg-[#EAF2EC] transition-colors cursor-pointer"
                          >
                            <Undo2 className="h-3.5 w-3.5" />
                            Mark as Returned
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/50 p-8 text-center text-stone-550">
                <HelpCircle className="mx-auto h-8 w-8 text-stone-400" />
                <p className="mt-2 text-xs font-semibold">You don't have any tools loaned out right now.</p>
              </div>
            )}
          </div>

          {/* Right Sidebar: My Listed Tools Catalog */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="font-display text-lg font-bold text-stone-900 border-l-4 border-stone-300 pl-2.5">
              My Garage Listing
            </h2>
            {myTools.length > 0 ? (
              <div className="space-y-3">
                {myTools.map((tool) => {
                  const statusColors = {
                    Available: 'bg-[#EAF2EC] text-emerald-850 border border-emerald-900/10',
                    Requested: 'bg-amber-50 text-amber-800 border border-amber-200',
                    Borrowed: 'bg-stone-100 text-stone-700 border border-stone-200'
                  };
                  return (
                    <div 
                      key={tool.id} 
                      className="rounded-lg border border-stone-200 p-3 bg-white flex items-center justify-between gap-2.5 shadow-2xs"
                    >
                      <div className="flex gap-2.5 items-center min-w-0">
                        <img 
                          src={tool.photoUrl} 
                          alt={tool.name} 
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 rounded object-cover bg-stone-50 border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-850 truncate leading-tight">
                            {tool.name}
                          </p>
                          <p className="text-[9px] font-bold text-stone-400 font-mono mt-0.5 uppercase tracking-wide">{tool.category}</p>
                        </div>
                      </div>
                      <span className={`rounded border px-2 py-0.5 text-[8px] font-bold uppercase shrink-0 font-mono tracking-wider ${statusColors[tool.status]}`}>
                        {tool.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/50 p-6 text-center text-stone-500">
                <p className="text-xs font-semibold">You haven't listed any tools yet!</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* RENDER BORROWING PANEL */}
      {activeSubTab === 'borrowing' && (
        <div className="space-y-6">
          <h2 className="font-display text-lg font-bold text-stone-900 border-l-4 border-emerald-800 pl-2.5">
            My Rental Requests
          </h2>

          {mySentRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mySentRequests.map((req) => {
                // Determine styling based on status
                const statusStyles = {
                  Pending: {
                    badge: 'bg-amber-50 text-amber-800 border border-amber-200',
                    label: 'Pending Approval',
                    desc: 'The tool owner is reviewing your proposed pickup coordinates and date.'
                  },
                  Approved: {
                    badge: 'bg-[#EAF2EC] text-emerald-850 border border-emerald-900/10',
                    label: 'Approved!',
                    desc: 'Approved! Coordinate with the owner below for pickup.'
                  },
                  Declined: {
                    badge: 'bg-rose-50 text-rose-800 border border-rose-200',
                    label: 'Declined',
                    desc: 'Ah, the owner declined this loan. Try searching for similar tools nearby!'
                  },
                  Returned: {
                    badge: 'bg-stone-100 text-stone-600 border border-stone-200',
                    label: 'Returned & Closed',
                    desc: 'Tool has been safely returned to closure. Thank you for building trust!'
                  }
                };

                const currentConfig = statusStyles[req.status];

                return (
                  <div
                    key={req.id}
                    id={`req-borrow-${req.id}`}
                    className="flex flex-col rounded-xl border border-stone-200 bg-white overflow-hidden shadow-xs"
                  >
                    {/* Header */}
                    <div className="border-b border-stone-100 p-4 bg-stone-50/50 flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        <img 
                          src={req.toolPhoto} 
                          alt={req.toolName} 
                          referrerPolicy="no-referrer"
                          className="h-8 w-8 rounded object-cover bg-stone-50 border border-stone-150"
                        />
                        <span className="text-xs font-bold text-stone-850 truncate max-w-[150px]">
                          {req.toolName}
                        </span>
                      </div>
                      <span className={`rounded border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider font-mono shrink-0 ${currentConfig.badge}`}>
                        {currentConfig.label}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex-1 space-y-3">
                      <p className="text-xs text-stone-600 font-medium leading-relaxed">
                        {currentConfig.desc}
                      </p>

                      <div className="rounded-lg bg-[#FCFAF7] p-2.5 space-y-1.5 text-xs text-stone-700 border border-stone-150 font-medium">
                        <p><strong>Owner:</strong> {req.ownerName}</p>
                        <p><strong>Proposed Date:</strong> {formatFriendlyDate(req.proposedDate)}</p>
                        <p className="italic">"{req.message || 'No borrow message text.'}"</p>
                      </div>
                    </div>

                    {/* Footer Info details */}
                    <div className="border-t border-stone-100 px-4 py-3 bg-stone-50/50 text-[10px] text-stone-400 font-mono flex justify-between items-center">
                      <span>Submitted: {formatFriendlyDate(req.createdAt)}</span>
                      {req.status === 'Approved' && (
                        <span className="text-emerald-855 font-sans font-bold uppercase tracking-wider text-[9px]">Ready for Pickup</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/50 p-12 text-center text-stone-500">
              <AlertCircle className="mx-auto h-8 w-8 text-stone-400" />
              <h3 className="mt-2 text-sm font-display font-semibold text-stone-900">No requests sent yet</h3>
              <p className="mt-1 text-xs text-stone-550 max-w-sm mx-auto">
                Discover tools in the catalog, click a listing, and schedule borrowing arrangements with nearby neighbors.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
