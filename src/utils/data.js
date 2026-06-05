// Default academic blocks for Chandigarh University
// Coordinates are approximate - you should update these with actual coordinates
export const defaultBlocks = [
  {
    id: 'block-b1',
    name: 'BLOCK B1',
    lat: 30.769786,
    lng: 76.575586,
    type: 'academic'
  },
  {
    id: 'block-b2',
    name: 'BLOCK B2',
    lat: 30.769104,
    lng: 76.575847,
    type: 'academic'
  },
  {
    id: 'block-b3',
    name: 'BLOCK B3',
    lat: 30.768707,
    lng: 76.575720,
    type: 'academic'
  },
  {
    id: 'block-b4',
    name: 'BLOCK B4',
    lat: 30.768804,
    lng: 76.574733,
    type: 'academic'
  },
  {
    id: 'block-c1',
    name: 'BLOCK C1',
    lat: 30.766914,
    lng: 76.576122,
    type: 'academic'
  },
  {
    id: 'block-c2',
    name: 'BLOCK C2',
    lat: 30.766223,
    lng: 76.576138,
    type: 'academic'
  },
  {
    id: 'block-c3',
    name: 'BLOCK C3',
    lat: 30.767320,
    lng: 76.574685,
    type: 'academic'
  },
  {
    id: 'block-a3',
    name: 'BLOCK A3',
    lat: 30.769057,
    lng: 76.578606,
    type: 'academic'
  },
  {
    id: 'block-a2',
    name: 'BLOCK A2',
    lat: 30.769790,
    lng: 76.579309,
    type: 'academic'
  },
  {
    id: 'block-a1',
    name: 'BLOCK A1',
    lat: 30.771814,
    lng: 76.578263,
    type: 'academic'
  }
]

// Default connections between blocks (paths)
export const defaultConnections = [
  // B block connections
  { from: 'block-b1', to: 'block-b2' },
  { from: 'block-b2', to: 'block-b3' },
  { from: 'block-b3', to: 'block-b4' },
  // C block connections
  { from: 'block-c1', to: 'block-c2' },
  { from: 'block-c2', to: 'block-c3' },
  { from: 'block-c1', to: 'block-c3' },
  // A block connections
  { from: 'block-a1', to: 'block-a2' },
  { from: 'block-a2', to: 'block-a3' },
  // Cross-block connections
  { from: 'block-b1', to: 'block-c1' },
  { from: 'block-b2', to: 'block-c1' },
  { from: 'block-b3', to: 'block-c2' },
  { from: 'block-b4', to: 'block-c3' },
  { from: 'block-b1', to: 'block-a3' },
  { from: 'block-a3', to: 'block-b2' }
]

// Validation function to check if all connections reference valid blocks
export function validateConnections(blocks, connections) {
  const blockIds = new Set(blocks.map(b => b.id))
  const errors = []
  
  connections.forEach((conn, index) => {
    if (!blockIds.has(conn.from)) {
      errors.push(`Connection ${index}: 'from' block '${conn.from}' does not exist`)
    }
    if (!blockIds.has(conn.to)) {
      errors.push(`Connection ${index}: 'to' block '${conn.to}' does not exist`)
    }
    if (conn.from === conn.to) {
      errors.push(`Connection ${index}: 'from' and 'to' cannot be the same block`)
    }
  })
  
  return errors
}

// Validate default data on load
if (typeof window !== 'undefined') {
  const validationErrors = validateConnections(defaultBlocks, defaultConnections)
  if (validationErrors.length > 0) {
    console.error('Data validation errors:', validationErrors)
  }
}

// Load data from localStorage or return defaults
export function loadBlocks() {
  const saved = localStorage.getItem('campus-blocks')
  return saved ? JSON.parse(saved) : defaultBlocks
}

export function loadConnections() {
  const saved = localStorage.getItem('campus-connections')
  return saved ? JSON.parse(saved) : defaultConnections
}

export function loadEvents() {
  const saved = localStorage.getItem('campus-events')
  return saved ? JSON.parse(saved) : []
}

export function saveBlocks(blocks) {
  localStorage.setItem('campus-blocks', JSON.stringify(blocks))
}

export function saveConnections(connections) {
  localStorage.setItem('campus-connections', JSON.stringify(connections))
}

export function saveEvents(events) {
  localStorage.setItem('campus-events', JSON.stringify(events))
}

