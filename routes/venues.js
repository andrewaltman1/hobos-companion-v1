const express = require("express");
const router = express.Router();
const db = require("../db");
const { catchAsync } = require("../utils");
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
    let { rows } = await db.getVenuesByState(req.params.state);
    res.render("table-map", data.venues(req, rows));
  })
);

router.get(
  "/venues/cities/:city.:state",
  catchAsync(async (req, res) => {
    let { rows } = await db.getVenuesByCity(req.params.city, req.params.state);
    res.render("table-map", data.venuesByCity(req, rows));
  })
);

router.get(
  "/venues/:id",
  catchAsync(async (req, res) => {
    let { rows } = await db.getVenueByID(req.params.id);
    res.render("single-model", data.singleVenue(req, rows));
  })
);

module.exports = router;
