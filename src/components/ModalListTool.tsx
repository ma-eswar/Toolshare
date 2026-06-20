import React, { useState, useEffect } from 'react';
import { ToolCategory, ToolCondition, LocationCoordinates } from '../types';
import { fileToBase64 } from '../utils';
import { X, Upload, MapPin, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ModalListToolProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (toolData: {
    name: string;
    category: ToolCategory;
    condition: ToolCondition;
    description: string;
    photoUrl: string;
    maxBorrowDays: number;
    pricePerDay: number;
    location: LocationCoordinates;
  }) => void;
  currentLocation: LocationCoordinates;
}

const CATEGORIES: ToolCategory[] = [
  'Power Tools',
  'Hand Tools',
  'Garden',
  'Ladders',
  'Cleaning',
  'Other'
];

const PRESET_PHOTOS = [
  {
    label: 'Chainsaw',
    url: 'https://images.unsplash.com/photo-1590105574044-67ad62ba4a77?w=500&auto=format&fit=crop&q=80'
  },
  {
    label: 'Circular Saw',
    url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=80'
  },
  {
    label: 'Lawn Trimmer',
    url: 'https://images.unsplash.com/photo-1617101412985-2e0fce5dd22b?w=500&auto=format&fit=crop&q=80'
  },
  {
    label: 'Wrench Set',
    url: 'https://images.unsplash.com/photo-1540104230489-0ae991cb3298?w=500&auto=format&fit=crop&q=80'
  }
];

