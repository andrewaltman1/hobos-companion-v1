class Venue {
  constructor(venue, shows) {
    (this.name = venue.name || null),
      (this.city = venue.city || null),
      (this.state = venue.state || null),
      (this.country = venue.country || null),
      (this.geometry =
        {
          type: "Point",
          coordinates: [venue.lng, venue.lat],
        } || null),
      (this.shows = !shows ? [] : this.showFormatter(shows));
  }

  showFormatter(arr) {
    return arr.map((el) => {
      return {
        id: el.id,
        date: el.date.toLocaleDateString(),
      };
    });
  }
}

module.exports = Venue;
