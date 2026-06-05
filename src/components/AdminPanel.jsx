import React, { useState, useEffect } from 'react'
import { loadBlocks, loadEvents, saveEvents, saveBlocks } from '../utils/data'
import './AdminPanel.css'

function AdminPanel() {
  const [events, setEvents] = useState([])
  const [blocks, setBlocks] = useState([])
  const [formData, setFormData] = useState({
    eventName: '',
    blockId: '',
    date: '',
    time: '',
    description: ''
  })

  useEffect(() => {
    setBlocks(loadBlocks())
    setEvents(loadEvents())
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.eventName || !formData.blockId) {
      alert('Please fill in event name and select a block')
      return
    }

    const newEvent = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString()
    }

    const updatedEvents = [...events, newEvent]
    setEvents(updatedEvents)
    saveEvents(updatedEvents)
    
    // Reset form
    setFormData({
      eventName: '',
      blockId: '',
      date: '',
      time: '',
      description: ''
    })
    
    alert('Event added successfully!')
  }

  const handleDelete = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const updatedEvents = events.filter(e => e.id !== eventId)
      setEvents(updatedEvents)
      saveEvents(updatedEvents)
    }
  }

  const selectedBlock = blocks.find(b => b.id === formData.blockId)

  return (
    <div className="admin-panel">
      <div className="admin-container">
        <h2 className="admin-title">Admin Panel - Event Management</h2>
        
        <div className="admin-content">
          <div className="admin-form-section">
            <h3>Add New Event</h3>
            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-group">
                <label htmlFor="eventName">Event Name *</label>
                <input
                  type="text"
                  id="eventName"
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  placeholder="e.g., Guest Lecture on AI"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="blockId">Academic Block *</label>
                <select
                  id="blockId"
                  value={formData.blockId}
                  onChange={(e) => setFormData({ ...formData, blockId: e.target.value })}
                  required
                >
                  <option value="">Select a block</option>
                  {blocks.map(block => (
                    <option key={block.id} value={block.id}>
                      {block.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="time">Time</label>
                  <input
                    type="time"
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event details..."
                  rows="4"
                />
              </div>

              <button type="submit" className="submit-btn">Add Event</button>
            </form>
          </div>

          <div className="admin-list-section">
            <h3>Current Events ({events.length})</h3>
            {events.length === 0 ? (
              <div className="empty-state">
                <p>No events added yet. Add your first event above!</p>
              </div>
            ) : (
              <div className="events-list">
                {events.map(event => {
                  const block = blocks.find(b => b.id === event.blockId)
                  return (
                    <div key={event.id} className="event-card">
                      <div className="event-header">
                        <h4>{event.eventName}</h4>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="delete-btn"
                          title="Delete event"
                        >
                          ×
                        </button>
                      </div>
                      <div className="event-details">
                        <p className="event-block">
                          <strong>Block:</strong> {block ? block.name : 'Unknown'}
                        </p>
                        {event.date && (
                          <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                        )}
                        {event.time && (
                          <p><strong>Time:</strong> {event.time}</p>
                        )}
                        {event.description && (
                          <p className="event-description">{event.description}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel

