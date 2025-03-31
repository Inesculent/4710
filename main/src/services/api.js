// Mock data for our API service
// These would be retrieved from our backend server in a real application

// Users (Students)
const users = [
  {
    uid: 1,
    email: 'student1@knights.ucf.edu',
    displayName: 'John Student',
    university_id: 1,
    role: 'student',
    photoURL: 'https://i.pravatar.cc/300?img=1'
  },
  {
    uid: 2,
    email: 'admin1@knights.ucf.edu',
    displayName: 'Jane Admin',
    university_id: 1,
    role: 'admin',
    photoURL: 'https://i.pravatar.cc/300?img=5'
  },
  {
    uid: 3,
    email: 'superadmin@knights.ucf.edu',
    displayName: 'Sam SuperAdmin',
    university_id: 1,
    role: 'superadmin',
    photoURL: 'https://i.pravatar.cc/300?img=8'
  }
];

// Locations
const locations = [
  {
    lname: 'Computer Science Building',
    address: '123 University Blvd, Orlando, FL 32816',
    longitude: -81.2001,
    latitude: 28.6018
  },
  {
    lname: 'Student Union',
    address: '456 University Blvd, Orlando, FL 32816',
    longitude: -81.2050,
    latitude: 28.6020
  },
  {
    lname: 'Main Campus Quad',
    address: 'University of Central Florida, Orlando, FL 32816',
    longitude: -81.2030,
    latitude: 28.6015
  }
];

