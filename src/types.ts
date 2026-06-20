export type ToolCategory = 'Power Tools' | 'Hand Tools' | 'Garden' | 'Ladders' | 'Cleaning' | 'Other';

export type ToolCondition = 'New' | 'Good' | 'Worn';

export type ToolStatus = 'Available' | 'Requested' | 'Borrowed';

export type RequestStatus = 'Pending' | 'Approved' | 'Declined' | 'Returned';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  label: string;
}

export interface User {
  id: string;
  name: string;
  location: LocationCoordinates;
  avatarUrl: string;
}

export interface Tool {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  category: ToolCategory;
  condition: ToolCondition;
  description: string;
  photoUrl: string;
  maxBorrowDays: number;
  pricePerDay: number;
  status: ToolStatus;
  location: LocationCoordinates;
  createdAt: string;
}

export interface BorrowRequest {
  id: string;
  toolId: string;
  toolName: string;
  toolPhoto: string;
  ownerId: string;
  ownerName: string;
  borrowerId: string;
  borrowerName: string;
  proposedDate: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
}
