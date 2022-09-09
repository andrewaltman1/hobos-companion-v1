const { sumSinglePropOfArrEl, stateAbrevToName } = require("./utils");
const FeatureCollection = require("./models/feature-collection");

module.exports.allShows = (req, rows) => {
  return {
    user: req.user,
    table: {
      title: rows[0].title ? `${rows[0].title}` : "All Shows",
      subtitleOne: `Years: ${
        rows[rows.length - 1].date.getYear() - rows[0].date.getYear()
      }`,
      subtitleTwo: `Total Plays: ${rows.length}`,
      headerOne: "Date ",
      headerTwo: "Venue ",
      headerThree: "Location ",
      rowsPartial: "shows",
    },
    clusterMap: {
      mapToken: process.env.MAPBOX_TOKEN,
      mapData: new FeatureCollection(rows),
      mapCenter: [-103.59179687498357, 40.66995747013945],
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

module.exports.allVenues = (req, rows) => {
  return {
    user: req.user,
    table: {
      title: "All Venues",
      subtitleOne: `Unique Venues:  ${rows.length}`,
      subtitleTwo: `Total Plays:  ${rows[0].totalPerformances}`,
      headerOne: "Name ",
      headerTwo: "City ",
      headerThree: "State ",
      rowsPartial: "venues",
    },
    clusterMap: {
      mapToken: process.env.MAPBOX_TOKEN,
      mapData: new FeatureCollection(rows),
      mapCenter: [-103.59179687498357, 40.66995747013945],
    },
    scripts: { page: "/public/scripts/venues-script.js" },
  };
};

module.exports.allVenuesByCity = (req, rows) => {
  return {
    user: req.user,
    table: {
      title: `${rows[0].city}, ${
        !rows[0].state
          ? rows[0].country
          : rows[0].state
      }`,
      subtitleOne: `Unique Venues: ${rows.length}`,
      subtitleTwo: `Total Plays: ${rows.reduce(
        (p, c) => +p + +c.total,
        0
      )}`,
      headerOne: "Total ",
      headerTwo: "Venue ",
      headerThree: "Recent ",
      rowsPartial: "city",
    },
    clusterMap: {
      mapToken: process.env.MAPBOX_TOKEN,
      mapData: new FeatureCollection(rows),
      mapCenter: [rows[0].centerLng, rows[0].centerLat],
    },
    scripts: { page: "/public/scripts/city-script.js" },
  };
};

module.exports.allVenuesByState = (req, state, rows) => {
  return {
    user: req.user,
    table: {
      title: `${
        rows[0].state
          ? state.length == 2
            ? `${stateAbrevToName(state)}, ${
                rows[0].country
              }`
            : `${state}, ${rows[0].country}`
          : rows[0].country
      }`,
      subtitleOne: `Unique Venues: ${rows.length}`,
      subtitleTwo: `Total Plays: ${rows.reduce(
        (p, c) => +p + +c.total,
        0
      )}`,
      headerOne: "Total ",
      headerTwo: "Venue ",
      headerThree: "Location ",
      rowsPartial: "state",
    },
    clusterMap: {
      mapToken: process.env.MAPBOX_TOKEN,
      mapData: new FeatureCollection(rows),
      mapCenter: [rows[0].centerLng, rows[0].centerLat],
    },
    scripts: { page: "/public/scripts/state-script.js" },
  };
};
