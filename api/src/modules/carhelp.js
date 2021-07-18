const express = require('express')
const router = express.Router()
const pool = require('../database')
const helpers = require('../lib/helpers')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const nodemailer = require('nodemailer')
var pdf = require('dynamic-html-pdf')
const fs = require('fs')
const moment = require('moment')

const Culqi = require('culqi2-node')
const culqi = new Culqi('sk_test_OUTVVXHzshQyTXQ1', 'pk_test_NBsfBLVx1wheM6ra')

const { isLoggedIn } = require('../lib/auth')
const { isCliente } = require('../lib/auth')

const Handlebars = require('handlebars')
Handlebars.registerHelper('ifCond', function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this)
  }
  return options.inverse(this)
})

Handlebars.registerHelper('ifMayor', function (v1, v2, options) {
  if (v1 > v2) {
    return options.fn(this)
  }
  return options.inverse(this)
})

Handlebars.registerHelper('fecha', function (date) {
  const dia = date.getDate()
  const mes = date.getMonth() + 1
  const año = date.getFullYear()
  return `${dia}/${mes}/${año}`
})

var id_prueba = 0
async function Dfaltan(req) {
  const user = await pool.query(
    'SELECT * from userSuscripcion where id_user =? and tipo_suscripcion =?',
    [req.user.id, 'Prueba']
  )
  if (user.length > 0) {
    const fecha = user[0].fecha_pago_siguiente
    const datetime1 = new Date()
    var fecha2 = new Date(
      datetime1.getFullYear(),
      datetime1.getMonth(),
      datetime1.getDate()
    )
    const faltan = (fecha.getTime() - fecha2.getTime()) / 1000 / 60 / 60 / 24
    id_prueba = user[0].id_local_pagado
    return faltan
  } else {
    return 0
  }
}

async function DataSave(req) {
  //*Creo Data de Autos

  const carros2 = await pool.query('SELECT * FROM carros')
  var objeto = []
  var car = { objeto }
  if (carros2.length > 0) {
    for (var i = 0; i < carros2.length; i++) {
      car: {
        objeto[i] = {
          id: carros2[i].id,
          placa: carros2[i].placa,
          modelo: carros2[i].modelo,
          marca: carros2[i].marca,
          tipo: carros2[i].tipo,
          año: carros2[i].año,
          kilometraja: carros2[i].kilometraja,
          km: carros2[i].km,
          nivel_gasolina: carros2[i].nivel_gasolina,
          observacion: carros2[i].observacion,
          declaracion: carros2[i].declaracion,
        }
      }
    }
  }
  fs.writeFileSync(
    'src/public/data/carros.json',
    JSON.stringify(car),
    (err) => {
      if (err) throw err
      console.log('Archivo actualizado Satisfactoriamente')
    }
  )

  //Guardo data de Clientes

  var objeto2 = []
  var client = { objeto2 }
  const clientes2 = await pool.query('SELECT * FROM clientes')

  if (clientes2.length > 0) {
    for (var j = 0; j < clientes2.length; j++) {
      client: {
        objeto2[j] = {
          id: clientes2[j].id,
          nombre: clientes2[j].nombre,
          correo: clientes2[j].correo,
          tlf: clientes2[j].tlf,
          conocio_carhelp: clientes2[j].conocio_carhelp,
          rucCliente: clientes2[j].rucCliente,
          distrito: clientes2[j].distrito,
          provincia: clientes2[j].provincia,
          departamento: clientes2[j].departamento,
        }
      }
    }
  }

  fs.writeFileSync(
    'src/public/data/clientes.json',
    JSON.stringify(client),
    (err) => {
      if (err) throw err
      console.log('Archivo actualizado Satisfactoriamente')
    }
  )
}

//***********ATENCION AL CLIENTE *************/

router.get('/atencion-al-cliente', isLoggedIn, isCliente, async (req, res) => {
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)
  const reclamos = await pool.query('SELECT * FROM reclamos WHERE id_user =?', [
    req.user.id,
  ])
  console.log(reclamos)
  res.render('atencionCliente', { nombre_local, faltan, id_prueba, reclamos })
})

router.post('/atencion-al-cliente', isLoggedIn, isCliente, async (req, res) => {
  const { mensajecontacto, reclamo, consulta } = req.body
  var tipo = ''
  if (reclamo == 'on') {
    tipo = 'Reclamo'
  } else {
    tipo = 'Consulta'
  }
  console.log('Creating transport...')
  var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: '465',
    secure: true, // true for 465, false for other ports
    auth: {
      type: 'login',
      user: 'talleres.online.peru@gmail.com',
      pass: 'teamcarhelpperu2020',
    },
  })
  const nombre = await pool.query(
    'SELECT razon_social, email FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const emailTaller = nombre[0].email

  var mailOptions = {
    from: 'Talleres Online ',
    to: 'talleres.online.peru@gmail.com',
    subject: 'Atención al Cliente',
    html: ` 
		<div> 
		<h2>NUEVA CONSULTA</h2> 
		<br>
		<h3> Taller: ${nombre_local}
		<br>
		<h3> Email: ${emailTaller}
		<br>
		<br> 
		<h5>${mensajecontacto} </h5> 
		</div> 
	 `,
  }

  transporter.sendMail(mailOptions, function (error, info) {
    console.log('senMail returned!')
    if (error) {
      console.log('ERROR!!!!!!', error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })

  const newConsulta = {
    tipo,
    reclamo: mensajecontacto,
    id_user: req.user.id,
    razon: nombre_local,
  }

  await pool.query('INSERT INTO reclamos SET ?', [newConsulta])
  req.flash('success', 'Mensaje enviado Satisfactoriamente')
  res.redirect('atencion-al-cliente')
})

router.get('/consulta/delete/:id', isLoggedIn, isCliente, async (req, res) => {
  const id = req.params.id
  await pool.query('DELETE FROM reclamos WHERE id=?', [id])
  req.flash('success', 'Consulta eliminada')
  res.redirect('/atencion-al-cliente')
})

//**********  ACCESOS  *************/

router.get('/accesos', isLoggedIn, isCliente, async (req, res) => {
  var accesos = []
  var accesocompleto = {}
  var trabajadores = await pool.query(
    'SELECT * from trabajadores WHERE id_creador =? ORDER BY id_localT',
    req.user.id
  )

  if (trabajadores.length > 0) {
    for (var i = 0; i < trabajadores.length; i++) {
      var nombreLocal = await pool.query(
        'SELECT nombreLocal from locales WHERE id =?',
        [trabajadores[i].id_localT]
      )
      accesos = await pool.query(
        'SELECT accesos, nombreLocal FROM trabajadorAccesoCompleta WHERE trabajador_id =?',
        [trabajadores[i].id]
      )
      var acceso1 = false
      var acceso2 = false
      var acceso3 = false
      var acceso4 = false
      var acceso5 = false
      var acceso6 = false
      var acceso7 = false
      var acceso8 = false

      for (var j = 0; j < accesos.length; j++) {
        if (accesos[j].accesos == 'Ordenes de Trabajo') {
          acceso1 = true
        }
        if (accesos[j].accesos == 'Proformas') {
          acceso2 = true
        }
        if (accesos[j].accesos == 'Estadísticas') {
          acceso3 = true
        }
        if (accesos[j].accesos == 'Tienda Online') {
          acceso4 = true
        }
        if (accesos[j].accesos == 'Facturacion') {
          acceso5 = true
        }
        if (accesos[j].accesos == 'Mis Clientes') {
          acceso6 = true
        }
        if (accesos[j].accesos == 'Estado de Cuentas') {
          acceso7 = true
        }
        if (accesos[j].accesos == 'Facturacion') {
          acceso5 = true
        }
        if (accesos[j].accesos == 'Mis Clientes') {
          acceso6 = true
        }
        if (accesos[j].accesos == 'Estado de Cuentas') {
          acceso7 = true
        }
        if (accesos[j].accesos == 'Mis Promociones') {
          acceso8 = true
        }
      }

      const fotoNombre = await pool.query(
        'SELECT fotoNombre FROM users WHERE id=?',
        trabajadores[i].id_userT
      )

      accesocompleto[i] = {
        acceso1,
        acceso2,
        acceso3,
        acceso4,
        acceso5,
        acceso6,
        acceso7,
        acceso8,
        id: trabajadores[i].id,
        nombre: trabajadores[i].nombre,
        apellido: trabajadores[i].apellido,
        cargo: trabajadores[i].cargo,
        fotoNombre: fotoNombre[0].fotoNombre,
        local: nombreLocal[0].nombreLocal,
      }
    }
  }

  const filtro = req.query.filtro
  if (req.query.filtro) {
    trabajadores = await pool.query(
      'SELECT * FROM trabajadores WHERE id_creador =? and nombre =? OR apellido =? OR cargo=?',
      [req.user.id, filtro, filtro, filtro]
    )
    var accesos = []
    var accesocompleto = {}

    if (trabajadores.length > 0) {
      for (var i = 0; i < trabajadores.length; i++) {
        var nombreLocal = await pool.query(
          'SELECT nombreLocal from locales WHERE id =?',
          [trabajadores[i].id_localT]
        )
        accesos = await pool.query(
          'SELECT accesos FROM trabajadorAccesoCompleta WHERE trabajador_id =?',
          [trabajadores[i].id]
        )
        var acceso1 = false
        var acceso2 = false
        var acceso3 = false
        var acceso4 = false
        var acceso5 = false
        var acceso6 = false
        var acceso8 = false

        for (var j = 0; j < accesos.length; j++) {
          if (accesos[j].accesos == 'Ordenes de Trabajo') {
            acceso1 = true
          }
          if (accesos[j].accesos == 'Proformas') {
            acceso2 = true
          }
          if (accesos[j].accesos == 'Estadísticas') {
            acceso3 = true
          }
          if (accesos[j].accesos == 'Tienda Online') {
            acceso4 = true
          }
          if (accesos[j].accesos == 'Facturacion') {
            acceso5 = true
          }
          if (accesos[j].accesos == 'Mis Clientes') {
            acceso6 = true
          }
          if (accesos[j].accesos == 'Estado de Cuentas') {
            acceso7 = true
          }
          if (accesos[j].accesos == 'Mis Promociones') {
            acceso8 = true
          }
        }
        accesocompleto[i] = {
          acceso1,
          acceso2,
          acceso3,
          acceso4,
          acceso5,
          acceso6,
          acceso7,
          acceso8,
          id: trabajadores[i].id,
          nombre: trabajadores[i].nombre,
          apellido: trabajadores[i].apellido,
          cargo: trabajadores[i].cargo,
          fotoNombre: trabajadores[i].fotoNombre,
          local: nombreLocal[0].nombreLocal,
        }
      }
    }

    if (trabajadores == []) {
      //Mensaje de no encontrado
    }
  }
  const locales = await pool.query(
    'SELECT * FROM locales WHERE user_id =? AND activo =?',
    [req.user.id, 'true']
  )
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)
  res.render('config/configAccesos.hbs', {
    accesocompleto,
    locales,
    nombre_local,
    faltan,
    id_prueba,
  })
})

router.get('/nuevoAcceso', isLoggedIn, isCliente, async (req, res) => {
  const locales = await pool.query(
    'SELECT * FROM localPlan WHERE user_id =? AND activo =? AND accesos >?',
    [req.user.id, 'true', 0]
  )
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)
  const totalAccesos = locales.length
  res.render('config/nuevoAcceso.hbs', {
    locales,
    totalAccesos,
    nombre_local,
    faltan,
    id_prueba,
  })
})

router.post('/nuevoAcceso', isLoggedIn, isCliente, async (req, res) => {
  const {
    nombreAcceso,
    Apellido,
    cargoAcceso,
    correoAcceso,
    telefonoAcceso,
    password,
    correoLocal,
    permisos,
  } = req.body
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  var accesosTrabajador = []
  var newUser = {}

  if (req.files[0]) {
    const { path, originalname } = req.files[0]

    /*USUARIO*/
    newUser = {
      fullname: nombreAcceso,
      email: correoAcceso,
      password,
      fotoNombre: originalname,
      fotoUbicacion: path,
      telefono: telefonoAcceso,
      razon_social: nombre_local,
      tipo: 'Trabajador',
    }
  } else {
    newUser = {
      fullname: nombreAcceso,
      email: correoAcceso,
      password,
      telefono: telefonoAcceso,
      razon_social: nombre_local,
      tipo: 'Trabajador',
    }
  }

  const noUser = await pool.query('SELECT * FROM users WHERE email =?', [
    correoAcceso,
  ])

  if (noUser.length > 0) {
    req.flash('message', 'Error, este email ya está registrado')
    res.redirect('accesos')
  } else {
    newUser.password = await helpers.encryptPassword(password)
    var id1 = await pool.query('INSERT INTO users set ?', [newUser])

    /*TRABAJADOR*/

    const localAcceso = req.body.localAcceso
    newTrabajador = {
      nombre: nombreAcceso,
      apellido: Apellido,
      cargo: cargoAcceso,
      id_localT: localAcceso,
      id_creador: req.user.id,
      id_userT: id1.insertId,
    }

    var id2 = await pool.query('INSERT INTO trabajadores set ?', [
      newTrabajador,
    ])

    /*ACCESOS*/

    if (permisos.length > 0) {
      var accesos = []

      for (var i = 0; i < permisos.length; i++) {
        if (permisos[i] == 'Ordenes de Trabajo') {
          newTrabajadorAccesos = {
            trabajador_id: id2.insertId,
            acceso_id: 1,
          }
          await pool.query('INSERT INTO trabajadorAcceso set ?', [
            newTrabajadorAccesos,
          ])
        }

        if (permisos[i] == 'Proformas') {
          newTrabajadorAccesos = {
            trabajador_id: id2.insertId,
            acceso_id: 2,
          }
          await pool.query('INSERT INTO trabajadorAcceso set ?', [
            newTrabajadorAccesos,
          ])
        }

        if (permisos[i] == 'Estadísticas') {
          newTrabajadorAccesos = {
            trabajador_id: id2.insertId,
            acceso_id: 3,
          }
          await pool.query('INSERT INTO trabajadorAcceso set ?', [
            newTrabajadorAccesos,
          ])
        }

        if (permisos[i] == 'Tienda Online') {
          newTrabajadorAccesos = {
            trabajador_id: id2.insertId,
            acceso_id: 4,
          }
          await pool.query('INSERT INTO trabajadorAcceso set ?', [
            newTrabajadorAccesos,
          ])
        }

        if (permisos[i] == 'Facturacion') {
          newTrabajadorAccesos = {
            trabajador_id: id2.insertId,
            acceso_id: 5,
          }
          await pool.query('INSERT INTO trabajadorAcceso set ?', [
            newTrabajadorAccesos,
          ])
        }

        if (permisos[i] == 'Mis Clientes') {
          newTrabajadorAccesos = {
            trabajador_id: id2.insertId,
            acceso_id: 6,
          }
          await pool.query('INSERT INTO trabajadorAcceso set ?', [
            newTrabajadorAccesos,
          ])
        }

        if (permisos[i] == 'Estado de Cuentas') {
          newTrabajadorAccesos = {
            trabajador_id: id2.insertId,
            acceso_id: 7,
          }
          await pool.query('INSERT INTO trabajadorAcceso set ?', [
            newTrabajadorAccesos,
          ])
        }

        if (permisos[i] == 'Mis Promociones') {
          newTrabajadorAccesos = {
            trabajador_id: id2.insertId,
            acceso_id: 8,
          }
          await pool.query('INSERT INTO trabajadorAcceso set ?', [
            newTrabajadorAccesos,
          ])
        }
      }
    }
    //------------------Actualizo Plan ------------------//

    const totalAccesos = await pool.query(
      'SELECT accesos, id FROM planSuscripcion WHERE local_id =?',
      [localAcceso]
    )
    const acceso = {
      accesos: totalAccesos[0].accesos - 1,
    }
    await pool.query('UPDATE planSuscripcion set ? WHERE id =?', [
      acceso,
      totalAccesos[0].id,
    ])

    //---------------------Envío Notificación-----------------//

    var transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: '465',
      secure: true, // true for 465, false for other ports
      auth: {
        type: 'login',
        user: 'talleres.online.peru@gmail.com',
        pass: 'teamcarhelpperu2020',
      },
    })

    var mailOptions = {
      from: 'Talleres Online',
      to: correoAcceso,
      subject: 'Registro talleres online',
      text: 'Bienvenido a talleres',

      //text: 'Código de validación: '+encodeURIComponent(token)
    }

    transporter.sendMail(mailOptions, function (error, info) {
      console.log('senMail returned!')
      if (error) {
        console.log('ERROR!!!!!!', error)
      } else {
        console.log('Email sent: ' + info.response)
      }
    })

    req.flash('success', 'Trabajador creado exitosamente')
    res.redirect('/accesos')
  }
})

router.get('/accesos/edit/:id', isLoggedIn, isCliente, async (req, res) => {
  const { id } = req.params
  const acceso = await pool.query('SELECT * FROM trabajadores WHERE id = ?', [
    id,
  ])
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)

  res.render('accesos/edit.hbs', {
    nombre_local,
    faltan,
    acceso: acceso[0],
    id_prueba,
  })
})

router.post('/accesos/edit/:id', isLoggedIn, isCliente, async (req, res) => {
  var { id } = req.params
  const { nombreAcceso, Apellido, cargoAcceso, permisos } = req.body
  var accesosTrabajador = []
  var iduser = ('SELECT id_userT FROM trabajadores WHERE id =?', id)
  if (req.files) {
    const { path, originalname } = req.files[0]

    /*USUARIO*/
    newUser = {
      fullname: nombreAcceso,
      fotoNombre: originalname,
      fotoUbicacion: path,
    }
    var id1 = await pool.query('UPDATE users set ? WHERE id = ?', [
      newUser,
      iduser,
    ])
  } else {
    newUser = {
      fullname: nombreAcceso,
    }
    var id1 = await pool.query('UPDATE users set ? WHERE id = ?', [
      newUser,
      iduser,
    ])
  }

  /*TRABAJADOR*/

  const id_localT = await pool.query(
    'SELECT * FROM locales where user_id =?',
    req.user.id
  )
  newTrabajador = {
    nombre: nombreAcceso,
    apellido: Apellido,
    cargo: cargoAcceso,
  }

  var id2 = await pool.query('UPDATE trabajadores set ? WHERE id = ?', [
    newTrabajador,
    id,
  ])

  /*ACCESOS*/

  var accesos = []

  for (var i = 0; i < permisos.length; i++) {
    if (permisos[i] == 'Ordenes de Trabajo') {
      newTrabajadorAccesos = {
        trabajador_id: id,
        acceso_id: 1,
      }
      await pool.query(
        'UPDATE trabajadorAcceso set ? WHERE trabajador_id =? ',
        [newTrabajadorAccesos, id]
      )
    }

    if (permisos[i] == 'Proformas') {
      newTrabajadorAccesos = {
        trabajador_id: id,
        acceso_id: 2,
      }
      await pool.query(
        'UPDATE trabajadorAcceso set ? WHERE trabajador_id =? ',
        [newTrabajadorAccesos, id]
      )
    }

    if (permisos[i] == 'Estadísticas') {
      newTrabajadorAccesos = {
        trabajador_id: id,
        acceso_id: 3,
      }
      await pool.query(
        'UPDATE trabajadorAcceso set ? WHERE trabajador_id =? ',
        [newTrabajadorAccesos, id]
      )
    }

    if (permisos[i] == 'Tienda Online') {
      newTrabajadorAccesos = {
        trabajador_id: id,
        acceso_id: 4,
      }
      await pool.query(
        'UPDATE trabajadorAcceso set ? WHERE trabajador_id =? ',
        [newTrabajadorAccesos, id]
      )
    }

    if (permisos[i] == 'Facturacion') {
      newTrabajadorAccesos = {
        trabajador_id: id,
        acceso_id: 5,
      }
      await pool.query(
        'UPDATE trabajadorAcceso set ? WHERE trabajador_id =? ',
        [newTrabajadorAccesos, id]
      )
    }

    if (permisos[i] == 'Mis Clientes') {
      newTrabajadorAccesos = {
        trabajador_id: id,
        acceso_id: 6,
      }
      await pool.query(
        'UPDATE trabajadorAcceso set ? WHERE trabajador_id =? ',
        [newTrabajadorAccesos, id]
      )
    }

    if (permisos[i] == 'Estado de Cuentas') {
      newTrabajadorAccesos = {
        trabajador_id: id,
        acceso_id: 7,
      }
      await pool.query(
        'UPDATE trabajadorAcceso set ? WHERE trabajador_id =? ',
        [newTrabajadorAccesos, id]
      )
    }

    if (permisos[i] == 'Mis Promociones') {
      newTrabajadorAccesos = {
        trabajador_id: id,
        acceso_id: 8,
      }
      await pool.query(
        'UPDATE trabajadorAcceso set ? WHERE trabajador_id =? ',
        [newTrabajadorAccesos, id]
      )
    }
  }
  req.flash('success', 'Acceso Actualizado')
  res.redirect('/accesos')
})

//ELIMINAR ACCESO

router.get('/accesos/delete/:id', isLoggedIn, isCliente, async (req, res) => {
  const { id } = req.params
  const userid = await pool.query(
    'SELECT id_userT, id_localT from trabajadores WHERE id =?',
    id
  )
  await pool.query('DELETE from trabajadorAcceso WHERE trabajador_id = ?', [id])
  await pool.query('DELETE FROM trabajadores WHERE id = ?', [id])
  await pool.query('DELETE FROM users WHERE id=? ', [userid[0].id_userT])

  //------------------Actualizo Plan ------------------//

  const totalAccesos = await pool.query(
    'SELECT accesos, id FROM planSuscripcion WHERE local_id =?',
    [userid[0].id_localT]
  )
  const acceso = {
    accesos: totalAccesos[0].accesos + 1,
  }
  await pool.query('UPDATE planSuscripcion set ? WHERE id =?', [
    acceso,
    totalAccesos[0].id,
  ])

  req.flash('success', 'Trabajador Eliminado')
  res.redirect('/accesos')
})

