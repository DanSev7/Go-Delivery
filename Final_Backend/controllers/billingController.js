// SaaS Billing Controller with Chapa Integration
// ==============================================
// Handles subscription billing, plan upgrades, and payment processing

const axios = require('axios');
const { query } = require('../config/db');
const crypto = require('crypto');

/**
 * Chapa API Configuration
 */
const CHAPA_CONFIG = {
  baseURL: process.env.CHAPA_URL || 'https://api.chapa.co/v1',
  authToken: process.env.CHAPA_AUTH,
  returnUrl: process.env.CHAPA_RETURN_URL || 'https://your-app.com/billing/success',
  callbackUrl: process.env.CHAPA_CALLBACK_URL || 'https://your-app.com/api/billing/webhook'
};

/**
 * Initialize subscription payment with Chapa
 */
const initializeSubscriptionPayment = async (req, res) => {
  try {
    const { plan_id, billing_cycle = 'monthly' } = req.body;
    const tenantId = req.tenant.tenant_id;

    // Get plan details
    const planResult = await query(
      'SELECT * FROM SubscriptionPlans WHERE plan_id = $1 AND status = $2',
      [plan_id, 'active']
    );

    const plan = planResult.rows[0];
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PLAN_NOT_FOUND',
          message: 'Subscription plan not found',
          statusCode: 404
        }
      });
    }

    // Calculate amount based on billing cycle
    const amount = billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
    
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Invalid subscription amount',
          statusCode: 400
        }
      });
    }

    // Generate unique transaction reference
    const tx_ref = `saas_sub_${tenantId}_${Date.now()}`;

    // Prepare Chapa payment data
    const paymentData = {
      amount: amount,
      currency: plan.currency,
      email: req.tenant.contact_email,
      first_name: req.tenant.name.split(' ')[0],
      last_name: req.tenant.name.split(' ').slice(1).join(' ') || 'N/A',
      phone_number: req.tenant.contact_phone || '',
      tx_ref: tx_ref,
      callback_url: `${CHAPA_CONFIG.callbackUrl}`,
      return_url: `${CHAPA_CONFIG.returnUrl}?tenant=${tenantId}`,
      description: `${plan.display_name} subscription - ${billing_cycle}`,
      customization: {
        title: 'Food Delivery SaaS Subscription',
        description: `Subscribe to ${plan.display_name}`,
      },
      meta: {
        tenant_id: tenantId,
        plan_id: plan_id,
        billing_cycle: billing_cycle,
        subscription_type: 'saas'
      }
    };

    // Initialize payment with Chapa
    const chapaResponse = await axios.post(
      `${CHAPA_CONFIG.baseURL}/transaction/initialize`,
      paymentData,
      {
        headers: {
          'Authorization': `Bearer ${CHAPA_CONFIG.authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (chapaResponse.data.status !== 'success') {
      throw new Error('Chapa payment initialization failed');
    }

    // Store pending payment in database
    await query(`
      INSERT INTO TenantInvoices (
        tenant_id, invoice_number, status, subtotal, total_amount, 
        currency, issue_date, due_date, description, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      tenantId,
      tx_ref,
      'open',
      amount,
      amount,
      plan.currency,
      new Date(),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      `${plan.display_name} subscription - ${billing_cycle}`,
      JSON.stringify({
        plan_id,
        billing_cycle,
        chapa_checkout_url: chapaResponse.data.data.checkout_url,
        tx_ref
      })
    ]);

    // Log payment initialization
    if (req.auditLog) {
      await req.auditLog('payment_initialized', 'subscription', plan_id, {
        amount,
        currency: plan.currency,
        billing_cycle,
        tx_ref
      });
    }

    res.json({
      success: true,
      data: {
        checkout_url: chapaResponse.data.data.checkout_url,
        tx_ref: tx_ref,
        amount: amount,
        currency: plan.currency,
        plan: plan.display_name,
        billing_cycle
      },
      message: 'Payment initialized successfully',
      code: 'PAYMENT_INITIALIZED'
    });

  } catch (error) {
    console.error('Error initializing subscription payment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PAYMENT_INITIALIZATION_FAILED',
        message: 'Failed to initialize payment',
        statusCode: 500
      }
    });
  }
};

