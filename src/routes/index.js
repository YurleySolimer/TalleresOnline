const express = require('express');
const router = express.Router();
const pool = require('../database'); 


const { isLoggedIn } = require('../lib/auth');

router.get('/', (req, res) => {
	res.render('index');
});

router.get('/noPermitido', (req, res) => {
	res.render('noPermitido');
});

router.get('/dashboard', isLoggedIn, async (req, res) => {
	var user = await  pool.query('SELECT * FROM users WHERE id =?', req.user.id);
	if (user[0].tipo == 'Trabajador') {  
		res.redirect('t-dashboard');
	}
	if (user[0].tipo == 'Cliente') {  
		res.redirect('dashboard-inicio');
	}
	if (user[0].tipo == 'Admin') {  
		res.redirect('admin/inicio');
	}
});


module.exports = router;