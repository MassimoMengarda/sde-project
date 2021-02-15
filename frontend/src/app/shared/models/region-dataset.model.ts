export interface RegionDataset {
  country: [
    date: string,
    cases: number,
    provinces: [
      region: {
        cases: number;
      }
    ]
  ];

}
