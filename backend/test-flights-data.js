const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFlightsData() {
  try {
    console.log('Checking flights data in database...\n');

    // Get all flights
    const { data: allFlights, error: allError } = await supabase
      .from('flights')
      .select('*')
      .order('departure_time', { ascending: true });

    if (allError) {
      console.error('Error fetching all flights:', allError);
      return;
    }

    console.log(`Total flights in database: ${allFlights.length}\n`);

    // Show sample flights
    console.log('Sample flights:');
    allFlights.slice(0, 5).forEach(flight => {
      console.log({
        id: flight.id,
        flight_number: flight.flight_number,
        airline: flight.airline,
        origin: flight.origin,
        destination: flight.destination,
        departure_time: flight.departure_time,
        available_seats: flight.available_seats,
        price: flight.price,
        cabin_class: flight.cabin_class
      });
    });

    // Check specific route
    console.log('\nChecking JFK to LAX flights:');
    const { data: jfkLaxFlights, error: jfkLaxError } = await supabase
      .from('flights')
      .select('*')
      .eq('origin', 'JFK')
      .eq('destination', 'LAX')
      .order('departure_time', { ascending: true });

    if (jfkLaxError) {
      console.error('Error fetching JFK-LAX flights:', jfkLaxError);
    } else {
      console.log(`Found ${jfkLaxFlights.length} JFK to LAX flights:`);
      jfkLaxFlights.forEach(flight => {
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

    // Check flights for specific date
    const testDate = '2024-12-25';
    const departureDate = new Date(testDate);
    const nextDay = new Date(departureDate);
    nextDay.setDate(nextDay.getDate() + 1);

    console.log(`\nChecking flights for ${testDate}:`);
    const { data: dateFlights, error: dateError } = await supabase
      .from('flights')
      .select('*')
      .gte('departure_time', departureDate.toISOString())
      .lt('departure_time', nextDay.toISOString())
      .order('departure_time', { ascending: true });

    if (dateError) {
      console.error('Error fetching date flights:', dateError);
    } else {
      console.log(`Found ${dateFlights.length} flights on ${testDate}:`);
      dateFlights.forEach(flight => {
        console.log({
          id: flight.id,
          flight_number: flight.flight_number,
          airline: flight.airline,
          origin: flight.origin,
          destination: flight.destination,
          departure_time: flight.departure_time,
          available_seats: flight.available_seats
        });
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkFlightsData(); 