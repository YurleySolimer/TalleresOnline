const mysql = require('mysql');
const { promisify } = require('util');

const { database } = require('./keys.js');

//conexion

const pool = mysql.createPool(database);

pool.getConnection((err, connection) => {
	if (err) {
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			console.error('DATABASE CONNECTION WAS CLOSED');
		}
		if (err.code === 'ER_CON_COUNT_ERROR') {
			console.error('DATABASE HAS TO MANY CONNECITONS');
		}
		if (err.code === 'ECONNREFUSED') {
			console.error('DATABE CONNECITON WAS REFUSED');
		}
	}

	if(connection) connection.release();
	console.log('DB is Connected');
	return;
});

module.exports = pool;

pool.query = promisify(pool.query); //convertir callbacks en promesas