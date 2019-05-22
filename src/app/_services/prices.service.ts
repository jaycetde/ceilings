import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PricesService {
  public hushBlocksPricingData = {
    partsList: {
      '1-1-2': {
        '3-85-110': 2,
        '3-85-111': 3,
        '3-85-116': 1
      },
      '1-2-2': {
        '3-85-110': 4,
        '3-85-111': 4,
        '3-85-112': 2
      },
      '1-3-2': {
        '3-85-110': 5,
        '3-85-111': 4,
        '3-85-115': 2
      },
      '1-4-2': {
        '3-85-110': 4,
        '3-85-111': 5,
        '3-85-117': 2
      },
      '2-2-2': {
        '3-85-110': 4,
        '3-85-111': 4,
        '3-85-112': 2
      },
      '2-2-2-t': {
        '3-85-110': 4,
        '3-85-111': 5,
        '3-85-118': 1
      }
    },
    servicePrices: {
      '1-1-2': 17.77,
      '1-2-2': 30.8,
      '1-3-2': 60.2,
      '1-4-2': 81.81,
      '2-2-2': 80.8,
      '2-2-2-t': 34.37
    },
    hardwarePrices: {
      '3-85-110': 0.24,
      '3-85-111': 1.85,
      '3-85-112': 5.42,
      '3-85-116': 1.2,
      '3-85-115': 3.1,
      '3-85-117': 3.99,
      '3-85-118': 5.42
    }
  };

  constructor() {}
}