export type EventCategory = 'Cultural' | 'Academic' | 'Sports' | 'Workshop' | 'Other';
export type EventStatus = 'Draft' | 'In review' | 'Approved' | 'Rejected' | 'Cancelled';
export type UserRole = 'Attendee' | 'Organizer' | 'Admin';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  dateStart: Date;
  dateEnd: Date;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  coverImage: string;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
  status: EventStatus;
  submittedDate?: Date;
  rejectionReason?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Mock current user (can be null for public view)
export let currentUser: User | null = null;

export const setCurrentUser = (user: User | null) => {
  currentUser = user;
};

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    role: 'Organizer',
  },
  {
    id: '2',
    name: 'Prof. Michael Chen',
    email: 'michael.chen@university.edu',
    role: 'Organizer',
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@university.edu',
    role: 'Organizer',
  },
  {
    id: '4',
    name: 'Admin User',
    email: 'admin@university.edu',
    role: 'Admin',
  },
];

// Mock events with various statuses
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Annual Science Fair',
    description: 'Join us for the annual science fair where students showcase their innovative research projects. Witness groundbreaking experiments, meet brilliant minds, and get inspired by the future of science. This event features presentations from multiple departments including Physics, Chemistry, Biology, and Computer Science. All students, faculty, and staff are welcome to attend.',
    category: 'Academic',
    dateStart: new Date('2026-04-15T09:00:00'),
    dateEnd: new Date('2026-04-15T17:00:00'),
    location: {
      name: 'Main Campus Hall',
      lat: 40.7580,
      lng: -73.9855,
    },
    coverImage: 'https://images.unsplash.com/photo-1700671562333-f71286a7c748?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzc1Mzk5MjMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    organizer: mockUsers[0],
    status: 'Approved',
    submittedDate: new Date('2026-03-10'),
  },
  {
    id: '2',
    title: 'Spring Concert Series',
    description: 'Experience an unforgettable evening of music featuring our talented student musicians and guest performers. The concert will showcase a diverse range of musical styles from classical to contemporary, jazz to pop. Don\'t miss this celebration of artistic talent!',
    category: 'Cultural',
    dateStart: new Date('2026-04-20T19:00:00'),
    dateEnd: new Date('2026-04-20T22:00:00'),
    location: {
      name: 'University Auditorium',
      lat: 40.7590,
      lng: -73.9845,
    },
    coverImage: 'https://images.unsplash.com/photo-1738667289162-9e55132e18a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBzdGFnZXxlbnwxfHx8fDE3NzU0MDA5Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    organizer: mockUsers[1],
    status: 'Approved',
    submittedDate: new Date('2026-03-12'),
  },
  {
    id: '3',
    title: 'Career Development Workshop',
    description: 'Learn essential skills for your career success. This comprehensive workshop covers resume writing, interview techniques, networking strategies, and professional communication. Industry experts will share their insights and answer your questions. Perfect for students preparing to enter the job market.',
    category: 'Workshop',
    dateStart: new Date('2026-04-18T14:00:00'),
    dateEnd: new Date('2026-04-18T16:30:00'),
    location: {
      name: 'Student Center Room 205',
      lat: 40.7570,
      lng: -73.9860,
    },
    coverImage: 'https://images.unsplash.com/photo-1753164725369-23a8c8190922?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHBlb3BsZSUyMGxlYXJuaW5nfGVufDF8fHx8MTc3NTQxNDg3MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    organizer: mockUsers[2],
    status: 'Approved',
    submittedDate: new Date('2026-03-15'),
  },
  {
    id: '4',
    title: 'Basketball Championship Finals',
    description: 'Cheer for our university team as they compete in the championship finals! This exciting match-up features our best players against our long-time rivals. Come show your school spirit and support our athletes. Free admission for students with ID. Concessions available.',
    category: 'Sports',
    dateStart: new Date('2026-04-25T18:00:00'),
    dateEnd: new Date('2026-04-25T20:30:00'),
    location: {
      name: 'University Sports Arena',
      lat: 40.7585,
      lng: -73.9870,
    },
    coverImage: 'https://images.unsplash.com/photo-1772653519333-c1927e38f791?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBldmVudCUyMGNvbGxlZ2V8ZW58MXx8fHwxNzc1NDE0ODY5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    organizer: mockUsers[0],
    status: 'Approved',
    submittedDate: new Date('2026-03-08'),
  },
  {
    id: '5',
    title: 'Study Abroad Information Session',
    description: 'Discover opportunities to study abroad and expand your global perspective. Learn about our partner universities, scholarship opportunities, application processes, and hear from students who have studied abroad. Q&A session with international programs advisors.',
    category: 'Academic',
    dateStart: new Date('2026-04-12T13:00:00'),
    dateEnd: new Date('2026-04-12T15:00:00'),
    location: {
      name: 'International Students Office',
      lat: 40.7575,
      lng: -73.9850,
    },
    coverImage: 'https://images.unsplash.com/photo-1620829813947-ef4246827355?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMHN0dWR5aW5nJTIwZ3JvdXB8ZW58MXx8fHwxNzc1Mzg1Njk2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    organizer: mockUsers[1],
    status: 'Approved',
    submittedDate: new Date('2026-03-05'),
  },
  {
    id: '6',
    title: 'Guest Lecture: Future of AI',
    description: 'Renowned AI researcher Dr. Emily Watson will present her latest findings on artificial intelligence and machine learning. This is a rare opportunity to hear from one of the leading minds in the field. The lecture will cover current trends, ethical considerations, and future predictions.',
    category: 'Academic',
    dateStart: new Date('2026-04-22T16:00:00'),
    dateEnd: new Date('2026-04-22T18:00:00'),
    location: {
      name: 'Engineering Building Lecture Hall',
      lat: 40.7595,
      lng: -73.9865,
    },
    coverImage: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwbGVjdHVyZSUyMGhhbGx8ZW58MXx8fHwxNzc1NDE0ODY5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    organizer: mockUsers[2],
    status: 'Approved',
    submittedDate: new Date('2026-03-18'),
  },
  // Events in other statuses for organizer dashboard
  {
    id: '7',
    title: 'Photography Exhibition',
    description: 'Student photography exhibition featuring works from the advanced photography class.',
    category: 'Cultural',
    dateStart: new Date('2026-05-01T10:00:00'),
    dateEnd: new Date('2026-05-05T18:00:00'),
    location: {
      name: 'Art Gallery',
      lat: 40.7560,
      lng: -73.9880,
    },
    coverImage: 'https://images.unsplash.com/photo-1700671562333-f71286a7c748?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzc1Mzk5MjMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    organizer: mockUsers[0],
    status: 'In review',
    submittedDate: new Date('2026-04-01'),
  },
  {
    id: '8',
    title: 'Alumni Networking Event',
    description: 'Connect with successful alumni and expand your professional network.',
    category: 'Other',
    dateStart: new Date('2026-05-10T17:00:00'),
    dateEnd: new Date('2026-05-10T20:00:00'),
    location: {
      name: 'Alumni Center',
      lat: 40.7565,
      lng: -73.9875,
    },
    coverImage: 'https://images.unsplash.com/photo-1620829813947-ef4246827355?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMHN0dWR5aW5nJTIwZ3JvdXB8ZW58MXx8fHwxNzc1Mzg1Njk2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    organizer: mockUsers[0],
    status: 'Draft',
  },
  {
    id: '9',
    title: 'Unauthorized Party',
    description: 'This event was rejected due to lack of proper permissions.',
    category: 'Other',
    dateStart: new Date('2026-04-30T21:00:00'),
    dateEnd: new Date('2026-04-30T23:59:00'),
    location: {
      name: 'Campus Quad',
      lat: 40.7580,
      lng: -73.9855,
    },
    coverImage: 'https://images.unsplash.com/photo-1738667289162-9e55132e18a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBzdGFnZXxlbnwxfHx8fDE3NzU0MDA5Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    organizer: mockUsers[0],
    status: 'Rejected',
    submittedDate: new Date('2026-03-28'),
    rejectionReason: 'This event does not have proper authorization and violates university policy regarding after-hours events.',
  },
];