/**
 * Verify payment with Chapa
 */
const verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;

    // Verify payment with Chapa
    const chapaResponse = await axios.get(
      `${CHAPA_CONFIG.baseURL}/transaction/verify/${tx_ref}`,
      {
        headers: {
          'Authorization': `Bearer ${CHAPA_CONFIG.authToken}`
        }
      }
    );

    const paymentData = chapaResponse.data.data;

    if (chapaResponse.data.status !== 'success') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PAYMENT_VERIFICATION_FAILED',
          message: 'Payment verification failed',
          statusCode: 400
        }
      });
    }

    // Get invoice
    const invoiceResult = await query(
      'SELECT * FROM TenantInvoices WHERE invoice_number = $1',
      [tx_ref]
    );

    const invoice = invoiceResult.rows[0];
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVOICE_NOT_FOUND',
          message: 'Invoice not found',
          statusCode: 404
        }
      });
    }

    // Check if payment is successful
    if (paymentData.status === 'success') {
      await processSuccessfulPayment(invoice, paymentData);
    }

    res.json({
      success: true,
      data: {
        payment_status: paymentData.status,
        amount: paymentData.amount,
        currency: paymentData.currency,
        tx_ref: tx_ref
      },
      message: 'Payment verified successfully',
      code: 'PAYMENT_VERIFIED'
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PAYMENT_VERIFICATION_ERROR',
        message: 'Failed to verify payment',
        statusCode: 500
      }
    });
  }
};

/**
 * Process successful payment
 */
