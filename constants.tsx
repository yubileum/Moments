import { Photo } from './types';

export const MOCK_PHOTOS: Photo[] = [
  {
    id: '1',
    url: 'https://picsum.photos/id/1015/800/600',
    description: 'Sunset by the river during our anniversary trip.',
    location: { name: 'Grand Canyon', lat: 36.1069, lng: -112.1129 },
    date: '2023-05-15T18:30:00.000Z',
    tags: ['anniversary', 'sunset', 'nature']
  },
  {
    id: '2',
    url: 'https://picsum.photos/id/1036/800/600',
    description: 'Winter walk in the park. It was freezing but beautiful.',
    location: { name: 'Central Park, NY', lat: 40.785091, lng: -73.968285 },
    date: '2023-12-20T14:15:00.000Z',
    tags: ['winter', 'park', 'nyc']
  },
  {
    id: '3',
    url: 'https://picsum.photos/id/1043/800/600',
    description: 'Trying out that new Italian restaurant downtown.',
    location: { name: 'Rome, Italy', lat: 41.9028, lng: 12.4964 },
    date: '2022-09-10T20:00:00.000Z',
    tags: ['food', 'dinner', 'date night']
  },
  {
    id: '4',
    url: 'https://picsum.photos/id/106/800/600',
    description: 'The cherry blossoms were in full bloom!',
    location: { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
    date: '2024-04-01T10:00:00.000Z',
    tags: ['flowers', 'travel', 'spring']
  },
   {
    id: '5',
    url: 'https://picsum.photos/id/211/800/600',
    description: 'A quiet boat ride on the lake.',
    location: { name: 'Lake Como', lat: 46.0160, lng: 9.2572 },
    date: '2023-07-22T11:45:00.000Z',
    tags: ['summer', 'boat', 'lake']
  },
  {
    id: '6',
    url: 'https://picsum.photos/id/40/800/600',
    description: 'Picnic under the Eiffel Tower with wine and cheese.',
    location: { name: 'Paris, France', lat: 48.8584, lng: 2.2945 },
    date: '2023-05-18T14:00:00.000Z',
    tags: ['picnic', 'romance', 'paris']
  },
  {
    id: '7',
    url: 'https://picsum.photos/id/57/800/600',
    description: 'Watching the blue domes light up during sunset.',
    location: { name: 'Santorini, Greece', lat: 36.3932, lng: 25.4615 },
    date: '2023-08-10T19:30:00.000Z',
    tags: ['sunset', 'travel', 'greece']
  },
  {
    id: '8',
    url: 'https://picsum.photos/id/65/800/600',
    description: 'A lovely coffee break in the old town square.',
    location: { name: 'Prague, Czech Republic', lat: 50.0755, lng: 14.4378 },
    date: '2022-10-05T10:30:00.000Z',
    tags: ['coffee', 'city', 'europe']
  },
  {
    id: '9',
    url: 'https://picsum.photos/id/88/800/600',
    description: 'Hiking up to see the glaciers, feeling small against nature.',
    location: { name: 'Reykjavik, Iceland', lat: 64.1466, lng: -21.9426 },
    date: '2024-02-15T09:00:00.000Z',
    tags: ['hiking', 'snow', 'nature']
  },
  {
    id: '10',
    url: 'https://picsum.photos/id/95/800/600',
    description: 'Sunrise yoga on the beach before the crowds arrived.',
    location: { name: 'Bali, Indonesia', lat: -8.4095, lng: 115.1889 },
    date: '2024-04-05T06:00:00.000Z',
    tags: ['beach', 'yoga', 'sunrise']
  },
  {
    id: '11',
    url: 'https://picsum.photos/id/128/800/600',
    description: 'Found the coziest little bookstore in Covent Garden.',
    location: { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
    date: '2023-12-24T16:00:00.000Z',
    tags: ['books', 'cozy', 'christmas']
  },
  {
    id: '12',
    url: 'https://picsum.photos/id/164/800/600',
    description: 'Riding the cable car and seeing the bay views.',
    location: { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 },
    date: '2022-09-12T13:00:00.000Z',
    tags: ['city', 'fun', 'usa']
  }
];