/****************DETALLES DE UN ACCESO ************/

router.get('/acceso/:id', isLoggedIn, isCliente, async (req, res) => {
  const { id } = req.params
  var accesocompleto = {}
  const trabajadores = await pool.query(
    'SELECT * from trabajadores WHERE id =?',
    [id]
  )
  const accesos = await pool.query(
    'SELECT accesos FROM trabajadorAccesoCompleta WHERE trabajador_id =?',
    [id]
  )
  var acceso1 = false
  var acceso2 = false
  var acceso3 = false
  var acceso4 = false
  var acceso5 = false
  var acceso6 = false
  var acceso7 = false
  var acceso8 = false

  for (var j = 0; j < accesos.length; j++) {
    if (accesos[j].accesos == 'Ordenes de Trabajo') {
      acceso1 = true
    }
    if (accesos[j].accesos == 'Proformas') {
      acceso2 = true
    }
    if (accesos[j].accesos == 'Estadísticas') {
      acceso3 = true
    }
    if (accesos[j].accesos == 'Tienda Online') {
      acceso4 = true
    }
    if (accesos[j].accesos == 'Facturacion') {
      acceso5 = true
    }
    if (accesos[j].accesos == 'Mis Clientes') {
      acceso6 = true
    }
    if (accesos[j].accesos == 'Estado de Cuentas') {
      acceso7 = true
    }
    if (accesos[j].accesos == 'Mis Promociones') {
      acceso8 = true
    }
  }

  if (trabajadores.length > 0) {
    const fotoNombre = await pool.query(
      'SELECT fotoNombre FROM users WHERE id=?',
      [trabajadores[0].id_userT]
    )
    console.log(fotoNombre)
    accesocompleto = {
      acceso1,
      acceso2,
      acceso3,
      acceso4,
      acceso5,
      acceso6,
      acceso7,
      acceso8,
      id: trabajadores[0].id,
      nombre: trabajadores[0].nombre,
      apellido: trabajadores[0].apellido,
      cargo: trabajadores[0].cargo,
      fotoNombre: fotoNombre[0].fotoNombre,
    }
  }
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)
  res.render('accesos/acceso', {
    accesocompleto,
    faltan,
    nombre_local,
    id_prueba,
  })
})

/*********** LOCALES  ********** */

router.get('/locales', isLoggedIn, isCliente, async (req, res) => {
  var locales = await pool.query(
    'SELECT * FROM localSuscripcion WHERE user_id =?',
    req.user.id
  )
  const filtroLocales = req.query.filtroLocales

  if (!req.query.filtroLocales) {
    locales = await pool.query(
      'SELECT * FROM localSuscripcion WHERE user_id =?',
      req.user.id
    )
  } else if (req.query.filtroLocales) {
    locales = await pool.query(
      'SELECT * FROM localSuscripcion WHERE user_id =? and nombreLocal = ? OR direccion =? OR distrito =?',
      [req.user.id, filtroLocales, filtroLocales, filtroLocales]
    )
    if (locales == []) {
      req.flash('message', 'No hay Locales con nombre: ' + filtroLocales)
    }
  }

  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)
  console.log(id_prueba)

  res.render('config/configLocales.hbs', {
    locales,
    nombre_local,
    faltan,
    id_prueba,
  })
})

router.get('/nuevoLocal', isLoggedIn, isCliente, async (req, res) => {
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const user = await pool.query(
    'SELECT * from userSuscripcion where id_user =?',
    [req.user.id]
  )
  const faltan = await Dfaltan(req)

  res.render('config/nuevoLocal.hbs', { nombre_local, faltan, id_prueba })
})

