# Campus Navigation System - Chandigarh University

A React-based campus navigation system that helps students and visitors find the shortest path to academic blocks and events using Dijkstra's algorithm and OpenStreetMap.

## Features

- 🗺️ Interactive map using OpenStreetMap
- 📍 Real-time GPS location tracking
- 🎯 Shortest path finding using Dijkstra's algorithm
- 📅 Event management system
- 🏛️ Academic block navigation
- 👨‍💼 Admin panel for event management

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

### Admin Panel
- Navigate to the Admin Panel to add events
- Enter event name, select academic block, date, time, and description
- Events will appear on the map page for navigation

### Map Page
- Allow location access when prompted
- Click on any academic block marker to find the shortest path
- Click on events in the sidebar to navigate to event locations
- The shortest path will be displayed on the map with distance information

## Project Structure

```
src/
├── components/
│   ├── AdminPanel.jsx      # Admin panel for event management
│   ├── AdminPanel.css
│   ├── MapPage.jsx         # Main map component
│   └── MapPage.css
├── utils/
│   ├── dijkstra.js         # Dijkstra algorithm implementation
│   └── data.js             # Data management utilities
├── App.jsx                 # Main app component with routing
├── App.css
├── main.jsx                # Entry point
└── index.css               # Global styles
```

## Technologies Used

- React 18
- React Router DOM
- Leaflet & React-Leaflet (for OpenStreetMap)
- Vite (build tool)
- LocalStorage (for data persistence)

## Customization

### Update Campus Coordinates
Edit `src/utils/data.js` to update the default academic blocks with your actual coordinates:

```javascript
export const defaultBlocks = [
  {
    id: 'block-b1',
    name: 'BLOCK B1',
    lat: 30.769786,  // Update with actual coordinates
    lng: 76.575586,
    type: 'academic'
  },
  // ... more blocks
]
```

### Add More Connections
Update the `defaultConnections` array in `src/utils/data.js` to add paths between blocks.

## Notes

- Make sure to allow location access in your browser for GPS functionality
- The coordinates in the default data are approximate - update them with actual campus coordinates
- Data is stored in browser localStorage, so it persists between sessions

## License

MIT

