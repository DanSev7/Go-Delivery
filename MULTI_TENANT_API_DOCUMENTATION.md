# 📡 Multi-Tenant SaaS Food Delivery API Documentation

## 🎯 Overview

This comprehensive API documentation covers all endpoints for the multi-tenant SaaS food delivery platform. The API supports tenant isolation, subscription billing, role-based access control, and real-time features.

**Base URL**: `https://yourdomain.com/api`
**Version**: 2.0.0
**Authentication**: JWT Bearer Token
**Content-Type**: `application/json`

## 🏗️ Architecture

### Multi-Tenant Strategy
- **Tenant Discovery**: Subdomain, custom domain, or X-Tenant-ID header
- **Data Isolation**: All queries are automatically scoped by tenant_id
- **RBAC**: Global roles + tenant-specific roles with permissions

### Response Format
All API responses follow this consistent format:

```json
{
  "success": true|false,
  "message": "Human-readable message",
  "data": { /* Response data */ },
  "code": "OPERATION_CODE",
  "tenant": {
    "id": "uuid",
    "name": "Tenant Name",
    "subdomain": "tenant"
  }
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "statusCode": 400
  }
}
```

## 🔐 Authentication

### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "tenant_subdomain": "pizzahut" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "user_id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "restaurant_manager"
    },
    "tenant_access": [
      {
        "tenant_id": "uuid",
        "tenant_name": "Pizza Hut",
        "subdomain": "pizzahut",
        "tenant_role": "tenant_admin"
      }
    ],
    "selected_tenant": {
      "tenant_id": "uuid",
      "name": "Pizza Hut",
      "subdomain": "pizzahut"
    }
  }
}
```

### Register
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "customer",
  "phone_number": "+1234567890",
  "address": "123 Main St"
}
```

### Get Profile
```http
GET /api/users/profile
Authorization: Bearer jwt_token
```

## 🏢 Tenant Management

### Create New Tenant (Onboarding)
```http
POST /api/tenants/onboard
Content-Type: application/json

{
  "name": "Pizza Palace",
  "subdomain": "pizzapalace",
  "contact_email": "admin@pizzapalace.com",
  "contact_phone": "+1234567890",
  "business_address": "456 Business Ave",
  "subscription_plan": "professional",
  "admin_name": "Admin User",
  "admin_email": "admin@pizzapalace.com",
  "admin_password": "SecurePass123!",
  "admin_phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tenant created successfully",
  "data": {
    "tenant": {
      "tenant_id": "uuid",
      "name": "Pizza Palace",
      "subdomain": "pizzapalace",
      "status": "active",
      "url": "https://pizzapalace.fooddelivery.com"
    },
    "admin": {
      "user_id": 123,
      "name": "Admin User",
      "email": "admin@pizzapalace.com"
    },
    "token": "jwt_token",
    "subscription_plan": {
      "name": "professional",
      "max_restaurants": 3,
      "max_orders_per_month": 5000
    }
  }
}
```

### Check Subdomain Availability
```http
GET /api/tenants/check-subdomain/{subdomain}
```

### Get Current Tenant Details
```http
GET /api/tenants/current
Authorization: Bearer jwt_token
X-Tenant-ID: tenant_uuid // or use subdomain
```

### Update Tenant
```http
PUT /api/tenants/current
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "name": "Updated Business Name",
  "contact_email": "new-email@example.com",
  "logo_url": "https://example.com/logo.png",
  "primary_color": "#007bff"
}
```

### Invite User to Tenant
```http
POST /api/tenants/users/invite
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "email": "user@example.com",
  "tenant_role": "manager",
  "permissions": {
    "manage_menu": true,
    "view_analytics": true
  }
}
```

### List Tenant Users
```http
GET /api/tenants/users?page=1&limit=20&role=manager&status=active
Authorization: Bearer jwt_token
```

## 💳 Billing & Subscriptions