export const getApprovedEvents = () => mockEvents.filter(e => e.status === 'Approved');
export const getPendingEvents = () => mockEvents.filter(e => e.status === 'In review');
export const getEventsByOrganizer = (organizerId: string) => 
  mockEvents.filter(e => e.organizer.id === organizerId);

export const mockCategories = [
  { id: '1', name: 'Cultural', description: 'Eventos culturales y artísticos', eventCount: 15 },
  { id: '2', name: 'Academic', description: 'Conferencias, charlas y seminarios', eventCount: 28 },
  { id: '3', name: 'Sports', description: 'Eventos deportivos y torneos', eventCount: 8 },
  { id: '4', name: 'Workshop', description: 'Talleres prácticos y de habilidades', eventCount: 12 },
  { id: '5', name: 'Other', description: 'Otros tipos de eventos', eventCount: 5 },
];

// Simulador de eventos favoritos para el usuario actual
export let mockFavoriteEvents = mockEvents.filter(e => ['1', '2'].includes(e.id));

export const toggleFavorite = (eventId: string) => {
  const event = mockEvents.find(e => e.id === eventId);
  if (!event) return false;
  
  const index = mockFavoriteEvents.findIndex(e => e.id === eventId);
  if (index > -1) {
    mockFavoriteEvents.splice(index, 1);
    return false;
  } else {
    mockFavoriteEvents.push(event);
    return true;
  }
};
