const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://khynwzlcxqeafiiychqc.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoeW53emxjeHFlYWZpaXljaHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NjcwMDUsImV4cCI6MjA2NzQ0MzAwNX0.tjQCYjnSYzejKiGnfQD_1pbNK0ALMdHeoH12VMuAJjM");

// Store active SSE connections
const clients = new Set();

exports.flightStatusSSE = (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connection', message: 'Connected to flight status updates' })}\n\n`);

  // Add client to the set
  clients.add(res);

  // Handle client disconnect
  req.on('close', () => {
    clients.delete(res);
  });

  // Keep connection alive with heartbeat
  const heartbeat = setInterval(() => {
    if (res.writableEnded) {
      clearInterval(heartbeat);
      clients.delete(res);
    } else {
      res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
    }
  }, 30000); // Send heartbeat every 30 seconds
};

// Function to broadcast flight status updates to all connected clients
exports.broadcastFlightUpdate = (flightData) => {
  const message = JSON.stringify({
    type: 'flight_update',
    data: flightData,
    timestamp: new Date().toISOString()
  });

  clients.forEach(client => {
    if (!client.writableEnded) {
      client.write(`data: ${message}\n\n`);
    }
  });
};

// Function to broadcast booking updates
exports.broadcastBookingUpdate = (bookingData) => {
  const message = JSON.stringify({
    type: 'booking_update',
    data: bookingData,
    timestamp: new Date().toISOString()
  });

  clients.forEach(client => {
    if (!client.writableEnded) {
      client.write(`data: ${message}\n\n`);
    }
  });
};

// Get current flight status for a specific flight
exports.getFlightStatus = async (req, res) => {
  try {
    const { flightId } = req.params;
    
    const { data: flight, error } = await supabase
      .from('flights')
      .select('*')
      .eq('id', flightId)
      .single();
    
    if (error) throw error;
    
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    
    // Calculate flight status based on departure time
    const now = new Date();
    const departureTime = new Date(flight.departure_time);
    const arrivalTime = new Date(flight.arrival_time);
    
    let status = 'scheduled';
    if (now > arrivalTime) {
      status = 'completed';
    } else if (now > departureTime) {
      status = 'in_flight';
    } else if (now > departureTime - 30 * 60 * 1000) { // 30 minutes before departure
      status = 'boarding';
    }
    
    res.json({
      ...flight,
      status,
      current_time: now.toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 