router.post('/nuevoLocal', isLoggedIn, isCliente, async (req, res) => {
  const {
    nombreAcceso,
    rucLocal,
    direccionLocal,
    distritoLocal,
    telefonoLocal,
    correoLocal,
    serviciosLocal,
    horarioEntrada,
    horarioSalida,
    mediosPagoLocal,
  } = req.body
  const { path, originalname } = req.files[0]

  //INSERTO LOCAL//

  const newLocal = {
    direccion: direccionLocal,
    distrito: distritoLocal,
    nombreLocal: nombreAcceso,
    telefono: telefonoLocal,
    user_id: req.user.id,
    fotoUbicacion: path,
    fotoNombre: originalname,
    horarioEntrada,
    horarioSalida,
    email: correoLocal,
    ruc_local: rucLocal,
  }

  const local = await pool.query('INSERT INTO locales set ?', [newLocal])
  const { marcaLocal } = req.body
  let marca_id = []

  //INSERTO SUSCRIPCION

  const newSuscripcion = {
    id_user: req.user.id,
    id_local_pagado: local.insertId,
    tipo_suscripcion: 'N/A',
  }

  await pool.query('INSERT INTO userSuscripcion set ?', [newSuscripcion])

  //INSERTO MARCAS CON LAS QUE TRABAJA //

  for (var i = 0; i < marcaLocal.length; i++) {
    if (marcaLocal[i] == 'Abarth') {
      newmarcaLocal = {
        marca_id: 1,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Alfa Romeo') {
      newmarcaLocal = {
        marca_id: 2,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Aspina') {
      newmarcaLocal = {
        marca_id: 3,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Aston Martin') {
      newmarcaLocal = {
        marca_id: 4,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Audi') {
      newmarcaLocal = {
        marca_id: 5,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Barkas') {
      newmarcaLocal = {
        marca_id: 6,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Bentley') {
      newmarcaLocal = {
        marca_id: 7,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'BMW') {
      newmarcaLocal = {
        marca_id: 8,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Cadillac') {
      newmarcaLocal = {
        marca_id: 9,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Caterham') {
      newmarcaLocal = {
        marca_id: 10,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Chevrolet') {
      newmarcaLocal = {
        marca_id: 11,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Chrysler') {
      newmarcaLocal = {
        marca_id: 12,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Citroen') {
      newmarcaLocal = {
        marca_id: 13,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Corvette') {
      newmarcaLocal = {
        marca_id: 14,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Cupra') {
      newmarcaLocal = {
        marca_id: 15,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Dacia') {
      newmarcaLocal = {
        marca_id: 16,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Daewoo') {
      newmarcaLocal = {
        marca_id: 17,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Daihatsy') {
      newmarcaLocal = {
        marca_id: 18,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Dodge') {
      newmarcaLocal = {
        marca_id: 19,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'DS Automobiles') {
      newmarcaLocal = {
        marca_id: 20,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Fiat') {
      newmarcaLocal = {
        marca_id: 21,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Ford') {
      newmarcaLocal = {
        marca_id: 22,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Honda') {
      newmarcaLocal = {
        marca_id: 23,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Hyundai') {
      newmarcaLocal = {
        marca_id: 24,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Infiniti') {
      newmarcaLocal = {
        marca_id: 25,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Isuzu') {
      newmarcaLocal = {
        marca_id: 26,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Iveco') {
      newmarcaLocal = {
        marca_id: 27,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Jaguar') {
      newmarcaLocal = {
        marca_id: 28,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Jeep') {
      newmarcaLocal = {
        marca_id: 29,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Kia') {
      newmarcaLocal = {
        marca_id: 30,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Lada') {
      newmarcaLocal = {
        marca_id: 31,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Lancia') {
      newmarcaLocal = {
        marca_id: 32,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Land Rover') {
      newmarcaLocal = {
        marca_id: 33,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Lexus') {
      newmarcaLocal = {
        marca_id: 34,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Lotus') {
      newmarcaLocal = {
        marca_id: 35,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'MAN') {
      newmarcaLocal = {
        marca_id: 36,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Meserati') {
      newmarcaLocal = {
        marca_id: 37,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Mazda') {
      newmarcaLocal = {
        marca_id: 38,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Mercedes Benz') {
      newmarcaLocal = {
        marca_id: 39,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'MG Rover') {
      newmarcaLocal = {
        marca_id: 40,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'MINI') {
      newmarcaLocal = {
        marca_id: 41,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Mitsubishi') {
      newmarcaLocal = {
        marca_id: 42,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Nissan') {
      newmarcaLocal = {
        marca_id: 43,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Opel') {
      newmarcaLocal = {
        marca_id: 44,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Peugeot') {
      newmarcaLocal = {
        marca_id: 45,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Piaggio') {
      newmarcaLocal = {
        marca_id: 46,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Pontiac') {
      newmarcaLocal = {
        marca_id: 47,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Porsche') {
      newmarcaLocal = {
        marca_id: 48,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Renault') {
      newmarcaLocal = {
        marca_id: 49,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Rover') {
      newmarcaLocal = {
        marca_id: 50,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Saab') {
      newmarcaLocal = {
        marca_id: 51,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Seat') {
      newmarcaLocal = {
        marca_id: 52,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Skoda') {
      newmarcaLocal = {
        marca_id: 53,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Smart') {
      newmarcaLocal = {
        marca_id: 54,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Ssangyong') {
      newmarcaLocal = {
        marca_id: 55,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Subaru') {
      newmarcaLocal = {
        marca_id: 56,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Suzuki') {
      newmarcaLocal = {
        marca_id: 57,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Tata') {
      newmarcaLocal = {
        marca_id: 58,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Tesla') {
      newmarcaLocal = {
        marca_id: 59,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Toyota') {
      newmarcaLocal = {
        marca_id: 60,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Volkswagen') {
      newmarcaLocal = {
        marca_id: 61,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }

    if (marcaLocal[i] == 'Volvo') {
      newmarcaLocal = {
        marca_id: 62,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }
    if (marcaLocal[i] == 'Westfiel') {
      newmarcaLocal = {
        marca_id: 63,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    } else {
      newmarcaLocal = {
        marca_id: 64,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO marcaLocal set ?', [newmarcaLocal])
    }
  }

  //Inserto Categorias
  let servicio_id = []

  for (var i = 0; i < serviciosLocal.length; i++) {
    if (serviciosLocal[i] == 'Carwash & detailing') {
      newservLocal = {
        servicio_id: 1,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO servicioLocal set ?', [newservLocal])
    }
    if (serviciosLocal[i] == 'Libricento') {
      newservLocal = {
        servicio_id: 2,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO servicioLocal set ?', [newservLocal])
    }
    if (serviciosLocal[i] == 'Venta de Accesorios') {
      newservLocal = {
        servicio_id: 3,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO servicioLocal set ?', [newservLocal])
    }
    if (serviciosLocal[i] == 'Mecanica Automotriz') {
      newservLocal = {
        servicio_id: 4,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO servicioLocal set ?', [newservLocal])
    }

    if (serviciosLocal[i] == 'Venta de Repuestos') {
      newservLocal = {
        servicio_id: 5,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO servicioLocal set ?', [newservLocal])
    }

    if (serviciosLocal[i] == 'Otro') {
      newservLocal = {
        servicio_id: 6,
        local_id: local.insertId,
      }
      await pool.query('INSERT INTO servicioLocal set ?', [newservLocal])
    }
  }

  //Inserto Medios de Pago

  let medio_id = []

  for (var i = 0; i < mediosPagoLocal.length; i++) {
    if (mediosPagoLocal[i] != 'Otro') {
      if (mediosPagoLocal[i] == 'Mastercard') {
        newmedioLocal = {
          medio_id: 4,
          local_id: local.insertId,
        }
        await pool.query('INSERT INTO medioLocal set ?', [newmedioLocal])
      }
      if (mediosPagoLocal[i] == 'Visa') {
        newmedioLocal = {
          medio_id: 3,
          local_id: local.insertId,
        }
        await pool.query('INSERT INTO medioLocal set ?', [newmedioLocal])
      }
      if (mediosPagoLocal[i] == 'Transferencia') {
        newmedioLocal = {
          medio_id: 2,
          local_id: local.insertId,
        }
        await pool.query('INSERT INTO medioLocal set ?', [newmedioLocal])
      }
      if (mediosPagoLocal[i] == 'Efectivo') {
        newmedioLocal = {
          medio_id: 1,
          local_id: local.insertId,
        }
        await pool.query('INSERT INTO medioLocal set ?', [newmedioLocal])
      }
    }
  }

  res.redirect('/locales')
})

router.get('/locales/edit/:id', isLoggedIn, isCliente, async (req, res) => {
  const { id } = req.params
  const local = await pool.query('SELECT * FROM locales WHERE id =?', [id])
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)
  res.render('locales/edit.hbs', {
    nombre_local,
    faltan,
    local: local[0],
    id_prueba,
  })
})

router.post('/locales/edit/:id', isLoggedIn, isCliente, async (req, res) => {
  const { id } = req.params
  const {
    nombreAcceso,
    rucLocal,
    direccionLocal,
    distritoLocal,
    telefonoLocal,
    correoLocal,
    serviciosLocal,
    horarioEntrada,
    horarioSalida,
    mediosPagoLocal,
  } = req.body
  const { path, originalname } = req.files[0]

  //INSERTO LOCAL//

  const newLocal = {
    direccion: direccionLocal,
    distrito: distritoLocal,
    nombreLocal: nombreAcceso,
    telefono: telefonoLocal,
    user_id: req.user.id,
    fotoUbicacion: path,
    fotoNombre: originalname,
    horarioEntrada,
    horarioSalida,
    email: correoLocal,
    ruc_local: rucLocal,
  }

  await pool.query('UPDATE locales set ? WHERE id = ?', [newLocal, id]) //Actualizar datos editados

  //INSERTO MARCAS CON LAS QUE TRABAJA //

  const { marcaLocal } = req.body
  let marca_id = []

  for (var i = 0; i < marcaLocal.length; i++) {
    if (marcaLocal[i] == 'Abarth') {
      newmarcaLocal = {
        marca_id: 1,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Alfa Romeo') {
      newmarcaLocal = {
        marca_id: 2,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Aspina') {
      newmarcaLocal = {
        marca_id: 3,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Aston Martin') {
      newmarcaLocal = {
        marca_id: 4,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Audi') {
      newmarcaLocal = {
        marca_id: 5,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Barkas') {
      newmarcaLocal = {
        marca_id: 6,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Bentley') {
      newmarcaLocal = {
        marca_id: 7,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'BMW') {
      newmarcaLocal = {
        marca_id: 8,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Cadillac') {
      newmarcaLocal = {
        marca_id: 9,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Caterham') {
      newmarcaLocal = {
        marca_id: 10,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Chevrolet') {
      newmarcaLocal = {
        marca_id: 11,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Chrysler') {
      newmarcaLocal = {
        marca_id: 12,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Citroen') {
      newmarcaLocal = {
        marca_id: 13,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Corvette') {
      newmarcaLocal = {
        marca_id: 14,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Cupra') {
      newmarcaLocal = {
        marca_id: 15,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Dacia') {
      newmarcaLocal = {
        marca_id: 16,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Daewoo') {
      newmarcaLocal = {
        marca_id: 17,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Daihatsy') {
      newmarcaLocal = {
        marca_id: 18,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Dodge') {
      newmarcaLocal = {
        marca_id: 19,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'DS Automobiles') {
      newmarcaLocal = {
        marca_id: 20,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Fiat') {
      newmarcaLocal = {
        marca_id: 21,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Ford') {
      newmarcaLocal = {
        marca_id: 22,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Honda') {
      newmarcaLocal = {
        marca_id: 23,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Hyundai') {
      newmarcaLocal = {
        marca_id: 24,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Infiniti') {
      newmarcaLocal = {
        marca_id: 25,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Isuzu') {
      newmarcaLocal = {
        marca_id: 26,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Iveco') {
      newmarcaLocal = {
        marca_id: 27,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Jaguar') {
      newmarcaLocal = {
        marca_id: 28,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Jeep') {
      newmarcaLocal = {
        marca_id: 29,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Kia') {
      newmarcaLocal = {
        marca_id: 30,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Lada') {
      newmarcaLocal = {
        marca_id: 31,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Lancia') {
      newmarcaLocal = {
        marca_id: 32,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Land Rover') {
      newmarcaLocal = {
        marca_id: 33,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Lexus') {
      newmarcaLocal = {
        marca_id: 34,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Lotus') {
      newmarcaLocal = {
        marca_id: 35,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'MAN') {
      newmarcaLocal = {
        marca_id: 36,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Meserati') {
      newmarcaLocal = {
        marca_id: 37,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Mazda') {
      newmarcaLocal = {
        marca_id: 38,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Mercedes Benz') {
      newmarcaLocal = {
        marca_id: 39,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'MG Rover') {
      newmarcaLocal = {
        marca_id: 40,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'MINI') {
      newmarcaLocal = {
        marca_id: 41,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Mitsubishi') {
      newmarcaLocal = {
        marca_id: 42,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Nissan') {
      newmarcaLocal = {
        marca_id: 43,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Opel') {
      newmarcaLocal = {
        marca_id: 44,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Peugeot') {
      newmarcaLocal = {
        marca_id: 45,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Piaggio') {
      newmarcaLocal = {
        marca_id: 46,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Pontiac') {
      newmarcaLocal = {
        marca_id: 47,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Porsche') {
      newmarcaLocal = {
        marca_id: 48,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Renault') {
      newmarcaLocal = {
        marca_id: 49,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Rover') {
      newmarcaLocal = {
        marca_id: 50,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Saab') {
      newmarcaLocal = {
        marca_id: 51,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Seat') {
      newmarcaLocal = {
        marca_id: 52,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Skoda') {
      newmarcaLocal = {
        marca_id: 53,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Smart') {
      newmarcaLocal = {
        marca_id: 54,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Ssangyong') {
      newmarcaLocal = {
        marca_id: 55,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Subaru') {
      newmarcaLocal = {
        marca_id: 56,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Suzuki') {
      newmarcaLocal = {
        marca_id: 57,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Tata') {
      newmarcaLocal = {
        marca_id: 58,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Tesla') {
      newmarcaLocal = {
        marca_id: 59,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Toyota') {
      newmarcaLocal = {
        marca_id: 60,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Volkswagen') {
      newmarcaLocal = {
        marca_id: 61,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }

    if (marcaLocal[i] == 'Volvo') {
      newmarcaLocal = {
        marca_id: 62,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }
    if (marcaLocal[i] == 'Westfiel') {
      newmarcaLocal = {
        marca_id: 63,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    } else {
      newmarcaLocal = {
        marca_id: 64,
        local_id: id,
      }
      await pool.query('UPDATE marcaLocal set ? WHERE local_id = ?', [
        newmarcaLocal,
        id,
      ])
    }
  }

  //Inserto Categorias
  let servicio_id = []

  for (var i = 0; i < serviciosLocal.length; i++) {
    if (serviciosLocal[i] == 'Carwash & detailing') {
      newservLocal = {
        servicio_id: 1,
        local_id: id,
      }
      await pool.query('UPDATE servicioLocal set ? WHERE local_id = ?', [
        newservLocal,
        id,
      ])
    }

    if (serviciosLocal[i] == 'Libricento') {
      newservLocal = {
        servicio_id: 2,
        local_id: id,
      }
      await pool.query('UPDATE servicioLocal set ? WHERE local_id = ?', [
        newservLocal,
        id,
      ])
    }

    if (serviciosLocal[i] == 'Venta de Accesorios') {
      newservLocal = {
        servicio_id: 3,
        local_id: id,
      }
      await pool.query('UPDATE servicioLocal set ? WHERE local_id = ?', [
        newservLocal,
        id,
      ])
    }

    if (serviciosLocal[i] == 'Mecanica Automotriz') {
      newservLocal = {
        servicio_id: 4,
        local_id: id,
      }
      await pool.query('UPDATE servicioLocal set ? WHERE local_id = ?', [
        newservLocal,
        id,
      ])
    }

    if (serviciosLocal[i] == 'Venta de Repuestos') {
      newservLocal = {
        servicio_id: 5,
        local_id: id,
      }
      await pool.query('UPDATE servicioLocal set ? WHERE local_id = ?', [
        newservLocal,
        id,
      ])
    }

    if (serviciosLocal[i] == 'Otro') {
      newservLocal = {
        servicio_id: 6,
        local_id: id,
      }
      await pool.query('UPDATE servicioLocal set ? WHERE local_id = ?', [
        newservLocal,
        id,
      ])
    }
  }

  //Inserto Medios de Pago

  let medio_id = []

  for (var i = 0; i < mediosPagoLocal.length; i++) {
    if (mediosPagoLocal[i] != 'Otro') {
      if (mediosPagoLocal[i] == 'Mastercard') {
        newmedioLocal = {
          medio_id: 4,
          local_id: id,
        }
        await pool.query('UPDATE medioLocal set ? WHERE local_id = ?', [
          newmedioLocal,
          id,
        ])
      }

      if (mediosPagoLocal[i] == 'Visa') {
        newmedioLocal = {
          medio_id: 3,
          local_id: id,
        }
        await pool.query('UPDATE medioLocal set ? WHERE local_id = ?', [
          newmedioLocal,
          id,
        ])
      }

      if (mediosPagoLocal[i] == 'Transferencia') {
        newmedioLocal = {
          medio_id: 2,
          local_id: id,
        }
        await pool.query('UPDATE medioLocal set ? WHERE local_id = ?', [
          newmedioLocal,
          id,
        ])
      }

      if (mediosPagoLocal[i] == 'Efectivo') {
        newmedioLocal = {
          medio_id: 1,
          local_id: id,
        }
        await pool.query('UPDATE medioLocal set ? WHERE local_id = ?', [
          newmedioLocal,
          id,
        ])
      }
    }
  }

  req.flash('success', 'Local Actualizado')
  res.redirect('/locales')
})

//ELIMINAR LOCAL

router.get('/locales/delete/:id', isLoggedIn, isCliente, async (req, res) => {
  const { id } = req.params
  const locales = await pool.query('SELECT * FROM locales WHERE user_id =?', [
    req.user.id,
  ])

  if (locales.length > 1) {
    await pool.query('DELETE from marcaLocal WHERE local_id = ?', [id])
    await pool.query('DELETE from servicioLocal WHERE local_id = ?', [id])
    await pool.query('DELETE from medioLocal WHERE local_id = ?', [id])
    await pool.query('DELETE from trabajadores WHERE id_localT = ?', [id])
    await pool.query('DELETE FROM clienteTaller WHERE taller_id = ?', [id])
    await pool.query('DELETE FROM planSuscripcion WHERE local_id = ?', [id])
    await pool.query('DELETE FROM userSuscripcion WHERE id_local_pagado = ?', [
      id,
    ])
    await pool.query('DELETE FROM locales WHERE id = ?', [id])
    req.flash('success', 'Local Eliminado')
  } else {
    req.flash('message', 'No es permitido eliminar su único local')
  }

  res.redirect('/locales')
})

//DETALLES DE UN LOCAL

router.get('/local/:id', isLoggedIn, isCliente, async (req, res) => {
  const { id } = req.params
  const local = await pool.query('SELECT * FROM localSuscripcion WHERE id =?', [
    id,
  ])
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)
  const trabajadores = await pool.query(
    'SELECT * FROM trabajadores WHERE id_localT =?',
    [id]
  )
  const totalTra = trabajadores.length
  res.render('locales/local', {
    nombre_local,
    totalTra,
    faltan,
    local: local[0],
    id_prueba,
  })
})

//********* RESULTADOS DE BUSQUEDA *************/

router.get('/busqueda', isLoggedIn, isCliente, async (req, res) => {
  const filtroBusqueda = req.query.Buscar
  console.log(req.query)

  if (req.query.Buscar) {
    var locales = await pool.query(
      'SELECT * FROM locales WHERE user_id =? AND nombreLocal = ? OR direccion =? OR distrito =?',
      [req.user.id, filtroBusqueda, filtroBusqueda, filtroBusqueda]
    )
    var otCompleta = await pool.query(
      'SELECT * FROM otCompleta WHERE nombre = ? OR distrito =? OR modelo =? OR placa =?  and user_id',
      [
        filtroBusqueda,
        filtroBusqueda,
        filtroBusqueda,
        filtroBusqueda,
        req.user.id,
      ]
    )
    var proformaCompleta = await pool.query(
      'SELECT * FROM proformaCompleta WHERE nombre = ? OR distrito =? OR modelo =?  OR placa =? and user_id',
      [
        filtroBusqueda,
        filtroBusqueda,
        filtroBusqueda,
        filtroBusqueda,
        req.user.id,
      ]
    )
    var clientes = await pool.query(
      'SELECT * FROM tallerClienteCompleta WHERE nombre =? OR rucCliente =? OR distrito =? AND user_id =?',
      [filtroBusqueda, filtroBusqueda, filtroBusqueda, req.user.id]
    )
    var trabajadores = await pool.query(
      'SELECT * FROM trabajadores WHERE id_creador =? and nombre =? OR apellido =? OR cargo=?',
      [req.user.id, filtroBusqueda, filtroBusqueda, filtroBusqueda]
    )
    var accesos = []
    var accesocompleto = {}

    if (locales.length > 0) {
      var l = true
    }

    if (otCompleta.length > 0) {
      var ots = true
    }
    if (proformaCompleta.length > 0) {
      var p = true
    }
    if (clientes.length > 0) {
      var c = true
    }
    if (trabajadores.length > 0) {
      var tr = true
      for (var i = 0; i < trabajadores.length; i++) {
        accesos = await pool.query(
          'SELECT accesos FROM trabajadorAccesoCompleta WHERE trabajador_id =?',
          [trabajadores[i].id]
        )
        var acceso1 = false
        var acceso2 = false
        var acceso3 = false
        var acceso4 = false
        var acceso5 = false
        var acceso6 = false
        var acceso7 = false
        var acceso8 = false

        for (var j = 0; j < accesos.length; j++) {
          if (accesos[j].accesos == 'Ordenes de Trabajo') {
            acceso1 = true
          }
          if (accesos[j].accesos == 'Proformas') {
            acceso2 = true
          }
          if (accesos[j].accesos == 'Estadísticas') {
            acceso3 = true
          }
          if (accesos[j].accesos == 'Tienda Online') {
            acceso4 = true
          }
          if (accesos[j].accesos == 'Facturacion') {
            acceso5 = true
          }
          if (accesos[j].accesos == 'Mis Clientes') {
            acceso6 = true
          }
          if (accesos[j].accesos == 'Estado de Cuentas') {
            acceso7 = true
          }
          if (accesos[j].accesos == 'Mis Promociones') {
            acceso8 = true
          }
        }

        accesocompleto[i] = {
          acceso1,
          acceso2,
          acceso3,
          acceso4,
          acceso5,
          acceso6,
          acceso7,
          acceso8,
          id: trabajadores[i].id,
          nombre: trabajadores[i].nombre,
          apellido: trabajadores[i].apellido,
          cargo: trabajadores[i].cargo,
        }
      }
    }

    if (trabajadores == []) {
      req.flash('message', 'No hay trabajadores con nombre: ' + filtroBusqueda)
    }
  }

  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)

  res.render('busqueda.hbs', {
    locales,
    trabajadores,
    faltan,
    otCompleta,
    tr,
    l,
    ots,
    p,
    c,
    clientes,
    proformaCompleta,
    nombre_local,
    id_prueba,
  })
})

//************  PERFIL  *************** */

router.get('/perfil', isLoggedIn, isCliente, async (req, res) => {
  const userId = req.user.id
  const user = await pool.query('SELECT * FROM users WHERE id =?', userId)
  const locales = await pool.query(
    'SELECT * from locales WHERE user_id =?',
    req.user.id
  )
  const foto = await pool.query(
    'SELECT fotoNombre FROM users WHERE id=?',
    req.user.id
  )
  const fotoNombre = foto[0].fotoNombre

  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)

  res.render('config/profile.hbs', {
    user,
    fotoNombre,
    faltan,
    nombre_local,
    id_prueba,
  })
})

router.get('/editarPerfil', isLoggedIn, isCliente, async (req, res) => {
  const user = await pool.query('SELECT * FROM users WHERE id =?', [
    req.user.id,
  ])
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)

  res.render('config/editProfile.hbs', {
    nombre_local,
    faltan,
    user: user[0],
    id_prueba,
  })
})

router.post('/editarPerfil', isLoggedIn, isCliente, async (req, res) => {
  const {
    nombreAcceso,
    cargoAcceso,
    telefonoAcceso,
    correoAcceso,
    contraseñaAcceso,
    password,
  } = req.body

  if (password) {
    if (req.file) {
      const { path, originalname } = req.files[0]
      newUser = {
        fullname: nombreAcceso,
        email: correoAcceso,
        password,
        fotoNombre: originalname,
        fotoUbicacion: path,
        tipo: 'Cliente',
      }
      newUser.password = await helpers.encryptPassword(contraseñaAcceso)
      await pool.query('UPDATE users set ? WHERE id =?', [newUser, req.user.id])
    } else {
      newUser = {
        fullname: nombreAcceso,
        email: correoAcceso,
        password,
        tipo: 'Cliente',
      }
      newUser.password = await helpers.encryptPassword(contraseñaAcceso)
      await pool.query('UPDATE users set ? WHERE id =?', [newUser, req.user.id])
    }
  } else {
    if (req.file) {
      const { path, originalname } = req.file
      newUser = {
        fullname: nombreAcceso,
        email: correoAcceso,
        fotoNombre: originalname,
        fotoUbicacion: path,
        tipo: 'Cliente',
      }
      await pool.query('UPDATE users set ? WHERE id =?', [newUser, req.user.id])
    } else {
      newUser = {
        fullname: nombreAcceso,
        email: correoAcceso,
        tipo: 'Cliente',
      }
      await pool.query('UPDATE users set ? WHERE id =?', [newUser, req.user.id])
    }
  }

  res.redirect('perfil')
})

//*********  MIS FIRMAS  **************/

router.get('/misFirmas', isLoggedIn, isCliente, async (req, res) => {
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)

  res.render('config/misFirmas.hbs', { nombre_local, faltan, id_prueba })
})

//*********** ORDENES DE TRABAJO  ************ */

router.get('/historial', isLoggedIn, isCliente, async (req, res) => {
  const locales = await pool.query('SELECT * FROM locales WHERE user_id =?', [
    req.user.id,
  ])
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)

  if (req.query.idLocal) {
    if (req.query.idLocal == 0) {
      const otCompleta = await pool.query(
        'SELECT * FROM otCompleta WHERE user_id =? ORDER BY nombreLocal',
        [req.user.id]
      )
      res.render('OT/Historial', {
        otCompleta,
        locales,
        nombre_local,
        faltan,
        id_prueba,
      })
    } else {
      var id_local = req.query.idLocal
      const otCompleta = await pool.query(
        'SELECT * FROM otCompleta WHERE user_id =? and id_local=? ORDER BY nombreLocal',
        [req.user.id, id_local]
      )
      res.render('OT/Historial', {
        otCompleta,
        locales,
        nombre_local,
        faltan,
        id_prueba,
      })
    }
  } else {
    const otCompleta = await pool.query(
      'SELECT * FROM otCompleta WHERE user_id =? ORDER BY nombreLocal',
      [req.user.id]
    )
    //------------------FILTROS----------------//

    if (req.query.placa || req.query.dia_inicio || req.query.dia_fin) {
      const placa = req.query.placa
      var dia_inicio = req.query.dia_inicio
      var dia_fin = req.query.dia_fin
      const date = new Date()
      var currentDay = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDay()
      )

      if (dia_fin == '') {
        dia_fin = currentDay
      }

      facturaCompleta = await pool.query(
        'SELECT * from otCompleta WHERE placa =? OR numero =? AND fecha_recepcion BETWEEN ? AND ? AND user_id=?',
        [placa, placa, dia_inicio, dia_fin, req.user.id]
      )
      res.render('OT/Historial', {
        otCompleta,
        locales,
        nombre_local,
        faltan,
        id_prueba,
      })
    } else {
      res.render('OT/Historial', {
        otCompleta,
        locales,
        nombre_local,
        faltan,
        id_prueba,
      })
    }
  }
})

router.get('/nuevaOT', isLoggedIn, isCliente, async (req, res) => {
  locales = await pool.query(
    'SELECT * FROM locales WHERE user_id=? AND activo =?',
    [req.user.id, 'true']
  )
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)
  res.render('OT/nuevaOT', { locales, nombre_local, faltan, id_prueba })
})

router.post('/nuevaOT', isLoggedIn, isCliente, async (req, res) => {
  const locales = await pool.query(
    'SELECT * FROM locales WHERE user_id =?',
    req.user.id
  )

  /*INSERTO VEHICULOS*/

  const {
    tipoCarro,
    placa,
    marcaCarro,
    modeloCarro,
    año,
    Kilometraje,
    km,
    observacion,
    declaracion,
    nivel_gasolina,
  } = req.body
  let marca_id = await pool.query(
    'SELECT id FROM marcasVehiculos WHERE marca = ?',
    [marcaCarro]
  )
  const carros = await pool.query('SELECT * FROM carros')
  var idCarro = 0
  var carroExiste = false
  if (carros.length > 0) {
    for (var i = 0; i < carros.length; i++) {
      if (carros[i].placa == placa) {
        idCarro = carros[i].id
        carroExiste = true
        break
      }
    }
    if (carroExiste == false) {
      const newVehiculo = {
        placa,
        modelo: modeloCarro,
        marca: marcaCarro,
        tipo: tipoCarro,
        año,
        km,
        kilometraja: Kilometraje,
        nivel_gasolina,
        observacion,
        declaracion,
      }

      const idCarroInserted = await pool.query('INSERT INTO carros set ?', [
        newVehiculo,
      ])
      idCarro = idCarroInserted.insertId
    }
  } else {
    const newVehiculo = {
      placa,
      modelo: modeloCarro,
      marca: marcaCarro,
      tipo: tipoCarro,
      año,
      km,
      kilometraja: Kilometraje,
      nivel_gasolina,
      observacion,
      declaracion,
    }

    const idCarroInserted = await pool.query('INSERT INTO carros set ?', [
      newVehiculo,
    ])
    idCarro = idCarroInserted.insertId
  }

  const fotos = req.files

  for (var i = 0; i < fotos.length; i++) {
    const path = fotos[i].path
    const originalname = fotos[i].originalname
    const newFoto = {
      fotoNombre: originalname,
      fotoUbicacion: path,
      id_carro: idCarro,
    }

    await pool.query('INSERT INTO fotosVehiculos set?', [newFoto])
  }

  /*INSERTO CLIENTES*/

  const {
    nombreCliente,
    rucCliente,
    correoCliente,
    distritoCliente,
    departamentoCliente,
    provinciaCliente,
    tlfCliente,
    conocio_carhelp,
    codigoProm,
  } = req.body
  const { idLocal } = req.body

  console.log(distritoCliente, departamentoCliente, provinciaCliente)

  const ruc = await pool.query(
    'SELECT id FROM clientes WHERE rucCliente =?',
    rucCliente
  )

  if (ruc.length > 0) {
    const clientes = await pool.query(
      'SELECT * FROM clienteTaller WHERE cliente_id =?',
      ruc[0].id
    )

    if (clientes.length > 0) {
      var datetime1 = new Date()
      var datetime = new Date(
        datetime1.getFullYear(),
        datetime1.getMonth(),
        datetime1.getDate()
      )

      const newClienteTaller = {
        cliente_id: ruc[0].id,
        taller_id: idLocal,
        numero_visitas: clientes[0].numero_visitas + 1,
        ultima_visita: datetime,
        tipo_cliente: 'Recurrente',
      }
      await pool.query('UPDATE clienteTaller set ? WHERE cliente_id =?', [
        newClienteTaller,
        ruc[0].id,
      ])
    } else {
      var datetime1 = new Date()
      var datetime = new Date(
        datetime1.getFullYear(),
        datetime1.getMonth(),
        datetime1.getDate()
      )
      const newClienteTaller = {
        cliente_id: ruc[0].id,
        taller_id: idLocal,
        numero_visitas: 1,
        ultima_visita: datetime,
        tipo_cliente: 'Nuevo',
      }

      await pool.query('INSERT INTO clienteTaller set ?', [newClienteTaller])
    }
  } else {
    const newCliente = {
      nombre: nombreCliente,
      rucCliente,
      correo: correoCliente,
      distrito: distritoCliente,
      departamento: departamentoCliente,
      provincia: provinciaCliente,
      tlf: tlfCliente,
      conocio_carhelp,
      codigoProm,
    }

    var idCliente = await pool.query('INSERT INTO clientes set ?', [newCliente])
    const clientes = await pool.query(
      'SELECT * FROM tallerClienteCompleta WHERE id =?',
      idCliente.insertId
    )

    if (clientes.length > 0) {
      const newClienteTaller = {
        cliente_id: idCliente.insertedId,
        taller_id: idLocal,
        numero_visitas: clientes[0].numero_visitas + 1,
        ultima_visita: datetime,
        tipo_cliente: 'Recurrente',
      }
      await pool.query('UPDATE clienteTaller set ? WHERE cliente_id =?', [
        newClienteTaller,
        idCliente.insertId,
      ])
    } else {
      var datetime1 = new Date()
      var datetime = new Date(
        datetime1.getFullYear(),
        datetime1.getMonth(),
        datetime1.getDate()
      )

      const newClienteTaller = {
        cliente_id: idCliente.insertId,
        taller_id: idLocal,
        numero_visitas: 1,
        ultima_visita: datetime,
        tipo_cliente: 'Nuevo',
      }
      await pool.query('INSERT INTO clienteTaller set ?', [newClienteTaller])
    }
  }

  /*INSERTO OT*/

  const { categoria, total, iva, subtotal, detalle, importe } = req.body
  var idL = 1

  let categoria_id = await pool.query(
    'SELECT id FROM categorias WHERE categoria = ?',
    [categoria]
  )

  var OTLocal = await pool.query('SELECT * FROM ot WHERE id_local =?', idL)
  var numero = 0

  if (OTLocal.length > 0) {
    numero = OTLocal[OTLocal.length - 1].numero + 1
  } else {
    numero = 1
  }

  var datetime1 = new Date()
  var datetime = new Date(
    datetime1.getFullYear(),
    datetime1.getMonth(),
    datetime1.getDate()
  )
  const newOT = {
    categoria_id: categoria_id[0].id,
    subtotal,
    iva,
    total,
    user_empresa: [req.user.id],
    fecha_recepcion: datetime,
    id_local: idLocal,
    numero,
  }

  const idOT = await pool.query('INSERT INTO ot set ?', [newOT])
  numero = numero + 1
  var newImporte = {}

  for (var i = 0; i < detalle.length; i++) {
    newImporte = {
      id_ot: idOT.insertId,
      importe: importe[i],
      descripcion: detalle[i],
    }
  }

  var newClienteOT = {}

  if (ruc.length > 0) {
    newClienteOT = {
      id_ot: idOT.insertId,
      id_clientes: ruc[0].id,
    }
  } else {
    newClienteOT = {
      id_ot: idOT.insertId,
      id_clientes: idCliente.insertId,
    }
  }

  const idClienteOT = await pool.query('INSERT INTO clienteOT set ?', [
    newClienteOT,
  ])

  /*Inserto CarroOT*/
  const newCarroOT = {
    id_ot: idOT.insertId,
    id_carro: idCarro,
  }
  await pool.query('INSERT INTO carrosOT set ?', [newCarroOT])

  await DataSave()

  req.flash('success', 'Orden de Trabajo creada exitosamente')
  res.redirect('/recepcionados')
})

router.get('/historialPDF', isLoggedIn, isCliente, async (req, res) => {
  var locales = await pool.query(
    'SELECT * FROM locales WHERE user_id =? AND activo =?',
    [req.user.id, 'true']
  )
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)

  var numero = 1
  var html = fs.readFileSync('src/plantilla.html', 'utf8')
  var options = {
    format: 'A3',
    orientation: 'portrait',
    border: '10mm',
  }

  if (req.query.idLocal) {
    const exportados = await pool.query('SELECT * FROM exportaciones')
    var id_local = req.query.idLocal

    if (exportados.length > 0) {
      numero = exportados[exportados.length - 1].id + 1
    }

    const newExportacion = {
      numero,
      ubicacion: `src/Historiales/Historial ${numero}.pdf`,
      id_local,
      id_user: req.user.id,
    }
    const id_exportado = await pool.query('INSERT INTO exportaciones set ?', [
      newExportacion,
    ])

    const exportacionCompleta = await pool.query(
      'SELECT * from exportacionHistorial WHERE id_user =?',
      [req.user.id]
    )

    const otCompleta = await pool.query(
      'SELECT * FROM otCompleta WHERE user_id =? and id_local=?',
      [req.user.id, id_local]
    )
    var document = {
      type: 'file',
      template: html,
      context: {
        otCompleta: otCompleta,
      },
      path: `src/Historiales/Historial ${numero}.pdf`,
    }

    pdf
      .create(document, options)
      .then((res) => {
        console.log(res)
      })
      .catch((error) => {
        console.error(error)
      })
    req.flash('success', 'Exportación Exitosa')
    res.render('OT/exportarPDF', {
      locales,
      nombre_local,
      faltan,
      exportacionCompleta,
    })
  } else {
    const exportacionCompleta = await pool.query(
      'SELECT * from exportacionHistorial WHERE id_user =?',
      [req.user.id]
    )
    res.render('OT/exportarPDF', {
      exportacionCompleta,
      nombre_local,
      faltan,
      locales,
    })
  }
})

router.get(
  '/historialPDF/descargar/:numero',
  isLoggedIn,
  isCliente,
  async (req, res) => {
    const numero = req.params.numero
    res.download(`src/Historiales/Historial ${numero}.pdf`)
  }
)

router.get(
  '/historialPDF/delete/:numero',
  isLoggedIn,
  isCliente,
  async (req, res) => {
    const { numero } = req.params
    await pool.query('DELETE from exportaciones WHERE numero = ?', [numero])
    req.flash(
      'success',
      'Los datos exportados han sido eliminados correctamente'
    )
    fs.unlink(`src/Historiales/Historial ${numero}.pdf`, function (err) {
      if (err) throw err
      console.log('file deleted')
    })
    res.redirect('/historialPDF')
  }
)

router.get('/resumen', isLoggedIn, isCliente, async (req, res) => {
  const locales = await pool.query(
    'SELECT * from locales WHERE user_id =? AND activo =?',
    [req.user.id, 'true']
  )
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)

  if (req.query.idLocal) {
    var id_local = req.query.idLocal
    if (req.query.idLocal == 0) {
      const recepcionados = await pool.query(
        'select * from resumenUser where estado = ? and userId=?',
        ['Recepcionados', req.user.id]
      )
      const trabajando = await pool.query(
        'select * from resumenUser where estado = ? and userId=?',
        ['Trabajando', req.user.id]
      )
      const listos = await pool.query(
        'select * from resumenUser where estado = ? and userId=?',
        ['Listos', req.user.id]
      )
      const entregados = await pool.query(
        'select * from resumenUser where estado =? and userId=?',
        ['Entregados', req.user.id]
      )
      const otCompleta = await pool.query(
        'SELECT * FROM otCompleta where user_id =?',
        [req.user.id]
      )

      const r = recepcionados.length
      const t = trabajando.length
      const l = listos.length
      const e = entregados.length

      res.render('OT/OTindex', {
        r,
        t,
        l,
        e,
        otCompleta,
        locales,
        faltan,
        nombre_local,
        id_prueba,
      })
    } else {
      const recepcionados = await pool.query(
        'select * from resumenUser where estado = ? and userId=? and id_local=?',
        ['Recepcionados', req.user.id, id_local]
      )
      const trabajando = await pool.query(
        'select * from resumenUser where estado = ? and userId=? and id_local=?',
        ['Trabajando', req.user.id, id_local]
      )
      const listos = await pool.query(
        'select * from resumenUser where estado = ? and userId=? and id_local=?',
        ['Listos', req.user.id, id_local]
      )
      const entregados = await pool.query(
        'select * from resumenUser where estado =? and userId=? and id_local=?',
        ['Entregados', req.user.id, id_local]
      )
      const otCompleta = await pool.query(
        'SELECT * FROM otCompleta where user_id =? and id_local=?',
        [req.user.id, id_local]
      )

      const r = recepcionados.length
      const t = trabajando.length
      const l = listos.length
      const e = entregados.length

      res.render('OT/OTindex', {
        r,
        t,
        l,
        e,
        otCompleta,
        locales,
        faltan,
        nombre_local,
        id_prueba,
      })
    }
  } else {
    const recepcionados = await pool.query(
      'select * from resumenUser where estado = ? and userId=?',
      ['Recepcionados', req.user.id]
    )
    const trabajando = await pool.query(
      'select * from resumenUser where estado = ? and userId=?',
      ['Trabajando', req.user.id]
    )
    const listos = await pool.query(
      'select * from resumenUser where estado = ? and userId=?',
      ['Listos', req.user.id]
    )
    const entregados = await pool.query(
      'select * from resumenUser where estado =? and userId=?',
      ['Entregados', req.user.id]
    )
    const otCompleta = await pool.query(
      'SELECT * FROM otCompleta where user_id =?',
      [req.user.id]
    )

    const r = recepcionados.length
    const t = trabajando.length
    const l = listos.length
    const e = entregados.length

    res.render('OT/OTindex', {
      r,
      t,
      l,
      e,
      otCompleta,
      locales,
      faltan,
      nombre_local,
      id_prueba,
    })
  }
})

router.get('/resumen/edit/:id', isLoggedIn, isCliente, async (req, res) => {
  const locales = await pool.query(
    'SELECT * FROM locales WHERE user_id =? AND activo =?',
    [req.user.id, 'true']
  )
  const { id } = req.params
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const ot = await pool.query(
    'SELECT * FROM otCompleta WHERE user_id =? AND otid =?',
    [req.user.id, id]
  )
  const importes = await pool.query('SELECT * from otImportes WHERE id_ot =?', [
    id,
  ])
  const faltan = await Dfaltan(req)

  res.render('OT/editOT.hbs', {
    nombre_local,
    faltan,
    locales,
    importes,
    ot: ot[0],
    id_prueba,
  })
})

router.post('/resumen/edit/:id', isLoggedIn, isCliente, async (req, res) => {
  const locales = await pool.query(
    'SELECT * FROM locales WHERE user_id =? AND activo =?',
    [req.user.id, 'true']
  )
  const OT_id = req.params.id
  const clienteID = await pool.query(
    'SELECT id FROM clienteOT WHERE id_ot =?',
    [OT_id]
  )
  const carroID = await pool.query('SELECT id FROM carrosOT WHERE id_ot =?', [
    OT_id,
  ])

  /*INSERTO VEHICULOS*/

  const {
    tipoCarro,
    placa,
    marcaCarro,
    modeloCarro,
    año,
    Kilometraje,
    km,
    observacion,
    declaracion,
    nivel_gasolina,
  } = req.body
  let marca_id = await pool.query(
    'SELECT id FROM marcasVehiculos WHERE marca = ?',
    [marcaCarro]
  )

  const newVehiculo = {
    placa,
    modelo: modeloCarro,
    marca: marcaCarro,
    tipo: tipoCarro,
    año,
    kilometraja: Kilometraje,
    nivel_gasolina,
    observacion,
    declaracion,
  }

  const idCarro = await pool.query('UPDATE carros set ? WHERE id =?', [
    newVehiculo,
    carroID[0].id,
  ])

  /*INSERTO CLIENTES*/

  const {
    nombreCliente,
    rucCliente,
    correoCliente,
    distritoCliente,
    tlfCliente,
    conocio_carhelp,
    codigoProm,
  } = req.body
  const { idLocal } = req.body

  const newCliente = {
    nombre: nombreCliente,
    rucCliente,
    correo: correoCliente,
    distrito: distritoCliente,
    tlf: tlfCliente,
    conocio_carhelp,
    codigoProm,
  }

  await pool.query('UPDATE clientes set ? WHERE id =?', [
    newCliente,
    clienteID[0].id,
  ])

  /*INSERTO OT*/

  const { categoria, total, iva, subtotal, detalle, importe } = req.body
  var idL = 1

  let categoria_id = await pool.query(
    'SELECT id FROM categorias WHERE categoria = ?',
    [categoria]
  )

  for (let i = 0; i < locales.length; i++) {
    if (locales[i].id == idLocal) {
      idL = idLocal
    }
  }

  var OTLocal = await pool.query('SELECT * FROM ot WHERE id_local =?', [idL])
  const numero = await pool.query('SELECT numero FROM ot WHERE id =?', [OT_id])

  const newOT = {
    categoria_id: categoria_id[0].id,
    subtotal,
    iva,
    total,
    id_local: idLocal,
    numero: numero[0].numero,
  }

  await pool.query('UPDATE ot set ? WHERE id=?', [newOT, OT_id])
  var newImporte = {}

  for (var i = 0; i < detalle.length; i++) {
    newImporte = {
      id_ot: OT_id,
      importe: importe[i],
      descripcion: detalle[i],
    }
    await pool.query('UPDATE otImportes set ? WHERE id_ot =?', [
      newImporte,
      OT_id,
    ])
  }

  req.flash('success', 'Orden de Trabajo Actualizada')
  res.redirect('/resumen')
})

router.get('/resumen/delete/:id', isLoggedIn, isCliente, async (req, res) => {
  const { id } = req.params
  await pool.query('DELETE from carrosOT WHERE id_ot = ?', [id])
  await pool.query('DELETE FROM clienteOT WHERE id_ot = ?', [id])
  await pool.query('DELETE FROM trabajadorOT WHERE id_ot = ?', [id])
  await pool.query('DELETE FROM otImportes WHERE id_ot = ?', [id])
  await pool.query('DELETE FROM facturas WHERE id_ot = ?', [id])
  await pool.query('DELETE FROM ot WHERE id = ?', [id])

  req.flash('success', 'Orden de Trabajo Eliminada')
  res.redirect('/resumen')
})

router.get('/detallesOT/:id', isLoggedIn, isCliente, async (req, res) => {
  const locales = await pool.query('SELECT * from locales WHERE user_id =?', [
    req.user.id,
  ])
  const otCompleta = await pool.query(
    'SELECT * FROM otCompleta WHERE otid =?',
    [req.params.id]
  )
  const importes = await pool.query('SELECT * FROM otImportes WHERE id_ot =?', [
    req.params.id,
  ])
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)

  const fotos = await pool.query(
    'SELECT * from fotosVehiculos WHERE id_carro =?',
    [otCompleta[0].vid]
  )
  res.render('OT/detallesOT.hbs', {
    nombre_local,
    fotos,
    otCompleta: otCompleta[0],
    faltan,
    importes,
    id_prueba,
  })
})

//***************    ESTADISTICAS   ********************* */

router.get('/estadisticas', isLoggedIn, isCliente, async (req, res) => {
  const locales = await pool.query(
    'SELECT * from locales WHERE user_id =? AND activo =?',
    [req.user.id, 'true']
  )
  var localesPremium = []
  if (locales.length > 0) {
    for (var l = 0; l < locales.length; l++) {
      localesPremium[l] = await pool.query(
        'SELECT * from userSuscripcion WHERE id_local_pagado =? AND tipo_suscripcion =?',
        [locales[l].id, 'Premium']
      )
    }
  }

  if (
    req.query.id_local ||
    req.query.tipoCliente ||
    req.query.inicio ||
    req.query.fin
  ) {
    var id_local = req.query.idLocal
    var tipoCliente = req.query.tipoCliente
    var inicio = req.query.inicio
    var fin = req.query.fin

    const date = new Date()
    var currentDay = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    )

    if (fin == '') {
      fin = currentDay
    }

    if (tipoCliente == '') {
      tipoCliente = 'Todos'
    }

    if (id_local == '') {
      id_local = 0
    }

    if (id_local == 0) {
      var totalNuevos = await pool.query(
        'select tipo_cliente from tallerClienteCompleta	where user_id =? and tipo_cliente =?  and ultima_visita BETWEEN ? AND ?',
        [req.user.id, 'Nuevo', inicio, fin]
      )
      var totalRecurrentes = await pool.query(
        'select tipo_cliente from tallerClienteCompleta	where user_id =? and  tipo_cliente =? and ultima_visita BETWEEN ? AND ?',
        [req.user.id, 'Recurrente', inicio, fin]
      )

      var nuevosAutos = await pool.query(
        'select tipo from otCompleta where user_id =? and tipo = ? and tipo_cliente = ? and fecha_recepcion BETWEEN ? AND ?',
        [req.user.id, 'Auto', 'Nuevo', inicio, fin]
      )
      var nuevosMotos = await pool.query(
        'select tipo from otCompleta where user_id =? and tipo = ? and tipo_cliente = ? and fecha_recepcion BETWEEN ? AND ?',
        [req.user.id, 'Moto', 'Nuevo', inicio, fin]
      )
      var nuevosCamionetas = await pool.query(
        'select tipo from otCompleta where user_id =? and tipo = ? and tipo_cliente = ? and fecha_recepcion BETWEEN ? AND ?',
        [req.user.id, 'Camioneta', 'Nuevo', inicio, fin]
      )

      var nuevoCarwash = await pool.query(
        'select total from nuevoTotal	where user_id =? and categoria =? and fecha_recepcion BETWEEN ? AND ?',
        [req.user.id, 'Carwash & detailing', inicio, fin]
      )
      var nuevoAccesorios = await pool.query(
        'select total from nuevoTotal	where user_id =? and  categoria =? and fecha_recepcion BETWEEN ? AND ?',
        [req.user.id, 'Venta de accesorios', inicio, fin]
      )
      var nuevoLubricento = await pool.query(
        'select total from nuevoTotal	where user_id =? and  categoria =? and fecha_recepcion BETWEEN ? AND ?',
        [req.user.id, 'Lubricento', inicio, fin]
      )
      var nuevoMecanica = await pool.query(
        'select total from nuevoTotal	where user_id =? and  categoria =? and fecha_recepcion BETWEEN ? AND ?',
        [req.user.id, 'Mecanica Automotriz', inicio, fin]
      )
      var nuevoRepuestos = await pool.query(
        'select total from nuevoTotal	where user_id =? and  categoria =? and fecha_recepcion BETWEEN ? AND ?',
        [req.user.id, 'Venta de Repuestos', inicio, fin]
      )
      var nuevoOtro = await pool.query(
        'select total from nuevoTotal	where user_id =? and  categoria =? and fecha_recepcion BETWEEN ? AND ?',
        [req.user.id, 'Otro', inicio, fin]
      )

      var otAuto = await pool.query(
        'select estado from otCompleta where user_id =? and estado =? and tipo=?  and fecha_recepcion BETWEEN ? AND ?',
        [req.user.id, 'Recepcionados', 'Auto', inicio, fin]
      )
      var otMoto = await pool.query(
        'select estado from otCompleta where user_id =? and estado =? and tipo=?  and fecha_recepcion BETWEEN ? AND ?',
        [req.user.id, 'Recepcionados', 'Moto', inicio, fin]
      )
      var otCamioneta = await pool.query(
        'select estado from otCompleta where user_id =? and estado =? and tipo=?  and fecha_recepcion BETWEEN ? AND ?',
        [req.user.id, 'Recepcionados', 'Camioneta', inicio, fin]
      )

      if (tipoCliente != 'Todos') {
        var totalCarwash = await pool.query(
          'select total from otCompleta	where user_id =? and categoria =? and tipo_cliente =? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Carwash & detailing', tipoCliente, inicio, fin]
        )
        var totalAccesorios = await pool.query(
          'select total from otCompleta	where user_id =? and  categoria =? and tipo_cliente =? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Venta de accesorios', tipoCliente, inicio, fin]
        )
        var totalLubricento = await pool.query(
          'select total from otCompleta	where user_id =? and  categoria =? and tipo_cliente =? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Lubricento', tipoCliente, inicio, fin]
        )
        var totalMecanica = await pool.query(
          'select total from otCompleta	where user_id =? and  categoria =? and tipo_cliente =? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Mecanica Automotriz', tipoCliente, inicio, fin]
        )
        var totalRepuestos = await pool.query(
          'select total from otCompleta	where user_id =? and  categoria =? and tipo_cliente =?and fecha_recepcion BETWEEN ? AND ? ',
          [req.user.id, 'Venta de Repuestos', tipoCliente, inicio, fin]
        )
        var totalOtro = await pool.query(
          'select total from otCompleta	where user_id =? and  categoria =? and tipo_cliente =? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Otro', tipoCliente, inicio, fin]
        )

        var totalAuto = await pool.query(
          'select total from otCompleta	where user_id =? and tipo =? and tipo_cliente =?    and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Auto', tipoCliente, inicio, fin]
        )
        var totalCamioneta = await pool.query(
          'select total from otCompleta	where user_id =? and tipo =? and tipo_cliente =?    and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Camioneta', tipoCliente, inicio, fin]
        )
        var totalMoto = await pool.query(
          'select total from otCompleta	where user_id =? and tipo =?  and tipo_cliente =?   and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Moto', tipoCliente, inicio, fin]
        )

        var otEnero = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [
            req.user.id,
            tipoCliente,
            '2020-01-01 00:00:00',
            '2020-01-31 00:00:00',
          ]
        )
        var otFebrero = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [
            req.user.id,
            tipoCliente,
            '2020-02-01 00:00:00',
            '2020-02-29 00:00:00',
          ]
        )
        var otMarzo = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [
            req.user.id,
            tipoCliente,
            '2020-03-01 00:00:00',
            '2020-03-31 00:00:00',
          ]
        )
        var otAbril = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [
            req.user.id,
            tipoCliente,
            '2020-04-01 00:00:00',
            '2020-04-30 00:00:00',
          ]
        )
        var otMayo = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [
            req.user.id,
            tipoCliente,
            '2020-05-01 00:00:00',
            '2020-05-30 00:00:00',
          ]
        )
        var otJunio = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [
            req.user.id,
            tipoCliente,
            '2020-06-01 00:00:00',
            '2020-06-30 00:00:00',
          ]
        )
        var otJulio = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [
            req.user.id,
            tipoCliente,
            '2020-07-01 00:00:00',
            '2020-07-31 00:00:00',
          ]
        )
        var otAgosto = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [
            req.user.id,
            tipoCliente,
            '2020-08-01 00:00:00',
            '2020-08-30 00:00:00',
          ]
        )
        var otSeptiembre = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [
            req.user.id,
            tipoCliente,
            '2020-09-01 00:00:00',
            '2020-09-30 00:00:00',
          ]
        )
        var otOctubre = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [
            req.user.id,
            tipoCliente,
            '2020-10-01 00:00:00',
            '2020-10-31 00:00:00',
          ]
        )
        var otNoviembre = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [
            req.user.id,
            tipoCliente,
            '2020-11-01 00:00:00',
            '2020-11-30 00:00:00',
          ]
        )
        var otDiciembre = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [
            req.user.id,
            tipoCliente,
            '2020-11-01 00:00:00',
            '2020-11-31 00:00:00',
          ]
        )

        var totalCarHelp = await pool.query(
          'select total from otCompleta	where user_id =? and conocio_carhelp =? and tipo_cliente =? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'CarHelp', tipoCliente, inicio, fin]
        )
        var totalRedes = await pool.query(
          'select total from otCompleta	where user_id =? and conocio_carhelp =? and tipo_cliente =? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Redes Sociales', tipoCliente, inicio, fin]
        )
        var totalRecomendado = await pool.query(
          'select total from otCompleta	where user_id =? and conocio_carhelp =? and tipo_cliente =? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Recomendado', tipoCliente, inicio, fin]
        )
        var totalOtros = await pool.query(
          'select total from otCompleta	where user_id =? and conocio_carhelp =? and tipo_cliente =? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Otros', tipoCliente, inicio, fin]
        )

        var totalRecepcionados = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and tipo_cliente =? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Recepcionados', tipoCliente, inicio, fin]
        )
        var totalTrabajando = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and tipo_cliente =? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Trabajando', tipoCliente, inicio, fin]
        )
        var totalListos = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and tipo_cliente =? and  fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Listos', tipoCliente, inicio, fin]
        )
        var totalEntregados = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and tipo_cliente =? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Entregados', tipoCliente, inicio, fin]
        )

        var otAuto = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and tipo=?  and fecha_recepcion BETWEEN ? AND ?  and tipo_cliente =?',
          [req.user.id, 'Recepcionados', 'Auto', inicio, fin, tipoCliente]
        )
        var otMoto = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and tipo=?  and fecha_recepcion BETWEEN ? AND ?  and tipo_cliente =?',
          [req.user.id, 'Recepcionados', 'Moto', inicio, fin, tipoCliente]
        )
        var otCamioneta = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and tipo=?  and fecha_recepcion BETWEEN ? AND ?  and tipo_cliente =?',
          [req.user.id, 'Recepcionados', 'Camioneta', inicio, fin, tipoCliente]
        )
      } else if (tipoCliente == 'Todos') {
        var totalCarwash = await pool.query(
          'select total from otCompleta	where user_id =? and categoria =?  and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Carwash & detailing', inicio, fin]
        )
        var totalAccesorios = await pool.query(
          'select total from otCompleta	where user_id =? and  categoria =? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Venta de accesorios', inicio, fin]
        )
        var totalLubricento = await pool.query(
          'select total from otCompleta	where user_id =? and  categoria =?  and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Lubricento', inicio, fin]
        )
        var totalMecanica = await pool.query(
          'select total from otCompleta	where user_id =? and  categoria =?  and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Mecanica Automotriz', inicio, fin]
        )
        var totalRepuestos = await pool.query(
          'select total from otCompleta	where user_id =? and  categoria =? and fecha_recepcion BETWEEN ? AND ? ',
          [req.user.id, 'Venta de Repuestos', inicio, fin]
        )
        var totalOtro = await pool.query(
          'select total from otCompleta	where user_id =? and  categoria =?  and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Otro', inicio, fin]
        )

        var totalAuto = await pool.query(
          'select total from otCompleta	where user_id =? and tipo =?  and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Auto', inicio, fin]
        )
        var totalCamioneta = await pool.query(
          'select total from otCompleta	where user_id =? and tipo =?  and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Camioneta', inicio, fin]
        )
        var totalMoto = await pool.query(
          'select total from otCompleta	where user_id =? and tipo =?  and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Moto', inicio, fin]
        )

        var otEnero = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, '2020-01-01 00:00:00', '2020-01-31 00:00:00']
        )
        var otFebrero = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, '2020-02-01 00:00:00', '2020-02-29 00:00:00']
        )
        var otMarzo = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, '2020-03-01 00:00:00', '2020-03-31 00:00:00']
        )
        var otAbril = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, '2020-04-01 00:00:00', '2020-04-30 00:00:00']
        )
        var otMayo = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, '2020-05-01 00:00:00', '2020-05-30 00:00:00']
        )
        var otJunio = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, '2020-06-01 00:00:00', '2020-06-30 00:00:00']
        )
        var otJulio = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, '2020-07-01 00:00:00', '2020-07-31 00:00:00']
        )
        var otAgosto = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, '2020-08-01 00:00:00', '2020-08-30 00:00:00']
        )
        var otSeptiembre = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, '2020-09-01 00:00:00', '2020-09-30 00:00:00']
        )
        var otOctubre = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, '2020-10-01 00:00:00', '2020-10-31 00:00:00']
        )
        var otNoviembre = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, '2020-11-01 00:00:00', '2020-11-30 00:00:00']
        )
        var otDiciembre = await pool.query(
          'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, '2020-11-01 00:00:00', '2020-11-31 00:00:00']
        )

        var totalCarHelp = await pool.query(
          'select total from otCompleta	where user_id =? and conocio_carhelp =? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'CarHelp', inicio, fin]
        )
        var totalRedes = await pool.query(
          'select total from otCompleta	where user_id =? and conocio_carhelp =? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Redes Sociales', inicio, fin]
        )
        var totalRecomendado = await pool.query(
          'select total from otCompleta	where user_id =? and conocio_carhelp =?  and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Recomendado', inicio, fin]
        )
        var totalOtros = await pool.query(
          'select total from otCompleta	where user_id =? and conocio_carhelp =?  and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Otros', inicio, fin]
        )

        var totalRecepcionados = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Recepcionados', inicio, fin]
        )
        var totalTrabajando = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Trabajando', inicio, fin]
        )
        var totalListos = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Listos', inicio, fin]
        )
        var totalEntregados = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Entregados', inicio, fin]
        )

        var otAuto = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and tipo=?  and fecha_recepcion BETWEEN ? AND ? ',
          [req.user.id, 'Recepcionados', 'Auto', inicio, fin]
        )
        var otMoto = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and tipo=?  and fecha_recepcion BETWEEN ? AND ? ',
          [req.user.id, 'Recepcionados', 'Moto', inicio, fin]
        )
        var otCamioneta = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and tipo=?  and fecha_recepcion BETWEEN ? AND ?  ',
          [req.user.id, 'Recepcionados', 'Camioneta', inicio, fin]
        )
      }
    } else {
      var totalNuevos = await pool.query(
        'select tipo_cliente from tallerClienteCompleta	where taller_id =? and tipo_cliente =? and ultima_visita BETWEEN ? AND ?',
        [id_local, 'Nuevo', inicio, fin]
      )
      var totalRecurrentes = await pool.query(
        'select tipo_cliente from tallerClienteCompleta	where taller_id =? and  tipo_cliente =? and ultima_visita BETWEEN ? AND ?',
        [id_local, 'Recurrente', inicio, fin]
      )

      var nuevosAutos = await pool.query(
        'select tipo from otCompleta where taller_id = ? and tipo = ? and tipo_cliente = ? and fecha_recepcion BETWEEN ? AND ?',
        [id_local, 'Auto', 'Nuevo', inicio, fin]
      )
      var nuevosMotos = await pool.query(
        'select tipo from otCompleta where taller_id = ? and tipo = ? and tipo_cliente = ? and fecha_recepcion BETWEEN ? AND ?',
        [id_local, 'Moto', 'Nuevo', inicio, fin]
      )
      var nuevosCamionetas = await pool.query(
        'select tipo from otCompleta where taller_id = ? and tipo = ? and tipo_cliente = ? and fecha_recepcion BETWEEN ? AND ?',
        [id_local, 'Camioneta', 'Nuevo', inicio, fin]
      )

      var nuevoCarwash = await pool.query(
        'select total from nuevoTotal	where id_local =? and categoria =? and fecha_recepcion BETWEEN ? AND ?',
        [id_local, 'Carwash & detailing', inicio, fin]
      )
      var nuevoAccesorios = await pool.query(
        'select total from nuevoTotal	where id_local =? and  categoria =? and fecha_recepcion BETWEEN ? AND ?',
        [id_local, 'Venta de accesorios', inicio, fin]
      )
      var nuevoLubricento = await pool.query(
        'select total from nuevoTotal	where id_local =? and  categoria =? and fecha_recepcion BETWEEN ? AND ?',
        [id_local, 'Lubricento', inicio, fin]
      )
      var nuevoMecanica = await pool.query(
        'select total from nuevoTotal	where id_local =? and  categoria =? and fecha_recepcion BETWEEN ? AND ?',
        [id_local, 'Mecanica Automotriz', inicio, fin]
      )
      var nuevoRepuestos = await pool.query(
        'select total from nuevoTotal	where id_local =? and  categoria =? and fecha_recepcion BETWEEN ? AND ?',
        [id_local, 'Venta de Repuestos', inicio, fin]
      )
      var nuevoOtro = await pool.query(
        'select total from nuevoTotal	where id_local =? and  categoria =? and fecha_recepcion BETWEEN ? AND ?',
        [id_local, 'Otro', inicio, fin]
      )

      var otAuto = await pool.query(
        'select estado from otCompleta where user_id =? and estado =? and id_local = ? and tipo = ? and tipo_cliente = ? and fecha_recepcion BETWEEN ? AND ?',
        [req.user.id, 'Recepcionados', id_local, 'Auto', inicio, fin]
      )
      var otMoto = await pool.query(
        'select estado from otCompleta where user_id =? and estado =? and id_local = ? and tipo = ? and tipo_cliente = ? and fecha_recepcion BETWEEN ? AND ?',
        [req.user.id, 'Recepcionados', id_local, 'Moto', inicio, fin]
      )
      var otCamioneta = await pool.query(
        'select estado from otCompleta where user_id =? and estado =? and  id_local = ? and tipo = ? and tipo_cliente = ? and fecha_recepcion BETWEEN ? AND ?',
        [req.user.id, 'Recepcionados', id_local, 'Camioneta', inicio, fin]
      )

      if (tipoCliente != 'Todos') {
        var totalCarwash = await pool.query(
          'select total from otCompleta	where id_local =? and categoria =? and tipo_cliente =? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Carwash & detailing', tipoCliente, inicio, fin]
        )
        var totalAccesorios = await pool.query(
          'select total from otCompleta	where id_local =? and  categoria =? and tipo_cliente =? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Venta de accesorios', tipoCliente, inicio, fin]
        )
        var totalLubricento = await pool.query(
          'select total from otCompleta	where id_local =? and  categoria =? and tipo_cliente =? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Lubricento', tipoCliente, inicio, fin]
        )
        var totalMecanica = await pool.query(
          'select total from otCompleta	where id_local =? and  categoria =? and tipo_cliente =? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Mecanica Automotriz', tipoCliente, inicio, fin]
        )
        var totalRepuestos = await pool.query(
          'select total from otCompleta	where id_local =? and  categoria =? and tipo_cliente =?and fecha_recepcion BETWEEN ? AND ? ',
          [id_local, 'Venta de Repuestos', tipoCliente, inicio, fin]
        )
        var totalOtro = await pool.query(
          'select total from otCompleta	where id_local =? and  categoria =? and tipo_cliente =? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Otro', tipoCliente, inicio, fin]
        )

        var totalAuto = await pool.query(
          'select total from otCompleta	where id_local =? and tipo =? and tipo_cliente   and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Auto', tipoCliente, inicio, fin]
        )
        var totalCamioneta = await pool.query(
          'select total from otCompleta	where id_local =? and tipo =? and tipo_cliente   and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Camioneta', tipoCliente, inicio, fin]
        )
        var totalMoto = await pool.query(
          'select total from otCompleta	where id_local =? and tipo =?  and tipo_cliente  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Moto', tipoCliente, inicio, fin]
        )

        var otEnero = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, tipoCliente, '2020-01-01 00:00:00', '2020-01-31 00:00:00']
        )
        var otFebrero = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local  = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, tipoCliente, '2020-02-01 00:00:00', '2020-02-29 00:00:00']
        )
        var otMarzo = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local  = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, tipoCliente, '2020-03-01 00:00:00', '2020-03-31 00:00:00']
        )
        var otAbril = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local  = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, tipoCliente, '2020-04-01 00:00:00', '2020-04-30 00:00:00']
        )
        var otMayo = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local  = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, tipoCliente, '2020-05-01 00:00:00', '2020-05-30 00:00:00']
        )
        var otJunio = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local  = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, tipoCliente, '2020-06-01 00:00:00', '2020-06-30 00:00:00']
        )
        var otJulio = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local  = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, tipoCliente, '2020-07-01 00:00:00', '2020-07-31 00:00:00']
        )
        var otAgosto = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, tipoCliente, '2020-08-01 00:00:00', '2020-08-30 00:00:00']
        )
        var otSeptiembre = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local  = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, tipoCliente, '2020-09-01 00:00:00', '2020-09-30 00:00:00']
        )
        var otOctubre = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local  = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, tipoCliente, '2020-10-01 00:00:00', '2020-10-31 00:00:00']
        )
        var otNoviembre = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local  = ? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, tipoCliente, '2020-11-01 00:00:00', '2020-11-30 00:00:00']
        )
        var otDiciembre = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local  = ? and tipo_cliente  =? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, tipoCliente, '2020-11-01 00:00:00', '2020-11-31 00:00:00']
        )

        var totalCarHelp = await pool.query(
          'select total from otCompleta	where id_local =? and conocio_carhelp =?  and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'CarHelp', tipoCliente, inicio, fin]
        )
        var totalRedes = await pool.query(
          'select total from otCompleta	where id_local =? and conocio_carhelp =?  and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Redes Sociales', tipoCliente, inicio, fin]
        )
        var totalRecomendado = await pool.query(
          'select total from otCompleta	where id_local =? and conocio_carhelp =?  and tipo_cliente  =? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Recomendado', tipoCliente, inicio, fin]
        )
        var totalOtros = await pool.query(
          'select total from otCompleta	where id_local =? and conocio_carhelp =?  and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Otros', tipoCliente, inicio, fin]
        )

        var totalRecepcionados = await pool.query(
          'select estado from otCompleta where id_local =? and estado =? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Recepcionados', tipoCliente, inicio, fin]
        )
        var totalTrabajando = await pool.query(
          'select estado from otCompleta where id_local =? and estado =? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Trabajando', tipoCliente, inicio, fin]
        )
        var totalListos = await pool.query(
          'select estado from otCompleta where id_local =? and estado =? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Listos', tipoCliente, inicio, fin]
        )
        var totalEntregados = await pool.query(
          'select estado from otCompleta where id_local =? and estado =? and tipo_cliente =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Entregados', tipoCliente, inicio, fin]
        )

        var otAuto = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and  id_local = ? and tipo = ? and tipo_cliente = ? and fecha_recepcion BETWEEN ? AND ? and tipo_cliente =?',
          [
            req.user.id,
            'Recepcionados',
            id_local,
            'Auto',
            inicio,
            fin,
            tipoCliente,
          ]
        )
        var otMoto = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and id_local = ? and tipo = ? and tipo_cliente = ? and fecha_recepcion BETWEEN ? AND ? and tipo_cliente =?',
          [
            req.user.id,
            'Recepcionados',
            id_local,
            'Moto',
            inicio,
            fin,
            tipoCliente,
          ]
        )
        var otCamioneta = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and  id_local = ? and tipo = ? and tipo_cliente = ? and fecha_recepcion BETWEEN ? AND ? and tipo_cliente =?',
          [
            req.user.id,
            'Recepcionados',
            id_local,
            'Camioneta',
            inicio,
            fin,
            tipoCliente,
          ]
        )
      } else if (tipoCliente == 'Todos') {
        var totalCarwash = await pool.query(
          'select total from otCompleta	where id_local =? and categoria =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Carwash & detailing', inicio, fin]
        )
        var totalAccesorios = await pool.query(
          'select total from otCompleta	where id_local =? and  categoria =? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Venta de accesorios', inicio, fin]
        )
        var totalLubricento = await pool.query(
          'select total from otCompleta	where id_local =? and  categoria =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Lubricento', inicio, fin]
        )
        var totalMecanica = await pool.query(
          'select total from otCompleta	where id_local =? and  categoria =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Mecanica Automotriz', inicio, fin]
        )
        var totalRepuestos = await pool.query(
          'select total from otCompleta	where id_local =? and  categoria =?  =? and fecha_recepcion BETWEEN ? AND ? ',
          [id_local, 'Venta de Repuestos', inicio, fin]
        )
        var totalOtro = await pool.query(
          'select total from otCompleta	where id_local =? and  categoria =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Otro']
        )

        var totalAuto = await pool.query(
          'select total from otCompleta	where  id_local =? and tipo =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Auto', inicio, fin]
        )
        var totalCamioneta = await pool.query(
          'select total from otCompleta	where  id_local =? and tipo =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Camioneta', inicio, fin]
        )
        var totalMoto = await pool.query(
          'select total from otCompleta	where  id_local =? and tipo =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Moto', inicio, fin]
        )

        var otEnero = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local = ? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, '2020-01-01 00:00:00', '2020-01-31 00:00:00']
        )
        var otFebrero = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local= ? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, '2020-02-01 00:00:00', '2020-02-29 00:00:00']
        )
        var otMarzo = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local = ? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, '2020-03-01 00:00:00', '2020-03-31 00:00:00']
        )
        var otAbril = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local= ? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, '2020-04-01 00:00:00', '2020-04-30 00:00:00']
        )
        var otMayo = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local= ? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, '2020-05-01 00:00:00', '2020-05-30 00:00:00']
        )
        var otJunio = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local = ? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, '2020-06-01 00:00:00', '2020-06-30 00:00:00']
        )
        var otJulio = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local = ? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, '2020-07-01 00:00:00', '2020-07-31 00:00:00']
        )
        var otAgosto = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local = ? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, '2020-08-01 00:00:00', '2020-08-30 00:00:00']
        )
        var otSeptiembre = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local = ? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, '2020-09-01 00:00:00', '2020-09-30 00:00:00']
        )
        var otOctubre = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local = ? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, '2020-10-01 00:00:00', '2020-10-31 00:00:00']
        )
        var otNoviembre = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local = ? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, '2020-11-01 00:00:00', '2020-11-30 00:00:00']
        )
        var otDiciembre = await pool.query(
          'select total, fecha_recepcion from otCompleta where id_local = ? and fecha_recepcion BETWEEN ? AND ?',
          [id_local, '2020-11-01 00:00:00', '2020-11-31 00:00:00']
        )

        var totalCarHelp = await pool.query(
          'select total from otCompleta	where id_local =? and conocio_carhelp =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'CarHelp', inicio, fin]
        )
        var totalRedes = await pool.query(
          'select total from otCompleta	where id_local =? and conocio_carhelp =?   and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Redes Sociales', inicio, fin]
        )
        var totalRecomendado = await pool.query(
          'select total from otCompleta	where id_local =? and conocio_carhelp =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Recomendado', inicio, fin]
        )
        var totalOtros = await pool.query(
          'select total from otCompleta	where id_local =? and conocio_carhelp =?   and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Otros', inicio, fin]
        )

        var totalRecepcionados = await pool.query(
          'select estado from otCompleta where id_local =? and estado =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Recepcionados', inicio, fin]
        )
        var totalTrabajando = await pool.query(
          'select estado from otCompleta where id_local =? and estado =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Trabajando', inicio, fin]
        )
        var totalListos = await pool.query(
          'select estado from otCompleta where id_local =? and estado =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Listos', inicio, fin]
        )
        var totalEntregados = await pool.query(
          'select estado from otCompleta where id_local =? and estado =?  and fecha_recepcion BETWEEN ? AND ?',
          [id_local, 'Entregados', inicio, fin]
        )

        var otAuto = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and  id_local = ? and tipo = ? and tipo_cliente = ? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Recepcionados', id_local, 'Auto', inicio, fin]
        )
        var otMoto = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and id_local = ? and tipo = ? and tipo_cliente = ? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Recepcionados', id_local, 'Moto', inicio, fin]
        )
        var otCamioneta = await pool.query(
          'select estado from otCompleta where user_id =? and estado =? and  id_local = ? and tipo = ? and tipo_cliente = ? and fecha_recepcion BETWEEN ? AND ?',
          [req.user.id, 'Recepcionados', id_local, 'Camioneta', inicio, fin]
        )
      }
    }

    var carwash = 0
    var accesorios = 0
    var lubricento = 0
    var mecanica = 0
    var repuestos = 0
    var otro = 0

    for (let i = 0; i < totalCarwash.length; i++) {
      carwash = carwash + totalCarwash[i].total
    }

    for (let i = 0; i < totalAccesorios.length; i++) {
      accesorios = accesorios + totalAccesorios[i].total
    }

    for (let i = 0; i < totalLubricento.length; i++) {
      lubricento = lubricento + totalLubricento[i].total
    }

    for (let i = 0; i < totalMecanica.length; i++) {
      mecanica = mecanica + totalMecanica[i].total
    }

    for (let i = 0; i < totalRepuestos.length; i++) {
      repuestos = repuestos + totalRepuestos[i].total
    }

    for (let i = 0; i < totalOtro.length; i++) {
      otro = otro + totalOtro[i].total
    }

    const totalCategorias = {
      carwash,
      accesorios,
      repuestos,
      mecanica,
      lubricento,
      otro,
    }

    var auto = 0
    var camioneta = 0
    var moto = 0

    for (let i = 0; i < totalAuto.length; i++) {
      auto = auto + totalAuto[i].total
    }

    for (let i = 0; i < totalCamioneta.length; i++) {
      camioneta = camioneta + totalCamioneta[i].total
    }

    for (let i = 0; i < totalMoto.length; i++) {
      moto = moto + totalMoto[i].total
    }

    const totalTipos = {
      auto,
      camioneta,
      moto,
    }

    var enero = 0
    for (let i = 0; i < otEnero.length; i++) {
      enero = enero + otEnero[i].total
    }

    var febrero = 0
    for (let i = 0; i < otFebrero.length; i++) {
      febrero = febrero + otFebrero[i].total
    }

    var marzo = 0
    for (let i = 0; i < otMarzo.length; i++) {
      marzo = marzo + otMarzo[i].total
    }

    var abril = 0
    for (let i = 0; i < otAbril.length; i++) {
      abril = abril + otAbril[i].total
    }

    var mayo = 0
    for (let i = 0; i < otMayo.length; i++) {
      mayo = mayo + otMayo[i].total
    }

    var junio = 0
    for (let i = 0; i < otJunio.length; i++) {
      junio = junio + otJunio[i].total
    }

    var julio = 0
    for (let i = 0; i < otJulio.length; i++) {
      julio = julio + otJulio[i].total
    }

    var agosto = 0
    for (let i = 0; i < otAgosto.length; i++) {
      agosto = agosto + otAgosto[i].total
    }

    var septiembre = 0
    for (let i = 0; i < otSeptiembre.length; i++) {
      septiembre = septiembre + otSeptiembre[i].total
    }

    var octrubre = 0
    for (let i = 0; i < otOctubre.length; i++) {
      octrubre = octrubre + otOctubre[i].total
    }

    var noviembre = 0
    for (let i = 0; i < otNoviembre.length; i++) {
      noviembre = noviembre + otNoviembre[i].total
    }

    var diciembre = 0
    for (let i = 0; i < otDiciembre.length; i++) {
      diciembre = diciembre + otDiciembre[i].total
    }

    const otMeses = {
      enero: otEnero.length,
      totalEnero: enero,
      febrero: otFebrero.length,
      totalFebrero: febrero,
      marzo: otMarzo.length,
      totalMarzo: marzo,
      abril: otAbril.length,
      totalAbril: abril,
      mayo: otMayo.length,
      totalMayo: mayo,
      junio: otJunio.length,
      totalJunio: junio,
      julio: otJulio.length,
      totalJulio: julio,
      agosto: otAgosto.length,
      totalAgosto: agosto,
      septiembre: otSeptiembre.length,
      totalSeptiembre: septiembre,
      octrubre: otOctubre.length,
      totalOctubre: octrubre,
      noviembre: otNoviembre.length,
      totalNoviembre: noviembre,
      diciembre: otDiciembre.length,
      totalDiciembre: diciembre,
    }

    var promedioEnero = enero / otEnero.length
    var promedioFebrero = febrero / otFebrero.length
    var promedioMArzo = marzo / otMarzo.length
    var promedioAbril = abril / otAbril.length
    var promedioMayo = mayo / otMayo.length
    var promedioJunio = junio / otJunio.length
    var promedioJulio = julio / otJunio.length
    var promedioAgosto = agosto / otAgosto.length
    var promedioSeptiembre = septiembre / otSeptiembre.length
    var promedioOctubre = octrubre / otOctubre.length
    var promedioNoviembre = noviembre / otNoviembre.length
    var promedioDiciembre = diciembre / otDiciembre.length

    var promedioMes = {
      promedioEnero,
      promedioFebrero,
      promedioMArzo,
      promedioAbril,
      promedioMayo,
      promedioJunio,
      promedioJulio,
      promedioAgosto,
      promedioSeptiembre,
      promedioOctubre,
      promedioNoviembre,
      promedioDiciembre,
    }

    var carhelp = totalCarHelp.length
    var redes = totalRedes.length
    var recomendados = totalRecomendado.length
    var otros = totalOtros.length

    /*
		
		var carhelp = 0;
		var redes = 0;
		var recomendados = 0;
		var otros = 0;
		
		
		for(let i = 0; i<totalCarHelp.length; i++) {
			carhelp = carhelp + totalCarHelp[i].total
		}
		
		for(let i = 0; i<totalRedes.length; i++) {
			redes = redes + totalRedes[i].total
		}
		
		for(let i = 0; i<totalRecomendado.length; i++) {
			recomendados = recomendados + totalRecomendado[i].total
		}
		
		for(let i = 0; i<totalOtros.length; i++) {
			otros = otros + totalOtros[i].total
		}

		*/

    const totalConocio = {
      carhelp,
      redes,
      recomendados,
      otros,
    }

    var recepcionados = totalRecepcionados.length
    var trabajando = totalTrabajando.length
    var listos = totalListos.length
    var entregados = totalEntregados.length

    const totalOT = {
      recepcionados,
      trabajando,
      listos,
      entregados,
    }

    var nuevos = totalNuevos.length
    var recurrentes = totalRecurrentes.length

    const totalClientes = {
      nuevos,
      recurrentes,
    }

    const tiposNuevos = {
      autos: nuevosAutos.length,
      motos: nuevosMotos.length,
      camionetas: nuevosCamionetas.length,
    }

    var ncarwash = 0
    var naccesorios = 0
    var nlubricento = 0
    var nmecanica = 0
    var nrepuestos = 0
    var notro = 0

    for (let i = 0; i < nuevoCarwash.length; i++) {
      ncarwash = ncarwash + nuevoCarwash[i].total
    }

    for (let i = 0; i < nuevoAccesorios.length; i++) {
      naccesorios = naccesorios + nuevoAccesorios[i].total
    }

    for (let i = 0; i < nuevoLubricento.length; i++) {
      nlubricento = nlubricento + nuevoLubricento[i].total
    }

    for (let i = 0; i < nuevoMecanica.length; i++) {
      nmecanica = nmecanica + nuevoMecanica[i].total
    }

    for (let i = 0; i < nuevoRepuestos.length; i++) {
      nrepuestos = nrepuestos + nuevoRepuestos[i].total
    }

    for (let i = 0; i < nuevoOtro.length; i++) {
      notro = notro + nuevoOtro[i].total
    }

    const nuevoCategorias = {
      ncarwash,
      naccesorios,
      nrepuestos,
      nmecanica,
      nlubricento,
      notro,
    }

    const nombre = await pool.query(
      'SELECT razon_social FROM users WHERE id =?',
      [req.user.id]
    )
    const nombre_local = nombre[0].razon_social
    const faltan = await Dfaltan(req)

    var otAutoTotal = otAuto.length
    var otMotoTotal = otMoto.length
    var otCamionetaTotal = otCamioneta.length

    var totalOTTipo = {
      otAutoTotal,
      otMotoTotal,
      otCamionetaTotal,
    }

    res.render('estadisticas', {
      nombre_local,
      localesPremium,
      totalOTTipo,
      locales,
      faltan,
      totalCategorias,
      id_prueba,
      totalTipos,
      totalConocio,
      totalOT,
      totalClientes,
      tiposNuevos,
      nuevoCategorias,
      otMeses,
      promedioMes,
    })
  } else {
    //-----------------------TOTAL CATEGORIA ----------------------------------//

    totalCarwash = await pool.query(
      'select total from otCompleta	where user_id =? and categoria =? ',
      [req.user.id, 'Carwash & detailing']
    )
    totalAccesorios = await pool.query(
      'select total from otCompleta	where user_id =? and  categoria =? ',
      [req.user.id, 'Venta de accesorios']
    )
    totalLubricento = await pool.query(
      'select total from otCompleta	where user_id =? and  categoria =? ',
      [req.user.id, 'Lubricento']
    )
    totalMecanica = await pool.query(
      'select total from otCompleta	where user_id =? and  categoria =? ',
      [req.user.id, 'Mecanica Automotriz']
    )
    totalRepuestos = await pool.query(
      'select total from otCompleta	where user_id =? and  categoria =? ',
      [req.user.id, 'Venta de Repuestos']
    )
    totalOtro = await pool.query(
      'select total from otCompleta	where user_id =? and  categoria =? ',
      [req.user.id, 'Otro']
    )

    carwash = 0
    accesorios = 0
    lubricento = 0
    mecanica = 0
    repuestos = 0
    otro = 0

    for (let i = 0; i < totalCarwash.length; i++) {
      carwash = carwash + totalCarwash[i].total
    }

    for (let i = 0; i < totalAccesorios.length; i++) {
      accesorios = accesorios + totalAccesorios[i].total
    }

    for (let i = 0; i < totalLubricento.length; i++) {
      lubricento = lubricento + totalLubricento[i].total
    }

    for (let i = 0; i < totalMecanica.length; i++) {
      mecanica = mecanica + totalMecanica[i].total
    }

    for (let i = 0; i < totalRepuestos.length; i++) {
      repuestos = repuestos + totalRepuestos[i].total
    }

    for (let i = 0; i < totalOtro.length; i++) {
      otro = otro + totalOtro[i].total
    }

    totalCategorias = {
      carwash,
      accesorios,
      repuestos,
      mecanica,
      lubricento,
      otro,
    }

    //--------------------------------TOTAL TIPO DE AUTO ---------------------------------------//

    totalAuto = await pool.query(
      'select total from otCompleta	where user_id =? and tipo =?',
      [req.user.id, 'Auto']
    )
    totalCamioneta = await pool.query(
      'select total from otCompleta	where user_id =? and tipo =?',
      [req.user.id, 'Camioneta']
    )
    totalMoto = await pool.query(
      'select total from otCompleta	where user_id =? and tipo =?',
      [req.user.id, 'Moto']
    )

    auto = 0
    camioneta = 0
    moto = 0

    for (let i = 0; i < totalAuto.length; i++) {
      auto = auto + totalAuto[i].total
    }

    for (let i = 0; i < totalCamioneta.length; i++) {
      camioneta = camioneta + totalCamioneta[i].total
    }

    for (let i = 0; i < totalMoto.length; i++) {
      moto = moto + totalMoto[i].total
    }

    totalTipos = {
      auto,
      camioneta,
      moto,
    }

    //---------------------------------ORDENES DE TRABAJO (Cantidad/Ingresos) ------------------------------------//

    otEnero = await pool.query(
      'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
      [req.user.id, '2020-01-01 00:00:00', '2020-01-31 00:00:00']
    )
    enero = 0
    for (let i = 0; i < otEnero.length; i++) {
      enero = enero + otEnero[i].total
    }

    otFebrero = await pool.query(
      'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
      [req.user.id, '2020-02-01 00:00:00', '2020-02-29 00:00:00']
    )
    febrero = 0
    for (let i = 0; i < otFebrero.length; i++) {
      febrero = febrero + otFebrero[i].total
    }

    otMarzo = await pool.query(
      'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
      [req.user.id, '2020-03-01 00:00:00', '2020-03-31 00:00:00']
    )
    marzo = 0
    for (let i = 0; i < otMarzo.length; i++) {
      marzo = marzo + otMarzo[i].total
    }

    otAbril = await pool.query(
      'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
      [req.user.id, '2020-04-01 00:00:00', '2020-04-30 00:00:00']
    )
    abril = 0
    for (let i = 0; i < otAbril.length; i++) {
      abril = abril + otAbril[i].total
    }

    otMayo = await pool.query(
      'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
      [req.user.id, '2020-05-01 00:00:00', '2020-05-30 00:00:00']
    )
    mayo = 0
    for (let i = 0; i < otMayo.length; i++) {
      mayo = mayo + otMayo[i].total
    }

    otJunio = await pool.query(
      'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
      [req.user.id, '2020-06-01 00:00:00', '2020-06-30 00:00:00']
    )
    junio = 0
    for (let i = 0; i < otJunio.length; i++) {
      junio = junio + otJunio[i].total
    }

    otJulio = await pool.query(
      'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
      [req.user.id, '2020-07-01 00:00:00', '2020-07-31 00:00:00']
    )
    julio = 0
    for (let i = 0; i < otJulio.length; i++) {
      julio = julio + otJulio[i].total
    }

    otAgosto = await pool.query(
      'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
      [req.user.id, '2020-08-01 00:00:00', '2020-08-30 00:00:00']
    )
    agosto = 0
    for (let i = 0; i < otAgosto.length; i++) {
      agosto = agosto + otAgosto[i].total
    }

    otSeptiembre = await pool.query(
      'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
      [req.user.id, '2020-09-01 00:00:00', '2020-09-30 00:00:00']
    )
    septiembre = 0
    for (let i = 0; i < otSeptiembre.length; i++) {
      septiembre = septiembre + otSeptiembre[i].total
    }

    otOctubre = await pool.query(
      'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
      [req.user.id, '2020-10-01 00:00:00', '2020-10-31 00:00:00']
    )
    octrubre = 0
    for (let i = 0; i < otOctubre.length; i++) {
      octrubre = octrubre + otOctubre[i].total
    }

    otNoviembre = await pool.query(
      'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
      [req.user.id, '2020-11-01 00:00:00', '2020-11-30 00:00:00']
    )
    noviembre = 0
    for (let i = 0; i < otNoviembre.length; i++) {
      noviembre = noviembre + otNoviembre[i].total
    }

    otDiciembre = await pool.query(
      'select total, fecha_recepcion from otCompleta where user_id = ? and fecha_recepcion BETWEEN ? AND ?',
      [req.user.id, '2020-11-01 00:00:00', '2020-11-31 00:00:00']
    )
    diciembre = 0
    for (let i = 0; i < otDiciembre.length; i++) {
      diciembre = diciembre + otDiciembre[i].total
    }

    otMeses = {
      enero: otEnero.length,
      totalEnero: enero,
      febrero: otFebrero.length,
      totalFebrero: febrero,
      marzo: otMarzo.length,
      totalMarzo: marzo,
      abril: otAbril.length,
      totalAbril: abril,
      mayo: otMayo.length,
      totalMayo: mayo,
      junio: otJunio.length,
      totalJunio: junio,
      julio: otJulio.length,
      totalJulio: julio,
      agosto: otAgosto.length,
      totalAgosto: agosto,
      septiembre: otSeptiembre.length,
      totalSeptiembre: septiembre,
      octrubre: otOctubre.length,
      totalOctubre: octrubre,
      noviembre: otNoviembre.length,
      totalNoviembre: noviembre,
      diciembre: otDiciembre.length,
      totalDiciembre: diciembre,
    }

    //-------------------------------CONSUMO PROMERDIO-------------------------------------------//

    promedioEnero = enero / otEnero.length
    promedioFebrero = febrero / otFebrero.length
    promedioMArzo = marzo / otMarzo.length
    promedioAbril = abril / otAbril.length
    promedioMayo = mayo / otMayo.length
    promedioJunio = junio / otJunio.length
    promedioJulio = julio / otJunio.length
    promedioAgosto = agosto / otAgosto.length
    promedioSeptiembre = septiembre / otSeptiembre.length
    promedioOctubre = octrubre / otOctubre.length
    promedioNoviembre = noviembre / otNoviembre.length
    promedioDiciembre = diciembre / otDiciembre.length

    promedioMes = {
      promedioEnero,
      promedioFebrero,
      promedioMArzo,
      promedioAbril,
      promedioMayo,
      promedioJunio,
      promedioJulio,
      promedioAgosto,
      promedioSeptiembre,
      promedioOctubre,
      promedioNoviembre,
      promedioDiciembre,
    }

    /*carwashEnero = await pool.query('select total from otCompleta	where user_id =? and categoria =?', [req.user.id, "Carwash & detailing"]);
carwashEneroProm = 0;     
	for(let i = 0; i< carwashEnero.length; i++) {
		carwashEneroProm = carwashEneroProm + carwashEnero[i].total;
	}
accesoriosEnero = await pool.query('select total from otCompleta	where user_id =? and  categoria =?', [req.user.id, "Venta de accesorios"]);
lubricentoEnero = await pool.query('select total from otCompleta	where user_id =? and  categoria =?', [req.user.id,"Lubricento"]);
mecanicaEnero = await pool.query('select total from otCompleta	where user_id =? and  categoria =?', [req.user.id,"Mecanica Automotriz"]);
repuestosEnero = await pool.query('select total from otCompleta	where user_id =? and  categoria =?', [req.user.id,"Venta de Repuestos"]);
otroEnero = await pool.query('select total from otCompleta	where user_id =? and  categoria =?', [req.user.id,"Otro"]); */

    //-----------------------COMO SUPO DE LA EMPRESA --------------------------------------//

    totalCarHelp = await pool.query(
      'select total from otCompleta	where user_id =? and conocio_carhelp =?',
      [req.user.id, 'CarHelp']
    )
    totalRedes = await pool.query(
      'select total from otCompleta	where user_id =? and conocio_carhelp =?',
      [req.user.id, 'Redes Sociales']
    )
    totalRecomendado = await pool.query(
      'select total from otCompleta	where user_id =? and conocio_carhelp =?',
      [req.user.id, 'Recomendado']
    )
    totalOtros = await pool.query(
      'select total from otCompleta	where user_id =? and conocio_carhelp =?',
      [req.user.id, 'Otros']
    )

    carhelp = totalCarHelp.length
    redes = totalRedes.length
    recomendados = totalRecomendado.length
    otros = totalOtros.length

    /* 
  
 carhelp = 0;
redes = 0;
recomendados = 0;
otros = 0; 
 
  for(let i = 0; i<totalCarHelp.length; i++) {
        carhelp = carhelp + totalCarHelp[i].total
    }
    
    for(let i = 0; i<totalRedes.length; i++) {
        redes = redes + totalRedes[i].total
    }
    
    for(let i = 0; i<totalRecomendado.length; i++) {
        recomendados = recomendados + totalRecomendado[i].total
    }
    
    for(let i = 0; i<totalOtros.length; i++) {
        otros = otros + totalOtros[i].total
    } */

    totalConocio = {
      carhelp,
      redes,
      recomendados,
      otros,
    }

    //----------------------- TOTAL ORDENES DE TRABAJO --------------------------------------//

    totalRecepcionados = await pool.query(
      'select estado from otCompleta where user_id =? and estado =?',
      [req.user.id, 'Recepcionados']
    )
    totalTrabajando = await pool.query(
      'select estado from otCompleta where user_id =? and estado =?',
      [req.user.id, 'Trabajando']
    )
    totalListos = await pool.query(
      'select estado from otCompleta where user_id =? and estado =?',
      [req.user.id, 'Listos']
    )
    totalEntregados = await pool.query(
      'select estado from otCompleta where user_id =? and estado =?',
      [req.user.id, 'Entregados']
    )

    recepcionados = totalRecepcionados.length
    trabajando = totalTrabajando.length
    listos = totalListos.length
    entregados = totalEntregados.length

    totalOT = {
      recepcionados,
      trabajando,
      listos,
      entregados,
    }

    console.log(totalOT)

    //----------------------- NUEVAS ORDENES DE TRABAJO --------------------------------------//

    otAuto = await pool.query(
      'select estado from otCompleta where user_id =? and estado =? and tipo=?',
      [req.user.id, 'Recepcionados', 'Auto']
    )
    otMoto = await pool.query(
      'select estado from otCompleta where user_id =? and estado =? and tipo=?',
      [req.user.id, 'Recepcionados', 'Moto']
    )
    otCamioneta = await pool.query(
      'select estado from otCompleta where user_id =? and estado =? and tipo=?',
      [req.user.id, 'Recepcionados', 'Camioneta']
    )

    otAutoTotal = otAuto.length
    otMotoTotal = otMoto.length
    otCamionetaTotal = otCamioneta.length

    totalOTTipo = {
      otAutoTotal,
      otMotoTotal,
      otCamionetaTotal,
    }

    //-----------------------TIPO DE CLIENTES ----------------------------------//

    totalNuevos = await pool.query(
      'select tipo_cliente from tallerClienteCompleta	where user_id =? and tipo_cliente =?',
      [req.user.id, 'Nuevo']
    )
    totalRecurrentes = await pool.query(
      'select tipo_cliente from tallerClienteCompleta	where user_id =? and  tipo_cliente =?',
      [req.user.id, 'Recurrente']
    )

    nuevos = totalNuevos.length
    recurrentes = totalRecurrentes.length

    totalClientes = {
      nuevos,
      recurrentes,
    }

    //------------------INFORMACION DE LOS NUEVOS CLIENTES TIPO DE AUTO --------------------------//

    nuevosAutos = await pool.query(
      'select tipo from otCompleta where user_id = ? and tipo = ? and tipo_cliente = ?',
      [req.user.id, 'Auto', 'Nuevo']
    )
    nuevosMotos = await pool.query(
      'select tipo from otCompleta where user_id = ? and tipo = ? and tipo_cliente = ?',
      [req.user.id, 'Moto', 'Nuevo']
    )
    nuevosCamionetas = await pool.query(
      'select tipo from otCompleta where user_id = ? and tipo = ? and tipo_cliente = ?',
      [req.user.id, 'Camioneta', 'Nuevo']
    )

    tiposNuevos = {
      autos: nuevosAutos.length,
      motos: nuevosMotos.length,
      camionetas: nuevosCamionetas.length,
    }

    //--------------------------INFORMACION DE LOS NUEVOS CLIENTES INGRESOS POR CATEGORIAS -------------------//

    nuevoCarwash = await pool.query(
      'select total from nuevoTotal	where user_id =? and categoria =?',
      [req.user.id, 'Carwash & detailing']
    )
    nuevoAccesorios = await pool.query(
      'select total from nuevoTotal	where user_id =? and  categoria =?',
      [req.user.id, 'Venta de accesorios']
    )
    nuevoLubricento = await pool.query(
      'select total from nuevoTotal	where user_id =? and  categoria =?',
      [req.user.id, 'Lubricento']
    )
    nuevoMecanica = await pool.query(
      'select total from nuevoTotal	where user_id =? and  categoria =?',
      [req.user.id, 'Mecanica Automotriz']
    )
    nuevoRepuestos = await pool.query(
      'select total from nuevoTotal	where user_id =? and  categoria =?',
      [req.user.id, 'Venta de Repuestos']
    )
    nuevoOtro = await pool.query(
      'select total from nuevoTotal	where user_id =? and  categoria =?',
      [req.user.id, 'Otro']
    )

    ncarwash = 0
    naccesorios = 0
    nlubricento = 0
    nmecanica = 0
    nrepuestos = 0
    notro = 0

    for (let i = 0; i < nuevoCarwash.length; i++) {
      ncarwash = ncarwash + nuevoCarwash[i].total
    }

    for (let i = 0; i < nuevoAccesorios.length; i++) {
      naccesorios = naccesorios + nuevoAccesorios[i].total
    }

    for (let i = 0; i < nuevoLubricento.length; i++) {
      nlubricento = nlubricento + nuevoLubricento[i].total
    }

    for (let i = 0; i < nuevoMecanica.length; i++) {
      nmecanica = nmecanica + nuevoMecanica[i].total
    }

    for (let i = 0; i < nuevoRepuestos.length; i++) {
      nrepuestos = nrepuestos + nuevoRepuestos[i].total
    }

    for (let i = 0; i < nuevoOtro.length; i++) {
      notro = notro + nuevoOtro[i].total
    }

    nuevoCategorias = {
      ncarwash,
      naccesorios,
      nrepuestos,
      nmecanica,
      nlubricento,
      notro,
    }

    nombre = await pool.query('SELECT razon_social FROM users WHERE id =?', [
      req.user.id,
    ])
    nombre_local = nombre[0].razon_social
    faltan = await Dfaltan(req)

    res.render('estadisticas', {
      nombre_local,
      totalOTTipo,
      localesPremium,
      locales,
      faltan,
      id_prueba,
      totalCategorias,
      totalTipos,
      totalConocio,
      totalOT,
      totalClientes,
      tiposNuevos,
      nuevoCategorias,
      otMeses,
      promedioMes,
    })
  }
})

