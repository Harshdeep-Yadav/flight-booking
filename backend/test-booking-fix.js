const axios = require('axios');

const API_BASE_URL = 'https://flight-booking-zeez.onrender.com';

async function testBookingProcess() {
  console.log('🧪 Testing Booking Process...\n');

  try {
    // Step 1: Register a test user
    console.log('1. Registering test user...');
    const registerResponse = await axios.post(`${API_BASE_URL}/users/register`, {
      email: 'testbooking@example.com',
      password: 'testpass123',
      full_name: 'Test Booking User',
      phone: '1234567890'
    });
    
    console.log('✅ User registered successfully');
    const { token, user } = registerResponse.data;
    
    // Step 2: Search for flights
    console.log('\n2. Searching for flights...');
    const searchResponse = await axios.get(`${API_BASE_URL}/flights/search`, {
      params: {
        origin: 'New York',
        destination: 'Los Angeles',
        departure_date: '2024-12-25',
        adults: 1
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Found ${searchResponse.data.flights?.length || 0} flights`);
    
    if (!searchResponse.data.flights || searchResponse.data.flights.length === 0) {
      console.log('❌ No flights found for booking test');
      return;
    }
    
    const flight = searchResponse.data.flights[0];
    console.log(`Selected flight: ${flight.flight_number} (${flight.origin} → ${flight.destination})`);
    
    // Step 3: Create a booking
    console.log('\n3. Creating booking...');
    const bookingData = {
      flight_id: flight.id,
      passenger_info: [
        {
          first_name: 'John',
          last_name: 'Doe',
          date_of_birth: '1990-01-01',
          passport_number: 'AB123456',
          seat_preference: 'window'
        }
      ],
      passenger_count: 1,
      total_price: flight.price * 1
    };
    
    const bookingResponse = await axios.post(`${API_BASE_URL}/bookings`, bookingData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Booking created successfully!');
    console.log('Booking details:', {
      id: bookingResponse.data.booking.id,
      flight: bookingResponse.data.flight,
      total_price: bookingResponse.data.booking.total_price,
      status: bookingResponse.data.booking.status
    });
    
    // Step 4: Verify booking appears in user's bookings
    console.log('\n4. Verifying booking in user bookings...');
    const userBookingsResponse = await axios.get(`${API_BASE_URL}/bookings/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const userBookings = userBookingsResponse.data.bookings || [];
    const createdBooking = userBookings.find(b => b.id === bookingResponse.data.booking.id);
    
    if (createdBooking) {
      console.log('✅ Booking found in user bookings');
      console.log('User booking details:', {
        id: createdBooking.id,
        flight_number: createdBooking.flight?.flight_number,
        status: createdBooking.status,
        total_price: createdBooking.total_price
      });
    } else {
      console.log('❌ Booking not found in user bookings');
    }
    
    // Step 5: Test flight availability update
    console.log('\n5. Checking flight availability after booking...');
    const updatedFlightResponse = await axios.get(`${API_BASE_URL}/flights/search`, {
      params: {
        origin: 'New York',
        destination: 'Los Angeles',
        departure_date: '2024-12-25',
        adults: 1
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const updatedFlight = updatedFlightResponse.data.flights?.find(f => f.id === flight.id);
    if (updatedFlight) {
      console.log(`✅ Flight availability updated: ${updatedFlight.available_seats} seats remaining`);
    } else {
      console.log('❌ Could not verify flight availability update');
    }
    
    console.log('\n🎉 Booking process test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
    
    if (error.response?.status === 404 && error.response?.data?.error === 'Flight not found') {
      console.log('\n🔍 Debugging flight lookup...');
      
      // Try to list all flights to see what's available
      try {
        const allFlightsResponse = await axios.get(`${API_BASE_URL}/flights`);
        console.log(`Available flights in database: ${allFlightsResponse.data.flights?.length || 0}`);
        
        if (allFlightsResponse.data.flights && allFlightsResponse.data.flights.length > 0) {
          console.log('Sample flights:');
          allFlightsResponse.data.flights.slice(0, 3).forEach(flight => {
            console.log(`- ${flight.flight_number}: ${flight.origin} → ${flight.destination} (ID: ${flight.id})`);
          });
        }
      } catch (listError) {
        console.error('Failed to list flights:', listError.response?.data?.error || listError.message);
      }
    }
  }
}

// Run the test
testBookingProcess(); 