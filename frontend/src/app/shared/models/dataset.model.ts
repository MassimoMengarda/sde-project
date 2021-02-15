export interface Dataset {
  date: string;
  cases: number;
  provinces: [
    city: {
      cases: number;
    }
  ];
}
