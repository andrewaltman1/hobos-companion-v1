const Venue = require("../models/venue");

class Show {
  constructor(date, venue, songs, notes) {
    (this.date = date.toLocaleDateString() || null),
      (this.venue = new Venue(venue) || null),
      (this.notes = this.displayEncoreNote(songs, notes) || null),
      (this.setCount = this.calcSetNumber(songs) || null),
      (this.songs = this.songFormatter(songs) || []),
      (this.sets = this.sortSets() || []);
  }

  songFormatter(arr) {
    return arr
      .map((el) => {
        return {
          title:
            `${el.setNumber == "Encore" ? "<strong>e:</strong> " : ""}` +
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

  displayEncoreNote(arr, notes) {
    return arr.some((element) => element.setNumber == "Encore")
      ? (notes = "e: denotes Encore\r\n" + notes)
      : notes;
  }
}

module.exports = Show;