### Get Available Plans
```http
GET /api/tenants/plans
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "plan_id": 1,
      "name": "starter",
      "display_name": "Starter Plan",
      "price_monthly": 999.00,
      "price_yearly": 9990.00,
      "max_restaurants": 1,
      "max_orders_per_month": 1000,
      "features": {
        "real_time_tracking": true,
        "analytics": true,
        "api_access": false
      }
    }
  ]
}
```

### Initialize Subscription Payment
```http
POST /api/billing/tenant/subscribe
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "plan_id": 1,
  "billing_cycle": "monthly"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "checkout_url": "https://checkout.chapa.co/checkout/payment/...",
    "tx_ref": "saas_sub_uuid_timestamp",
    "amount": 999.00,
    "currency": "ETB",
    "plan": "Starter Plan"
  }
}
```

### Verify Payment
```http
GET /api/billing/verify/{tx_ref}
```

### Get Billing Information
```http
GET /api/billing/tenant/current
Authorization: Bearer jwt_token
```

### Cancel Subscription
```http
POST /api/billing/tenant/cancel
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "cancel_at_period_end": true,
  "reason": "No longer needed"
}
```

## 🍕 Restaurant Management

All restaurant endpoints are automatically tenant-scoped.

### Create Restaurant
```http
POST /api/restaurants
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "name": "Main Branch",
  "location": "123 Restaurant St",
  "phone_number": "+1234567890",
  "opening_hours": {
    "monday": "9:00-22:00",
    "tuesday": "9:00-22:00"
  },
  "average_delivery_time": 30,
  "category": "Italian"
}
```

### Get Restaurant Dashboard
```http
GET /api/restaurants/dashboard
Authorization: Bearer jwt_token
```

### List Restaurants (Tenant-Scoped)
```http
GET /api/restaurants?page=1&limit=10
Authorization: Bearer jwt_token
```

### Update Restaurant
```http
PUT /api/restaurants/{restaurant_id}
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "name": "Updated Restaurant Name",
  "phone_number": "+9876543210"
}
```

## 🍔 Menu Management

### Create Menu Item
```http
POST /api/menu-items/{restaurant_id}
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "name": "Margherita Pizza",
  "price": 299.99,
  "description": "Classic tomato and mozzarella",
  "category": "Pizza",
  "availability_status": true,
  "image": "https://example.com/pizza.jpg"
}
```

### List Menu Items for Restaurant
```http
GET /api/menu-items/restaurants/{restaurant_id}
Authorization: Bearer jwt_token
```

### Update Menu Item
```http
PUT /api/menu-items/{menu_item_id}
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "price": 319.99,
  "availability_status": false
}
```

### Delete Menu Item
```http
DELETE /api/menu-items/{menu_item_id}
Authorization: Bearer jwt_token
```

## 📦 Order Management

### Create Order
```http
POST /api/orders/{restaurant_id}
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "items": [
    {
      "menu_item_id": 1,
      "quantity": 2,
      "price": 299.99
    }
  ],
  "delivery_address": "123 Customer St",
  "delivery_fee": 29.99,
  "total_price": 629.97
}
```

### Get Orders for Restaurant
```http
GET /api/orders/restaurant/{restaurant_id}?page=1&limit=20&status=pending
Authorization: Bearer jwt_token
```

### Update Order Status
```http
PUT /api/orders/{order_id}/status
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "order_status": "preparing"
}
```

### Get Order Details
```http
GET /api/orders/{order_id}
Authorization: Bearer jwt_token
```

## 🛵 Rider Management

### Register Rider
```http
POST /api/riders/register
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "vehicle_type": "motorcycle",
  "status": "available",
  "location": "Downtown Area"
}
```

### Get Available Riders
```http
GET /api/riders/available
Authorization: Bearer jwt_token
```

### Update Rider Status
```http
PUT /api/riders/status/{rider_id}
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "status": "busy"
}
```

