# Food Delivery System - Startup Guide

## Project Overview
This is a complete food delivery system with four main components:
- **Backend API** (Node.js/Express with PostgreSQL)
- **Admin Panel** (React with Material-UI)
- **Restaurant Panel** (React with Material-UI)
- **Client App** (React Native/Expo for customers)

## Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Expo CLI (for client app): `npm install -g @expo/cli`

## Database Setup

1. **Install PostgreSQL** and create a database named `Food_Delivery`

2. **Run the database schema**:
   ```sql
   -- Execute the SQL file located at:
   -- Final_Backend/database_schema.sql
   ```

3. **Update database credentials** in `Final_Backend/.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=Food_Delivery
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

## Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd "Final_Backend"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   - Server will run on http://localhost:5000
   - Health check: http://localhost:5000/health

## Admin Panel Setup

1. **Navigate to the admin panel directory**:
   ```bash
   cd "Admin Panel/admin_panel"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   - Admin panel will run on http://localhost:5173

## Client App Setup (React Native/Expo)

1. **Navigate to the client directory**:
   ```bash
   cd "client"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure the API URL**:
   Update `client/.env` with your backend URL:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start the Expo development server**:
   ```bash
   npx expo start
   ```
   - For web: Press `w`
   - For iOS simulator: Press `i`
   - For Android emulator: Press `a`
   - For physical device: Scan QR code with Expo Go app

## Restaurant Panel Setup

1. **Navigate to the restaurant panel directory**:
   ```bash
   cd "Restaurant Panel/restaurant_panel"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   - Restaurant panel will run on http://localhost:5174 (different port)

### Admin Panel Access
- **Role**: `admin`
- **Default Admin User**: Create manually in database or via registration
- **Features**: 
  - Dashboard with statistics
  - User management
  - Restaurant management
  - Category management
  - Order management
  - Rider management

### Restaurant Panel Access
- **Role**: `restaurant_manager`
- **Registration**: Restaurant managers can register via sign-up
- **Features**: 
  - Restaurant dashboard
  - Menu management
  - Order management
  - Restaurant profile management
  - Review management

## API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `GET /api/users/profile` - Get user profile (authenticated)

### Admin (Admin only)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/:id` - Delete user

### Restaurants
- `GET /api/restaurants` - List restaurants
- `POST /api/restaurants` - Create restaurant (restaurant_manager)
- `GET /api/restaurants/:id` - Get restaurant details
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant (admin)
- `GET /api/restaurants/dashboard` - Restaurant dashboard (restaurant_manager)

### Categories (Admin only)
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/update/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Menu Items
- `GET /api/menu-items/restaurants/:restaurantId` - List menu items by restaurant
- `POST /api/menu-items/:restaurantId` - Create menu item (restaurant_manager)
- `PUT /api/menu-items/:id` - Update menu item (restaurant_manager)
- `DELETE /api/menu-items/:id` - Delete menu item (restaurant_manager)

## Environment Configuration

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Food_Delivery
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=jwt_secret_key_for_food_delivery_app_2024

# Server
PORT=5000
NODE_ENV=development

# Chapa Payment
CHAPA_URL=https://api.chapa.co/v1/transaction/initialize
CHAPA_AUTH=your_chapa_auth_key

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

### Frontend (.env for both panels)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Food Delivery System
VITE_DEBUG=true
```

## Development Workflow

1. **Start the backend server first**: `npm run dev` in Final_Backend
2. **Start the admin panel**: `npm run dev` in Admin Panel/admin_panel
3. **Start the restaurant panel**: `npm run dev` in Restaurant Panel/restaurant_panel

## Common Issues and Solutions

### Database Connection Issues
- Check PostgreSQL is running
- Verify database credentials in .env
- Ensure database `Food_Delivery` exists

### CORS Issues
- Ensure ALLOWED_ORIGINS in backend .env includes frontend URLs
- Check that frontend is using correct API URL

### Authentication Issues
- Check JWT_SECRET is consistent
- Verify token format (Bearer token)
- Check user roles match required permissions

### Port Conflicts
- Backend: 5000
- Admin Panel: 5173
- Restaurant Panel: 5174
- Change ports in package.json if needed

## Production Deployment

1. **Set NODE_ENV=production** in backend
2. **Build frontend applications**: `npm run build`
3. **Use environment-specific database credentials**
4. **Configure proper CORS origins for production**
5. **Use HTTPS in production**

## Architecture Features

- **Role-based authorization** with middleware
- **JWT authentication** with automatic token refresh
- **Centralized API configuration** with interceptors
- **Error handling** with proper HTTP status codes
- **File upload support** with base64 encoding
- **Payment integration** with Chapa
- **Real-time dashboard** statistics
- **Responsive UI** with Material-UI

## Support

For issues or questions:
1. Check the console logs for errors
2. Verify API endpoints are accessible
3. Check network requests in browser dev tools
4. Ensure all services are running on correct ports