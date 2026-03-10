import { PlaceRecord } from '@/lib/types/domain';

export const mockPlaces: PlaceRecord[] = [
  {
    placeId: 'mock-lyon-boulangerie-1',
    name: 'Boulangerie des Terreaux',
    city: 'Lyon',
    address: '12 Rue des Capucins, 69001 Lyon',
    phone: '+33472000001',
    email: null,
    website: null,
    rating: 4.3,
    reviewsCount: 7,
    photosCount: 2,
    hasPhotos: true,
    category: 'Bakery',
    openingHours: ['Lun-Ven 7:00-19:00', 'Sam 7:00-13:00'],
    googleMapsUrl: 'https://maps.google.com/?cid=mock-1',
    observations: null
  },
  {
    placeId: 'mock-lyon-boulangerie-2',
    name: 'Pain Premium Lyon',
    city: 'Lyon',
    address: '2 Rue Mercière, 69002 Lyon',
    phone: null,
    email: null,
    website: 'https://pain-premium.example',
    rating: 4.8,
    reviewsCount: 124,
    photosCount: 32,
    hasPhotos: true,
    category: 'Bakery',
    openingHours: null,
    googleMapsUrl: 'https://maps.google.com/?cid=mock-2',
    observations: 'Fiche déjà bien travaillée.'
  },
  {
    placeId: 'mock-annecy-plombier-1',
    name: 'Plomberie du Lac',
    city: 'Annecy',
    address: '5 Avenue d\'Albigny, 74000 Annecy',
    phone: '+33450000002',
    email: null,
    website: null,
    rating: 4.1,
    reviewsCount: 9,
    photosCount: 0,
    hasPhotos: false,
    category: 'Plumber service',
    openingHours: ['Lun-Sam 8:00-18:00'],
    googleMapsUrl: 'https://maps.google.com/?cid=mock-3',
    observations: null
  }
];
