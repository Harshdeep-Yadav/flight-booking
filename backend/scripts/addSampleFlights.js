const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sampleFlights = [
  {
    flight_number: "AA101",
    airline: "American Airlines",
    origin: "JFK",
    destination: "LAX",
    departure_time: "2024-01-15T08:00:00Z",
    arrival_time: "2024-01-15T11:30:00Z",
    cabin_class: "Economy",
    price: 299.99,
    available_seats: 150,
    status: "scheduled"
  },
  {
    flight_number: "UA202",
    airline: "United Airlines",
    origin: "JFK",
    destination: "LAX",
    departure_time: "2024-01-15T10:00:00Z",
    arrival_time: "2024-01-15T13:30:00Z",
    cabin_class: "Economy",
    price: 349.99,
    available_seats: 120,
    status: "scheduled"
  },
  {
    flight_number: "DL303",
    airline: "Delta Airlines",
    origin: "JFK",
    destination: "LAX",
    departure_time: "2024-01-15T14:00:00Z",
    arrival_time: "2024-01-15T17:30:00Z",
    cabin_class: "Business",
    price: 899.99,
    available_seats: 20,
    status: "scheduled"
  },
  {
    flight_number: "LAX101",
    airline: "American Airlines",
    origin: "LAX",
    destination: "JFK",
    departure_time: "2024-01-16T09:00:00Z",
    arrival_time: "2024-01-16T16:30:00Z",
    cabin_class: "Economy",
    price: 279.99,
    available_seats: 140,
    status: "scheduled"
  },
  {
    flight_number: "SFO201",
    airline: "United Airlines",
    origin: "SFO",
    destination: "JFK",
    departure_time: "2024-01-15T07:00:00Z",
    arrival_time: "2024-01-15T15:30:00Z",
    cabin_class: "Economy",
    price: 399.99,
    available_seats: 100,
    status: "scheduled"
  },
  {
    flight_number: "ORD301",
    airline: "Delta Airlines",
    origin: "ORD",
    destination: "LAX",
    departure_time: "2024-01-15T11:00:00Z",
    arrival_time: "2024-01-15T13:30:00Z",
    cabin_class: "Premium Economy",
    price: 549.99,
    available_seats: 80,
    status: "scheduled"
  }
];

async function addSampleFlights() {
  console.log('🛫 Adding sample flights to database...\n');

  try {
    for (const flight of sampleFlights) {
      const { data, error } = await supabase
        .from('flights')
        .insert(flight)
        .select()
        .single();

      if (error) {
        console.error(`❌ Failed to add flight ${flight.flight_number}:`, error.message);
      } else {
        console.log(`✅ Added flight ${flight.flight_number}: ${flight.origin} → ${flight.destination}`);
      }
    }

    console.log('\n🎉 Sample flights added successfully!');
    console.log('\n📋 You can now test the search functionality with:');
    console.log('   - Origin: JFK, Destination: LAX');
    console.log('   - Origin: LAX, Destination: JFK');
    console.log('   - Origin: SFO, Destination: JFK');
    console.log('   - Origin: ORD, Destination: LAX');

  } catch (error) {
    console.error('❌ Error adding sample flights:', error);
  }
}

// Run the script
addSampleFlights(); 