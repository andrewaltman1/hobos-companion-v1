const express = require("express");
const router = express.Router();
const db = require("../db");
const { catchAsync, stateAbrevToName } = require("../utils");
const Venue = require("../models/venue");
const data = require("../data");

router.get(
  "/venues",
  catchAsync(async (req, res) => {
    let { rows } = await db.getAllVenues();
    res.render("table-map", data.venues(req, rows));
  })
);

router.get(
  "/venues/states/:state",
  catchAsync(async (req, res) => {
    let { state } = req.params;
    let { rows } = await db.getVenuesByState(state);
    res.render("table-map", data.venues(req, rows));
  })
);

router.get(
  "/venues/cities/:city.:state",
  catchAsync(async (req, res) => {
    let { city, state } = req.params;
    let { rows } = await db.getVenuesByCity(city, state);
    res.render("table-map", data.venuesByCity(req, rows));
  })
);

router.get(
  "/venues/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    let { rows } = await db.getVenueByID(id);
    res.render("venue", {
      venue: new Venue(rows[0], rows),
      user: req.user,
    });
  })
);

module.exports = router;
