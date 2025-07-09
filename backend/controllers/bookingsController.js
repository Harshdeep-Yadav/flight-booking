const { createClient } = require("@supabase/supabase-js");
require('dotenv').config();

// Use service role client to bypass RLS policies for booking operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { sendBookingEmail } = require("./emailController");

async function getUserEmail(user_id) {
  const { data, error } = await supabase
    .from("users")
    .select("email")
    .eq("id", user_id)
    .single();
  return data?.email || null;
}

exports.createBooking = async (req, res) => {
  try {
    const {
      flight_id,
      passenger_info,
      passenger_count,
      total_price,
      status = "confirmed",
      e_ticket_url,
    } = req.body;

    // Get user ID from authenticated request
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Validate required fields
    if (!flight_id || !passenger_info || !passenger_count || !total_price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log('Creating booking for flight:', flight_id, 'user:', user_id);

    // Check if flight exists and has enough seats
    const { data: flight, error: flightError } = await supabase
      .from("flights")
      .select("available_seats, flight_number, airline, origin, destination")
      .eq("id", flight_id)
      .single();

    if (flightError) {
      console.error('Flight lookup error:', flightError);
      return res.status(404).json({ error: "Flight not found" });
    }

    if (!flight) {
      console.error('Flight not found:', flight_id);
      return res.status(404).json({ error: "Flight not found" });
    }

    console.log('Flight found:', flight.flight_number, 'Available seats:', flight.available_seats);

    if (flight.available_seats < passenger_count) {
      return res.status(400).json({ 
        error: `Not enough seats available. Available: ${flight.available_seats}, Requested: ${passenger_count}` 
      });
    }

    // Create booking
    const { error: bookingError, data: bookingData } = await supabase
      .from("bookings")
      .insert({
        user_id,
        flight_id,
        total_price,
        passenger_count,
        passenger_info,
        status,
        e_ticket_url,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return res.status(400).json({ error: bookingError.message });
    }

    console.log('Booking created successfully:', bookingData.id);

    // Update available seats
    const { error: updateError } = await supabase
      .from("flights")
      .update({ available_seats: flight.available_seats - passenger_count })
      .eq("id", flight_id);

    if (updateError) {
      console.error('Failed to update available seats:', updateError);
      // Don't fail the booking, just log the error
    }

    // Send email notification
    const email = await getUserEmail(user_id);
    if (email) {
      try {
        await sendBookingEmail(
          email,
          "Booking Confirmation",
          `Your booking is confirmed. Booking ID: ${bookingData.id}. Flight: ${flight.flight_number} (${flight.origin} to ${flight.destination}). Total passengers: ${passenger_count}. Total price: $${total_price}`
        );
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the booking, just log the error
      }
    }

    res.status(201).json({
      booking: bookingData,
      flight: {
        flight_number: flight.flight_number,
        airline: flight.airline,
        origin: flight.origin,
        destination: flight.destination
      }
    });
  } catch (err) {
    console.error("Booking creation error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.listBookings = async (req, res) => {
  try {
    const { user_id } = req.query;
    let query = supabase.from("bookings").select(`
      *,
      flights!bookings_flight_id_fkey (
        flight_number,
        airline,
        origin,
        destination,
        departure_time,
        arrival_time
      ),
      users (
        email,
        full_name
      )
    `);
    
    if (user_id) query = query.eq("user_id", user_id);
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;
    
    // Check if user can update this booking
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get current booking to check ownership
    const { data: currentBooking, error: fetchError } = await supabase
      .from("bookings")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Only allow if user owns the booking or is admin
    if (currentBooking.user_id !== userId && userRole !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { data, error } = await supabase
      .from("bookings")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    
    // Send email notification
    if (data?.user_id) {
      const email = await getUserEmail(data.user_id);
      if (email)
        await sendBookingEmail(
          email,
          "Booking Updated",
          `Your booking was updated. Booking ID: ${data.id}`
        );
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user can cancel this booking
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get current booking to check ownership
    const { data: currentBooking, error: fetchError } = await supabase
      .from("bookings")
      .select("user_id, flight_id, passenger_count")
      .eq("id", id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Only allow if user owns the booking or is admin
    if (currentBooking.user_id !== userId && userRole !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    
    // Restore available seats
    if (currentBooking.flight_id) {
      const { data: flight } = await supabase
        .from("flights")
        .select("available_seats")
        .eq("id", currentBooking.flight_id)
        .single();

      if (flight) {
        await supabase
          .from("flights")
          .update({ available_seats: flight.available_seats + currentBooking.passenger_count })
          .eq("id", currentBooking.flight_id);
      }
    }
    
    // Send email notification
    if (data?.user_id) {
      const email = await getUserEmail(data.user_id);
      if (email)
        await sendBookingEmail(
          email,
          "Booking Cancelled",
          `Your booking was cancelled. Booking ID: ${data.id}`
        );
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch all bookings for a specific flightId
exports.getFlightBookings = async (req, res) => {
  try {
    const { flightId } = req.params;
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        users (
          email,
          full_name
        )
      `)
      .eq("flight_id", flightId)
      .order("created_at", { ascending: false });
    
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`
        *,
        flights!bookings_flight_id_fkey (
          id,
          flight_number,
          airline,
          origin,
          destination,
          departure_time,
          arrival_time,
          price
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error('Get user bookings error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ bookings: bookings || [] });
  } catch (err) {
    console.error('Get user bookings error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Fetch a single booking by ID (user can only access their own booking unless admin)
exports.getBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        flights!bookings_flight_id_fkey (
          flight_number,
          airline,
          origin,
          destination,
          departure_time,
          arrival_time,
          price
        )
      `)
      .eq("id", bookingId)
      .single();
    if (error) return res.status(404).json({ error: "Booking not found" });
    // Only allow access if user owns the booking or is admin
    if (data.user_id !== userId && userRole !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