//***********  ESTADO DE CUENTA  ***************** */

router.get('/estado-de-cuenta', isLoggedIn, isCliente, async (req, res) => {
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)
  const locales = await pool.query('SELECT * FROM localPlan WHERE user_id =?', [
    req.user.id,
  ])
  console.log(locales)
  res.render('estadoCuenta', { nombre_local, faltan, id_prueba, locales })
})

router.post('/estado-de-cuenta', isLoggedIn, isCliente, (req, res) => {
  res.redirect('/estado-de-cuenta')
})

router.get(
  '/suscripcion/activar/:id',
  isLoggedIn,
  isCliente,
  async (req, res) => {
    const id_local = req.params.id
    const suscripcion = await pool.query(
      'SELECT * from userSuscripcion WHERE id_local_pagado =?',
      [id_local]
    )
    const local = await pool.query('SELECT * from locales WHERE id =?', [
      id_local,
    ])
    const nombre = await pool.query(
      'SELECT razon_social FROM users WHERE id =?',
      [req.user.id]
    )
    const nombre_local = nombre[0].razon_social
    const faltan = await Dfaltan(req)
    console.log(suscripcion)

    res.render('planes', {
      nombre_local,
      faltan,
      suscripcion: suscripcion[0],
      local: local[0],
      id_prueba,
    })
  }
)

