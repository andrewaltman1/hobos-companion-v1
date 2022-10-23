class Venue {
  constructor(venue, shows) {
    (this.name = venue.name || null),
      (this.city = venue.city || null),
      (this.state = venue.state || null),
      (this.country = venue.country || null),
      (this.geometry = JSON.parse(venue.geometry) || null),
      (this.shows = !shows ? [] : this.showFormatter(shows));
  }

  showFormatter(arr) {
    return arr.map((el) => {
      return {
        id: el.showId,
        date: el.date.toLocaleDateString(),
      };
    });
  }
}

module.exports = Venue;
