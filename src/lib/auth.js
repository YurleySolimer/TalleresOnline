const pool = require('../database'); //conexión a la db

module.exports = {
       isLoggedIn (req, res, next) {  //Método para saber si el usuario está logueado o no
        if (req.isAuthenticated()) {  //true si la sesión del usuario existe
            return next();
        }
        return res.redirect('/signin');
    },

    async isAdmin (req, res, next) {  
        var user = await pool.query('SELECT * FROM users WHERE id =?', req.user.id);
        if (user[0].tipo == 'Admin') {  
            return next();
        }
        return res.redirect('/noPermitido');
    },

    async isCliente (req, res, next) {  
        var user = await  pool.query('SELECT * FROM users WHERE id =?', req.user.id);
        if (user[0].tipo == 'Cliente') {  
            return next();
        }
        return res.redirect('/noPermitido');
    },

   async isTrabajador (req, res, next) {  
        var user = await pool.query('SELECT * FROM users WHERE id =?', req.user.id);
        if (user[0].tipo == 'Trabajador') {  
            return next();
        }
        return res.redirect('/noPermitido');
    },


    async isAccesoOT (req, res, next) {  
        var accesos = await pool.query('SELECT * FROM trabajadorAccesoCompleta WHERE id_userT =?', req.user.id);
        var acceso = false;
        console.log(accesos)
        for(var i = 0; i < accesos.length; i++){
            if (accesos[i].accesos == 'Ordenes de Trabajo') { 
                acceso = true;             
            }
       }
        if(acceso) {  
            return next();
        }
        return res.redirect('/noPermitido');
    },

   async isAccesoProformas (req, res, next) {  
        var accesos = await pool.query('SELECT * FROM trabajadorAccesoCompleta WHERE id_userT =?', req.user.id);
        var acceso = false;
        for(var i = 0; i < accesos.length; i++){
            if (accesos[i].accesos == 'Proformas') { 
                acceso = true;             
            }
       }
        if(acceso) {  
            return next();
        }
        return res.redirect('/noPermitido');
    },

   async isAccesoEstadisticas (req, res, next) {  
        var accesos = await pool.query('SELECT * FROM trabajadorAccesoCompleta WHERE id_userT =?', req.user.id);
        var acceso = false;
        console.log(accesos)
        for(var i = 0; i < accesos.length; i++){
            if (accesos[i].accesos == 'Estadísticas') { 
                acceso = true;             
            }
       }
        if(acceso) {  
            return next();
        }
        return res.redirect('/noPermitido');
    },

    async isAccesoTienda (req, res, next) {  
        var accesos = await pool.query('SELECT * FROM trabajadorAccesoCompleta WHERE id_userT =?', req.user.id);
        var acceso = false;
        for(var i = 0; i < accesos.length; i++){
            if (accesos[i].accesos == 'Tienda Online') { 
                acceso = true;             
            }
       }
        if(acceso) {  
            return next();
        }
        return res.redirect('/noPermitido');
    },

    async isAccesoFacturacion (req, res, next) {  
        var accesos = await pool.query('SELECT * FROM trabajadorAccesoCompleta WHERE id_userT =?', req.user.id);
        var acceso = false;
        for(var i = 0; i < accesos.length; i++){
            if (accesos[i].accesos == 'Facturacion') { 
                acceso = true;             
            }
       }
        if(acceso) {  
            return next();
        }
        return res.redirect('/noPermitido');
    },

    async isAccesoClientes (req, res, next) {  
        var accesos = await pool.query('SELECT * FROM trabajadorAccesoCompleta WHERE id_userT =?', req.user.id);
        var acceso = false;
        for(var i = 0; i < accesos.length; i++){
            if (accesos[i].accesos == 'Mis Clientes') { 
                acceso = true;             
            }
       }
        if(acceso) {  
            return next();
        }
        return res.redirect('/noPermitido');
    },

    async isAccesoCuenta (req, res, next) {  
        var accesos = await pool.query('SELECT * FROM trabajadorAccesoCompleta WHERE id_userT =?', req.user.id);
        var acceso = false;
        for(var i = 0; i < accesos.length; i++){
            if (accesos[i].accesos == 'Estado de Cuentas') { 
                acceso = true;             
            }
       }
        if(acceso) {  
            return next();
        }
        return res.redirect('/noPermitido');
    },

    async isAccesoPromociones (req, res, next) {  
        var accesos = await pool.query('SELECT * FROM trabajadorAccesoCompleta WHERE id_userT =?', req.user.id);
        var acceso = false;
        for(var i = 0; i < accesos.length; i++){
            if (accesos[i].accesos == 'Mis Promociones') { 
                acceso = true;             
            }
       }
        if(acceso) {  
            return next();
        }
        return res.redirect('/noPermitido');
    },


   async isNotLoggedIn (req, res, next) {  //Método para que el usuario no vuelva a loguearse

        if (!req.isAuthenticated()) {  
            return next();
        }

        var user = await pool.query('SELECT * FROM users WHERE id =?', req.user.id);
        if (user[0].tipo == 'Admin') { 
            return res.redirect('/admin/inicio')
        }  

        if (user[0].tipo == 'Cliente') { 
            return res.redirect('/dashboard')
        }

        if (user[0].tipo == 'Trabajador') { 
            return res.redirect('/trabajadores-dashboard')
        }

    }
};