### Get Rider Orders
```http
GET /api/riders/orders/assigned
Authorization: Bearer jwt_token
```

### Accept Order (Rider)
```http
PUT /api/riders/orders/{order_id}/accept
Authorization: Bearer jwt_token
```

## ⭐ Reviews & Ratings

### Add Review
```http
POST /api/reviews
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "restaurant_id": 1,
  "menu_item_id": 1,
  "rating": 5,
  "review_text": "Excellent food and service!"
}
```

### Get Restaurant Reviews
```http
GET /api/reviews/restaurant/{restaurant_id}?page=1&limit=10
Authorization: Bearer jwt_token
```

### Update Review
```http
PUT /api/reviews/{review_id}
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "rating": 4,
  "review_text": "Updated review text"
}
```

## 👥 User Management

### List Users (Tenant-Scoped)
```http
GET /api/users?page=1&limit=20&role=customer&status=active
Authorization: Bearer jwt_token
```

### Update User
```http
PUT /api/users/{user_id}
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "name": "Updated Name",
  "phone_number": "+9876543210"
}
```

### Delete User
```http
DELETE /api/users/{user_id}
Authorization: Bearer jwt_token
```

### Change Password
```http
POST /api/users/{user_id}/change-password
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "previousPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

### Request Password Reset
```http
POST /api/users/password/reset-request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Reset Password
```http
POST /api/users/password/reset
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "new_password": "newpassword123"
}
```

## 📊 Analytics & Reports

### Tenant Dashboard Stats
```http
GET /api/tenants/dashboard
Authorization: Bearer jwt_token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurants": {
      "total": 5
    },
    "orders": {
      "total": 1250,
      "delivered": 1180,
      "today": 45
    },
    "users": {
      "total": 89
    },
    "revenue": {
      "total": 125000.50,
      "today": 2340.25,
      "month": 45670.80
    }
  }
}
```

### Platform Revenue (Platform Admin Only)
```http
GET /api/billing/platform/revenue?period=month
Authorization: Bearer jwt_token
```

## 🏷️ Categories

### List Categories
```http
GET /api/categories
Authorization: Bearer jwt_token
```

### Create Category (Admin/Manager Only)
```http
POST /api/categories
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "name": "Desserts",
  "image": "desserts.jpg"
}
```

### Update Category
```http
PUT /api/categories/{category_id}
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "name": "Updated Category Name"
}
```

## 🔧 Administration (Platform Admin Only)

### List All Tenants
```http
GET /api/tenants/admin/tenants?page=1&limit=20&status=active
Authorization: Bearer jwt_token
```

### Update Tenant Status
```http
PATCH /api/tenants/admin/tenants/{tenant_id}/status
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "status": "suspended",
  "reason": "Policy violation"
}
```

### Get Platform Statistics
```http
GET /api/admin/stats
Authorization: Bearer jwt_token
```

## 🌐 Headers & Authentication

### Required Headers
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
X-Tenant-ID: {tenant_uuid} // Optional, can use subdomain instead
```

### Tenant Resolution Priority
1. `X-Tenant-ID` header
2. Subdomain (e.g., `pizzahut.yourdomain.com`)
3. Custom domain mapping
4. JWT token tenant claim

## 📡 Real-Time Events (WebSocket)

### Connection
```javascript
// Connect to tenant-specific namespace
const socket = io(`https://yourdomain.com/${tenantId}`, {
  auth: {
    token: jwt_token
  }
});
```

### Order Events
```javascript
// Listen for order updates
socket.on('order:status_changed', (data) => {
  console.log('Order status updated:', data);
});

// Listen for new orders (restaurant)
socket.on('order:new', (data) => {
  console.log('New order received:', data);
});

