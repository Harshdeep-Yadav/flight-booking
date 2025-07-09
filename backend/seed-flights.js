const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedFlights() {
  try {
    console.log('Seeding sample flight data...\n');

    const sampleFlights = [
      // JFK to LAX flights on 2024-12-25
      {
        flight_number: 'AA123',
        airline: 'American Airlines',
        origin: 'JFK',
        destination: 'LAX',
        departure_time: '2024-12-25T08:00:00Z',
        arrival_time: '2024-12-25T11:30:00Z',
        cabin_class: 'Economy',
        price: 299.99,
        available_seats: 150,
        status: 'scheduled'
      },
      {
        flight_number: 'DL456',
        airline: 'Delta Airlines',
        origin: 'JFK',
        destination: 'LAX',
        departure_time: '2024-12-25T10:30:00Z',
        arrival_time: '2024-12-25T14:00:00Z',
        cabin_class: 'Economy',
        price: 325.50,
        available_seats: 120,
        status: 'scheduled'
      },
      {
        flight_number: 'UA789',
        airline: 'United Airlines',
        origin: 'JFK',
        destination: 'LAX',
        departure_time: '2024-12-25T14:15:00Z',
        arrival_time: '2024-12-25T17:45:00Z',
        cabin_class: 'Economy',
        price: 289.99,
        available_seats: 180,
        status: 'scheduled'
      },
      {
        flight_number: 'AA124',
        airline: 'American Airlines',
        origin: 'JFK',
        destination: 'LAX',
        departure_time: '2024-12-25T16:45:00Z',
        arrival_time: '2024-12-25T20:15:00Z',
        cabin_class: 'Business',
        price: 899.99,
        available_seats: 20,
        status: 'scheduled'
      },
      // LAX to JFK flights on 2024-12-25
      {
        flight_number: 'AA125',
        airline: 'American Airlines',
        origin: 'LAX',
        destination: 'JFK',
        departure_time: '2024-12-25T09:00:00Z',
        arrival_time: '2024-12-25T17:30:00Z',
        cabin_class: 'Economy',
        price: 315.99,
        available_seats: 140,
        status: 'scheduled'
      },
      {
        flight_number: 'DL457',
        airline: 'Delta Airlines',
        origin: 'LAX',
        destination: 'JFK',
        departure_time: '2024-12-25T11:30:00Z',
        arrival_time: '2024-12-25T20:00:00Z',
        cabin_class: 'Economy',
        price: 340.50,
        available_seats: 110,
        status: 'scheduled'
      },
      // Other routes on 2024-12-25
      {
        flight_number: 'SW101',
        airline: 'Southwest Airlines',
        origin: 'ORD',
        destination: 'LAX',
        departure_time: '2024-12-25T07:30:00Z',
        arrival_time: '2024-12-25T10:00:00Z',
        cabin_class: 'Economy',
        price: 199.99,
        available_seats: 175,
        status: 'scheduled'
      },
      {
        flight_number: 'JB202',
        airline: 'JetBlue',
        origin: 'BOS',
        destination: 'LAX',
        departure_time: '2024-12-25T08:45:00Z',
        arrival_time: '2024-12-25T12:15:00Z',
        cabin_class: 'Economy',
        price: 245.99,
        available_seats: 160,
        status: 'scheduled'
      },
      // Return flights for round-trip testing
      {
        flight_number: 'AA126',
        airline: 'American Airlines',
        origin: 'LAX',
        destination: 'JFK',
        departure_time: '2024-12-30T08:00:00Z',
        arrival_time: '2024-12-30T16:30:00Z',
        cabin_class: 'Economy',
        price: 299.99,
        available_seats: 150,
        status: 'scheduled'
      },
      {
        flight_number: 'DL458',
        airline: 'Delta Airlines',
        origin: 'LAX',
        destination: 'JFK',
        departure_time: '2024-12-30T10:30:00Z',
        arrival_time: '2024-12-30T19:00:00Z',
        cabin_class: 'Economy',
        price: 325.50,
        available_seats: 120,
        status: 'scheduled'
      }
    ];

    // Clear existing flights first
    console.log('Clearing existing flights...');
    const { error: deleteError } = await supabase
      .from('flights')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all flights

    if (deleteError) {
      console.error('Error clearing flights:', deleteError);
      return;
    }

    console.log('Inserting sample flights...');
    const { data: insertedFlights, error: insertError } = await supabase
      .from('flights')
      .insert(sampleFlights)
      .select();

    if (insertError) {
      console.error('Error inserting flights:', insertError);
      return;
    }

    console.log(`Successfully inserted ${insertedFlights.length} flights:`);
    insertedFlights.forEach(flight => {
      console.log({
        id: flight.id,
        flight_number: flight.flight_number,
        airline: flight.airline,
        origin: flight.origin,
        destination: flight.destination,
        departure_time: flight.departure_time,
        price: flight.price,
        available_seats: flight.available_seats
      });
    });

    console.log('\nFlight seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding flights:', error);
  }
}

seedFlights(); 