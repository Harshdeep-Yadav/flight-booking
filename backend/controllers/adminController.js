const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create service role client for admin operations (bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Dashboard Statistics
exports.getStats = async (req, res) => {
  try {
    // Total bookings
    const { count: totalBookings } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
    
    // Total revenue
    const { data: revenueRows } = await supabase.from('bookings').select('total_price');
    const totalRevenue = revenueRows ? revenueRows.reduce((sum, b) => sum + (b.total_price || 0), 0) : 0;
    
    // Flights today
    const today = new Date().toISOString().slice(0, 10);
    const { count: flightsToday } = await supabase.from('flights').select('*', { count: 'exact', head: true }).gte('departure_time', today);
    
    // Total users (from users table, not profiles)
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
    
    // Recent bookings with user info
    const { data: recentBookings } = await supabase
      .from('bookings')
      .select(`
        *,
        users!bookings_user_id_fkey (
          id,
          email,
          full_name
        ),
        flights!bookings_flight_id_fkey (
          id,
          flight_number,
          airline,
          origin,
          destination
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({ 
      totalBookings, 
      totalRevenue, 
      flightsToday, 
      totalUsers,
      recentBookings 
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Flight Management
exports.listFlights = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build the base query
    let baseQuery = supabase.from('flights');
    
    // Add search filter if provided
    if (search) {
      baseQuery = baseQuery.or(`flight_number.ilike.%${search}%,origin.ilike.%${search}%,destination.ilike.%${search}%`);
    }
    
    // Get total count first
    const { count, error: countError } = await baseQuery.select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Count flights error:', countError);
      throw countError;
    }
    
    // Get paginated data
    const { data: flights, error: dataError } = await baseQuery
      .select('*')
      .order('departure_time', { ascending: true })
      .range(offset, offset + parseInt(limit) - 1);
    
    if (dataError) {
      console.error('List flights error:', dataError);
      throw dataError;
    }
    
    const totalPages = Math.ceil((count || 0) / parseInt(limit));
    
    res.json({
      flights: flights || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: totalPages
      }
    });
  } catch (err) {
    console.error('List flights error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.createFlight = async (req, res) => {
  try {
    const { flight_number, airline, origin, destination, departure_time, arrival_time, price, available_seats, cabin_class, status } = req.body;
    
    console.log('Creating flight with data:', { flight_number, airline, origin, destination, price, available_seats, cabin_class });
    
    const { data, error } = await supabase
      .from('flights')
      .insert([{
        flight_number,
        airline,
        origin,
        destination,
        departure_time,
        arrival_time,
        price: parseFloat(price),
        available_seats: parseInt(available_seats),
        cabin_class,
        status: status || 'scheduled'
      }])
      .select();
    
    if (error) {
      console.error('Create flight error:', error);
      throw error;
    }
    
    console.log('Flight created successfully:', data[0]);
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Create flight error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateFlight = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('Updating flight:', id, 'with data:', updateData);
    
    const { data, error } = await supabase
      .from('flights')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Update flight error:', error);
      throw error;
    }
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    
    console.log('Flight updated successfully:', data[0]);
    res.json(data[0]);
  } catch (err) {
    console.error('Update flight error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFlight = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Deleting flight:', id);
    
    const { error } = await supabase
      .from('flights')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Delete flight error:', error);
      throw error;
    }
    
    console.log('Flight deleted successfully');
    res.json({ message: 'Flight deleted successfully' });
  } catch (err) {
    console.error('Delete flight error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Booking Management
exports.listBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('bookings')
      .select(`
        *,
        users!bookings_user_id_fkey (
          id,
          email,
          full_name
        ),
        flights!bookings_flight_id_fkey (
          id,
          flight_number,
          airline,
          origin,
          destination
        )
      `);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data: bookings, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('List bookings error:', error);
      throw error;
    }
    
    res.json({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('List bookings error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Update booking error:', error);
      throw error;
    }
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(data[0]);
  } catch (err) {
    console.error('Update booking error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Delete booking error:', error);
      throw error;
    }
    
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Delete booking error:', err);
    res.status(500).json({ error: err.message });
  }
};

// User Management
exports.listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = supabase.from('users').select('*');
    
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    const { data: users, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('List users error:', error);
      throw error;
    }
    
    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: err.message });
  }
}; 