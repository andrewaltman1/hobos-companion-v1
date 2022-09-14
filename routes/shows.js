const express = require("express");
const router = express.Router();
const db = require("../db");
const { catchAsync, stateNameToAbrev } = require("../utils");
const { isAdmin, isLoggedIn } = require("../middleware");
const Show = require("../models/show");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });
const data = require("../data.js");

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
    const { songid } = req.params;
    let { rows } = await db.getShowsBySongID(songid);
    res.render("table-map", data.allShows(req, rows));
  })
);

router.get(
  "/show/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    let { rows } = await db.getShowByID(id);
    res.render("single-model", data.singleShow(req, rows));
  })
);

router.get(
  "/show/date/:date",
  catchAsync(async (req, res) => {
    const { date } = req.params;
    let { rows } = await db.getShowByDate(date);
    res.render("single-model", data.singleShow(req, rows));
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
