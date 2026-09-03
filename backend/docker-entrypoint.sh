#!/bin/sh
set -eu

node /app/node_modules/typeorm/cli.js migration:run -d dist/database/data-source.js
exec node dist/main.js
