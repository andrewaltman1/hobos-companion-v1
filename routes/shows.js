const express = require("express");
const router = express.Router();
const db = require("../db");
const { catchAsync, stateNameToAbrev } = require("../utils");
const { isAdmin, isLoggedIn } = require("../middleware");
const Show = require("../models/show");
const FeatureCollection = require("../models/feature-collection");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

router.get(
  "/",
  catchAsync(async (req, res) => {
    let { rows } = await db.getAllShows();

    let latestDate = rows[rows.length - 1].date.toLocaleDateString();

    res.render("shows/all-shows", {
      title: "All Shows",
      user: req.user,
      allShows: new FeatureCollection(rows),
      totalYears: `${
        latestDate.slice(latestDate.length - 4, latestDate.length) - 2000
      }`,
    });
  })
);

router.get(
  "/show/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    let { rows } = await db.getShowByID(id);

    res.render("shows/single-show", {
      show: new Show(rows[0].date, rows[0], rows, rows[0].showNotes),
      user: req.user,
    });
  })
);

router.get(
  "/shows/:songid",
  catchAsync(async (req, res) => {
    const { songid } = req.params;
    let { rows } = await db.getShowsBySongID(songid);

    let totalYears =
      rows[rows.length - 1].date.getYear() - rows[0].date.getYear();
    console.log(rows[0].date.getYear());

    res.render("shows/all-shows", {
      title: rows[0].title,
      user: req.user,
      allShows: new FeatureCollection(rows),
      totalYears: totalYears,
    });
  })
);

router.get(
  "/show/date/:date",
  catchAsync(async (req, res) => {
    const { date } = req.params;
    let { rows } = await db.getShowByDate(date);

    res.render("shows/single-show", {
      show: new Show(rows[0].date, rows[0], rows, rows[0].show_notes),
      user: req.user,
    });
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
