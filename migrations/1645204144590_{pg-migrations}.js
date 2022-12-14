/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(
    `SELECT AddGeometryColumn IF NOT EXISTS ('public','venues','geom',4326,'POINT',2);`
  );
};

exports.down = (pgm) => {
  pgm.sql(
    `SELECT DropGeometryColumn IF EXISTS ('public','venues','geom',4326,'POINT',2);`
  );
};

exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE users ADD COLUMN IF NOT EXISTS salt bytea`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE users DROP COLUMN IF EXISTS salt`);
};

exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password bytea`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE users DROP COLUMN IF EXISTS hashed_password`);
};

exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE users DROP COLUMN IF EXISTS karma`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE users ADD COLUMN IF NOT EXISTS karma`);
};

exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE users DROP COLUMN IF EXISTS rpx_identifier`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE users ADD COLUMN IF NOT EXISTS rpx_identifier`);
};

exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE venues ADD COLUMN IF NOT EXISTS shows_count`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE venues DROP COLUMN IF EXISTS shows_count`);
};

exports.up = (pgm) => {
  pgm.sql(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
};

exports.down = (pgm) => {
  pgm.sql(`DROP EXTENSION IF EXISTS pg_trgm`);
};

exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE versions RENAME COLUMN song_notes TO version_notes`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE versions RENAME COLUMN version_notes TO song_notes`);
};

// to fix "No migrations to run!`
// Migrations complete!" situation I had to delete recent row from pgmigrations table
