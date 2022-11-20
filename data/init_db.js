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