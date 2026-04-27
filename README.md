#  spacetimedb-app-twodbox


# Packages:
- pixi.js
- spacetimedb

# Information:
  This is just a prototype for 2D render only. Wanted to create 2D world with the editor to test out the features and create those features for open world editor game. While access SpaceTimeDB to build prototype world system.

# Pixi.js
  Why choice Pixijs not like other three.js or Phaser.js? The reason is simple wanted to use 2D render. As well since SpaceTimeDB listen to table names as sync to position on insert, update and delete. Phaser is good but need to test it later. As there simple sample test.

## Notes:
- Note that y direction is down. The reason is simple it was standard monitor screen scan lines.

## Goals:
- spacehip combat with module functions.
- RPG creature capture game.
- battle system tick base combat.



## Client
```js
const DB_NAME = 'spacetimedb-app-twodbox';
```
## Server:
spacetime.json
```json
//...
"database": "spacetimedb-app-twodbox",
//...
```
spacetime.local.json
```json
//...
"database": "spacetimedb-app-twodbox",
//...
```

# Commands:
```
bun install
```
```
spacetime start
```
```
spacetime dev --server local
```
# SQL:
```
spacetime sql --server local spacetimedb-app-twodbox "SELECT * FROM entity"

spacetime sql --server local spacetimedb-app-twodbox "SELECT * FROM transform3d"

spacetime sql --server local spacetimedb-app-twodbox "SELECT * FROM transform2d"

```
 For query table in command line.

# SQL to text file:

```
spacetime sql --server local sspacetimedb-app-twodbox "SELECT * FROM transform3d" > backup_your_table.txt

spacetime sql --server local sspacetimedb-app-twodbox "SELECT * FROM transform2d" > backup_your_table.txt
```

# Delete
```
spacetime publish --server local spacetimedb-app-twodbox --delete-data
```
 In case bug and can't update table error.

# Credits:
- https://spacetimedb.com/docs
- Grok AI agent
