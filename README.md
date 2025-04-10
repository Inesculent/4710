# College Events Application

## Overview
This application enables university students to discover, create, and engage with campus events. It supports different types of events (public, private, RSO), user roles (Student, Admin, SuperAdmin), and includes features like RSVPs, event searching, and map visualization.

## Architecture
- **Backend**: Spring Boot REST API with JPA for database access
- **Frontend**: React application using Material-UI components
- **Database**: MySQL

## Prerequisites
- Java 17+ (JDK)
- Node.js 16+ and npm
- MySQL Server

## Database Setup
1. Create a MySQL database named `college_events`
2. Update the database connection settings in `backend/src/main/resources/application.properties` if needed
3. Run the SQL schema file to create tables: `backend/src/main/resources/schema.sql`
4. (Optional) Load sample data: `backend/src/main/resources/data.sql`

## Running the Backend
1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Build the application:
   ```
   ./mvnw clean package
   ```
3. Run the Spring Boot application:
   ```
   ./mvnw spring-boot:run
   ```
4. The backend API will be available at `http://localhost:8080/api`

## Running the Frontend
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. The frontend will be available at `http://localhost:3000`

## Key Features

### User Management
- **Registration & Login**: Secure user authentication
- **Role-based Authorization**:
  - **Students**: Regular user permissions
  - **Admin**: Create/manage events, approve events
  - **SuperAdmin**: University-wide administrative capabilities

### University & RSO Management
- University creation and management
- Create, join, and manage Registered Student Organizations (RSOs)
- RSO admin capabilities

### Event Management
- **Create Events**: Create events with details (title, description, date/time, location)
- **Event Types**:
  - **Public Events**: Visible to everyone, require admin approval
  - **Private Events**: University-specific events, visible to university members
  - **RSO Events**: Only visible to RSO members
- **Event Approval**: Admin approval workflow for public events

### Advanced Features
1. **Event Search & Filtering**
   - Search by keyword in name or description
   - Filter by date range
   - Filter by university
   - Filter by event type (public, private, RSO)
   - Location-based search with distance radius

2. **RSVP System**
   - Indicate attendance status (attending, maybe, not attending)
   - View attendee list
   - Track event popularity
   - Record and display RSVP timestamps

3. **Interactive Map**
   - View events on a map
   - Get directions to events
   - Visualize event distribution by location
   - Click event markers for quick information

4. **Enhanced Event Details**
   - Rating system for events
   - Comments and reviews
   - Attendance tracking
   - Social media sharing

## API Endpoints

### User Endpoints
- `POST /api/users/create`: Register new user
- `POST /api/users/validate`: User login
- `GET /api/users/{userId}`: Get user profile
- `PUT /api/users/{userId}`: Update user profile

### University Endpoints
- `GET /api/universities/all`: Get all universities
- `GET /api/universities/{universityId}`: Get university details
- `POST /api/universities`: Create new university

### RSO Endpoints
- `GET /api/rsos`: Get all RSOs
- `GET /api/rsos/{rsoId}`: Get RSO details
- `GET /api/rsos/university/{universityId}`: Get university RSOs
- `GET /api/rsos/user/{userId}`: Get user's RSOs
- `POST /api/rsos/create`: Create new RSO
- `POST /api/rsos/{rsoId}/join`: Join an RSO

### Event Endpoints
- `GET /api/events/all`: Get all events
- `GET /api/events/{userId}`: Get user's events
- `GET /api/events/public/{userId}`: Get public events for user
- `GET /api/events/private/{userId}`: Get private events for user
- `GET /api/events/rso/{rsoId}`: Get RSO events
- `GET /api/events/university/{universityId}`: Get university events
- `GET /api/events/event/{eventId}`: Get specific event details
- `POST /api/events/create`: Create new event
- `POST /api/events/approve`: Approve public event
- `GET /api/events/search`: Search events with filters

### RSVP Endpoints
- `GET /api/rsvps/event/{eventId}`: Get RSVPs for an event
- `GET /api/rsvps/user/{userId}`: Get user's RSVPs
- `GET /api/rsvps/status/{userId}/{eventId}`: Get user's RSVP status for an event
- `POST /api/rsvps/create`: Create new RSVP
- `PUT /api/rsvps/update`: Update RSVP status

### Comment Endpoints
- `GET /api/events/{eventId}/comments`: Get comments for an event
- `POST /api/events/{eventId}/comments`: Add comment to an event

## Demo Credentials
Use these credentials for testing:
- SuperAdmin: `admin@college.edu` / `admin123`
- Admin: `admin@ucf.edu` / `admin123`
- Student: `student@knights.ucf.edu` / `student123`

## Common Issues & Troubleshooting
- If you encounter CORS issues, ensure your backend CORS settings are configured correctly
- Database connection issues can typically be resolved by checking MySQL settings
- For frontend development issues, check browser console for errors