router.post(
  '/suscripcion/activar/:id',
  isLoggedIn,
  isCliente,
  async (req, res, next) => {
    const { id, email, plan, local_id } = req.body
    const local = await pool.query(
      'SELECT * from locales WHERE id =? and user_id =?',
      [local_id, req.user.id]
    )
    const direccion = local[0].direccion
    const distrito = local[0].distrito
    const usuario = await pool.query('SELECT * from users WHERE id =?', [
      req.user.id,
    ])
    var cargo = false

    //ENVIO DE NOTIFICACION

    console.log('Creating transport...')
    var transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: '465',
      secure: true, // true for 465, false for other ports
      auth: {
        type: 'login',
        user: 'talleres.online.peru@gmail.com',
        pass: 'teamcarhelpperu2020',
      },
    })

    var mailOptions = {
      from: 'Talleres Online',
      to: email,
      subject: 'Suscripcion Talleres Online',
      html: ` 
	  <div> 
	  <h2>TU REGISTRO HA SIDO EXITOSO</h2> 
	  <br> 
	  <h5>Ha suscrito de manera exitosa su local, ahora puedes comenzar a disfrutar las funcionalidades que Talleres Online le ofrece </h5> 
	  </div> 
   `,
    }

    if (plan == 'Estandar') {
      culqi
        .createCharge({
          amount: '69000',
          currency_code: 'PEN',
          email: email,
          source_id: id,
          capture: false,
        })
        .then(async function () {
          console.log('lo estamos logrando', res.statusCode)
          req.flash('Su local ha sido activado')
          cargo = true
          const date = new Date()
          const date2 = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          )
          const date3 = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          )
          date3.setDate(date3.getDate() + 30)

          const newSuscripcion = {
            id_user: req.user.id,
            tipo_suscripcion: plan,
            fecha_pago: date2,
            fecha_pago_siguiente: date3,
            monto_pago: 69.0,
            suscrito: 'Si',
            id_local_pagado: local_id,
          }

          await pool.query(
            'UPDATE userSuscripcion set? WHERE id_local_pagado =?',
            [newSuscripcion, local_id]
          )
          const idSuscrip = await pool.query(
            'SELECT id FROM userSuscripcion WHERE id_local_pagado =?',
            [local_id]
          )

          const siAccesos = await pool.query(
            'SELECT * from trabajadores WHERE id_localT =?',
            [local_id]
          )
          accesos = 5
          if (siAccesos.length > 0 && siAccesos.length <= 5) {
            accesos = 5 - accesos.length
          } else if (siAccesos.length > 5) {
            accesos = 0
          } else {
            accesos = 5
          }
          const newPlan = {
            accesos: accesos,
            estadisticas: true,
            ots: true,
            proformas: true,
            facturas: false,
            idSuscrip: idSuscrip[0].id,
            local_id,
          }

          await pool.query('INSERT into planSuscripcion set?', [newPlan])

          const activo = {
            activo: 'true',
          }
          await pool.query('UPDATE locales set? WHERE id =?', [
            activo,
            local_id,
          ])

          transporter.sendMail(mailOptions, function (error, info) {
            console.log('senMail returned!')
            if (error) {
              console.log('ERROR!!!!!!', error)
            } else {
              console.log('Email sent: ' + info.response)
            }
          })

          res.redirect(`/local/${local_id}`)
        })
        .catch(function (err) {
          req.flash('message', err)
          console.log('err', err)
          res.redirect('/suscripcion/activar/' + local_id)
        })
    } else if (plan == 'Premium') {
      culqi
        .createCharge({
          amount: '10000',
          currency_code: 'PEN',
          email: email,
          source_id: id,
          capture: false,
        })
        .then(async function (response2) {
          code = response2.statusCode
          cargo = true
          req.flash('success', 'Su local ha sido activado exitosamente')
          const date = new Date()
          const date2 = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          )
          const date3 = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          )
          date3.setDate(date3.getDate() + 30)

          const newSuscripcion = {
            id_user: req.user.id,
            tipo_suscripcion: plan,
            fecha_pago: date2,
            fecha_pago_siguiente: date3,
            monto_pago: 99.0,
            suscrito: 'Si',
            id_local_pagado: local_id,
          }

          await pool.query(
            'UPDATE userSuscripcion set? WHERE id_local_pagado =?',
            [newSuscripcion, local_id]
          )
          const idSuscrip = await pool.query(
            'SELECT id FROM userSuscripcion WHERE id_local_pagado =?',
            [local_id]
          )

          const newPlan = {
            accesos: 100000,
            estadisticas: true,
            ots: true,
            proformas: true,
            facturas: true,
            idSuscrip: idSuscrip[0].id,
            local_id,
          }

          await pool.query('INSERT into planSuscripcion set?', [newPlan])
          const activo = {
            activo: 'true',
          }
          await pool.query('UPDATE locales SET ? WHERE id =?', [
            activo,
            local_id,
          ])
          res.redirect(`/local/${local_id}`)
        })
        .catch(function (err) {
          req.flash('message', err)
          console.log('err', err)
          res.redirect('/suscripcion/activar/' + local_id)
        })
    }

    /*culqi.createCustomer({
		'first_name':   'Juan',
		'last_name':    'Prueba',
		'email':        'prueba2@godoy.com',
		'address':      'La Calle De Juan 312',
		'address_city': 'Ciudad de Juanes',
		'country_code': 'PE',
		'phone_number': '1345678'
	}).then(function (response2) {
        console.log('statusCode2', response2.statusCode);

	}).catch(function (err) {
		console.log('err', err);

	});*/
  }
)

