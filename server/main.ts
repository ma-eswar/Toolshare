import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

const DB_FILE = path.join(process.cwd(), 'server', 'database.json');

// Ensure server directory exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// Initial Mock Data
const INITIAL_TOOLS: any[] = [
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
      label: 'Capitol Hill'
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
      lat: 47.6150,
      lng: -122.3150,
      label: 'Capitol Hill'
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tool_3',
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
      label: 'Ballard'
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

interface DatabaseSchema {
  tools: any[];
  requests: any[];
}

function loadDB(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const defaultData = { tools: INITIAL_TOOLS, requests: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (err) {
    console.error("Error reading database file", err);
    return { tools: INITIAL_TOOLS, requests: [] };
  }
}

function saveDB(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

// EventSource clients for real-time updates
let eventClients: { id: number; res: any }[] = [];

function broadcastUpdate() {
  const payload = JSON.stringify({ type: 'REFRESH' });
  eventClients.forEach(client => {
    client.res.write(`data: ${payload}\n\n`);
  });
}

// Real-time Event endpoint (Server-Sent Events)
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // Prevent proxy buffering
  });
  
  const clientId = Date.now();
  const newClient = { id: clientId, res };
  eventClients.push(newClient);
  
  req.on('close', () => {
    eventClients = eventClients.filter(client => client.id !== clientId);
  });
});

// REST endpoints
app.get('/api/tools', (req, res) => {
  const db = loadDB();
  res.json(db.tools);
});

app.post('/api/tools', (req, res) => {
  const db = loadDB();
  const newTool = {
    id: `tool_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'Available',
    ...req.body
  };
  db.tools.unshift(newTool);
  saveDB(db);
  broadcastUpdate();
  res.status(201).json(newTool);
});

app.get('/api/requests', (req, res) => {
  const db = loadDB();
  res.json(db.requests);
});

app.post('/api/requests', (req, res) => {
  const db = loadDB();
  const { toolId, proposedDate, message, borrowerId, borrowerName } = req.body;
  const toolIndex = db.tools.findIndex(t => t.id === toolId);
  if (toolIndex === -1) {
    return res.status(404).json({ error: 'Tool not found' });
  }
  
  const tool = db.tools[toolIndex];
  const newRequest = {
    id: `request_${Date.now()}`,
    toolId: tool.id,
    toolName: tool.name,
    toolPhoto: tool.photoUrl,
    ownerId: tool.ownerId,
    ownerName: tool.ownerName,
    borrowerId,
    borrowerName,
    proposedDate,
    message,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  
  tool.status = 'Requested';
  db.requests.unshift(newRequest);
  saveDB(db);
  broadcastUpdate();
  res.status(201).json(newRequest);
});

app.patch('/api/requests/:id', (req, res) => {
  const db = loadDB();
  const requestId = req.params.id;
  const { status } = req.body;
  
  const request = db.requests.find(r => r.id === requestId);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  
  request.status = status;
  
  // Also sync corresponding tool status
  const tool = db.tools.find(t => t.id === request.toolId);
  if (tool) {
    if (status === 'Approved') {
      tool.status = 'Borrowed';
    } else if (status === 'Declined' || status === 'Returned') {
      tool.status = 'Available';
    }
  }
  
  saveDB(db);
  broadcastUpdate();
  res.json(request);
});

// Serve static built files in production
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
