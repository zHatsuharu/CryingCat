const sqlite3 = require("sqlite3");
const db = new sqlite3.Database('./data/database.sqlite3', err => err ? console.error(error) : console.log("Connected to DB."));

module.exports = {
	
	async get(selector, table, condition1, condition2, addQuery) {
		let query = `SELECT "${selector}" FROM "${table}" WHERE "${condition1}" = "${condition2}"`;
		if (addQuery)
			query += addQuery;
		return await new Promise((resolve, reject) => {
			db.get(query, (err, row) => err ? reject(err) : resolve(row));
		})
	},

	async getByQuery(query) {
		return await new Promise((resolve, reject) => {
			db.get(query, (err, row) => err ? reject(err) : resolve(row));
		});
	},

	insert(table, columns, values, addQuery) {
		let query = `INSERT INTO "${table}" (${columns}) VALUES (${values});`;
		if (addQuery)
			query += addQuery;
		db.exec(query, (err) => { if (err) console.error(err) });
		return;
	},

	update(table, column, value, condition1, condition2, addQuery) {
		let query = `UPDATE "${table}" SET "${column}" = "${value}" WHERE "${condition1}" = "${condition2}"`;
		if (addQuery)
			query += addQuery;
		db.exec(query, (err) => { if (err) console.error(err) });
		return;
	}

}