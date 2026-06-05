import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { loadBlocks, loadConnections, loadEvents } from '../utils/data'
import { buildGraph, dijkstra, calculateDistance } from '../utils/dijkstra'
import { getRouteThroughWaypoints } from '../utils/routing'
import './MapPage.css'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom icon for academic blocks
const blockIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Custom icon for user location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Component to handle map updates
function MapUpdater({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

function MapPage() {
  const [blocks, setBlocks] = useState([])
  const [connections, setConnections] = useState([])
  const [events, setEvents] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [shortestPath, setShortestPath] = useState([])
  const [pathDistance, setPathDistance] = useState(null)
  const [mapCenter, setMapCenter] = useState([30.7590, 76.7690]) // Chandigarh University approximate coordinates
  const [mapZoom, setMapZoom] = useState(16)

  useEffect(() => {
    setBlocks(loadBlocks())
    setConnections(loadConnections())
    setEvents(loadEvents())
    getCurrentLocation()
  }, [])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          setMapCenter([location.lat, location.lng])
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your location. Using default map center.')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  const findShortestPath = async (destinationId) => {
    // If no user location, use map center as starting point
    const startLocation = userLocation || { lat: mapCenter[0], lng: mapCenter[1] }
    
    if (!userLocation) {
      console.log('No user location, using map center as start point')
    }

    if (blocks.length === 0) {
      alert('No blocks available. Please add blocks first.')
      return
    }

    const destination = blocks.find(b => b.id === destinationId)
    if (!destination) {
      alert('Destination not found')
      return
    }

    // If no connections exist, use routing API for direct path
    if (connections.length === 0) {
      try {
        const routePath = await getRouteThroughWaypoints([
          [startLocation.lat, startLocation.lng],
          [destination.lat, destination.lng]
        ])
        const directDistance = calculateDistance(
          startLocation.lat,
          startLocation.lng,
          destination.lat,
          destination.lng
        )
        setShortestPath(routePath)
        setPathDistance(directDistance)
        setSelectedDestination(destinationId)
      } catch (error) {
        console.error('Error getting route:', error)
        const directPath = [
          [startLocation.lat, startLocation.lng],
          [destination.lat, destination.lng]
        ]
        setShortestPath(directPath)
        setSelectedDestination(destinationId)
      }
      return
    }

    // Build graph with all blocks
    const graph = buildGraph(blocks, connections)
    
    // Find the nearest block to start location
    let nearestBlock = blocks[0]
    let minDistance = calculateDistance(
      startLocation.lat,
      startLocation.lng,
      blocks[0].lat,
      blocks[0].lng
    )

    blocks.forEach(block => {
      const dist = calculateDistance(
        startLocation.lat,
        startLocation.lng,
        block.lat,
        block.lng
      )
      if (dist < minDistance) {
        minDistance = dist
        nearestBlock = block
      }
    })

    // Add start location as a temporary node
    const userNodeId = 'user-location'
    const allNodes = [
      ...blocks,
      { id: userNodeId, lat: startLocation.lat, lng: startLocation.lng }
    ]

    // Add connection from start location to nearest block ONLY
    // DO NOT add direct connection - we want path to follow network!
    const allConnections = [
      ...connections,
      { from: userNodeId, to: nearestBlock.id }
    ]

    const fullGraph = buildGraph(allNodes, allConnections)
    
    console.log('Graph:', fullGraph)
    console.log('Finding path from:', userNodeId, 'to:', destinationId)

    const result = dijkstra(fullGraph, userNodeId, destinationId)
    
    console.log('Dijkstra result:', result)

    if (result.path.length > 0 && result.distance !== Infinity) {
      // Convert path IDs to coordinates (waypoints)
      const waypoints = result.path.map(nodeId => {
        if (nodeId === userNodeId) {
          return [startLocation.lat, startLocation.lng]
        }
        const node = allNodes.find(n => n.id === nodeId)
        return node ? [node.lat, node.lng] : null
      }).filter(coord => coord !== null)

      if (waypoints.length > 0) {
        try {
          // Get road-following route through all waypoints
          const roadPath = await getRouteThroughWaypoints(waypoints)
          setShortestPath(roadPath)
          setPathDistance(result.distance)
          setSelectedDestination(destinationId)
          console.log('Road-following path set:', roadPath)
        } catch (error) {
          console.error('Error getting road route, using waypoints:', error)
          // Fallback to waypoints if routing fails
          setShortestPath(waypoints)
          setPathDistance(result.distance)
          setSelectedDestination(destinationId)
        }
      } else {
        // Fallback to direct path
        try {
          const routePath = await getRouteThroughWaypoints([
            [startLocation.lat, startLocation.lng],
            [destination.lat, destination.lng]
          ])
          setShortestPath(routePath)
          setPathDistance(calculateDistance(
            startLocation.lat,
            startLocation.lng,
            destination.lat,
            destination.lng
          ))
          setSelectedDestination(destinationId)
        } catch (error) {
          const directPath = [
            [startLocation.lat, startLocation.lng],
            [destination.lat, destination.lng]
          ]
          setShortestPath(directPath)
          setSelectedDestination(destinationId)
        }
      }
    } else {
      // Fallback: use routing API for direct path if Dijkstra fails
      console.log('Dijkstra failed, using routing API for direct path')
      try {
        const routePath = await getRouteThroughWaypoints([
          [startLocation.lat, startLocation.lng],
          [destination.lat, destination.lng]
        ])
        setShortestPath(routePath)
        setPathDistance(calculateDistance(
          startLocation.lat,
          startLocation.lng,
          destination.lat,
          destination.lng
        ))
        setSelectedDestination(destinationId)
      } catch (error) {
        const directPath = [
          [startLocation.lat, startLocation.lng],
          [destination.lat, destination.lng]
        ]
        setShortestPath(directPath)
        setPathDistance(calculateDistance(
          startLocation.lat,
          startLocation.lng,
          destination.lat,
          destination.lng
        ))
        setSelectedDestination(destinationId)
      }
    }
  }

  const handleBlockClick = (blockId) => {
    findShortestPath(blockId)
  }

  const handleEventClick = (event) => {
    findShortestPath(event.blockId)
  }

  return (
    <div className="map-page">
      <div className="map-container-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
        >
          <MapUpdater center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* User location marker */}
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userIcon}
            >
              <Popup>Your Location</Popup>
            </Marker>
          )}

          {/* Connection paths between blocks - shows the network */}
          {connections.map((conn, index) => {
            const fromBlock = blocks.find(b => b.id === conn.from)
            const toBlock = blocks.find(b => b.id === conn.to)
            if (fromBlock && toBlock) {
              return (
                <Polyline
                  key={`connection-${index}`}
                  positions={[[fromBlock.lat, fromBlock.lng], [toBlock.lat, toBlock.lng]]}
                  color="#cccccc"
                  weight={2}
                  opacity={0.4}
                />
              )
            }
            return null
          })}

          {/* Academic blocks markers */}
          {blocks.map(block => (
            <Marker
              key={block.id}
              position={[block.lat, block.lng]}
              icon={blockIcon}
              eventHandlers={{
                click: () => handleBlockClick(block.id)
              }}
            >
              <Popup>
                <div className="popup-content">
                  <h3>{block.name}</h3>
                  <button
                    onClick={() => handleBlockClick(block.id)}
                    className="navigate-btn"
                  >
                    Navigate Here
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Shortest path polyline */}
          {shortestPath.length > 0 && (
            <Polyline
              positions={shortestPath}
              color="#667eea"
              weight={4}
              opacity={0.7}
            />
          )}
        </MapContainer>
      </div>

      <div className="map-sidebar">
        <div className="sidebar-section">
          <h3>Your Location</h3>
          {userLocation ? (
            <div className="location-info">
              <p>Lat: {userLocation.lat.toFixed(6)}</p>
              <p>Lng: {userLocation.lng.toFixed(6)}</p>
              <button onClick={getCurrentLocation} className="refresh-btn">
                Refresh Location
              </button>
            </div>
          ) : (
            <p>Getting your location...</p>
          )}
        </div>

        {pathDistance && (
          <div className="sidebar-section">
            <h3>Route Information</h3>
            <div className="route-info">
              <p className="distance">
                <strong>Distance:</strong> {(pathDistance / 1000).toFixed(2)} km
              </p>
              <p className="distance">
                <strong>Distance:</strong> {pathDistance.toFixed(0)} meters
              </p>
            </div>
          </div>
        )}

        <div className="sidebar-section">
          <h3>Academic Blocks</h3>
          <div className="blocks-list">
            {blocks.map(block => (
              <div
                key={block.id}
                className={`block-item ${selectedDestination === block.id ? 'selected' : ''}`}
                onClick={() => handleBlockClick(block.id)}
              >
                <strong>{block.name}</strong>
                {userLocation && (
                  <span className="distance-badge">
                    {calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      block.lat,
                      block.lng
                    ).toFixed(0)}m
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {events.length > 0 && (
          <div className="sidebar-section">
            <h3>Events</h3>
            <div className="events-list">
              {events.map(event => {
                const block = blocks.find(b => b.id === event.blockId)
                return (
                  <div
                    key={event.id}
                    className="event-item"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="event-name">{event.eventName}</div>
                    <div className="event-location">{block ? block.name : 'Unknown'}</div>
                    {event.date && (
                      <div className="event-date">
                        {new Date(event.date).toLocaleDateString()}
                        {event.time && ` at ${event.time}`}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MapPage