router.get(
  '/suscripcion/eliminar/:id',
  isLoggedIn,
  isCliente,
  async (req, res) => {
    const id = req.params.id
    await pool.query('DELETE from planSuscripcion WHERE local_id =?', [id])

    const suscripcion = {
      suscrito: 'No',
      tipo_suscripcion: 'N/A',
    }

    await pool.query('UPDATE userSuscripcion set ? WHERE id_local_pagado =?', [
      suscripcion,
      id,
    ])

    const inactivo = {
      activo: 'false',
    }

    await pool.query('UPDATE locales set ? WHERE id =?', [inactivo, id])

    req.flash('success', 'Ha eliminado la suscripción de su Local')
    res.redirect('/estado-de-cuenta')
  }
)

router.post(
  '/suscripcion/cambiar/:id',
  isLoggedIn,
  isCliente,
  async (req, res) => {
    const { id, email, plan, local_id } = req.body
    console.log(req.body)
    const local = await pool.query(
      'SELECT * from locales WHERE id =? and user_id =?',
      [local_id, req.user.id]
    )
    const direccion = local[0].direccion
    const distrito = local[0].distrito
    const usuario = await pool.query('SELECT * from users WHERE id =?', [
      req.user.id,
    ])

    culqi
      .createCharge({
        amount: '10000',
        currency_code: 'PEN',
        email: email,
        source_id: id,
        capture: false,
      })
      .then(async function (response2) {
        code = response2.statusCode
        cargo = true
        req.flash('success', 'Su local ha sido activado exitosamente')
        const date = new Date()
        const date2 = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        )
        const date3 = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        )
        date3.setDate(date3.getDate() + 30)

        const newSuscripcion = {
          id_user: req.user.id,
          tipo_suscripcion: plan,
          fecha_pago: date2,
          fecha_pago_siguiente: date3,
          monto_pago: 99.0,
          suscrito: 'Si',
          id_local_pagado: local_id,
        }

        await pool.query(
          'UPDATE userSuscripcion set? WHERE id_local_pagado =?',
          [newSuscripcion, local_id]
        )
        const idSuscrip = await pool.query(
          'SELECT id FROM userSuscripcion WHERE id_local_pagado =?',
          [local_id]
        )

        const newPlan = {
          accesos: 100000,
          estadisticas: true,
          ots: true,
          proformas: true,
          facturas: true,
          idSuscrip: idSuscrip[0].id,
          local_id,
        }

        await pool.query('UPDATE planSuscripcion set? WHERE local_id =?', [
          newPlan,
          local_id,
        ])

        res.redirect('/estado-de-cuenta')
      })
      .catch(function (err) {
        req.flash('message', err)
        console.log('err', err)
      })
  }
)

