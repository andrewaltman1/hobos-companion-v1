const { sumSinglePropOfArrEl, stateAbrevToName } = require("./utils");
const FeatureCollection = require("./models/feature-collection");

function venueTitle(rows){
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

module.exports.allShows = (req, rows) => {
  return {
    user: req.user,
    table: {
      title: rows[0].title ? `${rows[0].title}` : "All Shows",
      subtitleOne: `Years: ${
        rows[0].date.getYear() - rows[rows.length - 1].date.getYear()
      }`,
      subtitleTwo: `Total Plays: ${rows.length}`,
      headerOne: "Date ",
      headerTwo: "Venue ",
      headerThree: "Location ",
      rowsPartial: "shows",
    },
    clusterMap: {
      token: process.env.MAPBOX_TOKEN,
      data: new FeatureCollection(rows),
      center: [-103.59179687498357, 40.66995747013945],
    },
    scripts: { page: "/public/scripts/shows-script.js" },
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
      headerOne: "Plays ",
      headerTwo: "Title ",
      headerThree: "Writer ",
      rowsPartial: "songs",
      rows: rows,
    },
    scripts: { page: "/public/scripts/songs-script.js" },
  };
};

module.exports.venues = (req, rows) => {
  return {
    user: req.user,
    table: {
      title: rows[0].centerLng ? venueTitle(rows) : "All Venues",
      subtitleOne: `Unique Venues:  ${rows.length}`,
      subtitleTwo: `Total Plays: ${rows.reduce((p, c) => +p + +c.total, 0)}`,
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
    },
    scripts: { page: "/public/scripts/venues-script.js" },
  };
};

module.exports.venuesByCity = (req, rows) => {
  return {
    user: req.user,
    table: {
      title: rows[0].centerLng ? venueTitle(rows) : "All Venues",
      subtitleOne: `Unique Venues: ${rows.length}`,
      subtitleTwo: `Total Plays: ${rows.reduce((p, c) => +p + +c.total, 0)}`,
      headerOne: "Total ",
      headerTwo: "Venue ",
      headerThree: "Recent ",
      rowsPartial: "city",
    },
    clusterMap: {
      token: process.env.MAPBOX_TOKEN,
      data: new FeatureCollection(rows),
      center: [rows[0].centerLng, rows[0].centerLat],
    },
    scripts: { page: "/public/scripts/city-script.js" },
  };
};
