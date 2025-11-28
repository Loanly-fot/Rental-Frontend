# Equipment Rental System - React Frontend

## Overview

A complete React-based frontend application for managing equipment rentals with user authentication, inventory management, rental checkout, and reporting capabilities.

## Features Implemented

### 1. **Login Page** (`src/pages/Login.js`)

- Email and password authentication
- Axios POST request to `/auth/login` endpoint
- Token storage in localStorage
- Automatic redirect to dashboard on successful login
- Error handling with user-friendly messages
- Demo credentials display

### 2. **Dashboard** (`src/pages/Dashboard.js`)

- Welcome message with user information
- Statistical cards showing:
  - Total equipment in inventory
  - Active rentals count
  - Monthly revenue
  - Pending returns
- Navigation sidebar with links to all modules
- Logout functionality
- Token-based authentication check

### 3. **Equipment Management** (`src/pages/Equipment.js`)

- **List View**: Display all equipment with details
- **Create**: Add new equipment with:
  - Name, description, category
  - Daily rental rate
  - Quantity tracking (total and available)
- **Update**: Edit existing equipment details
- **Delete**: Remove equipment from system
- Real-time inventory status display

### 4. **Rental Checkout** (`src/pages/Rentals.js`)

- Create new rentals with:
  - Equipment selection (filtered by availability)
  - Customer information (name, email, phone)
  - Date range selection
  - Quantity management
  - Automatic cost calculation
- View all active and completed rentals
- Return equipment functionality
- Status tracking (active, completed, cancelled)

### 5. **Reports & Analytics** (`src/pages/Reports.js`)

- Three report types:
  - **Revenue Report**: Daily/period revenue by equipment
  - **Equipment Status**: Current inventory and utilization
  - **Rental History**: All rentals with financial details
- Date range filtering
- CSV export functionality
- Revenue summaries and totals

## API Endpoints Used

```
Authentication:
- POST /auth/login

Dashboard:
- GET /dashboard/stats

Equipment:
- GET /equipment
- POST /equipment
- PUT /equipment/:id
- DELETE /equipment/:id

Rentals:
- GET /rentals
- POST /rentals
- PUT /rentals/:id/return

Reports:
- GET /reports/revenue
- GET /reports/equipment
- GET /reports/rentals
```

## Technical Stack

- **Framework**: React 19.2.0
- **Routing**: React Router DOM 7.9.6
- **HTTP Client**: Axios 1.13.2
- **Testing**: React Testing Library 16.3.0
- **Styling**: CSS with responsive design

## Project Structure

```
src/
├── pages/
│   ├── Login.js          # Authentication page
│   ├── Dashboard.js      # Main dashboard
│   ├── Equipment.js      # Equipment CRUD operations
│   ├── Rentals.js        # Rental management
│   └── Reports.js        # Reporting and analytics
├── styles/
│   ├── Auth.css          # Login page styling
│   ├── Dashboard.css     # Dashboard styling
│   ├── Equipment.css     # Equipment management styling
│   ├── Rentals.css       # Rentals page styling
│   └── Reports.css       # Reports page styling
├── api.js                # Axios configuration with interceptors
├── App.js                # Route configuration
└── index.js              # Application entry point
```

## Key Features

### Authentication

- Token-based authentication using Bearer tokens
- Automatic token injection in request headers
- Session expiration handling (401 redirects to login)
- Token storage in localStorage

### Form Management

- Controlled components for all inputs
- Client-side validation
- Success/error feedback messages
- Loading states during API calls

### Data Visualization

- Statistics cards on dashboard
- Tables with sorting capability (via backend)
- Status badges for rentals
- Revenue highlighting

### Responsive Design

- Mobile-friendly layouts
- Flexible grid systems
- Collapsible navigation on smaller screens
- Touch-friendly buttons and inputs

## Component Features

### Forms

- Multi-step form layouts
- Conditional field rendering
- Real-time calculations (rental totals)
- Date range validation

### Tables

- Responsive table layouts
- Action buttons (Edit, Delete, Return)
- Status indicators
- Striped rows for readability

### Navigation

- Sticky navigation bar
- Sidebar menu (collapsible on mobile)
- Active link highlighting
- Quick action buttons

## Environment Configuration

Create a `.env` file in the project root:

```env
REACT_APP_API_URL=http://localhost:5000
```

## Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm build

# Run tests
npm test
```

## Available Scripts

- `npm start` - Run development server on port 3000
- `npm build` - Create optimized production build
- `npm test` - Run test suite
- `npm eject` - Eject from create-react-app (irreversible)

## API Response Format Expected

### Login Response

```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@rental.com"
  }
}
```

### Equipment List Response

```json
[
  {
    "id": 1,
    "name": "Bulldozer",
    "category": "Heavy Machinery",
    "dailyRate": 500,
    "quantity": 5,
    "available": 3,
    "description": "CAT D9 Bulldozer"
  }
]
```

### Rental Response

```json
{
  "id": 1,
  "equipmentName": "Bulldozer",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "startDate": "2025-01-01",
  "endDate": "2025-01-05",
  "totalCost": 2500,
  "status": "active"
}
```

## Future Enhancements

- PDF report generation
- Email notifications
- User roles and permissions
- Equipment maintenance tracking
- Payment processing integration
- Advanced search and filtering
- Real-time notifications
- Dark mode support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- All API calls include Bearer token authentication
- Forms include comprehensive error handling
- Loading states prevent double submissions
- Responsive design works on all screen sizes
- CSV export functionality for all reports
