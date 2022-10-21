class FeatureCollection {
  constructor(features) {
    (this.type = "FeatureCollection"),
      (this.features = features.map((feature) => {
        return {
          type: "Feature",
          properties: {
            venueId: +feature.venueId || null,
            venue: feature.venueName || null,
            city: feature.city || null,
            state: feature.state || null,
            country: feature.country || null,
            date: !feature.date
              ? null
              : feature.date,
            showId: +feature.showId || null,
            total: +feature.total || null,
            mostRecent: feature.mostRecent || null,
          },
          geometry: JSON.parse(feature.geometry),
        };
      }));
  }
}

module.exports = FeatureCollection;
