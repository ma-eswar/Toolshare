import React, { useState, useMemo } from 'react';
import { Tool, ToolCategory, LocationCoordinates } from '../types';
import { calculateHaversineDistance } from '../utils';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface BrowsePanelProps {
  tools: Tool[];
  currentLocation: LocationCoordinates;
  onSelectTool: (tool: Tool) => void;
  onOpenListForm: () => void;
}

const CATEGORIES: (ToolCategory | 'All')[] = [
  'All',
  'Power Tools',
  'Hand Tools',
  'Garden',
  'Ladders',
  'Cleaning',
  'Other'
];

export default function BrowsePanel({
  tools,
  currentLocation,
  onSelectTool,
  onOpenListForm
}: BrowsePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'All'>('All');
  const [maxDistance, setMaxDistance] = useState<number>(5); // default 5 km (from PRD)

  // Calculate distances and filter tools list
  const processedTools = useMemo(() => {
    return tools
      .map((tool) => {
        const distance = calculateHaversineDistance(
          currentLocation.lat,
          currentLocation.lng,
          tool.location.lat,
          tool.location.lng,
          'km'
        );
        return { ...tool, calculatedDistance: distance };
      })
      .filter((tool) => {
        // Enforce: borrowed tools are hidden from search results
        if (tool.status === 'Borrowed') return false;

        // Search text matching
        const matchesSearch =
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Category filter matching
        const matchesCategory =
          selectedCategory === 'All' || tool.category === selectedCategory;

        // Radius filter matching (if maxDistance is defined and > 0)
        const matchesDistance = maxDistance === 0 || tool.calculatedDistance <= maxDistance;

        return matchesSearch && matchesCategory && matchesDistance;
      })
      // Sort ascending by calculated distance
      .sort((a, b) => a.calculatedDistance - b.calculatedDistance);
  }, [tools, currentLocation, searchQuery, selectedCategory, maxDistance]);

  return (
    <div className="space-y-6">
      
      {/* Top Welcome / Pitch block */}
      <div className="rounded-xl border border-emerald-900/10 bg-[#EAF2EC] p-6 text-stone-900 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold md:text-3xl text-stone-900 leading-tight">
              Rent tools locally from neighbors.
            </h1>
            <p className="mt-1.5 text-xs text-stone-600 leading-relaxed max-w-xl font-medium">
              Hyperlocal resource sharing. Need a drill, ladder, or leaf blower for a quick weekend project? Locate the exact tool nearby and rent it from checked neighbors.
            </p>
          </div>
          <button
            id="btn-trigger-list-tool"
            onClick={onOpenListForm}
            className="self-start md:self-auto rounded-lg bg-emerald-800 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-emerald-900 active:scale-95 transition-all duration-150 shrink-0 cursor-pointer"
          >
            + List a Tool
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
          
          {/* Search Box */}
          <div className="relative md:col-span-5">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-stone-400" />
            </span>
            <input
              id="input-tool-search"
              type="text"
              placeholder="Search tools (e.g., drill, ladder, power washer)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-stone-200 py-2 pl-9 pr-4 text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-emerald-800 bg-[#FCFAF7] transition-colors"
            />
          </div>

          {/* Max Distance Radius Filter */}
          <div className="flex items-center gap-3 md:col-span-4">
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest shrink-0 font-mono">
              Radius Filter:
            </span>
            <select
              id="select-radius-filter"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-xs font-semibold text-stone-850 focus:outline-hidden focus:border-emerald-800 bg-[#FCFAF7] transition-colors cursor-pointer"
            >
              <option value={1}>Within 1 km (Hyperlocal)</option>
              <option value={5}>Within 5 km (Standard)</option>
              <option value={10}>Within 10 km (Bikeable)</option>
              <option value={25}>Within 25 km (Regional)</option>
              <option value={0}>Show all tools</option>
            </select>
          </div>

          {/* Quick Filters Info */}
          <div className="flex items-center justify-end text-[10px] font-bold uppercase tracking-wider text-stone-450 font-mono md:col-span-3">
            <span>Showing {processedTools.length} closest tools</span>
          </div>
        </div>

        {/* Category horizontal scroll select list */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-stone-100 pt-4">
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mr-2 font-mono">
            Categories:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#EAF2EC] text-emerald-855 font-bold border border-emerald-900/10 shadow-2xs'
                    : 'bg-stone-50 text-stone-750 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Results */}
      {processedTools.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {processedTools.map((tool, index) => {
            // Condition tag styles
            const conditionStyles = {
              New: 'bg-[#EAF2EC] text-emerald-850 border-emerald-900/10',
              Good: 'bg-stone-100 text-stone-850 border-stone-200',
              Worn: 'bg-amber-50/70 text-amber-800 border-amber-200/50'
            };

            return (
              <motion.div
                key={tool.id}
                id={`tool-card-${tool.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.3) }}
                onClick={() => onSelectTool(tool)}
                className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs hover:shadow-md hover:border-stone-300 transition-all duration-200 cursor-pointer"
              >
                {/* Photo Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-stone-50 border-b border-stone-100">
                  <img
                    src={tool.photoUrl}
                    alt={tool.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  
                  {/* Status Overlay */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center rounded bg-stone-900/80 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider font-mono">
                      {tool.category}
                    </span>
                    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider font-mono ${conditionStyles[tool.condition]}`}>
                      {tool.condition}
                    </span>
                  </div>

                  {/* Distance Ribbon */}
                  <div className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded bg-stone-900/80 px-2 py-0.5 text-[9px] font-bold text-white tracking-wide font-mono">
                    <MapPin className="h-3 w-3 text-emerald-500 fill-emerald-500" />
                    <span>{tool.calculatedDistance} km away</span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex flex-1 flex-col p-4 bg-white">
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold text-stone-900 leading-snug group-hover:text-emerald-800 transition-colors line-clamp-1">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-xs text-stone-500 font-medium leading-relaxed line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  {/* Footer Stats summary */}
                  <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-[#EAF2EC] border border-stone-150 flex items-center justify-center text-[10px] font-bold text-emerald-855">
                        {tool.ownerName[0]}
                      </div>
                      <div className="text-[11px]">
                        <p className="font-bold text-stone-850 leading-none">{tool.ownerName}</p>
                        <p className="text-[9px] font-bold text-stone-400 font-mono mt-0.5">LENDER</p>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Price</p>
                      <p className="text-xs font-bold text-emerald-800 leading-none mt-0.5">
                        ₹{tool.pricePerDay} / day
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 bg-white px-6 py-12 text-center">
          <SlidersHorizontal className="h-10 w-10 text-stone-400" />
          <h3 className="mt-3 text-sm font-display font-semibold text-stone-900">No tools found within radius</h3>
          <p className="mt-1 text-xs text-stone-550 max-w-md">
            Try adjusting your search criteria, widening the distance radius filter to "Show all tools", or switching simulated profiles.
          </p>
        </div>
      )}

    </div>);
}
