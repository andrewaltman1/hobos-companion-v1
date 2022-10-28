const Venue = require("../models/venue");

class Show {
  constructor(date, venue, songs, notes) {
    (this.date = date.toLocaleDateString('en-US', {timeZone: 'UTC'}) || null),
      (this.venue = new Venue(venue) || null),
      (this.notes = notes || null),
      (this.setCount =
        Math.max(
          ...songs
            .filter((song) => song.setNumber != "Encore")
            .map((el) => +el.setNumber)
        ) || null),
      (this.didEncore =
        songs.some((song) => song.setNumber == "Encore") || null),
      (this.songs = this.songFormatter(songs) || []),
      (this.sets = this.sortSets() || []);
  }

  songFormatter(arr) {
    return arr.map((el) => {
      return {
        title: el.title + `${el.transition ? " >" : ""}`,
        position: el.position,
        setNumber: el.setNumber,
        versionNotes: el.versionNotes,
        transition: el.transition,
      };
    });
  }

  sortSets() {
    return this.songs.reduce(function (r, a) {
      r[a.setNumber] = r[a.setNumber] || [];
      r[a.setNumber].push(a);
      return r;
    }, Object.create(null));
  }
}

// class Show {
//   constructor(date, venue, songs, notes) {
//     (this.date = date.toLocaleDateString() || null),
//       (this.venue = new Venue(venue) || null),
//       (this.notes = notes || null),
//       (this.setCount =
//         Math.max(
//           ...songs
//             .filter((song) => song.setNumber != "Encore")
//             .map((el) => +el.setNumber)
//         ) || null),
//       (this.didEncore =
//         songs.some((song) => song.setNumber == "Encore") || null),
//       (this.songs = this.songFormatter(songs) || []),
//       (this.sets = this.sortSets() || []);
//   }

//   songFormatter(arr) {
//     return arr.map((el) => {
//       return {
//         title: el.title + `${el.transition ? " >" : ""}`,
//         position: el.position,
//         setNumber: el.setNumber,
//         versionNotes: el.versionNotes,
//         transition: el.transition,
//       };
//     });
//   }

//   sortSets() {
//     return this.songs.reduce(function (r, a) {
//       r[a.setNumber] = r[a.setNumber] || [];
//       r[a.setNumber].push(a);
//       return r;
//     }, Object.create(null));
//   }
// }

module.exports = Show;
