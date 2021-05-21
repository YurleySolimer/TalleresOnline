const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');

const nodemailer = require('nodemailer');

passport.use('local.signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, password, email, done) => {
  const email2 = req.body.email;
  const password2 = req.body.password;

  const rows = await pool.query('SELECT * FROM users WHERE email = ?', [email2]);

  if (rows.length > 0) {
    const user = rows[0];
    const validPassword = await helpers.matchPassword(password2, user.password)
    if (validPassword) {
		const userrr = await pool.query('SELECT id FROM users WHERE email =?', [email2]);
		const locales = await pool.query('SELECT * FROM localPlan WHERE user_id =? AND activo =?', [userrr[0].id, 'true']);
		console.log('user: ' + userrr[0].id)
		if(locales.length>0) {
			for(var i = 0; i < locales.length ; i++) {
				const fecha = locales[i].fecha_pago_siguiente;
				const datetime1 = new Date();
				var fecha2= new Date (datetime1.getFullYear(), datetime1.getMonth() , datetime1.getDate());
				var suscripcion = fecha.getTime();
				var hoy = fecha2.getTime();
				console.log('suscripcion: ' + suscripcion);
				console.log( ' Hoy :' + hoy)
				if (fecha.getTime() < fecha2.getTime()) {
					const inactivo = {
						activo : 'false'
					}
					await pool.query('UPDATE locales SET? WHERE id =?', [inactivo, locales[i].id]);
				}
			}
		}
      done(null, user, req.flash('success', 'Bienvenido! '));
    } else {
      done(null, false, req.flash('message', 'Contraseña incorrecta'));
    }
  } else {
    return done(null, false, req.flash('message', 'El email de usuario no existe'));
  }
}));

//_______________________//

