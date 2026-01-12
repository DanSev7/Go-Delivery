🛵 **Go Food Delivery System**
==============================

A comprehensive, full-stack food delivery ecosystem featuring mobile applications for customers and riders, along with a powerful web management portal for restaurants and administrators.

📱 Project Overview
-------------------

**Go Food Delivery System** is designed to bridge the gap between hungry customers, local restaurants, and delivery partners. The system ensures a seamless flow from order placement to doorstep delivery through real-time data synchronization.

The project consists of three main interfaces:

1.  **Customer App (Mobile):** For browsing menus, ordering food, and tracking deliveries.
    
2.  **Rider App (Mobile):** For delivery partners to accept tasks and navigate to locations.
    
3.  **Admin & Restaurant Portal (Web):** For managing menus, tracking business analytics, and dispatching orders.
    

✨ Key Features
--------------

*   📍 **Real-time Order Tracking** – Live GPS tracking of riders using Google Maps integration.
    
*   💳 **Secure Payments** – Integrated payment gateways (Stripe/Razorpay) for seamless transactions.
    
*   🔔 **Instant Notifications** – Real-time push notifications for order status updates (Placed, Preparing, Out for Delivery).
    
*   🗺️ **Map Integration** – Advanced routing for riders and precise location picking for customers.
    
*   📊 **Admin Dashboard** – Comprehensive tools for managing users, restaurants, and financial reports.
    
*   🏪 **Restaurant Management** – Easy menu updates, toggle item availability, and order management.
    

🛠️ Tools Used
--------------

*   ⚛️ **React Native** – Mobile framework for high-performance iOS and Android apps.
    
*   🌐 **React.js** – Web framework for the Admin and Restaurant Manager portals.
    
*   🟢 **Node.js & Socket.io** – Backend engine for real-time, bidirectional communication.
    
*   🔐 **Appwrite / Firebase** – Backend-as-a-Service for authentication and database management.
    
*   🗺️ **Google Maps SDK** – For location services and pathfinding.
    

🚀 Get Started
--------------

### 1\. Clone and Install Dependencies

```bash
# Install Mobile dependencies  cd mobile-app  npm install  # Install Web Portal dependencies  cd web-portal  npm install   
```

### 2\. Configure Environment Variables

Create a .env file in both directories and add your API keys:

*   Maps API Key
    
*   Payment Gateway Secret
    
*   Backend Service URL
    

### 3\. Run the Project

**For Mobile:**

```bash
npx expo start
```

**For Web:**

```bash
npm start
```

🔄 Project Structure
--------------------

*   **/customer-app** – React Native code for the user-facing application.
    
*   **/rider-app** – React Native code optimized for delivery logistics.
    
*   **/admin-portal** – React Web dashboard for system-wide control.
    
*   **/shared-components** – Reusable UI elements across all platforms.
    

📚 Documentation & Support
--------------------------

*   [API Reference](https://www.google.com/search?q=https://github.com/gofood/docs)
    
*   [Deployment Guide](https://www.google.com/search?q=https://github.com/gofood/deploy)
    

🌍 Join the Community
---------------------

*   Follow us on Twitter: [@GoFoodDev](https://www.google.com/search?q=https://twitter.com/gofooddev)
    
*   Discord Support: [https://chat.gofood.dev](https://www.google.com/search?q=https://chat.gofood.dev)
    

© 2026 Go Food Delivery System. All rights reserved.
