import React, { useState } from 'react';
import { User, LocationCoordinates } from '../types';
import { SIMULATED_USERS } from '../data';
import { MapPin, Users, Info, Compass, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  currentLocation: LocationCoordinates;
  onLocationChange: (loc: LocationCoordinates) => void;
}

export default function Header({
  currentUser,
  onUserChange,
  currentLocation,
  onLocationChange
}: HeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const handleBrowserGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: 'Your Live Browser Geolocation'
        });
        setGeoLoading(false);
        setShowLocationDropdown(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert(`Could not retrieve location: ${error.message}. Please use neighborhood presets.`);
        setGeoLoading(false);
      }
    );
  };

  const neighborhoodPresets: LocationCoordinates[] = [
    { lat: 47.6062, lng: -122.3321, label: 'Downtown / Pioneer Square' },
    { lat: 47.6150, lng: -122.3150, label: 'Capitol Hill (Olivia)' },
    { lat: 47.6500, lng: -122.3500, label: 'Fremont (Marcus)' },
    { lat: 47.6684, lng: -122.3842, label: 'Ballard (Sarah)' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo/Header */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-800 text-emerald-50 shadow-sm shrink-0">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <span className="font-display text-xl font-bold tracking-tight text-stone-900">
              ToolShare
            </span>
            <span className="hidden sm:inline-block ml-2 text-[9px] font-bold bg-[#EAF2EC] text-emerald-850 px-2 py-0.5 rounded-full border border-emerald-900/10 uppercase tracking-wider font-mono">
              Neighborhood Circle
            </span>
          </div>
        </div>

        {/* Dynamic Controls Side */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Location Picker */}
          <div className="relative">
            <button
              id="btn-location-dropdown"
              onClick={() => {
                setShowLocationDropdown(!showLocationDropdown);
                setShowUserDropdown(false);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 transition-all duration-150 cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5 text-emerald-700" />
              <span className="max-w-[120px] sm:max-w-[200px] truncate">
                {currentLocation.label}
              </span>
            </button>

            <AnimatePresence>
              {showLocationDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowLocationDropdown(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl border border-stone-200 bg-white p-2 shadow-lg z-20"
                  >
                    <div className="px-3 py-2 text-xs font-semibold text-stone-500 border-b border-stone-100 mb-1 font-mono uppercase tracking-wider">
                      Set Simulated Location
                    </div>

                    {/* Geolocation Button */}
                    <button
                      id="btn-use-live-gps"
                      onClick={handleBrowserGeolocation}
                      disabled={geoLoading}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors duration-150 cursor-pointer"
                    >
                      <Compass className={`h-4 w-4 shrink-0 ${geoLoading ? 'animate-spin' : ''}`} />
                      <span>{geoLoading ? 'Reading GPS...' : 'Use Live GPS Location'}</span>
                    </button>

                    <div className="my-1 border-t border-stone-100" />

                    <div className="px-3 py-1 text-[9px] font-bold tracking-wider text-stone-400 uppercase font-mono">
                      Neighborhood Presets
                    </div>

                    <div className="space-y-0.5 mt-1">
                      {neighborhoodPresets.map((preset) => {
                        const isSelected = preset.lat === currentLocation.lat && preset.lng === currentLocation.lng;
                        return (
                          <button
                            key={preset.label}
                            onClick={() => {
                              onLocationChange(preset);
                              setShowLocationDropdown(false);
                            }}
                            className={`flex w-full flex-col rounded-lg px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#EAF2EC] text-emerald-855 border border-emerald-900/10 font-bold'
                                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                            }`}
                          >
                            <span>{preset.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Selector (Simulates Multi-user login) */}
          <div className="relative">
            <button
              id="btn-user-dropdown"
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowLocationDropdown(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-stone-200 bg-[#FCFAF7] px-2.5 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 shadow-2xs transition-all duration-150 cursor-pointer"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="h-5 w-5 rounded-full object-cover border border-stone-200"
              />
              <span className="hidden md:inline-block max-w-[100px] truncate">
                {currentUser.name}
              </span>
              <Users className="h-3.5 w-3.5 text-emerald-700" />
            </button>

            <AnimatePresence>
              {showUserDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowUserDropdown(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-stone-200 bg-white p-2 shadow-lg z-20"
                  >
                    <div className="px-3 py-2 text-xs font-semibold text-stone-500 border-b border-stone-100 mb-1 font-mono uppercase tracking-wider">
                      Switch Persona (Role Play)
                    </div>

                    <div className="space-y-0.5">
                      {SIMULATED_USERS.map((user) => {
                        const isSelected = user.id === currentUser.id;
                        return (
                          <button
                            key={user.id}
                            id={`btn-persona-${user.id}`}
                            onClick={() => {
                              onUserChange(user);
                              onLocationChange(user.location); // Automatically update simulated location to matching user anchor
                              setShowUserDropdown(false);
                            }}
                            className={`flex w-full items-center gap-2.5 rounded-lg p-2 text-left text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#EAF2EC] text-emerald-855 font-bold border border-emerald-900/10 shadow-2xs'
                                : 'text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              referrerPolicy="no-referrer"
                              className="h-7 w-7 rounded-full object-cover border border-stone-200"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`truncate font-semibold ${isSelected ? 'text-emerald-800' : 'text-stone-850'}`}>
                                {user.name}
                              </p>
                              <p className={`truncate text-[9px] font-bold font-mono uppercase mt-0.5 ${isSelected ? 'text-emerald-800/80' : 'text-stone-400'}`}>
                                {user.id === 'user_ben' ? 'Borrower' : 'Owner'}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-2 border-t border-stone-100 pt-2 px-3 pb-1 text-[9px] leading-relaxed text-stone-550 flex gap-1.5 font-sans">
                      <Info className="h-3.5 w-3.5 shrink-0 text-emerald-800" />
                      <span>Swap persona to simulate both renting tools and managing incoming rental approvals!</span>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* GitHub Link */}
          <a
            id="link-github-repo"
            href="https://github.com/ma-eswar/Toolshare"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[32px] w-[32px] items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 shadow-2xs hover:bg-stone-50 hover:text-stone-900 transition-all duration-150 cursor-pointer"
            title="View on GitHub"
          >
            <Github className="h-4 w-4 text-emerald-800" />
          </a>

        </div>
      </div>
    </header>
  );
}