router.post(
  '/suscripcion/pago/:id',
  isLoggedIn,
  isCliente,
  async (req, res, next) => {
    const { id, email, plan, local_id } = req.body
    const local = await pool.query(
      'SELECT * from locales WHERE id =? and user_id =?',
      [local_id, req.user.id]
    )
    const direccion = local[0].direccion
    const distrito = local[0].distrito
    const usuario = await pool.query('SELECT * from users WHERE id =?', [
      req.user.id,
    ])
    var cargo = false

    if (plan == 'Estandar') {
      culqi
        .createCharge({
          amount: '69000',
          currency_code: 'PEN',
          email: email,
          source_id: id,
          capture: false,
        })
        .then(async function () {
          console.log('lo estamos logrando', res.statusCode)
          req.flash('Su local ha sido activado')
          cargo = true
          const date = new Date()
          const date2 = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          )
          const date3 = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          )
          date3.setDate(date3.getDate() + 30)

          const newSuscripcion = {
            id_user: req.user.id,
            tipo_suscripcion: plan,
            fecha_pago: date2,
            fecha_pago_siguiente: date3,
            monto_pago: 69.0,
            suscrito: 'Si',
            id_local_pagado: local_id,
          }

          await pool.query(
            'UPDATE userSuscripcion set? WHERE id_local_pagado =?',
            [newSuscripcion, local_id]
          )
          const idSuscrip = await pool.query(
            'SELECT id FROM userSuscripcion WHERE id_local_pagado =?',
            [local_id]
          )
          console.log('idSuscrip:' + idSuscrip)

          const newPlan = {
            accesos: 5,
            estadisticas: true,
            ots: true,
            proformas: true,
            facturas: false,
            idSuscrip: idSuscrip[0].id,
            local_id,
          }

          await pool.query('UPDATE planSuscripcion set? WHERE idSuscrip =?', [
            newPlan,
            idSuscrip[0].id,
          ])

          const activo = {
            activo: 'true',
          }
          await pool.query('UPDATE locales set? WHERE id =?', [
            activo,
            local_id,
          ])
          res.redirect(`/local/${local_id}`)
        })
        .catch(function (err) {
          req.flash('message', err)
          console.log('err', err)
        })
    } else if (plan == 'Premium') {
      culqi
        .createCharge({
          amount: '10000',
          currency_code: 'PEN',
          email: email,
          source_id: id,
          capture: false,
        })
        .then(async function (response2) {
          code = response2.statusCode
          cargo = true
          req.flash('success', 'Su local ha sido activado exitosamente')
          const date = new Date()
          const date2 = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          )
          const date3 = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          )
          date3.setDate(date3.getDate() + 30)

          const newSuscripcion = {
            id_user: req.user.id,
            tipo_suscripcion: plan,
            fecha_pago: date2,
            fecha_pago_siguiente: date3,
            monto_pago: 99.0,
            suscrito: 'Si',
            id_local_pagado: local_id,
          }

          await pool.query(
            'UPDATE userSuscripcion set? WHERE id_local_pagado =?',
            [newSuscripcion, local_id]
          )
          const idSuscrip = await pool.query(
            'SELECT id FROM userSuscripcion WHERE id_local_pagado =?',
            [local_id]
          )

          const newPlan = {
            accesos: 100000,
            estadisticas: true,
            ots: true,
            proformas: true,
            facturas: true,
            idSuscrip: idSuscrip[0].id,
            local_id,
          }

          await pool.query('UPDATE planSuscripcion set? WHERE idSuscrip =?', [
            newPlan,
            idSuscrip[0].id,
          ])
          const activo = {
            activo: 'true',
          }
          await pool.query('UPDATE locales SET ? WHERE id =?', [
            activo,
            local_id,
          ])
          res.redirect(`/local/${local_id}`)
        })
        .catch(function (err) {
          req.flash('message', err)
          console.log('err', err)
          res.redirect('/suscripcion/activar/' + local_id)
        })
    }
  }
)

//************  FACTURACION   ************ */

router.get('/facturacion', isLoggedIn, isCliente, async (req, res) => {
  var facturaCompleta = await pool.query(
    'SELECT * FROM facturaCompleta WHERE user_id=?',
    req.user.id
  )
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)

  //------------------FILTROS----------------//

  if (req.query.placa || req.query.dia_inicio || req.query.dia_fin) {
    const placa = req.query.placa
    var dia_inicio = req.query.dia_inicio
    var dia_fin = req.query.dia_fin
    const date = new Date()
    var currentDay = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    )

    if (dia_fin == '') {
      dia_fin = currentDay
    }

    facturaCompleta = await pool.query(
      'SELECT * from facturaCompleta WHERE placa =? OR numero_factura =? AND fecha_emicion BETWEEN ? AND ? AND user_id=?',
      [placa, placa, dia_inicio, dia_fin, req.user.id]
    )
    res.render('facturacion/facturacion', {
      facturaCompleta,
      faltan,
      nombre_local,
      id_prueba,
    })
  } else {
    res.render('facturacion/facturacion', {
      facturaCompleta,
      faltan,
      nombre_local,
      id_prueba,
    })
  }
})

router.get('/nuevaFactura', isLoggedIn, isCliente, async (req, res) => {
  const locales = await pool.query(
    'SELECT * FROM localPlan WHERE user_id =? AND activo =? AND facturas =?',
    [req.user.id, 'true', '1']
  )
  const ot = await pool.query(
    'SELECT * FROM otCompleta WHERE facturada =? AND user_id =?',
    ['False', req.user.id]
  )
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)
  const totalLocales = locales.length
  res.render('facturacion/nuevaFactura', {
    locales,
    ot,
    faltan,
    totalLocales,
    nombre_local,
    id_prueba,
  })
})

router.get(
  '/facturacion/anular/:id',
  isLoggedIn,
  isCliente,
  async (req, res) => {
    const estado = {
      estado: 'Anulada',
    }
    await pool.query('UPDATE facturas SET ? WHERE id =?', [
      estado,
      req.params.id,
    ])
    res.redirect('/facturacion')
  }
)

router.post('/nuevaFactura', isLoggedIn, isCliente, async (req, res) => {
  const { tipo, ruc, numero, idLocal } = req.body

  const locales = await pool.query(
    'SELECT * FROM locales WHERE user_id AND activo=?',
    [req.user.id, 'true']
  )

  const { id } = req.body
  const idOT = id
  var datetime1 = new Date()
  var datetime = new Date(
    datetime1.getFullYear(),
    datetime1.getMonth(),
    datetime1.getDate()
  )

  const newFactura = {
    ruc_cliente: ruc,
    id_ot: idOT,
    numero_factura: numero,
    fecha_emicion: datetime,
    tipo,
  }

  const newOT = {
    facturada: 'True',
  }

  await pool.query('UPDATE ot set ? WHERE id = ?', [newOT, idOT])
  await pool.query('INSERT INTO facturas set ?', [newFactura]) //agregar datos a la db

  res.redirect('facturacion')
})

//*******    MIS   CLIENTES   ******* */

router.get('/mis-clientes', isLoggedIn, isCliente, async (req, res) => {
  const locales = await pool.query(
    'SELECT * FROM locales WHERE user_id =?',
    req.user.id
  )

  const clientes = await pool.query(
    'SELECT * FROM tallerClienteCompleta WHERE user_id =?',
    req.user.id
  )
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)

  res.render('misclientes', {
    locales,
    clientes,
    faltan,
    nombre_local,
    id_prueba,
  })
})

//********** DASHBOARD DE INICIO  ************ */

router.get('/dashboard-inicio', isLoggedIn, isCliente, async (req, res) => {
  const locales = await pool.query(
    'SELECT * FROM locales WHERE user_id=?',
    req.user.id
  )
  var prueba = 'false'
  if (locales.length) {
    for (var l = 0; l < locales.length; l++) {
      var tipo_suscripcion = await pool.query(
        'SELECT tipo_suscripcion FROM userSuscripcion WHERE id_local_pagado =?',
        [locales[l].id]
      )
      if (tipo_suscripcion[0]) {
        if (tipo_suscripcion[0].tipo_suscripcion == 'Prueba') prueba = 'true'
      }
    }
  }

  var datetime1 = new Date()
  var datetime = new Date(
    datetime1.getFullYear(),
    datetime1.getMonth(),
    datetime1.getDate()
  ) //hoy
  var datetime2 = new Date(
    datetime1.getFullYear(),
    datetime1.getMonth(),
    datetime1.getDate()
  )
  var datetime3 = new Date(
    datetime1.getFullYear(),
    datetime1.getMonth(),
    datetime1.getDate()
  )

  datetime2.setDate(datetime2.getDate() - 8) //semana pasadada
  datetime3.setDate(datetime2.getDate() - 1) //ayer

  const ot = await pool.query(
    'SELECT * from ot WHERE fecha_recepcion =? AND user_empresa=?',
    [datetime, req.user.id]
  )
  const clienteNuevosHoy = await pool.query(
    'SELECT * from otCompleta WHERE fecha_recepcion =? AND user_id=? AND tipo_cliente =?',
    [datetime, req.user.id, 'Nuevo']
  )
  const clienteNuevosAyer = await pool.query(
    'SELECT * from otCompleta WHERE fecha_recepcion =? AND user_id=? AND tipo_cliente =?',
    [datetime3, req.user.id, 'Nuevo']
  )

  const clienteRecurrentesHoy = await pool.query(
    'SELECT * from otCompleta WHERE fecha_recepcion =? AND user_id=? AND tipo_cliente =?',
    [datetime, req.user.id, 'Recurrente']
  )
  const clienteRecurrentesAyer = await pool.query(
    'SELECT * from otCompleta WHERE fecha_recepcion =? AND user_id=? AND tipo_cliente =?',
    [datetime3, req.user.id, 'Recurrente']
  )

  const totalNuevosHoy = clienteNuevosHoy.length
  const totalNuevosAyer = clienteNuevosAyer.length

  const totalRecurrentesHoy = clienteRecurrentesHoy.length
  const totalRecurrentesAyer = clienteRecurrentesAyer.length

  var total = 0
  var clientes = await pool.query(
    'SELECT * from tallerClienteCompleta WHERE user_id =? AND ultima_visita =?',
    [req.user.id, datetime]
  )
  var clientesTotal = clientes.length
  var proforma = await pool.query(
    'SELECT * from proformas WHERE fecha_emicion =? AND id_user =?',
    [datetime, req.user.id]
  )
  var proformaUltimasemana = await pool.query(
    'SELECT * from proformas WHERE fecha_emicion BETWEEN ? AND ? AND id_user =? limit 5',
    [datetime2, datetime, req.user.id]
  )

  const recepcionados = await pool.query(
    'SELECT * from otCompleta WHERE estado =? AND fecha_recepcion =? AND user_id=?',
    ['Recepcionados', datetime, req.user.id]
  )
  const trabajando = await pool.query(
    'SELECT * from otCompleta WHERE estado =? AND fecha_recepcion =? AND user_id=?',
    ['Trabajando', datetime, req.user.id]
  )
  const listos = await pool.query(
    'SELECT * from otCompleta WHERE estado =? AND fecha_recepcion =? AND user_id=?',
    ['Listos', datetime, req.user.id]
  )
  const entregados = await pool.query(
    'SELECT * from otCompleta WHERE estado =? AND fecha_recepcion =? AND user_id=?',
    ['Entregados', datetime, req.user.id]
  )

  const carwhashHoy = await pool.query(
    'SELECT * from otCompleta WHERE categoria =? AND fecha_recepcion =? AND user_id=?',
    ['Carwash & detailing', datetime, req.user.id]
  )
  const accesoriosHoy = await pool.query(
    'SELECT * from otCompleta WHERE categoria =? AND fecha_recepcion =? AND user_id=?',
    ['Venta de accesorios', datetime, req.user.id]
  )
  const lubricentroHoy = await pool.query(
    'SELECT * from otCompleta WHERE categoria =? AND fecha_recepcion =? AND user_id=?',
    ['Lubricentro', datetime, req.user.id]
  )
  const mecanicaHoy = await pool.query(
    'SELECT * from otCompleta WHERE categoria =? AND fecha_recepcion =? AND user_id=?',
    ['Mecanica Automotriz', datetime, req.user.id]
  )
  const repuestosHoy = await pool.query(
    'SELECT * from otCompleta WHERE categoria =? AND fecha_recepcion =? AND user_id=?',
    ['Venta de Repuestos', datetime, req.user.id]
  )
  const otroHoy = await pool.query(
    'SELECT * from otCompleta WHERE categoria =? AND fecha_recepcion =? AND user_id=?',
    ['Otro', datetime, req.user.id]
  )

  const carwhash = await pool.query(
    'SELECT * from otCompleta WHERE categoria =?  AND user_id=? ORDER BY fecha_recepcion DESC',
    ['Carwash & detailing', req.user.id]
  )
  const accesorios = await pool.query(
    'SELECT * from otCompleta WHERE categoria =?  AND user_id=?  ORDER BY fecha_recepcion DESC',
    ['Venta de accesorios', req.user.id]
  )
  const lubricentro = await pool.query(
    'SELECT * from otCompleta WHERE categoria =?  AND user_id=?  ORDER BY fecha_recepcion DESC',
    ['Lubricentro', req.user.id]
  )
  const mecanica = await pool.query(
    'SELECT * from otCompleta WHERE categoria =?  AND user_id=?  ORDER BY fecha_recepcion DESC',
    ['Mecanica Automotriz', req.user.id]
  )
  const repuestos = await pool.query(
    'SELECT * from otCompleta WHERE categoria =? AND  user_id=?  ORDER BY fecha_recepcion DESC',
    ['Venta de Repuestos', req.user.id]
  )
  const otro = await pool.query(
    'SELECT * from otCompleta WHERE categoria =? AND  user_id=?  ORDER BY fecha_recepcion DESC',
    ['Otro', req.user.id]
  )

  const totalCarwash = carwhash.length
  const totalAccesorios = accesorios.length
  const totalLubricento = lubricentro.length
  const totalMecanica = mecanica.length
  const totalRepuestos = repuestos.length
  const totalOtro = otro.length

  var ticketCar = 0
  var promedioCarwash = 0
  var clienteCarwhash = ''
  if (carwhash.length > 0) {
    for (c = 0; c < carwhash.length; c++) {
      ticketCar = carwhash[c].total + ticketCar
    }
    promedioCarwash = ticketCar / totalCarwash
    clienteCarwhash = carwhash[0].nombre
  }

  var ticketAccesorios = 0
  var promedioAccesorios = 0
  var clienteAccesorios = ''

  if (accesorios.length > 0) {
    for (a = 0; a < accesorios.length; a++) {
      ticketAccesorios = accesorios[a].total + ticketAccesorios
    }
    promedioAccesorios = ticketAccesorios / totalAccesorios
    clienteAccesorios = accesorios[0].nombre
  }

  var ticketLubricento = 0
  var promedioLubricento = 0
  var clienteLubricento = ''

  if (lubricentro.length > 0) {
    for (a = 0; a < lubricentro.length; a++) {
      ticketLubricento = lubricentro[a].total + ticketLubricento
    }
    promedioLubricento = ticketLubricento / totalLubricento
    clienteLubricento = lubricentro[0].nombre
  }

  var ticketMecanica = 0
  var promedioMecanica = 0
  var clienteMecanica = ''

  if (mecanica.length > 0) {
    for (a = 0; a < mecanica.length; a++) {
      ticketMecanica = mecanica[a].total + ticketMecanica
    }
    promedioMecanica = ticketMecanica / totalMecanica
    clienteMecanica = mecanica[0].nombre
  }

  var ticketRepuestos = 0
  var promedioRepuestos = 0
  var clienteRepuestos = ''

  if (repuestos.length > 0) {
    for (a = 0; a < repuestos.length; a++) {
      ticketRepuestos = repuestos[a].total + ticketRepuestos
    }
    promedioRepuestos = ticketRepuestos / totalRepuestos
    clienteRepuestos = repuestos[0].nombre
  }

  const HoycarWash = carwhashHoy.length
  const HoyAccesorios = accesoriosHoy.length
  const HoyLubricento = lubricentroHoy.length
  const HoyMecanica = mecanicaHoy.length
  const HoyRepuestos = repuestosHoy.length
  const HoyOtro = otroHoy.length

  const totalR = recepcionados.length
  const totalT = trabajando.length
  const totalL = listos.length
  const totalE = entregados.length

  var totalpro = proforma.length

  if (ot.length > 0) {
    for (var i = 0; i < ot.length; i++) {
      total = total + ot[i].total
    }
  }

  var ticket = total / ot.length

  const totalListos = listos.length

  const clientesDestacados = await pool.query(
    'SELECT * from tallerClienteCompleta WHERE user_id =? AND tipo_cliente =? ORDER BY ultima_visita limit 5',
    [req.user.id, 'Recurrente']
  )
  const faltan = await Dfaltan(req)

  const fullname = await pool.query('SELECT fullname FROM users WHERE id =?', [
    req.user.id,
  ])

  res.render('dashboard', {
    total,
    fullname: fullname[0],
    prueba,
    totalNuevosHoy,
    totalNuevosAyer,
    totalRecurrentesHoy,
    totalRecurrentesAyer,
    ticket,
    clienteCarwhash,
    clienteAccesorios,
    clienteLubricento,
    clienteMecanica,
    clienteRepuestos,
    promedioCarwash,
    promedioAccesorios,
    promedioLubricento,
    promedioMecanica,
    promedioRepuestos,
    HoycarWash,
    HoyAccesorios,
    HoyLubricento,
    HoyMecanica,
    HoyRepuestos,
    HoyOtro,
    totalCarwash,
    totalAccesorios,
    totalRepuestos,
    totalLubricento,
    totalMecanica,
    totalOtro,
    clientesTotal,
    faltan,
    totalpro,
    id_prueba,
    totalListos,
    totalR,
    totalT,
    totalL,
    totalE,
    proformaUltimasemana,
    clientesDestacados,
  })
})

