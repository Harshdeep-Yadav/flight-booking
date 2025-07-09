const request = require('supertest');
const express = require('express');
const adminController = require('../controllers/adminController');

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        count: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ count: 10 }))
        })),
        order: jest.fn(() => ({
          range: jest.fn(() => Promise.resolve({ data: [], count: 0 }))
        })),
        limit: jest.fn(() => Promise.resolve({ data: [] })),
        gte: jest.fn(() => ({
          select: jest.fn(() => ({
            count: jest.fn(() => Promise.resolve({ count: 5 }))
          }))
        })),
        or: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ data: [], count: 0 }))
          }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: [{ id: '1', flight_number: 'FL001' }] }))
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => Promise.resolve({ data: [{ id: '1', flight_number: 'FL001' }] }))
          }))
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null }))
        }))
      }))
    }))
  }))
}));

const app = express();
app.use(express.json());

// Mock admin middleware
const adminOnly = (req, res, next) => next();
app.use('/admin', adminOnly);

// Add routes
app.get('/admin/stats', adminController.getStats);
app.get('/admin/flights', adminController.listFlights);
app.post('/admin/flights', adminController.createFlight);
app.put('/admin/flights/:id', adminController.updateFlight);
app.delete('/admin/flights/:id', adminController.deleteFlight);
app.get('/admin/bookings', adminController.listBookings);
app.put('/admin/bookings/:id', adminController.updateBooking);
app.delete('/admin/bookings/:id', adminController.deleteBooking);
app.get('/admin/users', adminController.listUsers);

describe('Admin Controller', () => {
  describe('GET /admin/stats', () => {
    it('should return dashboard statistics', async () => {
      const response = await request(app)
        .get('/admin/stats')
        .expect(200);

      expect(response.body).toHaveProperty('totalBookings');
      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('flightsToday');
      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('recentBookings');
    });
  });

  describe('GET /admin/flights', () => {
    it('should return paginated flights list', async () => {
      const response = await request(app)
        .get('/admin/flights?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('flights');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('pages');
    });

    it('should handle search parameter', async () => {
      const response = await request(app)
        .get('/admin/flights?search=FL001')
        .expect(200);

      expect(response.body).toHaveProperty('flights');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('POST /admin/flights', () => {
    it('should create a new flight', async () => {
      const flightData = {
        flight_number: 'FL001',
        airline: 'Test Airlines',
        origin: 'NYC',
        destination: 'LAX',
        departure_time: '2024-01-15T10:00:00Z',
        arrival_time: '2024-01-15T13:00:00Z',
        price: 299.99,
        available_seats: 150,
        cabin_class: 'Economy'
      };

      const response = await request(app)
        .post('/admin/flights')
        .send(flightData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('flight_number');
    });
  });

  describe('PUT /admin/flights/:id', () => {
    it('should update an existing flight', async () => {
      const updateData = {
        price: 349.99,
        available_seats: 140
      };

      const response = await request(app)
        .put('/admin/flights/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('flight_number');
    });
  });

  describe('DELETE /admin/flights/:id', () => {
    it('should delete a flight', async () => {
      const response = await request(app)
        .delete('/admin/flights/1')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Flight deleted successfully');
    });
  });

  describe('GET /admin/bookings', () => {
    it('should return paginated bookings list', async () => {
      const response = await request(app)
        .get('/admin/bookings?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('bookings');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/admin/bookings?status=confirmed')
        .expect(200);

      expect(response.body).toHaveProperty('bookings');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('PUT /admin/bookings/:id', () => {
    it('should update a booking', async () => {
      const updateData = {
        status: 'cancelled'
      };

      const response = await request(app)
        .put('/admin/bookings/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
    });
  });

  describe('DELETE /admin/bookings/:id', () => {
    it('should delete a booking', async () => {
      const response = await request(app)
        .delete('/admin/bookings/1')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Booking deleted successfully');
    });
  });

  describe('GET /admin/users', () => {
    it('should return paginated users list', async () => {
      const response = await request(app)
        .get('/admin/users?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should handle search parameter', async () => {
      const response = await request(app)
        .get('/admin/users?search=john@example.com')
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('pagination');
    });
  });
}); 