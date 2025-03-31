# College Event Website

A platform for university students to discover, create, and join events at their university and with registered student organizations (RSOs).

## Features

- **User Authentication**: Support for student, admin, and super admin roles
- **Event Management**: Browse, search, and filter events
- **RSO Management**: Create, join, and manage Registered Student Organizations
- **University Management**: Super admins can create and manage university profiles
- **Comments & Ratings**: Rate and comment on events

## Data Model

### Entity Relationships

The application follows this ER diagram structure:

- **Users**: The base entity for all system users
  - Primary key: UID
  - ISA relationship to Admins and SuperAdmins

- **Events**: The base entity for all events
  - Primary key: Event ID
  - Attributes: Time, Description, etc.
  - ISA relationship to RSO_Events, Private_Events, and Public_Events
  - Events have a relationship "At" with Locations
  - Events have "Comments" from Users

- **Locations**: Places where events are held
  - Primary key: Lname
  - Attributes: Address, Longitude, Latitude

### Relations

- Public_Events are created by SuperAdmins
- Private_Events are created by Admins with approval from SuperAdmins 
- RSO_Events are owned by RSOs
- Users join Events
- Users are part of RSOs

## Local Data Service

The application uses a mock data service to simulate database operations. In a production environment, this would be replaced with API calls to a backend server.

### API Structure

- **auth**: User authentication and role management
- **events**: Event management, visibility, and attendance
- **comments**: Comment and rating management
- **rsos**: RSO management and membership
- **universities**: University profile management
- **locations**: Location information retrieval

## Development

### Running the App

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

### Demo Data

The application includes demo data for testing, including:
- Demo users (student, admin, super admin)
- Sample events
- Sample RSOs
- Sample universities

## Future Enhancements

- Integration with a real backend API
- Google Maps integration for location visualization
- Email notifications for event reminders
- Advanced search and filtering capabilities 