// Listen for rider location updates
socket.on('rider:location_update', (data) => {
  console.log('Rider location:', data);
});
```

## 🚦 Rate Limiting

### Standard Limits
- **Authentication endpoints**: 5 requests/minute
- **API endpoints**: 100 requests/minute per user
- **Webhook endpoints**: 1000 requests/minute

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔍 Filtering & Pagination

### Query Parameters
```http
GET /api/orders?page=1&limit=20&status=delivered&date_from=2024-01-01&date_to=2024-01-31&sort=created_at&order=desc
```

### Standard Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field
- `order`: Sort direction (`asc` or `desc`)
- `search`: Search term
- `status`: Filter by status
- `date_from`, `date_to`: Date range filters

## ⚠️ Error Codes

### Authentication Errors
- `NO_TOKEN`: Missing authentication token
- `INVALID_TOKEN`: Invalid or expired token
- `USER_NOT_FOUND`: User account not found
- `ACCOUNT_INACTIVE`: User account is disabled

### Authorization Errors
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `TENANT_ACCESS_DENIED`: User cannot access this tenant
- `PLATFORM_ADMIN_REQUIRED`: Operation requires platform admin role

### Tenant Errors
- `TENANT_NOT_FOUND`: Tenant does not exist
- `SUBDOMAIN_EXISTS`: Subdomain already taken
- `SUBSCRIPTION_LIMIT_EXCEEDED`: Usage limit exceeded

### Validation Errors
- `MISSING_REQUIRED_FIELDS`: Required fields not provided
- `INVALID_FORMAT`: Data format is incorrect
- `EMAIL_EXISTS`: Email already registered

### Business Logic Errors
- `RESTAURANT_NOT_FOUND`: Restaurant not found in tenant
- `ORDER_NOT_FOUND`: Order not found or not accessible
- `PAYMENT_FAILED`: Payment processing failed

## 📚 SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

class FoodDeliveryAPI {
  constructor(baseURL, token, tenantId) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
        'Content-Type': 'application/json'
      }
    });
  }

  async createRestaurant(data) {
    const response = await this.client.post('/restaurants', data);
    return response.data;
  }

  async getOrders(restaurantId, params = {}) {
    const response = await this.client.get(`/orders/restaurant/${restaurantId}`, { params });
    return response.data;
  }
}

// Usage
const api = new FoodDeliveryAPI(
  'https://yourdomain.com/api',
  'your_jwt_token',
  'tenant_uuid'
);

const restaurant = await api.createRestaurant({
  name: 'New Restaurant',
  location: 'Downtown'
});
```

### React Hook
```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useAPI(tenantId, token) {
  const [api] = useState(() => {
    return axios.create({
      baseURL: 'https://yourdomain.com/api',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId
      }
    });
  });

  return api;
}

// Usage in component
function RestaurantList() {
  const api = useAPI(tenantId, token);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    api.get('/restaurants').then(response => {
      setRestaurants(response.data.data);
    });
  }, [api]);

  return (
    <div>
      {restaurants.map(restaurant => (
        <div key={restaurant.id}>{restaurant.name}</div>
      ))}
    </div>
  );
}
```

## 🔄 Webhooks

### Chapa Payment Webhooks
The system automatically handles Chapa webhooks for payment processing.

**Endpoint**: `POST /api/billing/webhook`

**Events Handled:**
- `charge.success`: Payment completed successfully
- `charge.failed`: Payment failed

## 📈 Monitoring

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "2.0.0-saas",
  "features": ["multi-tenant", "saas-billing", "rbac"]
}
```

### API Metrics
Monitor these key metrics:
- Response times per endpoint
- Error rates by error code
- Active tenant count
- Subscription revenue
- Database query performance

---

## 🎉 Conclusion

This API provides a complete multi-tenant SaaS platform for food delivery with:

✅ **Multi-tenant isolation**
✅ **Subscription billing** 
✅ **Role-based access control**
✅ **Real-time features**
✅ **Comprehensive analytics**
✅ **Mobile app support**

For additional support or questions, please contact our development team or check the deployment guide for setup instructions.

**Happy coding! 🚀**