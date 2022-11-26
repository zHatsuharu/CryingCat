const sqlite3 = require("sqlite3");
const db = new sqlite3.Database('./data/database.sqlite3', err => err ? console.error(err) : console.log("Connected to DB."));

const genshindb = require("genshin-db");

const genshinChars = genshindb.characters("names", {matchCategories:true, resultLanguage: genshindb.Language.French})
    .map(i => i == "Aether" ? "Voyageur" : i == "Lumine" ? "Voyageuse" : i);

let query = `CREATE TABLE IF NOT EXISTS enka (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dcUID VARCHAR(255),
    giUID VARCHAR(255)`;

for (const char of genshinChars) {
    query += `, '${char}' TEXT`;
}
query += ")";

db.run(query);

// Check if every characters are in the table

query = `SELECT name FROM pragma_table_info('enka');`;

db.all(query, (err, rows) => {
	if (err) return console.error(err);
	for (let i = 0; i < 3; i++) rows.shift();
	const sqlNames = new Array();
	for (const { name } of rows) sqlNames.push(name);
	const diff = genshinChars.filter(name => !sqlNames.includes(name));
	console.log(diff);
	if (diff.length != 0) {
		for (const name of diff) {
			query = `ALTER TABLE enka ADD '${name}' TEXT`;
			db.run(query);
		}
	}
});

query = `CREATE TABLE IF NOT EXISTS twitchServers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serverID VARCHAR(255),
    channelID VARCHAR(255),
    streamerId VARCHAR(255),
    viewerId VARCHAR(255)
)`;

db.run(query);

query = `CREATE TABLE IF NOT EXISTS twitchNotifs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serverID VARCHAR(255),
    url TEXT,
    message TEXT
)`;

db.run(query);