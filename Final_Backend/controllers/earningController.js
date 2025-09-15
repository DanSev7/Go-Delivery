const db = require('../config/db'); // Assuming you have a configured db connection

// Function to fetch rider's earnings based on time interval
async function getRiderEarnings(req, res) {
  const { riderId } = req.params;

  try {
    // SQL Query to calculate total earnings based on the provided Orders table structure
    const earningsQuery = `
      SELECT 
        SUM(CASE WHEN order_time::date = CURRENT_DATE THEN delivery_fee ELSE 0 END) AS today_earnings,
        SUM(CASE WHEN EXTRACT(WEEK FROM order_time) = EXTRACT(WEEK FROM CURRENT_DATE) THEN delivery_fee ELSE 0 END) AS week_earnings,
        SUM(CASE WHEN EXTRACT(MONTH FROM order_time) = EXTRACT(MONTH FROM CURRENT_DATE) THEN delivery_fee ELSE 0 END) AS month_earnings,
        SUM(delivery_fee) AS all_time_earnings
      FROM orders
      WHERE rider_id = $1
      AND order_status = 'delivered'; 
    `;

    const values = [riderId];
    const result = await db.query(earningsQuery, values);

    const earnings = result.rows[0];
      console.log("total Earnings Json Data : ", earnings);
    // Send calculated earnings as a response
    return res.status(200).json({
      today_earnings: earnings.today_earnings || 0,
      week_earnings: earnings.week_earnings || 0,
      month_earnings: earnings.month_earnings || 0,
      all_time_earnings: earnings.all_time_earnings || 0,
    });
  } catch (error) {
    console.error('Error fetching rider earnings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getRiderEarnings };