const processSuccessfulPayment = async (invoice, paymentData) => {
  const client = await query.pool.connect();
  
  try {
    await client.query('BEGIN');

    // Update invoice status
    await client.query(`
      UPDATE TenantInvoices 
      SET status = 'paid', paid_date = CURRENT_DATE, 
          metadata = metadata || $1
      WHERE invoice_id = $2
    `, [
      JSON.stringify({ chapa_payment_data: paymentData }),
      invoice.invoice_id
    ]);

    // Get plan and billing cycle from invoice metadata
    const metadata = invoice.metadata;
    const planId = metadata.plan_id;
    const billingCycle = metadata.billing_cycle;

    // Get plan details
    const planResult = await client.query(
      'SELECT * FROM SubscriptionPlans WHERE plan_id = $1',
      [planId]
    );
    const plan = planResult.rows[0];

    // Calculate subscription period
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    
    if (billingCycle === 'yearly') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    // Cancel any existing active subscriptions
    await client.query(`
      UPDATE TenantSubscriptions 
      SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP
      WHERE tenant_id = $1 AND status IN ('active', 'trialing')
    `, [invoice.tenant_id]);

    // Create new subscription
    await client.query(`
      INSERT INTO TenantSubscriptions (
        tenant_id, plan_id, status, current_period_start, current_period_end,
        amount, currency, billing_cycle, chapa_customer_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      invoice.tenant_id,
      planId,
      'active',
      currentPeriodStart,
      currentPeriodEnd,
      invoice.total_amount,
      invoice.currency,
      billingCycle,
      paymentData.customer_id || null
    ]);

    // Update tenant subscription details
    await client.query(`
      UPDATE Tenants 
      SET 
        subscription_plan = $1,
        subscription_status = 'active',
        current_period_start = $2,
        current_period_end = $3,
        max_restaurants = $4,
        max_orders_per_month = $5,
        max_riders = $6,
        features = $7
      WHERE tenant_id = $8
    `, [
      plan.name,
      currentPeriodStart,
      currentPeriodEnd,
      plan.max_restaurants,
      plan.max_orders_per_month,
      plan.max_riders,
      JSON.stringify(plan.features),
      invoice.tenant_id
    ]);

    // Update feature flags based on new plan
    const features = plan.features;
    for (const [featureKey, enabled] of Object.entries(features)) {
      await client.query(`
        INSERT INTO TenantFeatureFlags (tenant_id, feature_key, is_enabled)
        VALUES ($1, $2, $3)
        ON CONFLICT (tenant_id, feature_key)
        DO UPDATE SET is_enabled = EXCLUDED.is_enabled
      `, [invoice.tenant_id, featureKey, enabled]);
    }

    await client.query('COMMIT');

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Webhook handler for Chapa payments
 */
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-chapa-signature'];
    const payload = JSON.stringify(req.body);
    
    // Verify webhook signature (if implemented by Chapa)
    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.CHAPA_WEBHOOK_SECRET || '')
        .update(payload)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const { event, data } = req.body;

    switch (event) {
      case 'charge.success':
        await handleSuccessfulCharge(data);
        break;
      case 'charge.failed':
        await handleFailedCharge(data);
        break;
      default:
        console.log('Unhandled webhook event:', event);
    }

    res.json({ status: 'success' });

  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Handle successful charge webhook
 */
const handleSuccessfulCharge = async (chargeData) => {
  const tx_ref = chargeData.tx_ref;

  // Find invoice
  const invoiceResult = await query(
    'SELECT * FROM TenantInvoices WHERE invoice_number = $1',
    [tx_ref]
  );

  const invoice = invoiceResult.rows[0];
  if (invoice && invoice.status !== 'paid') {
    await processSuccessfulPayment(invoice, chargeData);
  }
};

/**
 * Handle failed charge webhook
 */
const handleFailedCharge = async (chargeData) => {
  const tx_ref = chargeData.tx_ref;

  // Update invoice status
  await query(`
    UPDATE TenantInvoices 
    SET status = 'void',
        metadata = metadata || $1
    WHERE invoice_number = $2
  `, [
    JSON.stringify({ failure_reason: chargeData.message }),
    tx_ref
  ]);
};

/**
 * Get tenant billing information
 */
const getTenantBilling = async (req, res) => {
  try {
    const tenantId = req.tenant.tenant_id;

    // Get current subscription
    const subscriptionResult = await query(`
      SELECT 
        ts.*,
        sp.display_name as plan_name,
        sp.features,
        sp.max_restaurants,
        sp.max_orders_per_month,
        sp.max_riders
      FROM TenantSubscriptions ts
      JOIN SubscriptionPlans sp ON sp.plan_id = ts.plan_id
      WHERE ts.tenant_id = $1 AND ts.status = 'active'
      ORDER BY ts.created_at DESC
      LIMIT 1
    `, [tenantId]);

    // Get recent invoices
    const invoicesResult = await query(`
      SELECT * FROM TenantInvoices 
      WHERE tenant_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [tenantId]);

    // Get usage statistics
    const usageResult = await Promise.all([
      query('SELECT COUNT(*) as count FROM Restaurants WHERE tenant_id = $1', [tenantId]),
      query(`
        SELECT COUNT(*) as count FROM Orders 
        WHERE tenant_id = $1 
        AND created_at >= date_trunc('month', CURRENT_DATE)
      `, [tenantId]),
      query('SELECT COUNT(*) as count FROM Riders WHERE tenant_id = $1', [tenantId])
    ]);

    const usage = {
      restaurants: parseInt(usageResult[0].rows[0].count),
      orders_this_month: parseInt(usageResult[1].rows[0].count),
      riders: parseInt(usageResult[2].rows[0].count)
    };

    res.json({
      success: true,
      data: {
        subscription: subscriptionResult.rows[0] || null,
        invoices: invoicesResult.rows,
        usage
      }
    });

  } catch (error) {
    console.error('Error getting tenant billing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BILLING_FETCH_FAILED',
        message: 'Failed to fetch billing information',
        statusCode: 500
      }
    });
  }
};

