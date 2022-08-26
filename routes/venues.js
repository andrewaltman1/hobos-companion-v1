const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const { catchAsync, stateAbrevToName } = require("../utils");
const Venue = require("../models/venue");
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
  "/venues",
  catchAsync(async (req, res) => {
    let { rows } = await pool.query(
      `SELECT id as "venueId", name as "venueName", city, state, country, ST_AsGeoJSON(geom) AS geometry, ST_X(geom) AS lng, ST_Y(geom) AS lat, (select MAX(id) as "totalPerformances" from shows) FROM venues ORDER BY name`
    );

    res.render("venues/all-venues", {
      allVenues: new FeatureCollection(rows),
      user: req.user,
      totalPerformances: rows[0].totalPerformances,
    });
  })
);

router.get(
  "/venues/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    let { rows } = await pool.query(
      `SELECT name, city, state, country, ST_AsGeoJSON(geom) AS geometry, ST_X(geom) AS lng, ST_Y(geom) AS lat, to_char(date,'MM-DD-YYYY') As date, shows.id FROM venues JOIN shows ON venues.id = shows.venue_id WHERE venues.id = $1`,
      [id]
    );

    res.render("venues/single-venue", {
      venue: new Venue(rows[0], rows),
      user: req.user,
    });
  })
);

router.get(
  "/venues/cities/:city.:state",
  catchAsync(async (req, res) => {
    let { city, state } = req.params;
    let { rows } = await pool.query(
      `SELECT city, state, country, MAX(date) as "mostRecent", COUNT(*) as "total", venues.id as "venueId", name as "venueName", ST_AsGeoJSON(geom) AS geometry, ST_X(geom) AS lng, ST_Y(geom) AS lat, (SELECT AVG(ST_X(geom)) AS "centerLng" FROM venues where city = $1 AND state = $2 OR country = $2), (SELECT AVG(ST_Y(geom)) AS "centerLat" FROM venues where city = $1 AND state = $2 OR country = $2) FROM venues join shows on venues.id = venue_id where city = $1 AND state = $2 OR country = $2 group by venues.id ORDER BY "total" DESC`,
      [city, state]
    );

    res.render("venues/city", {
      cityShows: new FeatureCollection(rows),
      center: [rows[0].centerLng, rows[0].centerLat],
      user: req.user,
    });
  })
);

router.get(
  "/venues/states/:state",
  catchAsync(async (req, res) => {
    let { state } = req.params;
    let { rows } = await pool.query(
      `SELECT city, state, country, venues.id as "venueId", COUNT(*) as "total", name as "venueName", ST_AsGeoJSON(geom) AS geometry, ST_X(geom) AS lng, ST_Y(geom) AS lat, (SELECT AVG(ST_X(geom)) AS "centerLng" FROM venues where state = $1 or country = $1), (SELECT AVG(ST_Y(geom)) AS "centerLat" FROM venues where state = $1 or country = $1) FROM venues join shows on venues.id = venue_id where state = $1 or country = $1 group by venues.id order by "total" desc`,
      [state]
    );

    res.render("venues/state", {
      stateName: state.length == 2 ? stateAbrevToName(state) : state,
      stateShows: new FeatureCollection(rows),
      center: [rows[0].centerLng, rows[0].centerLat],
      user: req.user,
    });
  })
);

module.exports = router;
