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
              : new Date(feature.date).toLocaleDateString(),
            showId: +feature.showId || null,
            total: +feature.total || null,
            mostRecent: feature.mostRecent || null,
          },
          geometry: {
            type: "Point",
            coordinates: [feature.lng, feature.lat],
          },
        };
      }));
  }
}

module.exports = FeatureCollection;