passport.use('local.signup', new LocalStrategy({
  usernameField: 'fullname',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, fullname, password, done) => {

  const {email, apellido} = req.body;
  const noUser = await pool.query('SELECT * FROM users WHERE email =?', [email]);

  if (noUser.length>0) {
    return done(null, false, req.flash('message', 'Error, este email ya está registrado'));

  } else {
  

  const {razonLocal} = req.body;
  const {usertlf} = req.body;

  let newUser = {
    fullname,
	email, 
	apellido,
	razon_social: razonLocal,
	telefono: usertlf,
    password
  };

  newUser.password = await helpers.encryptPassword(password);
  newUser.email = req.body.email;
  console.log(fullname);
  console.log(email);
  console.log(password)
  // Saving in the Database
  const result = await pool.query('INSERT INTO users SET ? ', newUser);
  newUser.id = result.insertId;



  //------------REGISTRO LOCAL----------------//

  const { nombreAcceso, rucLocal, direccionLocal, distritoLocal, telefonoLocal, correoLocal, serviciosLocal, horarioEntrada, horarioSalida, mediosPagoLocal} = req.body;

  const {path, originalname} = req.files[0];

    const newLocal = {
        direccion : direccionLocal,
        distrito : distritoLocal,
        nombreLocal : nombreAcceso,
        telefono : telefonoLocal,
		user_id: newUser.id,
		fotoUbicacion : path,
		fotoNombre: originalname,
		horarioEntrada,
		horarioSalida,
		activo: 'true',
		email: correoLocal,
        ruc_local : rucLocal
    };

    const local_id = await pool.query('INSERT INTO locales set ?', [newLocal]); //agregar datos a la db
	
    const { id } = req.params;
    const {marcaLocal} = req.body;
	let marca_id = [];
	
		//Configuracion Plan Prueba

		var datetime1 = new Date();	
		var datetime = new Date (datetime1.getFullYear(), datetime1.getMonth() , datetime1.getDate());
		var fecha2= new Date (datetime1.getFullYear(), datetime1.getMonth() , datetime1.getDate());
		fecha2.setDate(fecha2.getDate() + 30);

		const newSuscripcion = {
			id_user: newUser.id,
			id_local_pagado: local_id.insertId,
			fecha_pago: datetime,
			fecha_pago_siguiente: fecha2,
			tipo_suscripcion: 'Prueba'
		}

		const idSuscrip = await pool.query('INSERT INTO userSuscripcion set ?', [newSuscripcion]);

		const newPlan = {
			accesos : 5,
			estadisticas: true,
			ots : true,
			proformas: true,
			facturas: false,
			idSuscrip : idSuscrip.insertId,
			local_id : local_id.insertId
		}
	
		await pool.query('INSERT into planSuscripcion set?', [newPlan]);

	

    for (var i = 0; i < marcaLocal.length; i++) {
   		if (marcaLocal[i] == "Mazda") {
    		newmarcaLocal = {   
	        	marca_id: 1,
	         	local_id: local_id.insertId,
	        }
	        await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal]);
        
	    }
	    if (marcaLocal[i] == "Ford") {
    		newmarcaLocal = {   
	        	marca_id: 2,
	         	local_id: local_id.insertId,
	        }
	        await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal]);
        
	    }
	    if (marcaLocal[i] == "Toyota") {
    		newmarcaLocal = {   
	        	marca_id: 3,
	         	local_id: local_id.insertId,
	        }
	        await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal]);
        
	    }
	    if (marcaLocal[i] == "Hyundai") {
    		newmarcaLocal = {   
	        	marca_id: 4,
	         	local_id: local_id.insertId,
	        }
	        await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal]);
        
	    }
	    if (marcaLocal[i] == "Chevrolet") {
    		newmarcaLocal = {   
	        	marca_id: 5,
	         	local_id: local_id.insertId,
	        }
	        await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal]);
        
	    }
	    if (marcaLocal[i] == "Subaru") {
    		newmarcaLocal = {   
	        	marca_id: 6,
	         	local_id: local_id.insertId,
	        }
	        await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal]);
        
	    }
	    if (marcaLocal[i] == "Lexus") {
    		newmarcaLocal = {   
	        	marca_id: 7,
	         	local_id: local_id.insertId,
	        }
	        await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal]);
        
	    }
	    if (marcaLocal[i] == "Honda") {
    		newmarcaLocal = {   
	        	marca_id: 8,
	         	local_id: local_id.insertId,
	        }
	        await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal]);
        
	    }
	    if (marcaLocal[i] == "Mitsubishi") {
    		newmarcaLocal = {   
	        	marca_id: 9,
	         	local_id: local_id.insertId,
	        }
	        await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal]);
       
	    }
	    if (marcaLocal[i] == "Nissan") {
    		newmarcaLocal = {   
	        	marca_id: 10,
	         	local_id: local_id.insertId,
	        }
	        await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal]);
        
	    }
	    if (marcaLocal[i] == "Peugeot") {
    		newmarcaLocal = {   
	        	marca_id: 11,
	         	local_id: local_id.insertId,
	        }
	        await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal]);
	       
	    }
	    if (marcaLocal[i] == "BMW") {
    		newmarcaLocal = {   
	        	marca_id: 12,
	         	local_id: local_id.insertId,
	        }
	        await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal]);
        
	    }
	    if (marcaLocal[i] == "Mercedes Benz") {
    		newmarcaLocal = {   
	        	marca_id: 13,
	         	local_id: local_id.insertId,
	        }
	        await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal]);
        
	    }
	   	if (marcaLocal[i] == "Otro") {
    		newmarcaLocal = {   
	        	marca_id: 14,
	         	local_id: local_id.insertId,
	        }
	        await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal]);
        
	    }

    }


    let servicio_id = [];

    for (var i = 0; i < serviciosLocal.length; i++) {
   		if (serviciosLocal[i] == "Carwash") {
        	newservLocal = {   
        		servicio_id: 1,
         		local_id: local_id.insertId,
        	}
            await pool.query('INSERT INTO servicioLocal set ?', [newservLocal]);
           }
           if (serviciosLocal[i] == "Mecanica") {
        	newservLocal = {   
        		servicio_id: 2,
         		local_id: local_id.insertId,
        	}
            await pool.query('INSERT INTO servicioLocal set ?', [newservLocal]);
           }
           if (serviciosLocal[i] == "Mantenimiento") {
        	newservLocal = {   
        		servicio_id: 3,
         		local_id: local_id.insertId,
        	}
            await pool.query('INSERT INTO servicioLocal set ?', [newservLocal]);
           }
           if (serviciosLocal[i] == "Modificaciones") {
        	newservLocal = {   
        		servicio_id: 4,
         		local_id: local_id.insertId,
        	}
            await pool.query('INSERT INTO servicioLocal set ?', [newservLocal]);
           }
            if (serviciosLocal[i] == "Otro") {
        	newservLocal = {   
        		servicio_id: 5,
         		local_id: local_id.insertId,
        	}
            await pool.query('INSERT INTO servicioLocal set ?', [newservLocal]);
           }
    
    }


    let medio_id = [];

    for (var i = 0; i < mediosPagoLocal.length; i++) {
    	if (mediosPagoLocal[i] != "Otro") {
    		if (mediosPagoLocal[i] == "Mastercard") {
	        	newmedioLocal = {   
	        		medio_id: 4,
	         		local_id: local_id.insertId,
	        	}
	            await pool.query('INSERT INTO medioLocal set ?', [newmedioLocal]);
        	}
        	if (mediosPagoLocal[i] == "Visa") {
	        	newmedioLocal = {   
	        		medio_id: 3,
	         		local_id: local_id.insertId,
	        	}
	            await pool.query('INSERT INTO medioLocal set ?', [newmedioLocal]);
        	}
        	if (mediosPagoLocal[i] == "Transferencia") {
	        	newmedioLocal = {   
	        		medio_id: 2,
	         		local_id: local_id.insertId,
	        	}
	            await pool.query('INSERT INTO medioLocal set ?', [newmedioLocal]);
        	}
        	if (mediosPagoLocal[i] == "Efectivo") {
	        	newmedioLocal = {   
	        		medio_id: 1,
	         		local_id: local_id.insertId,
	        	}
	            await pool.query('INSERT INTO medioLocal set ?', [newmedioLocal]);
        	}
		}
	}	

 //ENVIO DE NOTIFICACION 

 console.log("Creating transport...");
 var transporter = nodemailer.createTransport({
   host: 'smtp.gmail.com',
   port: "465",
   secure: true, // true for 465, false for other ports
   auth:{
	 type:"login",
	 user:"talleres.online.peru@gmail.com",
	 pass:"teamcarhelpperu2020"
 }
 });


 var mailOptions = {
   from: 'Talleres Online',
   to: email,
   subject: 'Bienvenido a Talleres Online',
   html:` 
   <div> 
   <h2>TU REGISTRO HA SIDO EXITOSO</h2> 
   <br> 
   <h5>Ahora formas parte de nuestra plataforma talleres online </h5> 
   </div> 
` 
 };

 console.log("sending email", mailOptions);

 transporter.sendMail(mailOptions, function (error, info) {
   console.log("senMail returned!");
   if (error) {
	 console.log("ERROR!!!!!!", error);
   } else {
	 console.log('Email sent: ' + info.response);
   }
 });

   return done(null, newUser);

  }
}));

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser( async (id, done) => {
	const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
	done(null, rows[0]);
});