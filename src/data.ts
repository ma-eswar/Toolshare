import { User, Tool } from './types';

export const SIMULATED_USERS: User[] = [
  {
    id: 'user_ben',
    name: 'Borrower Ben',
    location: {
      lat: 47.6062,
      lng: -122.3321,
      label: 'Downtown Seattle / Pioneer Square'
    },
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_olivia',
    name: 'Owner Olivia',
    location: {
      lat: 47.6150,
      lng: -122.3150,
      label: 'Capitol Hill'
    },
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_marcus',
    name: 'Marcus Green',
    location: {
      lat: 47.6500,
      lng: -122.3500,
      label: 'Fremont'
    },
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_sarah',
    name: 'Sarah Chen',
    location: {
      lat: 47.6684,
      lng: -122.3842,
      label: 'Ballard'
    },
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_TOOLS: Tool[] = [
  {
    id: 'tool_1',
    ownerId: 'user_olivia',
    ownerName: 'Owner Olivia',
    name: 'DeWalt Cordless Compact Drill (20V)',
    category: 'Power Tools',
    condition: 'Good',
    description: 'Perfect for hanging frames, shelves, or quick furniture building. Comes with charger and two batteries. Drill bit set included!',
    photoUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=80',
    maxBorrowDays: 3,
    pricePerDay: 150,
    status: 'Available',
    location: {
      lat: 47.6150,
      lng: -122.3150,
      label: 'Capitol Hill, Seattle'
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tool_2',
    ownerId: 'user_olivia',
    ownerName: 'Owner Olivia',
    name: '24-Foot Aluminum Extension Ladder',
    category: 'Ladders',
    condition: 'Good',
    description: 'Heavy professional duty ladder. Reaches roof height for single-story homes. Fits standard roof racks or inside a large SUV.',
    photoUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=500&auto=format&fit=crop&q=80',
    maxBorrowDays: 2,
    pricePerDay: 200,
    status: 'Available',
    location: {
      lat: 47.6160,
      lng: -122.3180,
      label: 'Capitol Hill East, Seattle'
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tool_3',
    ownerId: 'user_marcus',
    ownerName: 'Marcus Green',
    name: 'Honda 3100 PSI Gas Pressure Washer',
    category: 'Cleaning',
    condition: 'Good',
    description: 'Great for cleaning driveways, exterior stucco, decks, or brick walkways. Extremely powerful, uses standard gas (unleaded). Will show you how to start it.',
    photoUrl: 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=500&auto=format&fit=crop&q=80',
    maxBorrowDays: 1,
    pricePerDay: 500,
    status: 'Available',
    location: {
      lat: 47.6500,
      lng: -122.3500,
      label: 'Fremont, Seattle'
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tool_4',
    ownerId: 'user_sarah',
    ownerName: 'Sarah Chen',
    name: 'EGO Power+ Brushless Leaf Blower',
    category: 'Garden',
    condition: 'New',
    description: 'Ultra quiet, super powerful battery operated lawn blower. Recharges in 30 mins. Excellent for cleaning lawn trimmings and patio leaves.',
    photoUrl: 'https://images.unsplash.com/photo-1617101412985-2e0fce5dd22b?w=500&auto=format&fit=crop&q=80',
    maxBorrowDays: 4,
    pricePerDay: 350,
    status: 'Available',
    location: {
      lat: 47.6684,
      lng: -122.3842,
      label: 'Ballard, Seattle'
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tool_5',
    ownerId: 'user_sarah',
    ownerName: 'Sarah Chen',
    name: 'Stanley Complete 145-Piece Socket Set',
    category: 'Hand Tools',
    condition: 'New',
    description: 'An exhaustive metric and imperial socket and mechanics wrench set. Great for working on simple car repairs, bikes, or tightening heavy bolts.',
    photoUrl: 'https://images.unsplash.com/photo-1530124564343-6cdde1422790?w=500&auto=format&fit=crop&q=80',
    maxBorrowDays: 5,
    pricePerDay: 100,
    status: 'Available',
    location: {
      lat: 47.6690,
      lng: -122.3850,
      label: 'Ballard North, Seattle'
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];
