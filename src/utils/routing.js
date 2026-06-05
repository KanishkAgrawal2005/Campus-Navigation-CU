/**
 * Get road-following route between two points using OSRM routing service
 * @param {number} lat1 - Start latitude
 * @param {number} lng1 - Start longitude
 * @param {number} lat2 - End latitude
 * @param {number} lng2 - End longitude
 * @returns {Promise<Array>} - Array of [lat, lng] coordinates following roads
 */
export async function getRouteOnRoads(lat1, lng1, lat2, lng2) {
  try {
    // Use OSRM public demo server (free, no API key needed)
    // Try walking profile first (better for campus paths), fallback to driving
    // Format: lng,lat (OSRM uses longitude first!)
    let url = `https://router.project-osrm.org/route/v1/walking/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`
    
    let response = await fetch(url)
    let data = await response.json()
    
    // If walking fails, try driving profile
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.log('Walking profile failed, trying driving profile')
      url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`
      response = await fetch(url)
      data = await response.json()
    }
    
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      // Extract coordinates from GeoJSON geometry
      const coordinates = data.routes[0].geometry.coordinates
      // Convert from [lng, lat] to [lat, lng] for Leaflet
      return coordinates.map(coord => [coord[1], coord[0]])
    } else {
      console.warn('OSRM routing failed, using straight line:', data)
      // Fallback to straight line if routing fails
      return [[lat1, lng1], [lat2, lng2]]
    }
  } catch (error) {
    console.error('Error getting route from OSRM:', error)
    // Fallback to straight line on error
    return [[lat1, lng1], [lat2, lng2]]
  }
}

/**
 * Get road-following route through multiple waypoints
 * @param {Array} waypoints - Array of [lat, lng] coordinates
 * @returns {Promise<Array>} - Combined route following roads
 */
export async function getRouteThroughWaypoints(waypoints) {
  if (waypoints.length < 2) {
    return waypoints
  }
  
  if (waypoints.length === 2) {
    return await getRouteOnRoads(
      waypoints[0][0], waypoints[0][1],
      waypoints[1][0], waypoints[1][1]
    )
  }
  
  // For multiple waypoints, get route for each segment and combine
  const allRoutePoints = []
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const segment = await getRouteOnRoads(
      waypoints[i][0], waypoints[i][1],
      waypoints[i + 1][0], waypoints[i + 1][1]
    )
    
    // Add segment points (skip first point if not the first segment to avoid duplicates)
    if (i === 0) {
      allRoutePoints.push(...segment)
    } else {
      // Skip first point to avoid duplicate
      allRoutePoints.push(...segment.slice(1))
    }
  }
  
  return allRoutePoints
}