/**
 * Cancel subscription
 */
const cancelSubscription = async (req, res) => {
  try {
    const tenantId = req.tenant.tenant_id;
    const { cancel_at_period_end = true, reason } = req.body;

    const result = await query(`
      UPDATE TenantSubscriptions 
      SET 
        cancel_at_period_end = $1,
        cancellation_reason = $2,
        cancelled_at = CASE WHEN $1 = false THEN CURRENT_TIMESTAMP ELSE NULL END,
        status = CASE WHEN $1 = false THEN 'cancelled' ELSE status END
      WHERE tenant_id = $3 AND status = 'active'
      RETURNING *
    `, [cancel_at_period_end, reason, tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NO_ACTIVE_SUBSCRIPTION',
          message: 'No active subscription found',
          statusCode: 404
        }
      });
    }

    // Log cancellation
    if (req.auditLog) {
      await req.auditLog('subscription_cancelled', 'subscription', result.rows[0].subscription_id, {
        cancel_at_period_end,
        reason
      });
    }

    res.json({
      success: true,
      message: cancel_at_period_end 
        ? 'Subscription will be cancelled at the end of current period'
        : 'Subscription cancelled immediately',
      data: result.rows[0],
      code: 'SUBSCRIPTION_CANCELLED'
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBSCRIPTION_CANCELLATION_FAILED',
        message: 'Failed to cancel subscription',
        statusCode: 500
      }
    });
  }
};

/**
 * Platform revenue analytics (Platform admin only)
 */
const getPlatformRevenue = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    let dateFilter = '';
    switch (period) {
      case 'today':
        dateFilter = 'AND DATE(ti.paid_date) = CURRENT_DATE';
        break;
      case 'week':
        dateFilter = 'AND ti.paid_date >= CURRENT_DATE - INTERVAL \'7 days\'';
        break;
      case 'month':
        dateFilter = 'AND ti.paid_date >= date_trunc(\'month\', CURRENT_DATE)';
        break;
      case 'year':
        dateFilter = 'AND ti.paid_date >= date_trunc(\'year\', CURRENT_DATE)';
        break;
    }

    const revenueResult = await query(`
      SELECT 
        SUM(ti.total_amount) as total_revenue,
        COUNT(ti.invoice_id) as invoice_count,
        COUNT(DISTINCT ti.tenant_id) as paying_tenants,
        sp.display_name as plan_name,
        SUM(ti.total_amount) as plan_revenue
      FROM TenantInvoices ti
      LEFT JOIN TenantSubscriptions ts ON ts.tenant_id = ti.tenant_id
      LEFT JOIN SubscriptionPlans sp ON sp.plan_id = ts.plan_id
      WHERE ti.status = 'paid' ${dateFilter}
      GROUP BY sp.plan_id, sp.display_name
      ORDER BY plan_revenue DESC
    `);

    // Get tenant statistics
    const tenantStats = await query(`
      SELECT 
        COUNT(*) as total_tenants,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tenants,
        COUNT(CASE WHEN status = 'trial' THEN 1 END) as trial_tenants,
        COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as paying_tenants
      FROM Tenants
    `);

    res.json({
      success: true,
      data: {
        revenue_by_plan: revenueResult.rows,
        tenant_statistics: tenantStats.rows[0],
        period
      }
    });

  } catch (error) {
    console.error('Error getting platform revenue:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REVENUE_FETCH_FAILED',
        message: 'Failed to fetch revenue data',
        statusCode: 500
      }
    });
  }
};

module.exports = {
  initializeSubscriptionPayment,
  verifyPayment,
  handleWebhook,
  getTenantBilling,
  cancelSubscription,
  getPlatformRevenue
};