export default function ModalListTool({
  isOpen,
  onClose,
  onSubmit,
  currentLocation
}: ModalListToolProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ToolCategory>('Power Tools');
  const [condition, setCondition] = useState<ToolCondition>('Good');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [maxBorrowDays, setMaxBorrowDays] = useState(3);
  const [pricePerDay, setPricePerDay] = useState(150);
  const [locationLabel, setLocationLabel] = useState(currentLocation.label);
  const [latitude, setLatitude] = useState(currentLocation.lat);
  const [longitude, setLongitude] = useState(currentLocation.lng);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLocationLabel(currentLocation.label);
      setLatitude(currentLocation.lat);
      setLongitude(currentLocation.lng);
    }
  }, [isOpen, currentLocation]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image too large. Please upload an image under 2MB");
      return;
    }

    try {
      setUploadError('');
      const base64 = await fileToBase64(file);
      setPhotoUrl(base64);
    } catch (err) {
      setUploadError("Could not process uploaded file");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return alert("Please specify a tool name");
    if (!description.trim()) return alert("Please write a short description");
    
    // Choose fallback default image if none specified
    const finalPhoto = photoUrl || 'https://images.unsplash.com/photo-1530124564343-6cdde1422790?w=500&auto=format&fit=crop&q=80';

    onSubmit({
      name,
      category,
      condition,
      description,
      photoUrl: finalPhoto,
      maxBorrowDays,
      pricePerDay,
      location: {
        lat: latitude,
        lng: longitude,
        label: locationLabel
      }
    });

    // Reset Form
    setName('');
    setCategory('Power Tools');
    setCondition('Good');
    setDescription('');
    setPhotoUrl('');
    setMaxBorrowDays(3);
    setPricePerDay(150);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background shadow overlay */}
      <div 
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs" 
        onClick={onClose} 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg overflow-hidden rounded-xl bg-white border border-stone-200 shadow-xl z-10"
      >
        {/* Header decoration */}
        <div className="px-6 py-4 border-b border-stone-150 flex items-center justify-between bg-[#FCFAF7]">
          <div>
            <h3 className="font-display text-lg font-bold text-stone-900">List Your Tool in the Registry</h3>
            <p className="text-xs font-semibold text-stone-500 mt-0.5">Publish a tool so neighbors can request it.</p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-stone-450 hover:bg-stone-100 hover:text-stone-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form container scroll */}
        <form onSubmit={handleFormSubmit} className="max-h-[72vh] overflow-y-auto p-6 space-y-4 bg-white">
          
          {/* Tool Title */}
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1 font-mono">
              Tool Name
            </label>
            <input
              id="input-toolname"
              type="text"
              required
              placeholder="e.g. Bosch Professional SDS Hammer Drill"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-stone-200 py-2.5 px-3 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-hidden bg-[#FCFAF7] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category Select */}
            <div>
              <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1 font-mono">
                Category
              </label>
              <select
                id="select-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ToolCategory)}
                className="w-full rounded-lg border border-stone-200 bg-[#FCFAF7] py-2.5 px-3 text-xs font-semibold text-stone-900 focus:outline-hidden transition-colors cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Condition Select */}
            <div>
              <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1 font-mono">
                Condition
              </label>
              <select
                id="select-condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value as ToolCondition)}
                className="w-full rounded-lg border border-stone-200 bg-[#FCFAF7] py-2.5 px-3 text-xs font-semibold text-stone-900 focus:outline-hidden transition-colors cursor-pointer"
              >
                <option value="New">New (Mint Condition)</option>
                <option value="Good">Good (Working fine)</option>
                <option value="Worn">Worn (Some scuffs, works)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[9px] font-bold text-stone-450 uppercase tracking-widest mb-1 font-mono">
              Description & Accessories
            </label>
            <textarea
              id="input-description"
              required
              rows={3}
              placeholder="Include details about drill bits, key rules for power startup, or general tips."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-stone-200 py-2.5 px-3 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-hidden bg-[#FCFAF7] transition-colors"
            />
          </div>

          {/* Image Upload Area */}
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1 font-mono">
              Tool Photo
            </label>
            
            {photoUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-stone-200 h-32 bg-stone-50">
                <img 
                  src={photoUrl} 
                  alt="Preview" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-2 right-2 bg-stone-900/80 hover:bg-stone-950 text-white rounded-full p-1 text-xs transition cursor-pointer shadow-xs border border-stone-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Upload Section */}
                <div className="relative border-2 border-dashed border-stone-200 rounded-lg p-4 flex flex-col items-center justify-center text-center bg-[#FCFAF7] hover:bg-stone-50 transition cursor-pointer">
                  <Upload className="h-5 w-5 text-stone-400" />
                  <span className="text-xs font-semibold text-stone-700 mt-1">Upload file</span>
                  <span className="text-[9px] font-bold text-stone-450 uppercase font-mono mt-0.5">Under 2MB</span>
                  <input
                    id="input-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer animate-none"
                  />
                </div>

                {/* Preset Options Section */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block font-mono">
                    ⚡ Preset Photos
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRESET_PHOTOS.map((prep) => (
                      <button
                        key={prep.label}
                        type="button"
                        onClick={() => setPhotoUrl(prep.url)}
                        className="rounded border border-stone-200 p-1 bg-white hover:border-stone-400 transition text-left flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <img 
                          src={prep.url} 
                          alt={prep.label} 
                          referrerPolicy="no-referrer"
                          className="h-7 w-7 rounded object-cover border border-stone-200"
                        />
                        <span className="text-[8px] font-bold text-stone-600 truncate">{prep.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
            {uploadError && (
              <p className="text-[10px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {uploadError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Max Borrow Days */}
            <div>
              <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1 font-mono">
                Max borrow days
              </label>
              <input
                id="input-max-days"
                type="number"
                min={1}
                max={30}
                value={maxBorrowDays}
                onChange={(e) => setMaxBorrowDays(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-200 py-2 px-3 text-xs font-semibold text-stone-900 bg-[#FCFAF7] focus:outline-hidden transition-colors"
              />
            </div>

            {/* Price per day */}
            <div>
              <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1 font-mono">
                Price per day (₹)
              </label>
              <input
                id="input-price-per-day"
                type="number"
                min={0}
                value={pricePerDay}
                onChange={(e) => setPricePerDay(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-200 py-2 px-3 text-xs font-semibold text-stone-900 bg-[#FCFAF7] focus:outline-hidden transition-colors"
              />
            </div>

            {/* Simulated Address Tag */}
            <div className="col-span-2">
              <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-1 font-mono">
                <MapPin className="h-3.5 w-3.5 text-emerald-800" />
                Lending Address Location
              </label>
              <input
                id="input-address"
                type="text"
                required
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                className="w-full rounded-lg border border-stone-200 py-2.5 px-3 text-xs font-medium text-stone-900 bg-[#FCFAF7] focus:outline-hidden transition-colors"
              />
            </div>
          </div>

          {/* Action Submission */}
          <div className="border-t border-stone-150 pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs font-semibold text-stone-650 hover:bg-stone-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-submit-list-tool"
              type="submit"
              className="rounded-lg bg-emerald-800 hover:bg-emerald-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:shadow-md transition cursor-pointer"
            >
              Confirm & List
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
