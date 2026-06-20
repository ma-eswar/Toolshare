import React, { useState } from 'react';
import { Tool, User } from '../types';
import { calculateHaversineDistance, formatFriendlyDate } from '../utils';
import { X, Calendar, MapPin, AlertCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface ModalToolDetailProps {
  isOpen: boolean;
  tool: Tool | null;
  currentUser: User;
  currentLocation: LocationCoordinates;
  onClose: () => void;
  onSubmitRequest: (requestData: {
    toolId: string;
    proposedDate: string;
    message: string;
  }) => void;
}

interface LocationCoordinates {
  lat: number;
  lng: number;
  label: string;
}

export default function ModalToolDetail({
  isOpen,
  tool,
  currentUser,
  currentLocation,
  onClose,
  onSubmitRequest
}: ModalToolDetailProps) {
  const [proposedDate, setProposedDate] = useState(() => {
    // Default tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [message, setMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  if (!isOpen || !tool) return null;

  const isOwner = tool.ownerId === currentUser.id;

  // Calculate distance
  const distance = calculateHaversineDistance(
    currentLocation.lat,
    currentLocation.lng,
    tool.location.lat,
    tool.location.lng,
    'km'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isOwner) {
      alert("You cannot rent your own tool! Swap simulated profile identities in the header first.");
      return;
    }

    const selectedDate = new Date(proposedDate + 'T12:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setValidationError("Chosen pickup date can't be in the past!");
      return;
    }

    setValidationError('');
    onSubmitRequest({
      toolId: tool.id,
      proposedDate,
      message
    });

    setMessage('');
    onClose();
  };

  const conditionStyles = {
    New: 'bg-[#EAF2EC] text-emerald-850 border-emerald-900/10',
    Good: 'bg-stone-50 text-stone-750 border-stone-200',
    Worn: 'bg-amber-50 text-amber-800 border-amber-200'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Shadow layer */}
      <div 
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs" 
        onClick={onClose} 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-xl bg-white border border-stone-200 shadow-xl z-10"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-stone-900/60 p-2 text-white hover:bg-stone-900 transition-all z-20 cursor-pointer shadow-sm border border-stone-200/20"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Image and Static Meta */}
          <div className="relative aspect-square md:aspect-auto md:h-full bg-stone-100 min-h-[250px]">
            <img 
              src={tool.photoUrl} 
              alt={tool.name} 
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover"
            />
            
            {/* Soft Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="inline-flex rounded border border-stone-200/25 bg-stone-900/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider mb-1.5 font-mono shadow-sm">
                {tool.category}
              </span>
              <h3 className="font-display text-xl font-bold leading-tight">
                {tool.name}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-xs text-stone-300 font-semibold font-mono">
                <MapPin className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" />
                <span>{distance} km away • {tool.location.label}</span>
              </p>
            </div>
          </div>

          {/* Right Column: Interaction Form & Details */}
          <div className="p-6 flex flex-col h-[500px] overflow-y-auto justify-between bg-white md:border-l border-stone-200">
            <div className="space-y-4">
              
              {/* Heading descriptors */}
              <div className="flex items-center justify-between gap-1.5">
                <span className={`rounded border px-2.5 py-0.5 text-[9px] font-bold uppercase font-mono shadow-2xs ${conditionStyles[tool.condition]}`}>
                  Condition: {tool.condition}
                </span>
                <div className="flex gap-2 font-mono">
                  <span className="text-xs font-bold text-emerald-800">
                    ₹{tool.pricePerDay} / day
                  </span>
                </div>
              </div>

              {/* Owner card */}
              <div className="rounded-xl border border-stone-200 p-3 flex items-center gap-3 bg-[#FCFAF7] shadow-2xs">
                <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center font-display font-semibold text-emerald-855 font-mono text-sm leading-none">
                  {tool.ownerName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-900 leading-tight">Lender: {tool.ownerName}</p>
                  <p className="text-[9px] font-bold text-stone-400 font-mono uppercase tracking-wider mt-0.5">Trust Circle Member</p>
                </div>
              </div>

              {/* Description Body */}
              <div>
                <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                  Description
                </h4>
                <p className="mt-1 text-xs text-stone-600 font-medium leading-relaxed font-sans max-h-24 overflow-y-auto">
                  {tool.description}
                </p>
              </div>

              {/* Validation Alert */}
              {validationError && (
                <div className="rounded-lg bg-red-50 border border-red-100 p-2 text-xs text-red-700 flex items-center gap-1.5 font-bold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>

            {/* Interaction Form Block */}
            <div className="border-t border-stone-150 pt-4 mt-4">
              {isOwner ? (
                <div className="rounded-xl bg-amber-50 border border-amber-250 p-4 text-center space-y-2">
                  <ShieldAlert className="h-6 w-6 text-amber-700 mx-auto" />
                  <p className="text-xs font-bold text-amber-850 leading-snug">
                    This is your listed tool!
                  </p>
                  <p className="text-[10px] font-semibold text-amber-600 leading-normal">
                    To test the rental flow, use the switcher in the header to switch identity to <strong>Borrower Ben</strong>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-emerald-800" />
                    Request to Rent
                  </h4>

                  {/* Proposed Pickup Date */}
                  <div>
                    <label className="block text-[9px] font-bold text-stone-400 uppercase mb-1 font-mono">
                      Proposed Pickup Date
                    </label>
                    <input
                      id="input-pickup-date"
                      type="date"
                      required
                      value={proposedDate}
                      onChange={(e) => setProposedDate(e.target.value)}
                      className="w-full rounded-lg border border-stone-200 py-1.5 px-3 text-xs font-bold text-stone-900 bg-[#FCFAF7] focus:outline-hidden focus:border-emerald-800"
                    />
                  </div>

                  {/* Message Field */}
                  <div>
                    <label className="block text-[9px] font-bold text-stone-400 uppercase mb-1 font-mono">
                      Message to Owner
                    </label>
                    <textarea
                      id="input-borrow-message"
                      rows={2}
                      placeholder="e.g. Hi! I need this drill to hang a floating bookshelf on Saturday. Thanks!"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-lg border border-stone-200 py-1.5 px-3 text-xs font-bold text-stone-900 bg-[#FCFAF7] placeholder:text-stone-400 focus:outline-hidden focus:border-emerald-800"
                    />
                  </div>

                  {/* Submission triggers */}
                  <button
                    id="btn-confirm-borrow"
                    type="submit"
                    className="w-full rounded-lg bg-emerald-800 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-950 transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Send Rental Request
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </motion.div>
    </div>);
}
