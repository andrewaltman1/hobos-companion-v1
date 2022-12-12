const { calcTotalTimesPlayed, stateAbrevToName } = require("./utils");
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
      title: rows[0].title ? `${rows[0].title}` : "All Shows&nbsp;&nbsp;<span class='pipe'>|</span>",
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
      title: author ? author : "All Songs&nbsp;&nbsp;<span class='pipe'>|</span>",
      subtitleOne: `Unique Songs:  ${rows.length}`,
      subtitleTwo: `Total Plays:  ${calcTotalTimesPlayed(rows)}`,
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
      title: rows[0].centerLng ? venueTitle(rows) : "All Venues&nbsp;&nbsp;<span class='pipe'>|</span>",
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
      title: rows[0].centerLng ? venueTitle(rows) : "All Venues&nbsp;&nbsp;<span class='pipe'>|</span>",
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
    scripts: [],
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
    scripts: [],
  };
};

module.exports.singleShow = (req, rows) => {
  let date, venue, songs, notes;
  rows
    ? ((date = rows[0].date),
      (venue = rows[0]),
      (songs = rows),
      (notes = rows[0].showNotes))
    : ((date = req.session.newShow.date),
      (venue = req.session.newShow.venue),
      (songs = req.session.newShow.songs),
      (notes = req.session.newShow.notes));
  const show = new Show(new Date(date), venue, songs, notes);
  show.confirmed = req.url == "/new-show/show-confirm" ? false : true;
  return {
    user: req.user,
    title: show.venue.name,
    subtitle: show.date,
    show: show,
    section: {
      idString: "show-notes",
      data: show.notes,
    },
    scripts: [],
  };
};

module.exports.newShowInput = (req, rows) => {
  return { venueList: rows, user: req.user };
};

module.exports.venueCheck = (req) => {
  return {
    user: req.user,
    venue: {
      name: req.session.newShow.venue.name,
      city: req.session.newShow.venue.city,
      state: req.session.newShow.venue.state,
      country: req.session.newShow.venue.country,
      geometry: JSON.parse(req.session.newShow.venue.geometry),
    },
    mapToken: process.env.MAPBOX_TOKEN,
  };
};

module.exports.signUp = (req, res) => {
  return {
    user: req.user,
    userAction: "Sign Up",
    form: {
      action: "/signup",
      password: "new-password",
    },
    msg: res.locals.messages,
  };
};

module.exports.login = (req, res) => {
  return {
    user: req.user,
    userAction: "Log In",
    form: {
      action: "/login/password",
      password: "current-password",
    },
    msg: res.locals.messages,
  };
};

module.exports.confirmation = (req) => {
  let sectionHTML =
    `It looks like ${req.session.newShow.newSongs.length}` +
    `${req.session.newShow.newSongs.length > 1 ? " songs are" : " song is"}` +
    ` new to the database.
  Would you like to edit ${
    req.session.newShow.newSongs.length > 1 ? "their" : "this song's"
  }
  details now?<button type="button" class="map-popup-buttons"><a href="/songs/editor/form">Yes</a></button><button type="button" class="map-popup-buttons"><a href="/">Not Now</a></button>`;
  return {
    user: req.user,
    title:
      req.url == "/new-show/confirmation"
        ? "Show Saved. Thanks!"
        : "Song Saved. Thanks!",
    subtitle: "",
    show: false,
    section: {
      idString: "confirmation-notes",
      data: req.session.newShow.newSongs.length > 0 ? sectionHTML : "",
    },
    scripts: ["/public/scripts/confirmation.js"],
  };
};

module.exports.about = (req) => {
  return {
    user: req.user, 
    title: "Welcome to v2 of The Hobo’s Companion", 
    subtitle: "", 
    show: false,
    section: {
      idString: "about",
      data: "Relaunched in December of 2022 by Andrew Altman, Bassplayer in Railroad Earth from date-date, THC was originally conceived by Johnny Grubb - who played bass guitar for Railroad Earth from date-date.  Johnny built a website where fans of the band, effectionately know as “hobos”, could keep record on the location, set lists, special guest, etc of the 100+ shows a year they performed. Fans tended the site like a garden as it grew into a worthy compendium of RRE knowledge and stats.<br><br> Johnny kept the site alive for years after moving on to a career in tech. But the site eventually came down and the database full of RRE stats and history lay dormant waiting for another author to come along and revive it. In March of 2020 a worldwide pandemic came along and ground the world to a hault, including the lives and efforts of touring musicians everywhere. After years of being asked when the hobos companion web site would be back up and running again Andrew took up the task of bringing the site back. <br><br><a href='mailto:andrewaltman@outlook.com'>Email the currators of this site</a>"
    },
    scripts: []
  }
}
