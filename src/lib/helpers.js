const bcrypt = require('bcryptjs');

const helpers = {};

helpers.encryptPassword =  async (password) => {  //metodo para cifrar la contraseña
	const salt = await bcrypt.genSalt(10);
	const hash = await bcrypt.hash(password, salt);
	return hash;
};

helpers.matchPassword = async (password, savePassword) => { //comparar password con la guardada en la bd
	try {
		return await bcrypt.compare(password, savePassword);
	} catch (e) {
		console.log(e);
	}
};

module.exports = helpers;