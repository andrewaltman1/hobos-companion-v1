const express = require("express");
const router = express.Router();
const db = require("../db");
const { catchAsync, getNewGeoData, stateNameToAbrev } = require("../utils");
const { isAdmin, isLoggedIn } = require("../middleware");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });
const data = require("../data.js");

// router.use((req, res, next) => {
//   console.log(new Date(req.session.newShow.date));
//   next();
// });

router.get(
  "/",
  catchAsync(async (req, res) => {
    let { rows } = await db.getAllShows();
    res.render("table-map", data.allShows(req, rows));
  })
);

router.get(
  "/shows/:songid",
  catchAsync(async (req, res) => {
    let { rows } = await db.getShowsBySongID(req.params.songid);
    res.render("table-map", data.allShows(req, rows));
  })
);

router.get(
  "/show/:id",
  catchAsync(async (req, res) => {
    let { rows } = await db.getShowByID(req.params.id);
    res.render("single-model", data.singleShow(req, rows));
  })
);

router.get(
  "/show/date/:date",
  catchAsync(async (req, res) => {
    let { rows } = await db.getShowByDate(req.params.date);
    res.render("single-model", data.singleShow(req, rows));
  })
);

// the routes below are waiting for password reset functionality so that auth can be live

router.get(
  "/new-show",
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    req.session.newShow = {};
    let { rows } = await db.getAllVenues();
    res.render("new-show/venue-input", data.newShowInput(req, rows));
  })
);

router.post(
  "/new-show/venue-check",
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    if (req.body.address) {
      let venue = req.session.newShow.venue;
      req.session.newShow.venue.geometry = await getNewGeoData(
        req.body.address,
        venue.city,
        venue.state,
        venue.country
      );
    } else {
      let { date, name, city, state, country, venueId } = req.body;
      req.session.newShow = {
        date: date,
        venue: {
          id: venueId || null,
          name: name,
          city: city,
          state:
            state.length > 2 && country == "USA"
              ? stateNameToAbrev(state)
              : state,
          country: country,
          geometry: !venueId
            ? await getNewGeoData(name, city, state, country)
            : await db.getVenueGeoData(venueId),
        },
      };
    }
    res.render("new-show/venue-check", data.venueCheck(req));
  })
);

router.get("/new-show/set-input", isLoggedIn, isAdmin, (req, res) => {
  res.render("new-show/set-input", { user: req.user });
});

router.post(
  "/new-show/show-confirm",
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    req.session.newShow.notes = /[^\w]/gi.test(req.body.notes)
      ? req.body.notes
      : null;

    async function buildSongDetails() {
      req.session.newShow.songs = [];
      const allSongs = req.body.songs
        .split(/\r\n/)
        .filter((song) => song.length > 0);
      let currentSet = 1;
      let songPosition = 1;
      let dbCompareResult;

      for (song of allSongs) {
        if (/(Set\s?[1-9]:?)/gi.test(song) || /(Encore\s?:?)/gi.test(song)) {
          currentSet = +song.match(/\d/g) || "Encore";
        } else {
          dbCompareResult = await db.existingSongSearch(
            song.match(/[\w\s\?&#'\-""()/.:\u2019]+/gi).toString()
          );
          req.session.newShow.songs.push({
            id: dbCompareResult.id,
            title: dbCompareResult.title,
            position: songPosition,
            setNumber: currentSet,
            transition: />/.test(song),
            versionNotes: /[@#\$%\+^&\*](?!\s|\w)/g.test(song)
              ? song.match(/[@#\$%\+^&\*](?!\s|\w)/g).join("")
              : null,
          });
          songPosition += 1;
        }
      }
    }

    await buildSongDetails();

    res.render("single-model", data.singleShow(req));
  })
);

router.get(
  "/new-show/confirmation",
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    req.session.newShow.newSongs = req.session.newShow.songs.filter(
      (song) => song.id == null
    );
    req.session.newShow.songs = req.session.newShow.songs.filter(
      (song) => song.id != null
    );
    //https://node-postgres.com/api/pool transaction concerns
    // what about slug?

    !req.session.newShow.venue.id
      ? (req.session.newShow.venue.id = await db.insertNewVenue(req))
      : req.session.newShow.venue.id;
    req.session.newShow.id = await db.insertNewShow(req);
    if (req.session.newShow.newSongs) {
      for (song of req.session.newShow.newSongs) {
        song.id = await db.insertNewSong(req, song);
        await db.insertNewVersion(req, song);
      }
      for (song of req.session.newShow.songs) {
        await db.insertNewVersion(req, song);
      }
    } else {
      for (song of req.session.newShow.songs) {
        await db.insertNewVersion(req, song);
      }
    }

    res.session.newShow = {};


    res.render("single-model", data.confirmation(req));

    // res.render("new-show/confirmation", {
    //   user: req.user,
    //   songs: req.session.newShow.newSongs,
    //   title: "Show"
    // });
  })
);

// the route below contains code for updating geodata

router.get(
  "/show/update",
  catchAsync(async (req, res) => {
    let toUpdate = await pool.query(
      "SELECT id, name, city, state, country, geom FROM venues WHERE id = $1",
      [id]
    );

    toUpdate.rows.forEach(async (row) => {
      const geoData = await geocoder
        .forwardGeocode({
          query: `${row.name}, ${row.city}, ${row.state}, ${row.country}`,
          limit: 1,
        })
        .send();

      let addGeom = await pool.query(
        `UPDATE venues SET geom = ST_GeomFromGeoJSON($1)  WHERE id = $2`,
        [geoData.body.features[0].geometry, row.id]
      );
    });

    res.send("thanks");
  })
);

router.get(
  "/update",
  catchAsync(async (req, res) => {
    let allVenues = await pool.query(
      "SELECT id, name, city, state, country FROM venues"
    );

    allVenues.rows.forEach(async (row) => {
      const geoData = await geocoder
        .forwardGeocode({
          query: `${row.name}, ${row.city}, ${row.state}, ${row.country}`,
          limit: 1,
        })
        .send();

      let addGeom = await pool.query(
        `UPDATE venues SET geom = ST_GeomFromGeoJSON($1)  WHERE id = $2`,
        [geoData.body.features[0].geometry, row.id]
      );
    });

    res.send("thanks");
  })
);

module.exports = router;
