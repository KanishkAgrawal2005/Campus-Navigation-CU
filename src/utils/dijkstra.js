/**
 * Dijkstra's Algorithm for finding shortest path
 * @param {Object} graph - Adjacency list representation of the graph
 * @param {string} start - Starting node ID
 * @param {string} end - Destination node ID
 * @returns {Object} - { path: array of node IDs, distance: total distance }
 */
export function dijkstra(graph, start, end) {
  // Check if start or end nodes exist in graph
  if (!graph[start] || !graph[end]) {
    console.error('Start or end node not in graph', { start, end, graph })
    return { path: [], distance: Infinity }
  }

  // If start and end are the same
  if (start === end) {
    return { path: [start], distance: 0 }
  }

  // Initialize distances and previous nodes
  const distances = {}
  const previous = {}
  const unvisited = new Set()
  
  // Initialize all nodes
  for (const node in graph) {
    distances[node] = Infinity
    previous[node] = null
    unvisited.add(node)
  }
  
  distances[start] = 0
  
  while (unvisited.size > 0) {
    // Find the unvisited node with the smallest distance
    let currentNode = null
    let smallestDistance = Infinity
    
    for (const node of unvisited) {
      if (distances[node] < smallestDistance) {
        smallestDistance = distances[node]
        currentNode = node
      }
    }
    
    // If no path exists
    if (currentNode === null || distances[currentNode] === Infinity) {
      console.log('No path found - no reachable nodes')
      return { path: [], distance: Infinity }
    }
    
    // If we reached the destination
    if (currentNode === end) {
      const path = []
      let node = end
      
      while (node !== null) {
        path.unshift(node)
        node = previous[node]
      }
      
      console.log('Path found:', path, 'Distance:', distances[end])
      return { path, distance: distances[end] }
    }
    
    unvisited.delete(currentNode)
    
    // Update distances to neighbors
    if (graph[currentNode]) {
      for (const neighbor in graph[currentNode]) {
        if (unvisited.has(neighbor)) {
          const edgeWeight = graph[currentNode][neighbor]
          const alt = distances[currentNode] + edgeWeight
          if (alt < distances[neighbor]) {
            distances[neighbor] = alt
            previous[neighbor] = currentNode
          }
        }
      }
    }
  }
  
  console.log('No path found after exploring all nodes')
  return { path: [], distance: Infinity }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in meters
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000 // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Build graph from nodes and connections
 * @param {Array} nodes - Array of node objects with id, lat, lng
 * @param {Array} connections - Array of connection objects with from, to
 * @returns {Object} - Graph adjacency list
 */
export function buildGraph(nodes, connections) {
  const graph = {}
  
  // Initialize all nodes
  nodes.forEach(node => {
    if (node && node.id) {
      graph[node.id] = {}
    }
  })
  
  // Add edges with distances
  connections.forEach(conn => {
    if (!conn.from || !conn.to) {
      console.warn('Invalid connection:', conn)
      return
    }
    
    const fromNode = nodes.find(n => n && n.id === conn.from)
    const toNode = nodes.find(n => n && n.id === conn.to)
    
    if (fromNode && toNode) {
      const distance = calculateDistance(
        fromNode.lat,
        fromNode.lng,
        toNode.lat,
        toNode.lng
      )
      if (!graph[conn.from]) graph[conn.from] = {}
      if (!graph[conn.to]) graph[conn.to] = {}
      graph[conn.from][conn.to] = distance
      graph[conn.to][conn.from] = distance // Undirected graph
    } else {
      console.warn('Nodes not found for connection:', conn, { fromNode, toNode })
    }
  })
  
  console.log('Built graph:', graph)
  return graph
}

