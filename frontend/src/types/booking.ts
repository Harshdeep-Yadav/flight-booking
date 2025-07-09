export interface Passenger {
  type: "Adult" | "Child" | "Infant";
  first_name: string;
  last_name: string;
  date_of_birth: string;
  passport_number?: string;
  seat_preference?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  flight_id: string;
  passenger_count: number;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled";
  passenger_info: Passenger[];
  created_at: string;
  updated_at: string;
  flight?: Flight;
  user?: User;
}

export interface BookingFormData {
  flight_id: string;
  passengers: Passenger[];
  contact_info: {
    email: string;
    phone: string;
    address: string;
  };
  payment_info: {
    card_number: string;
    expiry_date: string;
    cvv: string;
    cardholder_name: string;
  };
}

export interface Flight {
  id: string;
  flight_number: string;
  airline: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  cabin_class: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
} 