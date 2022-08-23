class Venue {
  constructor(location, shows) {
    (this.name = location.name || null),
      (this.city = location.city || null),
      (this.state = location.state || null),
      (this.country = location.country || null),
      (this.geometry =
        {
          type: "Point",
          coordinates: [location.lng, location.lat],
        } || null),
      (this.shows = !shows ? [] : this.showFormatter(shows));
  }

  showFormatter(arr) {
    return arr.map((el) => {
      return {
        id: el.id,
        date: el.date,
      };
    });
  }
}

module.exports = Venue;