// Universities
const universities = [
  {
    id: 1,
    name: 'University of Central Florida',
    location: 'Orlando, FL',
    description: 'UCF is a public research university with the largest university campus by enrollment in Florida.',
    studentCount: 70000,
    pictures: [
      'https://images.unsplash.com/photo-1587068415117-b49abac631a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ]
  },
  {
    id: 2,
    name: 'Florida State University',
    location: 'Tallahassee, FL',
    description: 'FSU is a public research university offering bachelor\'s, master\'s, and doctoral degrees.',
    studentCount: 45000,
    pictures: [
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ]
  }
];

// RSOs
const rsos = [
  { 
    id: 1, 
    name: 'Computer Science Club', 
    description: 'A club for computer science students interested in programming and technology.',
    university_id: 1,
    memberCount: 25,
    active: true,
    admin_id: 2 // admin user
  },
  { 
    id: 2, 
    name: 'Chess Club', 
    description: 'Weekly meetings for chess enthusiasts of all skill levels.',
    university_id: 1,
    memberCount: 15,
    active: true,
    admin_id: 2 // admin user
  }
];

// RSO Memberships
const rsoMemberships = [
  { rso_id: 1, user_id: 1 },
  { rso_id: 2, user_id: 1 },
  { rso_id: 1, user_id: 2 },
  { rso_id: 2, user_id: 2 }
];

// Events (base class)
const events = [
  {
    id: 1,
    title: 'Tech Talk: AI and Ethics',
    description: 'Join us for a discussion on artificial intelligence ethics and implications.',
    date: '2025-04-15',
    time: '15:00',
    location_name: 'Computer Science Building',
    category: 'tech',
    type: 'public', // public, private, or rso
    university_id: 1,
    rso_id: null,
    contact_phone: '(407) 123-4567',
    contact_email: 'techevent@knights.ucf.edu',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    averageRating: 4.2,
    created_by: 3, // superadmin
    approved_by: 3 // self-approved for superadmin
  },
  {
    id: 2,
    title: 'Annual Spring Concert',
    description: 'Come enjoy live music and food at our annual spring concert.',
    date: '2025-04-20',
    time: '18:00',
    location_name: 'Main Campus Quad',
    category: 'social',
    type: 'private',
    university_id: 1,
    rso_id: null,
    contact_phone: '(407) 123-4567',
    contact_email: 'events@knights.ucf.edu',
    imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    averageRating: 4.0,
    created_by: 2, // admin
    approved_by: 3 // superadmin must approve private events
  },
  {
    id: 3,
    title: 'Chess Club Tournament',
    description: 'Join our RSO for the semesterly chess tournament.',
    date: '2025-04-25',
    time: '13:00',
    location_name: 'Student Union',
    category: 'social',
    type: 'rso',
    university_id: 1,
    rso_id: 2, // Chess Club
    contact_phone: '(407) 123-4567',
    contact_email: 'chessclub@knights.ucf.edu',
    imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    averageRating: 4.5,
    created_by: 2, // admin who owns the RSO
    approved_by: null // RSO events don't need approval
  }
];

// Event Attendees (Users who joined events)
const eventAttendees = [
  { event_id: 1, user_id: 1 },
  { event_id: 2, user_id: 1 },
  { event_id: 3, user_id: 1 },
  { event_id: 1, user_id: 2 }
];

// Comments
const comments = [
  {
    id: 1,
    event_id: 1,
    user_id: 1,
    text: 'Excited for this event! Looking forward to learning about AI ethics.',
    rating: 5,
    timestamp: '2025-03-18T10:24:00Z',
    likes: 5
  },
  {
    id: 2,
    event_id: 1,
    user_id: 2,
    text: 'Will there be a Q&A session at the end?',
    rating: 4,
    timestamp: '2025-03-19T15:30:00Z',
    likes: 2
  }
];

// Mock API functions
const api = {
  // Auth functions
  auth: {
    login: async (email, password) => {
      // In a real app, this would make a POST request to the server
      const user = users.find(u => u.email === email);
      if (user) {
        return user;
      }
      throw new Error('Invalid email or password');
    },

    register: async (email, password, displayName, universityId) => {
      // In a real app, this would make a POST request to the server
      const newUser = {
        uid: users.length + 1,
        email,
        displayName,
        university_id: universityId,
        role: 'student',
        photoURL: `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70)}`
      };
      users.push(newUser);
      return newUser;
    },

    // For demo purposes - allows easy role switching
    setUserRole: async (uid, newRole) => {
      const user = users.find(u => u.uid === uid);
      if (user) {
        user.role = newRole;
        return user;
      }
      throw new Error('User not found');
    }
  },

  // University functions
  universities: {
    getAll: async () => {
      return universities;
    },

    getById: async (id) => {
      const university = universities.find(u => u.id === id);
      if (university) {
        return university;
      }
      throw new Error('University not found');
    },

    create: async (universityData) => {
      const newUniversity = {
        id: universities.length + 1,
        ...universityData
      };
      universities.push(newUniversity);
      return newUniversity;
    },

    update: async (id, universityData) => {
      const index = universities.findIndex(u => u.id === id);
      if (index !== -1) {
        universities[index] = { ...universities[index], ...universityData };
        return universities[index];
      }
      throw new Error('University not found');
    },

    delete: async (id) => {
      const index = universities.findIndex(u => u.id === id);
      if (index !== -1) {
        universities.splice(index, 1);
        return true;
      }
      throw new Error('University not found');
    }
  },

  // RSO functions
  rsos: {
    getAll: async () => {
      return rsos;
    },

    getByUniversity: async (universityId) => {
      return rsos.filter(r => r.university_id === universityId);
    },

    getUserRsos: async (userId) => {
      const membershipIds = rsoMemberships
        .filter(m => m.user_id === userId)
        .map(m => m.rso_id);
      return rsos.filter(r => membershipIds.includes(r.id));
    },

    create: async (rsoData, members) => {
      const newRso = {
        id: rsos.length + 1,
        ...rsoData,
        memberCount: members.length + 1 // +1 for admin
      };
      rsos.push(newRso);
      
      // Add memberships
      rsoMemberships.push({ rso_id: newRso.id, user_id: rsoData.admin_id });
      members.forEach(userId => {
        rsoMemberships.push({ rso_id: newRso.id, user_id: userId });
      });
      
      return newRso;
    },

    join: async (rsoId, userId) => {
      // Check if already a member
      const existingMembership = rsoMemberships.find(
        m => m.rso_id === rsoId && m.user_id === userId
      );
      if (existingMembership) {
        throw new Error('Already a member of this RSO');
      }
      
      // Add membership
      rsoMemberships.push({ rso_id: rsoId, user_id: userId });
      
      // Update member count
      const rso = rsos.find(r => r.id === rsoId);
      if (rso) {
        rso.memberCount += 1;
      }
      
      return true;
    },

    leave: async (rsoId, userId) => {
      // Find and remove membership
      const membershipIndex = rsoMemberships.findIndex(
        m => m.rso_id === rsoId && m.user_id === userId
      );
      if (membershipIndex !== -1) {
        rsoMemberships.splice(membershipIndex, 1);
        
        // Update member count
        const rso = rsos.find(r => r.id === rsoId);
        if (rso) {
          rso.memberCount -= 1;
        }
        
        return true;
      }
      throw new Error('Not a member of this RSO');
    }
  },

  // Events functions
  events: {
    getAll: async () => {
      return events;
    },

    getById: async (id) => {
      const event = events.find(e => e.id === id);
      if (event) {
        return event;
      }
      throw new Error('Event not found');
    },

    // Get events that a user can see
    getVisibleEvents: async (userId) => {
      if (!userId) {
        return events.filter(e => e && e.type === 'public');
      }
      
      const user = users.find(u => u.uid === userId);
      if (!user) {
        return events.filter(e => e && e.type === 'public');
      }

      let visibleEvents = [];
      
      // Public events are visible to everyone
      visibleEvents = events.filter(e => e && e.type === 'public');
      
      // Private events are visible to users of the same university
      const privateEvents = events.filter(e => 
        e && e.type === 'private' && e.university_id === user.university_id
      );
      visibleEvents = [...visibleEvents, ...privateEvents];
      
      // RSO events are visible to members of the RSO
      const userRsos = rsoMemberships
        .filter(m => m && m.user_id === userId)
        .map(m => m.rso_id);
      
      const rsoEvents = events.filter(e => 
        e && e.type === 'rso' && userRsos.includes(e.rso_id)
      );
      visibleEvents = [...visibleEvents, ...rsoEvents];
      
      return visibleEvents;
    },

    create: async (eventData) => {
      const newEvent = {
        id: events.length + 1,
        ...eventData
      };
      events.push(newEvent);
      return newEvent;
    },

    update: async (id, eventData) => {
      const index = events.findIndex(e => e.id === id);
      if (index !== -1) {
        events[index] = { ...events[index], ...eventData };
        return events[index];
      }
      throw new Error('Event not found');
    },

    delete: async (id) => {
      const index = events.findIndex(e => e.id === id);
      if (index !== -1) {
        events.splice(index, 1);
        return true;
      }
      throw new Error('Event not found');
    },

    // Event attendance
    joinEvent: async (eventId, userId) => {
      // Check if already attending
      const existingAttendance = eventAttendees.find(
        a => a.event_id === eventId && a.user_id === userId
      );
      if (existingAttendance) {
        throw new Error('Already attending this event');
      }
      
      // Add attendance
      eventAttendees.push({ event_id: eventId, user_id: userId });
      return true;
    },

    leaveEvent: async (eventId, userId) => {
      // Find and remove attendance
      const attendanceIndex = eventAttendees.findIndex(
        a => a.event_id === eventId && a.user_id === userId
      );
      if (attendanceIndex !== -1) {
        eventAttendees.splice(attendanceIndex, 1);
        return true;
      }
      throw new Error('Not attending this event');
    },

    getUserEvents: async (userId) => {
      const attendingIds = eventAttendees
        .filter(a => a.user_id === userId)
        .map(a => a.event_id);
      return events.filter(e => attendingIds.includes(e.id));
    }
  },

  // Comments & Ratings functions
  comments: {
    getByEvent: async (eventId) => {
      const eventComments = comments.filter(c => c.event_id === eventId);
      // Join with user data
      return eventComments.map(comment => {
        const user = users.find(u => u.uid === comment.user_id);
        return {
          ...comment,
          userName: user ? user.displayName : 'Unknown User',
          userAvatar: user ? user.photoURL : null
        };
      });
    },

    create: async (commentData) => {
      const newComment = {
        id: comments.length + 1,
        ...commentData,
        timestamp: new Date().toISOString(),
        likes: 0
      };
      comments.push(newComment);
      
      // Update event average rating
      const eventComments = comments.filter(c => c.event_id === commentData.event_id);
      const totalRating = eventComments.reduce((sum, c) => sum + c.rating, 0);
      const avgRating = totalRating / eventComments.length;
      
      const event = events.find(e => e.id === commentData.event_id);
      if (event) {
        event.averageRating = parseFloat(avgRating.toFixed(1));
      }
      
      return newComment;
    },

    update: async (id, commentData) => {
      const index = comments.findIndex(c => c.id === id);
      if (index !== -1) {
        comments[index] = { 
          ...comments[index], 
          ...commentData,
          timestamp: new Date().toISOString() + ' (edited)'
        };
        return comments[index];
      }
      throw new Error('Comment not found');
    },

    delete: async (id) => {
      const index = comments.findIndex(c => c.id === id);
      if (index !== -1) {
        const deletedComment = comments[index];
        comments.splice(index, 1);
        
        // Update event average rating
        const eventComments = comments.filter(c => c.event_id === deletedComment.event_id);
        if (eventComments.length > 0) {
          const totalRating = eventComments.reduce((sum, c) => sum + c.rating, 0);
          const avgRating = totalRating / eventComments.length;
          
          const event = events.find(e => e.id === deletedComment.event_id);
          if (event) {
            event.averageRating = parseFloat(avgRating.toFixed(1));
          }
        }
        
        return true;
      }
      throw new Error('Comment not found');
    },

    like: async (id) => {
      const comment = comments.find(c => c.id === id);
      if (comment) {
        comment.likes += 1;
        return comment;
      }
      throw new Error('Comment not found');
    }
  },

  // Locations
  locations: {
    getAll: async () => {
      return locations;
    },

    getByName: async (lname) => {
      const location = locations.find(l => l.lname === lname);
      if (location) {
        return location;
      }
      throw new Error('Location not found');
    }
  }
};

export default api; 