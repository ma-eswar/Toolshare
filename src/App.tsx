import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BrowsePanel from './components/BrowsePanel';
import DashboardPanel from './components/DashboardPanel';
import ModalListTool from './components/ModalListTool';
import ModalToolDetail from './components/ModalToolDetail';
import { User, Tool, BorrowRequest, LocationCoordinates } from './types';
import { SIMULATED_USERS, INITIAL_TOOLS } from './data';
import { Compass, Sparkles, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // 1. Core State Handlers
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('toolshare_user');
    return saved ? JSON.parse(saved) : SIMULATED_USERS[0];
  });

  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates>(() => {
    const saved = localStorage.getItem('toolshare_coords');
    return saved ? JSON.parse(saved) : SIMULATED_USERS[0].location;
  });

  const [tools, setTools] = useState<Tool[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Active View Tab: 'browse' vs 'dashboard'
  const [activeTab, setActiveTab] = useState<'browse' | 'dashboard'>('browse');

  // Modals state
  const [isListOpen, setIsListOpen] = useState(false);
  const [selectedToolForDetail, setSelectedToolForDetail] = useState<Tool | null>(null);

  // In-app alert notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Local Storage fallback database mode
  const [isFallbackMode, setIsFallbackMode] = useState(false);

  // 2. Synchronize simulated identities with localStorage
  useEffect(() => {
    localStorage.setItem('toolshare_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('toolshare_coords', JSON.stringify(currentLocation));
  }, [currentLocation]);

  // Fetch tools and requests from Express backend API
  const fetchData = async () => {
    try {
      const [toolsRes, reqRes] = await Promise.all([
        fetch('/api/tools'),
        fetch('/api/requests')
      ]);
      
      if (!toolsRes.ok || !reqRes.ok) {
        throw new Error('Non-ok response from API');
      }
      
      const contentType1 = toolsRes.headers.get('content-type') || '';
      const contentType2 = reqRes.headers.get('content-type') || '';
      if (!contentType1.includes('application/json') || !contentType2.includes('application/json')) {
        throw new Error('API returned HTML instead of JSON (possibly static redirect)');
      }

      const toolsData = await toolsRes.json();
      const requestsData = await reqRes.json();
      setTools(toolsData);
      setRequests(requestsData);
      setIsFallbackMode(false);
    } catch (err) {
      console.warn('API connection failed, falling back to local storage database:', err);
      setIsFallbackMode(true);
      
      const localTools = localStorage.getItem('toolshare_db_tools');
      const localRequests = localStorage.getItem('toolshare_db_requests');
      
      const seededTools = localTools ? JSON.parse(localTools) : INITIAL_TOOLS;
      const seededRequests = localRequests ? JSON.parse(localRequests) : [];
      
      setTools(seededTools);
      setRequests(seededRequests);
      
      if (!localTools) localStorage.setItem('toolshare_db_tools', JSON.stringify(INITIAL_TOOLS));
      if (!localRequests) localStorage.setItem('toolshare_db_requests', JSON.stringify([]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to Server-Sent Events (SSE) for real-time updates
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'REFRESH') {
          fetchData();
        }
      } catch (err) {
        console.error('Error parsing SSE updates', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Utility to show temporary toast confirmation
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // 3. Action callbacks talking to Express REST routes or local storage fallback
  const handleAddNewTool = async (toolData: {
    name: string;
    category: any;
    condition: any;
    description: string;
    photoUrl: string;
    maxBorrowDays: number;
    pricePerDay: number;
    location: LocationCoordinates;
  }) => {
    const newTool = {
      id: `tool_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'Available' as const,
      ...toolData
    };

    if (isFallbackMode) {
      const updatedTools = [newTool, ...tools];
      setTools(updatedTools);
      localStorage.setItem('toolshare_db_tools', JSON.stringify(updatedTools));
      showToast(`Successfully listed "${toolData.name}" in the catalog!`);
      return;
    }

    try {
      const res = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolData)
      });
      if (res.ok) {
        showToast(`Successfully listed "${toolData.name}" in the catalog!`);
      } else {
        showToast('Failed to list tool on server');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error listing tool');
    }
  };

  const handleSendBorrowRequest = async (reqData: {
    toolId: string;
    proposedDate: string;
    message: string;
  }) => {
    const selectedTool = tools.find((t) => t.id === reqData.toolId);
    if (!selectedTool) return;

    if (isFallbackMode) {
      const newRequest = {
        id: `request_${Date.now()}`,
        toolId: selectedTool.id,
        toolName: selectedTool.name,
        toolPhoto: selectedTool.photoUrl,
        ownerId: selectedTool.ownerId,
        ownerName: selectedTool.ownerName,
        borrowerId: currentUser.id,
        borrowerName: currentUser.name,
        proposedDate: reqData.proposedDate,
        message: reqData.message,
        status: 'Pending' as const,
        createdAt: new Date().toISOString()
      };

      const updatedTools = tools.map(t => 
        t.id === selectedTool.id ? { ...t, status: 'Requested' as const } : t
      );
      const updatedRequests = [newRequest, ...requests];

      setTools(updatedTools);
      setRequests(updatedRequests);
      localStorage.setItem('toolshare_db_tools', JSON.stringify(updatedTools));
      localStorage.setItem('toolshare_db_requests', JSON.stringify(updatedRequests));

      showToast(`Rental request for "${selectedTool.name}" submitted!`);
      return;
    }

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: reqData.toolId,
          proposedDate: reqData.proposedDate,
          message: reqData.message,
          borrowerId: currentUser.id,
          borrowerName: currentUser.name
        })
      });
      if (res.ok) {
        showToast(`Rental request for "${selectedTool.name}" submitted!`);
      } else {
        showToast('Failed to submit request');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error submitting request');
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (isFallbackMode) {
      const updatedRequests = requests.map(r => 
        r.id === requestId ? { ...r, status: 'Approved' as const } : r
      );
      const targetRequest = requests.find(r => r.id === requestId);
      const updatedTools = tools.map(t => 
        t.id === targetRequest?.toolId ? { ...t, status: 'Borrowed' as const } : t
      );

      setRequests(updatedRequests);
      setTools(updatedTools);
      localStorage.setItem('toolshare_db_tools', JSON.stringify(updatedTools));
      localStorage.setItem('toolshare_db_requests', JSON.stringify(updatedRequests));
      showToast(`You approved the rental! Tool is now marked as rented.`);
      return;
    }

    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' })
      });
      if (res.ok) {
        showToast(`You approved the rental! Tool is now marked as rented.`);
      } else {
        showToast('Failed to approve rental');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error approving rental');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    if (isFallbackMode) {
      const updatedRequests = requests.map(r => 
        r.id === requestId ? { ...r, status: 'Declined' as const } : r
      );
      const targetRequest = requests.find(r => r.id === requestId);
      const updatedTools = tools.map(t => 
        t.id === targetRequest?.toolId ? { ...t, status: 'Available' as const } : t
      );

      setRequests(updatedRequests);
      setTools(updatedTools);
      localStorage.setItem('toolshare_db_tools', JSON.stringify(updatedTools));
      localStorage.setItem('toolshare_db_requests', JSON.stringify(updatedRequests));
      showToast(`Declined rental request.`);
      return;
    }

    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Declined' })
      });
      if (res.ok) {
        showToast(`Declined rental request.`);
      } else {
        showToast('Failed to decline request');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error declining request');
    }
  };

  const handleMarkReturned = async (requestId: string) => {
    if (isFallbackMode) {
      const updatedRequests = requests.map(r => 
        r.id === requestId ? { ...r, status: 'Returned' as const } : r
      );
      const targetRequest = requests.find(r => r.id === requestId);
      const updatedTools = tools.map(t => 
        t.id === targetRequest?.toolId ? { ...t, status: 'Available' as const } : t
      );

      setRequests(updatedRequests);
      setTools(updatedTools);
      localStorage.setItem('toolshare_db_tools', JSON.stringify(updatedTools));
      localStorage.setItem('toolshare_db_requests', JSON.stringify(updatedRequests));
      showToast(`Tool marked as returned and is now available again!`);
      return;
    }

    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Returned' })
      });
      if (res.ok) {
        showToast(`Tool marked as returned and is now available again!`);
      } else {
        showToast('Failed to process return');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error returning tool');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16 text-[#1E1C1A] selection:bg-emerald-200">
      
      {/* 1. Shell Control Header */}
      <Header
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        currentLocation={currentLocation}
        onLocationChange={setCurrentLocation}
      />

      {/* 2. Primary Navigation Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Navigation Selector Bar */}
        <div className="flex items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-6">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-stone-100 border border-stone-200">
            <button
              id="btn-tab-browse"
              onClick={() => setActiveTab('browse')}
              className={`rounded px-4 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer ${
                activeTab === 'browse'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Explore Tools
            </button>
            <button
              id="btn-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`rounded px-4 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              My Dashboard
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-900 font-serif italic">
            <Compass className="h-4 w-4 text-emerald-800" />
            <span>Real-time connection active. Swapping tabs updates instantly.</span>
          </div>
        </div>

        {/* 3. In-App Pop Toast Banner Alert */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="sticky top-20 z-30 mx-auto max-w-md w-full mb-6 p-4 bg-white text-stone-900 rounded-xl border border-stone-200 shadow-md flex items-center gap-2.5"
            >
              <div className="h-5 w-5 bg-emerald-800 rounded-full flex items-center justify-center shrink-0">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
              <p className="text-xs font-bold select-none leading-normal">
                {toastMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. Active Main panels rendering wrapper */}
        <div className="relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-500">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider font-mono">Syncing Circle DB...</p>
            </div>
          ) : activeTab === 'browse' ? (
            <BrowsePanel
              tools={tools}
              currentLocation={currentLocation}
              onSelectTool={setSelectedToolForDetail}
              onOpenListForm={() => setIsListOpen(true)}
            />
          ) : (
            <DashboardPanel
              currentUser={currentUser}
              tools={tools}
              requests={requests}
              onApproveRequest={handleApproveRequest}
              onDeclineRequest={handleDeclineRequest}
              onMarkReturned={handleMarkReturned}
            />
          )}
        </div>
      </main>

      {/* 5. Tool Listing Drawer Modal */}
      <ModalListTool
        isOpen={isListOpen}
        onClose={() => setIsListOpen(false)}
        onSubmit={handleAddNewTool}
        currentLocation={currentLocation}
      />

      {/* 6. Tool Detail Selection Modal */}
      <ModalToolDetail
        isOpen={selectedToolForDetail !== null}
        tool={selectedToolForDetail}
        currentUser={currentUser}
        currentLocation={currentLocation}
        onClose={() => setSelectedToolForDetail(null)}
        onSubmitRequest={handleSendBorrowRequest}
      />

      {/* Simulated instructions footer banner */}
      <footer className="mt-20 border-t border-stone-200 bg-white py-10 text-center text-stone-600">
        <div className="mx-auto max-w-7xl px-4 text-xs space-y-3">
          <p className="font-display font-bold text-stone-900 flex items-center justify-center gap-1.5 uppercase tracking-widest text-[12px]">
            <Sparkles className="h-4 w-4 text-emerald-800" />
            Neighborhood Circle Registry
          </p>
          <div className="max-w-2xl mx-auto space-y-2 text-stone-600 leading-relaxed text-[11px]">
            <p>
              1. <strong>Test Real-Time Syncing</strong>: Open this application in **two browser tabs** side-by-side. 
            </p>
            <p>
              2. <strong>Create & Request</strong>: In Tab A (as Borrower Ben), explore tools and send a request. In Tab B (as Olivia), click "My Dashboard" to see the request appear instantly without refreshing!
            </p>
            <p>
              3. <strong>Approve & Persist</strong>: Approve the request on Tab B, and verify the status instantly updates to "Approved" on Tab A. Data is permanently saved to <code>server/database.json</code>.
            </p>
          </div>
          <p className="pt-6 text-[10px] font-mono text-stone-400">
            © 2026 ToolShare Network • Production Standalone Configuration
          </p>
        </div>
      </footer>

    </div>
  );
}
