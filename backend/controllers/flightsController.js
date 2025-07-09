const supabase = require('../supabase/client');

// Admin: Create a new flight
exports.createFlight = async (req, res) => {
  try {
    const {
      flight_number,
      airline,
      origin,
      destination,
      departure_time,
      arrival_time,
      cabin_class,
      price,
      available_seats
    } = req.body;

    // Validate required fields
    if (!flight_number || !airline || !origin || !destination || !departure_time || !arrival_time || !cabin_class || !price || !available_seats) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate cabin class
    const validCabinClasses = ['Economy', 'Premium Economy', 'Business', 'First'];
    if (!validCabinClasses.includes(cabin_class)) {
      return res.status(400).json({ error: "Invalid cabin class" });
    }

    // Validate dates
    const departure = new Date(departure_time);
    const arrival = new Date(arrival_time);
    if (departure >= arrival) {
      return res.status(400).json({ error: "Arrival time must be after departure time" });
    }

    const { error, data } = await supabase
      .from('flights')
      .insert({
        flight_number,
        airline,
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departure_time,
        arrival_time,
        cabin_class,
        price: parseFloat(price),
        available_seats: parseInt(available_seats)
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    console.error('Create flight error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Public: List all flights (for admin dashboard)
exports.listFlights = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .order('departure_time', { ascending: true });
    
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error('List flights error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Public: Search flights with all required filters
exports.searchFlights = async (req, res) => {
  try {
    const {
      origin,
      destination,
      departure_date,
      return_date,
      adults = 1,
      children = 0,
      infants = 0,
      cabin_class,
      trip_type = 'one-way'
    } = req.query;

    // Validate required parameters
    if (!departure_date) {
      return res.status(400).json({ error: "Departure date is required" });
    }

    // Calculate total passengers
    const totalPassengers = parseInt(adults) + parseInt(children) + parseInt(infants);
    if (totalPassengers <= 0) {
      return res.status(400).json({ error: "At least one passenger is required" });
    }

    // If only departure_date is provided, get all flights for that date
    if (!origin && !destination) {
      console.log('Searching for all flights on departure date:', departure_date);
      
      const departureDate = new Date(departure_date);
      const nextDay = new Date(departureDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      let allFlightsQuery = supabase
        .from('flights')
        .select('*')
        .gte('available_seats', totalPassengers)
        .gte('departure_time', departureDate.toISOString())
        .lt('departure_time', nextDay.toISOString());

      // Filter by cabin class if specified
      if (cabin_class) {
        allFlightsQuery = allFlightsQuery.eq('cabin_class', cabin_class);
      }

      const { data: allFlights, error: allFlightsError } = await allFlightsQuery
        .order('departure_time', { ascending: true });

      if (allFlightsError) {
        return res.status(400).json({ error: allFlightsError.message });
      }

      const formattedFlights = allFlights.map(flight => ({
        id: flight.id,
        flight_number: flight.flight_number,
        airline: flight.airline,
        origin: flight.origin,
        destination: flight.destination,
        departure_time: flight.departure_time,
        arrival_time: flight.arrival_time,
        duration: flight.duration,
        price: flight.price,
        available_seats: flight.available_seats,
        cabin_class: flight.cabin_class,
        status: flight.status
      }));

      return res.json({
        flights: formattedFlights,
        search_criteria: {
          departure_date,
          passengers: { adults: parseInt(adults), children: parseInt(children), infants: parseInt(infants) },
          cabin_class,
          search_type: 'all_flights_on_date'
        }
      });
    }

    // Original search logic for specific origin/destination
    if (!origin || !destination) {
      return res.status(400).json({ error: "Origin and destination are required for route-specific search" });
    }

    // Build outbound flight query
    let outboundQuery = supabase
      .from('flights')
      .select('*')
      .eq('origin', origin.toUpperCase())
      .eq('destination', destination.toUpperCase());

    // Only filter by available seats if we have passengers
    if (totalPassengers > 0) {
      outboundQuery = outboundQuery.gte('available_seats', totalPassengers);
    }

    // Filter by departure date
    const departureDate = new Date(departure_date);
    const nextDay = new Date(departureDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    console.log('Searching for flights:', {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate: departureDate.toISOString(),
      nextDay: nextDay.toISOString(),
      totalPassengers,
      cabin_class
    });
    
    outboundQuery = outboundQuery
      .gte('departure_time', departureDate.toISOString())
      .lt('departure_time', nextDay.toISOString());

    // Filter by cabin class if specified
    if (cabin_class) {
      outboundQuery = outboundQuery.eq('cabin_class', cabin_class);
    }

    // Get outbound flights
    const { data: outboundFlights, error: outboundError } = await outboundQuery
      .order('departure_time', { ascending: true });

    if (outboundError) {
      console.error('Outbound flights query error:', outboundError);
      return res.status(400).json({ error: outboundError.message });
    }

    console.log(`Found ${outboundFlights?.length || 0} outbound flights`);
    if (outboundFlights && outboundFlights.length > 0) {
      console.log('Sample outbound flights:', outboundFlights.slice(0, 3).map(f => ({
        id: f.id,
        flight_number: f.flight_number,
        airline: f.airline,
        departure_time: f.departure_time,
        price: f.price,
        available_seats: f.available_seats
      })));
    } else {
      console.log('No outbound flights found. Let\'s check without filters:');
      
      // Try without available_seats filter to see if that's the issue
      const { data: allRouteFlights, error: allRouteError } = await supabase
        .from('flights')
        .select('*')
        .eq('origin', origin.toUpperCase())
        .eq('destination', destination.toUpperCase())
        .gte('departure_time', departureDate.toISOString())
        .lt('departure_time', nextDay.toISOString())
        .order('departure_time', { ascending: true });

      if (!allRouteError && allRouteFlights) {
        console.log(`Found ${allRouteFlights.length} flights without available_seats filter:`);
        allRouteFlights.forEach(flight => {
          console.log({
            id: flight.id,
            flight_number: flight.flight_number,
            airline: flight.airline,
            departure_time: flight.departure_time,
            available_seats: flight.available_seats,
            price: flight.price
          });
        });
      }
    }

    let returnFlights = [];
    
    // If round-trip, search for return flights
    if (trip_type === 'round-trip' && return_date) {
      const returnDate = new Date(return_date);
      const returnNextDay = new Date(returnDate);
      returnNextDay.setDate(returnNextDay.getDate() + 1);

      let returnQuery = supabase
        .from('flights')
        .select('*')
        .eq('origin', destination.toUpperCase())
        .eq('destination', origin.toUpperCase())
        .gte('available_seats', totalPassengers)
        .gte('departure_time', returnDate.toISOString())
        .lt('departure_time', returnNextDay.toISOString());

      if (cabin_class) {
        returnQuery = returnQuery.eq('cabin_class', cabin_class);
      }

      const { data: returnData, error: returnError } = await returnQuery
        .order('departure_time', { ascending: true });

      if (!returnError) {
        returnFlights = returnData;
      }
    }

    // Format response with all required flight details
    const formattedOutbound = outboundFlights.map(flight => ({
      id: flight.id,
      flight_number: flight.flight_number,
      airline: flight.airline,
      origin: flight.origin,
      destination: flight.destination,
      departure_time: flight.departure_time,
      arrival_time: flight.arrival_time,
      duration: flight.duration,
      price: flight.price,
      available_seats: flight.available_seats,
      cabin_class: flight.cabin_class,
      status: flight.status
    }));

    const formattedReturn = returnFlights.map(flight => ({
      id: flight.id,
      flight_number: flight.flight_number,
      airline: flight.airline,
      origin: flight.origin,
      destination: flight.destination,
      departure_time: flight.departure_time,
      arrival_time: flight.arrival_time,
      duration: flight.duration,
      price: flight.price,
      available_seats: flight.available_seats,
      cabin_class: flight.cabin_class,
      status: flight.status
    }));

    res.json({
      outbound: formattedOutbound,
      return: formattedReturn,
      search_criteria: {
        origin,
        destination,
        departure_date,
        return_date,
        passengers: { adults: parseInt(adults), children: parseInt(children), infants: parseInt(infants) },
        cabin_class,
        trip_type,
        search_type: 'route_specific'
      }
    });
  } catch (err) {
    console.error('Search flights error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Public: Get specific flight details
exports.getFlight = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return res.status(404).json({ error: 'Flight not found' });
    res.json(data);
  } catch (err) {
    console.error('Get flight error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Admin: Update flight
exports.updateFlight = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate cabin class if provided
    if (updateData.cabin_class) {
      const validCabinClasses = ['Economy', 'Premium Economy', 'Business', 'First'];
      if (!validCabinClasses.includes(updateData.cabin_class)) {
        return res.status(400).json({ error: "Invalid cabin class" });
      }
    }

    const { data, error } = await supabase
      .from('flights')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error('Update flight error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Admin: Delete flight
exports.deleteFlight = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if flight has any bookings
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('flight_id', id);

    if (bookingError) {
      return res.status(500).json({ error: bookingError.message });
    }

    if (bookings && bookings.length > 0) {
      return res.status(400).json({ 
        error: "Cannot delete flight with existing bookings. Cancel all bookings first." 
      });
    }

    const { error } = await supabase
      .from('flights')
      .delete()
      .eq('id', id);
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Flight deleted successfully' });
  } catch (err) {
    console.error('Delete flight error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Admin: Get flight statistics
exports.getFlightStats = async (req, res) => {
  try {
    const { data: flights, error } = await supabase.from('flights').select('*');
    if (error) return res.status(400).json({ error: error.message });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = {
      total_flights: flights.length,
      flights_today: flights.filter(f => {
        const flightDate = new Date(f.departure_time);
        return flightDate >= today && flightDate < tomorrow;
      }).length,
      average_price: flights.length > 0 ? 
        flights.reduce((sum, f) => sum + parseFloat(f.price), 0) / flights.length : 0,
      total_seats: flights.reduce((sum, f) => sum + f.available_seats, 0),
      flights_by_cabin: {
        Economy: flights.filter(f => f.cabin_class === 'Economy').length,
        'Premium Economy': flights.filter(f => f.cabin_class === 'Premium Economy').length,
        Business: flights.filter(f => f.cabin_class === 'Business').length,
        First: flights.filter(f => f.cabin_class === 'First').length
      }
    };

    res.json(stats);
  } catch (err) {
    console.error('Get flight stats error:', err);
    res.status(500).json({ error: err.message });
  }
};

// SSE status update (already handled in flights.js route for demo) 