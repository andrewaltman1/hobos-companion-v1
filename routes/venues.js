const express = require("express");
const router = express.Router();
const db = require("../db");
const { catchAsync, stateAbrevToName } = require("../utils");
const Venue = require("../models/venue");
const FeatureCollection = require("../models/feature-collection");

router.get(
  "/venues",
  catchAsync(async (req, res) => {
    let { rows } = await db.getAllVenues();

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
    let { rows } = await db.getVenueByID(id);

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
    let { rows } = await db.getVenuesByCity(city, state);

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
    let { rows } = await db.getVenuesByState(state);

    res.render("venues/state", {
      stateName: state.length == 2 ? stateAbrevToName(state) : state,
      stateShows: new FeatureCollection(rows),
      center: [rows[0].centerLng, rows[0].centerLat],
      user: req.user,
    });
  })
);

module.exports = router;
