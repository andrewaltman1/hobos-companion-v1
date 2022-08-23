const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const { catchAsync, stateNameToAbrev } = require("../utils");
const { isAdmin, isLoggedIn } = require("../middleware");
const Show = require("../models/show");
const FeatureCollection = require("../models/feature-collection");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

const pool = new Pool({
  user: "andrewaltman",
  host: "localhost",
  database: "rre-shows",
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});
pool.connect();

router.get(
  "/",
  catchAsync(async (req, res) => {
    const user = req.user;
    let { rows } = await pool.query(
      'SELECT venues.id as "venueId", shows.id as "showId", name as "venueName", city, state, country, date, ST_AsGeoJSON(geom) AS geometry, ST_X(geom) AS lng, ST_Y(geom) AS lat FROM venues JOIN shows ON shows.venue_id = venues.id ORDER BY date'
    );

    let allShows = new FeatureCollection(rows);
    let date = allShows.features[allShows.features.length - 1].properties.date;
    let totalYears = date.slice(date.length - 4, date.length) - 2000;

    res.render("shows/all-shows", { allShows, user, totalYears });
  })
);

router.get(
  "/show/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    let { rows } = await pool.query(
      `SELECT to_char(date,'MM/DD/YYYY') As date, city, show_notes as "showNotes", state, country, ST_AsGeoJSON(geom) AS geometry, ST_X(geom) AS lng, ST_Y(geom) AS lat, name, title, position, set_number as "setNumber", song_notes as "versionNotes", transition FROM shows JOIN venues ON venues.id = shows.venue_id JOIN versions ON shows.id = show_id JOIN songs ON songs.id = song_id WHERE shows.id = $1`,
      [id]
    );

    let show = new Show(rows[0].date, rows[0], rows, rows[0].showNotes);

    res.render("shows/single-show", { show, user });
  })
);

router.get(
  "/show/date/:date",
  catchAsync(async (req, res) => {
    const { date } = req.params;
    const user = req.user;
    let { rows } = await pool.query(
      `SELECT to_char(date,'MM/DD/YYYY') As date, city, show_notes as "showNotes", state, country, ST_AsGeoJSON(geom) AS geometry, ST_X(geom) AS lng, ST_Y(geom) AS lat, name, title, position, set_number as "setNumber", song_notes as "versionNotes", transition FROM shows JOIN venues ON venues.id = shows.venue_id JOIN versions ON shows.id = show_id JOIN songs ON songs.id = song_id WHERE shows.date = $1`,
      [date]
    );

    let show = new Show(rows[0].date, rows[0], rows, rows[0].show_notes);

    res.render("shows/single-show", { show, user });
  })
);

// the routes below are waiting for password reset functionality so that auth can be live

// router.get(
//   "/new-show",
//   isLoggedIn,
//   isAdmin,
//   catchAsync(async (req, res) => {
//     let user = req.user;
//     let { rows } = await pool.query(
//       "SELECT id, name, city, state, country FROM venues"
//     );

//     let venueList = rows;

//     res.render("new-show/venue-input", { venueList, user });
//   })
// );

// router.post(
//   "/new-show/venue-check",
//   isLoggedIn,
//   isAdmin,
//   catchAsync(async (req, res) => {
//     let { name, date, state } = req.body;
//     let { rows } = await pool.query(`SELECT name FROM venues WHERE name=$1`, [
//       name,
//     ]);

//     req.session.date = new Date(date);
//     req.session.venueName = name;

//     const geoData = await geocoder
//       .forwardGeocode({
//         query: `${req.body.name}, ${req.body.city}, ${req.body.state}, ${req.body.country}`,
//         limit: 1,
//       })
//       .send();

//     console.log(geoData.body.features[0]);
//     console.log(new Date(date));

//     res.send("THANKS");

//     let venue = geoData.body.features[0];

//     res.render("new-show/venue-check", { name, venue });
//   })
// );

// router.get("/new-show/date-songs", isLoggedIn, isAdmin, (req, res) => {
//   res.render("new-show/date-songs");
// });

// the route below contains code for updating geodata

// router.get(
//   "/show/update",
//   catchAsync(async (req, res) => {
//     let toUpdate = await pool.query(
//       "SELECT id, name, city, state, country, geom FROM venues WHERE id = $1",
//       [id]
//     );

//     toUpdate.rows.forEach(async (row) => {
//       const geoData = await geocoder
//         .forwardGeocode({
//           query: `${row.name}, ${row.city}, ${row.state}, ${row.country}`,
//           limit: 1,
//         })
//         .send();

//       let addGeom = await pool.query(
//         `UPDATE venues SET geom = ST_GeomFromGeoJSON($1)  WHERE id = $2`,
//         [geoData.body.features[0].geometry, row.id]
//       );
//     });

//     res.send("thanks");
//   })
// );

// router.get(
//   "/update",
//   catchAsync(async (req, res) => {
//     let allVenues = await pool.query(
//       "SELECT id, name, city, state, country FROM venues"
//     );

//     allVenues.rows.forEach(async (row) => {
//       const geoData = await geocoder
//         .forwardGeocode({
//           query: `${row.name}, ${row.city}, ${row.state}, ${row.country}`,
//           limit: 1,
//         })
//         .send();

//       let addGeom = await pool.query(
//         `UPDATE venues SET geom = ST_GeomFromGeoJSON($1)  WHERE id = $2`,
//         [geoData.body.features[0].geometry, row.id]
//       );
//     });

//     res.send("thanks");
//   })
// );

module.exports = router;
