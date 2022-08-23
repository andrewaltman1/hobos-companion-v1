const Venue = require("../models/venue");
const { objKeysToCamel } = require("../utils");

class Show {
  constructor(date, venue, songs, notes) {
    (this.date = date || null),
      (this.venue = new Venue(venue) || null),
      (this.notes = notes || null),
      (this.setCount = this.calcSetNumber(songs) || null),
      (this.songs = this.songFormatter(songs) || []),
      (this.sets = this.sortSets() || []);
  }

  songFormatter(arr) {
    return arr
      .map((el) => {
        return {
          title:
            `${el.setNumber == "Encore" ? "e: " : ""}` +
            el.title +
            `${el.transition ? " >" : ""}`,
          position: el.position,
          setNumber: `${
            el.setNumber == "Encore" ? this.setCount : el.setNumber
          }`,
          versionNotes: el.versionNotes,
        };
      })
      .sort(function (a, b) {
        return a.position - b.position;
      });
  }

  calcSetNumber(arr) {
    return Math.max(
      ...arr.map((el) => Number(el.setNumber)).filter((el) => el < 4)
    );
  }

  sortSets() {
    return this.songs.reduce(function (r, a) {
      r[a.setNumber] = r[a.setNumber] || [];
      r[a.setNumber].push(a);
      return r;
    }, Object.create(null));
  }
}

module.exports = Show;
