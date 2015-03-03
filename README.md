# trizilla
[![Build Status](https://travis-ci.org/mapbox/trizilla.svg)](https://travis-ci.org/mapbox/trizilla)

Consumes data values from a latticegrid, then aggregates and inflates triangular geometries.

## usage

`npm install trizilla`

`var trizilla = require('trizilla')();`

`trizilla.inflate(<minZ>)` - takes an input stream of stringified `{qt: <qt>, attributes: {<attributes>}}` objects and returns inflated triangular lattice GeoJSONs to the minZ specified.

`trizilla.tile(<delta>)` - given a `delta` (size of triangle relative to rendered tile), arrange stream of GeoJSONs and sorts by tile:
{tile: {x:<x>, y: <y>, z:<z>}, features: []}

`trizilla.serialize(x)` - takes a stream of above tile objects and serialize geometries

`trizilla.clean({})` - don't feed your trizilla garbage - send a stream through the cleaner before mealtime