//*********  PROFORMAS   ******* */

router.get('/proformas', isLoggedIn, isCliente, async (req, res) => {
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const locales = await pool.query(
    'SELECT * from locales WHERE user_id =? AND activo=?',
    [req.user.id, 'true']
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)

  res.render('proformas', { locales, faltan, nombre_local, id_prueba })
})

router.get('/proformas/delete/:id', isLoggedIn, isCliente, async (req, res) => {
  var id = req.params.id
  console.log('id:' + id)
  await pool.query('DELETE FROM proformaImportes WHERE id_proforma = ?', [id])
  await pool.query('DELETE FROM proformas WHERE id = ?', [id])
  fs.unlink(`src/Historiales/Proforma ${id}.pdf`, function (err) {
    if (err) throw err
    console.log('file deleted')
  })
  req.flash('success', 'Proforma Eliminada')
  res.redirect('/historial-proformas')
})

router.get(
  '/proformas/descargar/:id',
  isLoggedIn,
  isCliente,
  async (req, res) => {
    const id = req.params.id
    res.download(`src/Historiales/Proforma ${id}.pdf`)
  }
)

router.get('/detallesProforma/:id', isLoggedIn, isCliente, async (req, res) => {
  const locales = await pool.query('SELECT * from locales WHERE user_id =?', [
    req.user.id,
  ])
  const otCompleta = await pool.query(
    'SELECT * FROM otCompleta WHERE otid =?',
    [req.params.id]
  )
  const importes = await pool.query('SELECT * FROM otImportes WHERE id_ot =?', [
    req.params.id,
  ])
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)
  var proformaCompleta = await pool.query(
    'SELECT * from proformaCompleta WHERE  proformaid=?',
    [req.params.id]
  )

  res.render('detallesProforma.hbs', {
    nombre_local,
    proformaCompleta: proformaCompleta[0],
    faltan,
    id_prueba,
  })
})

router.post('/proformas', isLoggedIn, isCliente, async (req, res) => {
  const {
    tipoCarro,
    placa,
    marcaCarro,
    modeloCarro,
    año,
    km,
    Kilometraje,
    nombreCliente,
    rucCliente,
    correoCliente,
    tlfCliente,
    distritoCliente,
    idLocal,
    categoria,
    detalle,
    importe,
    subtotal,
    iva,
    total,
  } = req.body

  var datetime1 = new Date()
  var datetime = new Date(
    datetime1.getFullYear(),
    datetime1.getMonth(),
    datetime1.getDate()
  )

  const newProforma = {
    tipoCarro,
    placa,
    marca: marcaCarro,
    modelo: modeloCarro,
    año,
    kilometraje: Kilometraje,
    nombre: nombreCliente,
    RUC: rucCliente,
    correo: correoCliente,
    telefono: tlfCliente,
    distrito: distritoCliente,
    id_local: idLocal,
    categoria,
    fecha_emicion: datetime,
    subtotal,
    iva,
    id_user: req.user.id,
    total,
  }

  const idProforma = await pool.query('INSERT INTO proformas set ?', [
    newProforma,
  ])

  var newImporte = {}

  for (var i = 0; i < detalle.length; i++) {
    newImporte = {
      id_proforma: idProforma.insertId,
      importe: importe[i],
      descripcion: detalle[i],
    }
    await pool.query('INSERT INTO proformaImportes set ?', [newImporte])
  }

  var proformaCompleta = await pool.query(
    'SELECT * from proformaCompleta WHERE  proformaid=?',
    [idProforma.insertId]
  )
  const idPro = idProforma.insertId

  var html = fs.readFileSync('src/plantillaProforma.html', 'utf8')
  var options = {
    format: 'A3',
    orientation: 'portrait',
    base: 'src/public',
    border: '10mm',
  }

  var document = {
    type: 'file', // 'file' or 'buffer'
    template: html,
    context: {
      proformaCompleta: proformaCompleta[0],
    },
    path: `src/Historiales/Proforma ${idProforma.insertId}.pdf`, // it is not required if type is buffer
  }

  pdf
    .create(document, options)
    .then((res) => {
      console.log(res)
    })
    .catch((error) => {
      console.error(error)
    })

  req.flash('sucess', 'Nueva Proforma creada')
  res.redirect('historial-proformas')
})

router.get('/historial-proformas', isLoggedIn, isCliente, async (req, res) => {
  const locales = await pool.query(
    'SELECT * FROM locales WHERE user_id=?',
    req.user.id
  )
  var proformas = await pool.query(
    'SELECT * from proformaCompleta WHERE  user_id=?',
    req.user.id
  )
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)

  //------------------FILTROS----------------//

  if (req.query.placa || req.query.dia_inicio || req.query.dia_fin) {
    const placa = req.query.placa
    var dia_inicio = req.query.dia_inicio
    var dia_fin = req.query.dia_fin
    const date = new Date()
    var currentDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )

    if (dia_fin == '') {
      dia_fin = currentDay
    }

    proformas = await pool.query(
      'SELECT * from proformaCompleta WHERE placa =? AND fecha_emicion BETWEEN ? AND ? AND user_id=?',
      [placa, dia_inicio, dia_fin, req.user.id]
    )
    res.render('historial-proformas', {
      locales,
      faltan,
      proformas,
      id_prueba,
      nombre_local,
    })
  } else {
    res.render('historial-proformas', {
      locales,
      faltan,
      proformas,
      id_prueba,
      nombre_local,
    })
  }
})

//**********  TERMINOS  Y  CONDICIONES  ************/

router.get('/terminosCondiciones', isLoggedIn, isCliente, async (req, res) => {
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const user = await pool.query(
    'SELECT * from userSuscripcion where id_user =?',
    [req.user.id]
  )
  const faltan = await Dfaltan(req)
  res.render('terminosCondiciones', { nombre_local, id_prueba, faltan })
})

//********** ESTADOS OT********* */

router.get('/recepcionados', async (req, res) => {
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)

  if (req.query.idLocal) {
    var id_local = req.query.idLocal

    const locales = await pool.query('SELECT * from locales WHERE user_id =?', [
      req.user.id,
    ])
    var recepcionados = await pool.query(
      'select * from vistaEstado where estado =? and user_id=? and id_local=?',
      ['Recepcionados', req.user.id, id_local]
    )
    const totalrecepcionados = await pool.query(
      'select * from resumenUser where estado = ? and userId=? and id_local=?',
      ['Recepcionados', req.user.id, id_local]
    )
    const totaltrabajando = await pool.query(
      'select * from resumenUser where estado = ? and userId=? and id_local=?',
      ['Trabajando', req.user.id, id_local]
    )
    const totallistos = await pool.query(
      'select * from resumenUser where estado = ? and userId=? and id_local=?',
      ['Listos', req.user.id, id_local]
    )
    const totalentregados = await pool.query(
      'select * from resumenUser where estado =? and userId=? and id_local=?',
      ['Entregados', req.user.id, id_local]
    )

    const id = req.query.idOT
    var tr = await pool.query(
      'SELECT * FROM trabajadorAccesoCompleta WHERE id_creador =? AND accesos =?',
      [req.user.id, 'Ordenes de Trabajo']
    )

    if (recepcionados.length > 0) {
      for (let i = 0; i < recepcionados.length; i++) {
        if (recepcionados[i].id == id) {
          const newOT = {
            estado: 'Trabajando',
          }
          await pool.query('UPDATE ot set ? WHERE id = ?', [newOT, id])
          const newTr = {
            id_ot: id,
            id_trabajadores: req.query.idTrabajador,
            id_local: recepcionados[i].id_local,
          }

          await pool.query('INSERT INTO trabajadorOT set ?', [newTr])
          recepcionados = await pool.query(
            'select * from vistaEstado where estado =? and user_id=? and id_local=?',
            ['Recepcionados', req.user.id, id_local]
          )
        }
      }
    }

    const r = totalrecepcionados.length
    const t = totaltrabajando.length
    const l = totallistos.length
    const e = totalentregados.length
    res.render('OT/estados/recepcionados', {
      nombre_local,
      id_prueba,
      faltan,
      recepcionados,
      r,
      tr,
      t,
      l,
      e,
      locales,
    })
  } else {
    const locales = await pool.query(
      'SELECT * from locales WHERE user_id =?',
      req.user.id
    )
    var recepcionados = await pool.query(
      'select * from vistaEstado where estado =? and user_id=?',
      ['Recepcionados', req.user.id]
    )
    console.log(req.query)
    const id = req.query.idOT
    var tr = await pool.query(
      'SELECT * FROM trabajadorAccesoCompleta WHERE id_creador =? AND accesos =?',
      [req.user.id, 'Ordenes de Trabajo']
    )

    if (recepcionados.length > 0) {
      for (let i = 0; i < recepcionados.length; i++) {
        if (recepcionados[i].id == id) {
          const newOT = {
            estado: 'Trabajando',
          }
          await pool.query('UPDATE ot set ? WHERE id = ?', [newOT, id])

          const newTr = {
            id_ot: id,
            id_trabajadores: req.query.idTrabajador,
            id_local: recepcionados[i].id_local,
          }

          await pool.query('INSERT INTO trabajadorOT set ?', [newTr])
          recepcionados = await pool.query(
            'select * from vistaEstado where estado =? and user_id=?',
            ['Recepcionados', req.user.id]
          )
        }
      }
    }
    const totalrecepcionados = await pool.query(
      'select * from resumenUser where estado = ? and userId=?',
      ['Recepcionados', req.user.id]
    )
    const totaltrabajando = await pool.query(
      'select * from resumenUser where estado = ? and userId=?',
      ['Trabajando', req.user.id]
    )
    const totallistos = await pool.query(
      'select * from resumenUser where estado = ? and userId=?',
      ['Listos', req.user.id]
    )
    const totalentregados = await pool.query(
      'select * from resumenUser where estado =? and userId=?',
      ['Entregados', req.user.id]
    )

    const r = totalrecepcionados.length
    const t = totaltrabajando.length
    const l = totallistos.length
    const e = totalentregados.length

    res.render('OT/estados/recepcionados', {
      nombre_local,
      id_prueba,
      faltan,
      recepcionados,
      tr,
      r,
      t,
      l,
      e,
      locales,
    })
  }
})

router.get('/trabajando', async (req, res) => {
  const faltan = await Dfaltan(req)

  if (req.query.idLocal) {
    var id_local = req.query.idLocal

    const locales = await pool.query(
      'SELECT * from locales WHERE user_id =?',
      req.user.id
    )
    var trabajando = await pool.query(
      'select * from vistaEstado where estado =? and user_id=? and id_local=?',
      ['Trabajando', req.user.id, id_local]
    )

    const id = req.query.iniciar

    if (trabajando.length > 0) {
      for (let i = 0; i < trabajando.length; i++) {
        if (trabajando[i].id == id) {
          const newOT = {
            categoria_id: trabajando[i].categoria_id,
            numero: trabajando[i].numero,
            estado: 'Listos',
          }
          await pool.query('UPDATE ot set ? WHERE id = ?', [newOT, id])
          trabajando = await pool.query(
            'select * from vistaEstado where estado =? and user_id=? and id_local=?',
            ['Trabajando', req.user.id, id_local]
          )
        }
      }
    }
    const totalrecepcionados = await pool.query(
      'select * from resumenUser where estado = ? and userId=? and id_local=?',
      ['Recepcionados', req.user.id, id_local]
    )
    const totaltrabajando = await pool.query(
      'select * from resumenUser where estado = ? and userId=? and id_local=?',
      ['Trabajando', req.user.id, id_local]
    )
    const totallistos = await pool.query(
      'select * from resumenUser where estado = ? and userId=? and id_local=?',
      ['Listos', req.user.id, id_local]
    )
    const totalentregados = await pool.query(
      'select * from resumenUser where estado =? and userId=? and id_local=?',
      ['Entregados', req.user.id, id_local]
    )

    const r = totalrecepcionados.length
    const t = totaltrabajando.length
    const l = totallistos.length
    const e = totalentregados.length
    res.render('OT/estados/trabajando', {
      nombre_local,
      faltan,
      id_prueba,
      trabajando,
      r,
      t,
      l,
      e,
      locales,
    })
  } else {
    const locales = await pool.query(
      'SELECT * from locales WHERE user_id =?',
      req.user.id
    )
    var trabajando = await pool.query(
      'select * from vistaEstado where estado =? and user_id=?',
      ['Trabajando', req.user.id]
    )

    const id = req.query.iniciar

    if (trabajando.length > 0) {
      for (let i = 0; i < trabajando.length; i++) {
        if (trabajando[i].id == id) {
          const newOT = {
            categoria_id: trabajando[i].categoria_id,
            numero: trabajando[i].numero,
            estado: 'Listos',
          }
          await pool.query('UPDATE ot set ? WHERE id = ?', [newOT, id])
          trabajando = await pool.query(
            'select * from vistaEstado where estado =? and user_id=?',
            ['Trabajando', req.user.id]
          )
        }
      }
    }
    const totalrecepcionados = await pool.query(
      'select * from resumenUser where estado = ? and userId=?',
      ['Resecpcionados', req.user.id]
    )
    const totaltrabajando = await pool.query(
      'select * from resumenUser where estado = ? and userId=?',
      ['Trabajando', req.user.id]
    )
    const totallistos = await pool.query(
      'select * from resumenUser where estado = ? and userId=?',
      ['Listos', req.user.id]
    )
    const totalentregados = await pool.query(
      'select * from resumenUser where estado =? and userId=?',
      ['Entregados', req.user.id]
    )

    const r = totalrecepcionados.length
    const t = totaltrabajando.length
    const l = totallistos.length
    const e = totalentregados.length

    res.render('OT/estados/trabajando', {
      faltan,
      id_prueba,
      trabajando,
      r,
      t,
      l,
      e,
      locales,
    })
  }
})

router.get('/listos', isLoggedIn, isCliente, async (req, res) => {
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)

  if (req.query.idLocal) {
    var id_local = req.query.idLocal

    const locales = await pool.query(
      'SELECT * from locales WHERE user_id =?',
      req.user.id
    )
    var listos = await pool.query(
      'select * from vistaEstado where estado =? and user_id=? and id_local=?',
      ['Listos', req.user.id, id_local]
    )

    const id = req.query.iniciar
    console.log(listos.length)

    if (listos.length > 0) {
      for (let i = 0; i < listos.length; i++) {
        if (listos[i].id == id) {
          const newOT = {
            categoria_id: listos[i].categoria_id,
            numero: listos[i].numero,
            estado: 'Entregados',
          }
          await pool.query('UPDATE ot set ? WHERE id = ?', [newOT, id])
          listos = await pool.query(
            'select * from vistaEstado where estado =? and user_id=? and id_local=?',
            ['Listos', req.user.id, id_local]
          )
        }
      }
    }

    const totalrecepcionados = await pool.query(
      'select * from resumenUser where estado = ? and userId=? and id_local=?',
      ['Recepcionados', req.user.id, id_local]
    )
    const totaltrabajando = await pool.query(
      'select * from resumenUser where estado = ? and userId=? and id_local=?',
      ['Trabajando', req.user.id, id_local]
    )
    const totallistos = await pool.query(
      'select * from resumenUser where estado = ? and userId=? and id_local=?',
      ['Listos', req.user.id, id_local]
    )
    const totalentregados = await pool.query(
      'select * from resumenUser where estado =? and userId=? and id_local=?',
      ['Entregados', req.user.id, id_local]
    )

    const r = totalrecepcionados.length
    const t = totaltrabajando.length
    const l = totallistos.length
    const e = totalentregados.length

    res.render('OT/estados/listos.hbs', {
      nombre_local,
      id_prueba,
      faltan,
      listos,
      r,
      t,
      l,
      e,
      locales,
    })
  } else {
    const locales = await pool.query(
      'SELECT * from locales WHERE user_id =?',
      req.user.id
    )
    var listos = await pool.query(
      'select * from vistaEstado where estado =? and user_id=?',
      ['Listos', req.user.id, id_local]
    )

    const id = req.query.iniciar

    if (listos.length > 0) {
      for (let i = 0; i < listos.length; i++) {
        if (listos[i].id == id) {
          const newOT = {
            categoria_id: listos[i].categoria_id,
            numero: listos[i].numero,
            estado: 'Entregados',
          }
          await pool.query('UPDATE ot set ? WHERE id = ?', [newOT, id])
          listos = await pool.query(
            'select * from vistaEstado where estado =? and user_id=?',
            ['Listos', req.user.id, id_local]
          )
        }
      }
    }
    const totalrecepcionados = await pool.query(
      'select * from resumenUser where estado = ? and userId=?',
      ['Recepcionados', req.user.id]
    )
    const totaltrabajando = await pool.query(
      'select * from resumenUser where estado = ? and userId=?',
      ['Trabajando', req.user.id]
    )
    const totallistos = await pool.query(
      'select * from resumenUser where estado = ? and userId=?',
      ['Listos', req.user.id]
    )
    const totalentregados = await pool.query(
      'select * from resumenUser where estado =? and userId=?',
      ['Entregados', req.user.id]
    )

    const r = totalrecepcionados.length
    const t = totaltrabajando.length
    const l = totallistos.length
    const e = totalentregados.length

    res.render('OT/estados/listos.hbs', {
      nombre_local,
      id_prueba,
      faltan,
      listos,
      r,
      t,
      l,
      e,
      locales,
    })
  }
})

router.get('/entregados', isLoggedIn, isCliente, async (req, res) => {
  const nombre = await pool.query(
    'SELECT razon_social FROM users WHERE id =?',
    [req.user.id]
  )
  const nombre_local = nombre[0].razon_social
  const faltan = await Dfaltan(req)
  var entregados = []

  if (req.query.idLocal) {
    var id_local = req.query.idLocal

    const locales = await pool.query(
      'SELECT * from locales WHERE user_id =?',
      req.user.id
    )
    entregados = await pool.query(
      'select * from vistaEstado where estado =? and user_id=? and id_local=?',
      ['Entregados', req.user.id, id_local]
    )

    const id = req.query.iniciar

    if (entregados.length > 0) {
      for (let i = 0; i < entregados.length; i++) {
        if (entregados[i].id == id) {
          const newOT = {
            categoria_id: entregados[i].categoria_id,
            numero: entregados[i].numero,
            estado: 'Entregados',
          }
          await pool.query('UPDATE ot set ? WHERE id = ?', [newOT, id])
          entregados = await pool.query(
            'select * from vistaEstado where estado =? and user_id=? and id_local=?',
            ['Entregados', req.user.id, id_local]
          )
        }
      }
    }
    const totalrecepcionados = await pool.query(
      'select * from resumenUser where estado = ? and userId=? and id_local=?',
      ['Recepcionados', req.user.id, id_local]
    )
    const totaltrabajando = await pool.query(
      'select * from resumenUser where estado = ? and userId=? and id_local=?',
      ['Trabajando', req.user.id, id_local]
    )
    const totallistos = await pool.query(
      'select * from resumenUser where estado = ? and userId=? and id_local=?',
      ['Listos', req.user.id, id_local]
    )
    const totalentregados = await pool.query(
      'select * from resumenUser where estado =? and userId=? and id_local=?',
      ['Entregados', req.user.id, id_local]
    )

    const r = totalrecepcionados.length
    const t = totaltrabajando.length
    const l = totallistos.length
    const e = totalentregados.length

    res.render('OT/estados/entregados', {
      nombre_local,
      id_prueba,
      faltan,
      entregados,
      r,
      t,
      l,
      e,
      locales,
    })
  } else {
    var id_local = req.query.idLocal

    const locales = await pool.query(
      'SELECT * from locales WHERE user_id =?',
      req.user.id
    )
    entregados = await pool.query(
      'select * from vistaEstado where estado =? and user_id=?',
      ['Entregados', req.user.id]
    )

    const id = req.query.iniciar
    var trabajadores = {}

    if (entregados.length > 0) {
      for (let i = 0; i < entregados.length; i++) {
        if (entregados[i].id == id) {
          const newOT = {
            categoria_id: entregados[i].categoria_id,
            numero: entregados[i].numero,
            estado: 'Entregados',
          }
          await pool.query('UPDATE ot set ? WHERE id = ?', [newOT, id])
          entregados = await pool.query(
            'select * from vistaEstado where estado =? and user_id=?',
            ['Entregados', req.user.idl]
          )
        }
      }
    }
    const totalrecepcionados = await pool.query(
      'select * from resumenUser where estado = ? and userId=?',
      ['Recepcionados', req.user.id]
    )
    const totaltrabajando = await pool.query(
      'select * from resumenUser where estado = ? and userId=?',
      ['Trabajando', req.user.id]
    )
    const totallistos = await pool.query(
      'select * from resumenUser where estado = ? and userId=?',
      ['Listos', req.user.id]
    )
    const totalentregados = await pool.query(
      'select * from resumenUser where estado =? and userId=?',
      ['Entregados', req.user.id]
    )

    const r = totalrecepcionados.length
    const t = totaltrabajando.length
    const l = totallistos.length
    const e = totalentregados.length

    res.render('OT/estados/entregados', {
      nombre_local,
      id_prueba,
      faltan,
      entregados,
      r,
      t,
      l,
      e,
      locales,
    })
  }
})

module.exports = router
