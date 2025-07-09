var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/health', function(req, res) {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Admin stats endpoint (placeholder)
router.get('/admin/stats', async function(req, res) {
  // In production, query the database for real stats
  res.json({
    totalBookings: 42,
    totalRevenue: 12345.67,
    flightsToday: 7
  });
});

module.exports = router;
