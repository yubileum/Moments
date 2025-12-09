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
  }
];
