const { sumSinglePropOfArrEl, stateAbrevToName } = require("./utils");
const FeatureCollection = require("./models/feature-collection");
const Song = require("./models/song");
const Venue = require("./models/venue");
const Show = require("./models/show");

function venueTitle(rows) {
  const state = `${
    rows[0].state
      ? rows[0].state.length == 2
        ? `${stateAbrevToName(rows[0].state)}, ${rows[0].country}`
        : `${rows[0].state}, ${rows[0].country}`
      : rows[0].country
  }`;
  const city = `${rows[0].city}, ${
    !rows[0].state ? rows[0].country : rows[0].state
  }`;
  return rows[0].mostRecent ? city : state;
}

function mapZoom(rows) {
  return rows[0].mostRecent
    ? 10
    : rows[0].centerLng && rows[0].centerLat
    ? 5
    : 1;
}

module.exports.allShows = (req, rows) => {
  return {
    user: req.user,
    table: {
      title: rows[0].title ? `${rows[0].title}` : "All Shows",
      subtitleOne: `Years: ${
        rows[0].date.getYear() - rows[rows.length - 1].date.getYear()
      }`,
      subtitleTwo: `Total Plays: ${rows.length}`,
      columnTypes: "dss",
      headerOne: "Date ",
      headerTwo: "Venue ",
      headerThree: "Location ",
      rowsPartial: "shows",
    },
    clusterMap: {
      token: process.env.MAPBOX_TOKEN,
      data: new FeatureCollection(rows),
      center: [-103.59179687498357, 40.66995747013945],
      zoom: mapZoom(rows),
    },
    scripts: [
      "/public/scripts/table.js",
      "/public/scripts/mapbox.js",
      "/public/scripts/shared.js",
    ],
  };
};

module.exports.allSongs = (req, rows, author) => {
  return {
    user: req.user,
    clusterMap: false,
    table: {
      title: author ? author : "All Songs",
      subtitleOne: `Unique Songs:  ${rows.length}`,
      subtitleTwo: `Total Plays:  ${sumSinglePropOfArrEl(rows)}`,
      columnTypes: "nss",
      headerOne: "Plays ",
      headerTwo: "Title ",
      headerThree: "Writer ",
      rowsPartial: "songs",
      rows: rows,
    },
    scripts: ["/public/scripts/table.js"],
  };
};

module.exports.venues = (req, rows) => {
  return {
    user: req.user,
    table: {
      title: rows[0].centerLng ? venueTitle(rows) : "All Venues",
      subtitleOne: `Unique Venues:  ${rows.length}`,
      subtitleTwo: `Total Plays: ${rows.reduce((p, c) => +p + +c.total, 0)}`,
      columnTypes: "nss",
      headerOne: "Total ",
      headerTwo: "Venue ",
      headerThree: "Location ",
      rowsPartial: "venues",
    },
    clusterMap: {
      token: process.env.MAPBOX_TOKEN,
      data: new FeatureCollection(rows),
      center:
        rows[0].centerLng && rows[0].centerLat
          ? [rows[0].centerLng, rows[0].centerLat]
          : [-103.59179687498357, 40.66995747013945],
      zoom: mapZoom(rows),
    },
    scripts: [
      "/public/scripts/table.js",
      "/public/scripts/mapbox.js",
      "/public/scripts/shared.js",
    ],
  };
};

module.exports.venuesByCity = (req, rows) => {
  return {
    user: req.user,
    table: {
      title: rows[0].centerLng ? venueTitle(rows) : "All Venues",
      subtitleOne: `Unique Venues: ${rows.length}`,
      subtitleTwo: `Total Plays: ${rows.reduce((p, c) => +p + +c.total, 0)}`,
      columnTypes: "nsd",
      headerOne: "Total ",
      headerTwo: "Venue ",
      headerThree: "Recent ",
      rowsPartial: "city",
    },
    clusterMap: {
      token: process.env.MAPBOX_TOKEN,
      data: new FeatureCollection(rows),
      center: [rows[0].centerLng, rows[0].centerLat],
      zoom: mapZoom(rows),
    },
    scripts: [
      "/public/scripts/table.js",
      "/public/scripts/mapbox.js",
      "/public/scripts/shared.js",
    ],
  };
};

module.exports.singleSong = (req, rows) => {
  const song = new Song(rows[0]);
  return {
    user: req.user,
    title: song.title,
    subtitle: song.author
      ? `<a href="/songs/author/${song.author}">${song.author}</a><br />
    Total Plays:
    <a href="/shows/${song.id}">${song.timesPlayed}</a>`
      : `<br />
    Total Plays:
    <a href="/shows/${song.id}">${song.timesPlayed}</a>`,
    show: false,
    section: {
      idString: "song-notes",
      data: song.notes,
    },
  };
};

module.exports.singleVenue = (req, rows) => {
  const venue = new Venue(rows[0], rows);
  let html = "";
  venue.shows.forEach((show) => {
    html += `<a href="/show/${show.id}">${show.date}</a><br />`;
  });
  return {
    user: req.user,
    title: venue.name,
    subtitle:
      (!venue.state
        ? `${venue.city}, ${venue.country} - `
        : `${venue.city}, ${venue.state} - `) +
      (venue.shows.length < 2
        ? `${venue.shows.length} Performance`
        : `${venue.shows.length} Performances`),
    show: false,
    section: {
      idString: "performance-list",
      data: html,
    },
  };
};

module.exports.singleShow = (req, rows) => {
  const show = new Show(rows[0].date, rows[0], rows, rows[0].showNotes);
  return {
    user: req.user,
    title: show.venue.name,
    subtitle: show.date,
    show: show,
    section: {
      idString: "show-notes", 
      data: show.notes,
    },
  };
};
