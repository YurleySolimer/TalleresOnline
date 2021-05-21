$(document).ready(function () {


    /*-----------------------------------
     * SCRIPTS VARIOS
     *-----------------------------------*/


	$('#sidebarCollapse').on('click', function () {
		$('#sidebar').toggleClass('active');
	});


	$(".form-wrapper .buttonNextForm").click(function () {
		var button = $(this);
		var currentSection = button.parents(".section");
		var currentSectionIndex = currentSection.index();
		var headerSection = $('.steps li').eq(currentSectionIndex);
		currentSection.addClass("offset").next().removeClass("offset");
		currentSection.removeClass("is-active").next().addClass("is-active");
		headerSection.removeClass("is-active").next().addClass("is-active");

	});
	$(".form-wrapper .buttonPrevForm").click(function () {
		var button = $(this);
		var currentSection = button.parents(".section");
		var currentSectionIndex = currentSection.index();
		var headerSection = $('.steps li').eq(currentSectionIndex);
		currentSection.addClass("offset").prev().removeClass("offset");
		currentSection.removeClass("is-active").prev().addClass("is-active");
		headerSection.removeClass("is-active").prev().addClass("is-active");

	});
	$("label[for=tipoCarroAuto]").click(function () {
		$("#imagen-formulario-vehiculo").attr("src", "icons/auto.png");
	});
	$("label[for=tipoCarroCamioneta]").click(function () {
		$("#imagen-formulario-vehiculo").attr("src", "icons/camioneta.png");
	});
	$("label[for=tipoCarroMoto]").click(function () {
		$("#imagen-formulario-vehiculo").attr("src", "icons/moto.png");
	});
});

let abarth = new Array("124 Spider", "500", "595", "595C", "695", "695C", "Grande Punto", "Punto", "RitmoRitmo", "Stilo");
let alfaRomeo = new Array("145", "146", "147", "155", "156", "159", "164", "166", "33", "4C Spider", "6", "8C Competizione", "90", "Alfa 75", "Alfa", "Spider", "Alfetta", "GTV", "Brera", "Giulia", "Giulietta", "GT", "GTV", "MiTo", "Stelvio");
let alpina = new Array("B3", "B5", "B6", "B6 Gran Coupe", "B7", "BMW Alpina B4", "BMW Alpina D3", "BMW Alpina D5", "D4", "XD3", "XD4");
let astonMartin = new Array("DB 7", "DB 9", "DBS", "V8 Vantage", "Vanquish");
let audi = new Array("100", "200", "50", "80", "90", "A1", "A2", "A3", "A3 Limousine", "A4", "A4 Allroad", "A5", "A5 Sportsback", "A6", "A6 Allroad", "A7", "A8", "Allroad Quattro", "Cabriolet", "Coupe", "Q2", "Q3", "Q5", "Q7", "Q8", "Quattro", "R8", "RS 2", "RS 3", "RS 4", "RS 5", "RS 6", "RS 7", "RS Q3", "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "SQ5", "SQ7", "TT", "TT RS", "TTS", "V8");
let barkas = new Array("B 1000-1", "N");
let bentley = new Array("Azure", "Continental Flying Spur", "Continental GT", "Continental GTC");
let bmw = new Array("BMW Serie 1", "BMW Serie 2", "BMW Serie 3", "BMW Serie 4", "BMW Serie 5", "BMW Serie 6", "BMW Serie 7", "BMW Serie 8", "i3", "i8", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z1", "Z3", "Z4", "Z8");
let cadillac = new Array("ATS", "BLS", "CT6", "CTS", "CTS Wagon", "Eldorado", "Escalade", "Seville", "SRX", "STS", "XLR", "XT5");
let caterham = new Array("Super Seven");
let chevrolet = new Array("Alero", "Astro Van", "Aveo", "Blazer", "Camaro", "Captiva", "Corvette", "Cruze", "Epica", "Evanda", "HHR", "Kalos", "Lacetti", "Malibu", "Matiz", "Nubira", "Orlando", "Optra", "Rezzo", "Spark", "Tahoe", "TrailBlazer", "Trans Sport", "Trax", "Volt");
let chrysler = new Array("300 C", "300 M", "Crossfire", "ES", "Grand Voyager", "GS", "GTS", "Le Baron", "Neon", "New Yorker", "PT Cruiser", "Saratoga", "Sebring", "Shelby Daytona", "Stratus", "Viper", "Vision", "Vogager");
let citroen = new Array("1.6 THP", "2CV", "AX", "Berlingo", "BX", "C 3", "C-Crosser", "C-Elyseo", "C-Zero", "C1", "C15", "C2", "C25", "C3", "Aircross", "C3 Picasso", "C3 Pluriel", "C4 Aircross", "C4 Cactus", "C4 Grand Picasso", "C4 Picasso", "C4 Spacetourer", "C5", "C5 Aircross", "C5 Cross Tourer", "C6", "C8", "CX", "DS 20", "DS 23", "DS3", "DS3 Cabrio", "DS4", "DS4 Crossback", "DS5", "DS7 Crossback", "Dyane", "E-Mehari", "Evasion", "Grand C4 Spacetourer", "GSA", "Jumper", "Jumpy", "LN", "Nemo", "Saxo", "SM", "Visa II", "Xantia", "XM", "Xsara", "Xsara Picasso", "ZX");
let corvette = new Array("C4", "C5", "C6", "C7", "Stingray");
let cupra = new Array("Ateca");
let dacia = new Array("1210", "1300", "1301", "1302", "1304", "1305", "1307", "1309", "1320", "1325", "1410", "Dokker", "Dokker Express", "Duster", "Duster II", "Lodgy", "Logan", "Logan Express", "Logan II", "Logan MCV", "Logan MCV II", "Logan Pick-up", "Sandero", "Sandero II");
let daewoo = new Array("Cielo", "Damas", "Espero", "Evanda", "Kalos", "Lacetti", "Lanos", "Leganza", "Matiz", "Nexia", "Nubira", "Rezzo", "Tacuma");
let daihatsu = new Array("Applause", "Hi Jet S 76 4WD /Piaggio Porter", "Hijet", "Sirion", "Sparcar S 75", "Terios");
let dodge = new Array("Avenger", "Caliber", "Journey", "Nitro");
let dsAutomobiles = new Array("DS3", "DS3 Crossback", "DS7 Crossback");
let fiat = new Array("124 Spider", "124 Sport Spider", "127", "500", "500C", "500L", "500X", "850T/900T/900E", "Albea", "Argenta", "Barchetta", "Brava", "Bravo", "Cinquecento", "Coupe", "Croma", "Dobla", "Ducato", "Fiorino", "Freemont", "Fullback", "Grande Punto", "Idea", "Lanea", "Marea", "Multipla", "Palio", "Panda", "Punto", "Qubo", "Regata", "RitmoRitmo", "Scudo", "Sedici", "Seicento", "Stilo", "Strada", "Talento", "Tempra", "Tipo", "Ulysse", "Uno", "X 1/9");
let ford = new Array("B-Max", "C-Max", "Capri", "Cougar", "Econoline", "Ecosport", "Edge", "Escort", "Explorer", "Fiesta", "Focus", "Fusion", "Galaxy", "Granada", "Grand C-Max", "Grand Tourneo Connect", "Ka", "Ka+", "Kuga", "Maverick", "Mondeo", "Mustang", "Orion", "Probe", "Puma", "Ranger", "S-Max", "Scorpio", "Sierra", "StreetKa", "Taunus", "Tourneo", "Tourneo Connect", "Tourneo Courier", "Transit", "Windstar");
let honda = new Array("AccordAccord", "Civic", "Concerto", "CR-V", "CR-Z", "CRX", "Evolution", "FR-V", "HR-V", "Insight", "Integra", "Jazz", "Legend", "Logo", "NSX", "Pilot", "Prelude", "S 2000", "Shuttle", "Stream");
let hyundai = new Array("Accent", "Atos", "Coupe", "Elantra", "Genesis", "Getz", "Grand Santa Fe", "H1", "H100", "H350 BUS", "H350 Kasten", "i10", "i20", "i20 Active", "i30", "i40", "IONIQ", "ix20", "ix35", "ix55", "Kona", "Lantra", "Matrix", "Nexo", "Pony", "Santa Fe", "Scoupe", "Sonata", "Terracan", "Trajet", "Tucson", "Veloster", "XG");
let infiniti = new Array("EX", "FX", "G37", "M-Serie", "Q30", "Q50Q50", "Q60", "Q70", "QX30", "QX50", "QX70");
let isuzu = new Array("Campo", "D MAX", "Gemini", "Trooper", "Van Midi");
let iveco = new Array("Daily");
let jaguar = new Array("Daimler", "E-Pace", "F-Pace", "F-Type", "I-Pace", "S-TYPE", "X-TYPE", "XE", "XF", "XJ", "XJ Serie II", "XJ Serie III", "XJ12", "XJ6", "XJS", "XK", "XK8", "XKR");
let jeep = new Array("Cherokee", "Cherokee Chief", "CJ 7", "Commander", "Compass", "Grand Cherokee", "Patriot", "Renegade", "Wagoneer", "Wrangler", "Wrangler Unlimited");
let kia = new Array("Besta", "Carens", "Carnival", "cee'd", "Cerato", "Clarus", "Joice", "K-Reihe 2500", "K-Reihe 270", "Magentis", "Niro", "Opirus", "Optima", "Picanto", "Pregio", "Pride", "pro_cee'd", "Retona", "Rio", "Roadster", "Rocsta", "Sephia", "Shuma", "Sorento", "Soul", "Sportage", "Stinger", "Stonic", "Venga");
let lada = new Array("Forma", "Granta", "Kalina 2", "Niva", "Samara", "Taiga", "Vesta");
let lancia = new Array("Beta /Spider", "Dedra", "Delta", "Flavia", "Gamma", "Kappa", "Lancia A 112", "Lancia Y", "Lybra", "Musa", "Phedra", "Prisma", "Thema", "Thesis", "Trevi", "Vogager", "Y 10", "Ypsilon", "Zeta");
let landRover = new Array("Defender", "Discovery", "Discovery 4", "Discovery 5", "Discovery Sport", "Evoque", "Evoque Cabriolet", "Freelander", "Range Rover", "Range Rover Sport", "Range Rover Velar");
let lexus = new Array("CT-Serie", "GS-Serie", "IS-Serie", "LC-Serie", "LS-Serie", "NX-Serie", "RC-Serie", "RX-Serie", "SC-Serie");
let lotus = new Array("Elise", "Esprit", "Europa", "Evora", "Exige");
let man = new Array("G", "G 90", "TGE");
let maserati = new Array("4200 Coupe", "4200 Spyder", "Coupe", "Ghibli", "Grancabrio", "Levante", "Quattroporte", "Spyder");
let mazda = new Array("121", "2", "3", "323", "5", "6", "626", "929", "929L", "BT-50", "CX 3", "CX 5", "CX 7", "CX-9", "Demio", "E 2000", "E 2200", "Mazda Serie B", "MPV", "MX-3", "MX-5", "MX-6", "Premacy", "RX-7", "RX-8", "Tribute", "Xedos 6", "Xedos 9");
let mercedesBenz = new Array("190/190 E", "A-Klasse Limousine", "AMG GT", "AMG GT 4-door", "Citan", "CL Coupe", "Clase A", "Clase B", "Clase C", "Clase CLA", "Clase CLC", "Clase CLK", "Clase CLS", "Clase E", "Clase GL", "Clase GLA", "Clase GLE", "Clase GLK", "Clase M", "Clase R", "Clase S", "Clase SL", "Clase SLK", "Clase V", "Classe GLC", "Classe GLS", "Classe SLC", "E-Klasse All-Terrain", "G-Klasse", "MB 100", "SLR McLaren", "SLS AMG", "Sprinter", "Strich Acht W114/W115", "T1 Transporter", "V-Klasse Marco Polo", "Vaneo", "Viano", "Vito", "Vito Tourer", "W123", "X-Klasse");
let mgRover = new Array("100", "200", "25", "400", "45", "600", "75", "800", "MG TF", "MG ZS", "MG ZT", "MG ZT-T", "MGF", "MINI", "Streetwise");
let mini = new Array("Cabrio", "Clubman", "Clubvan", "Countryman", "Coupe", "MINI", "Paceman", "Roadster");
let mitsubishi = new Array("3000 GT", "ASX", "Carisma", "Celeste", "Colt", "Cordia", "Eclipse", "Eclipse Cross", "Galant", "Galloper", "Grandis", "i-MiEV", "L 200", "L 300", "L 400", "Lancer", "Montero", "Outlander", "Santamo", "Sapporo", "Sigma", "Space", "Starion Turbo", "Tredia");
let nissan = new Array("100 NX", "200SX", "280ZX /280ZXT", "300 ZX", "350Z", "370Z", "Almera", "Almera Tino", "Bluebird", "Cherry", "Cube", "GT-R", "Interstar", "Juke", "Kubistar", "Laurel", "Leaf", "Maxima", "Micra", "Murano", "Navara Pick-up", "Note", "NP300 Pick-up", "NV200", "NV200 Evalia", "NV300", "NV400", "Pathfinder", "Patrol", "Pick-up", "Pixo", "Prairie", "Primastar", "Primera", "Pulsar", "Qashqai", "Qashqai+2", "Serena", "Silvia", "Skyline Inj.", "Stanza", "Sunny", "Sunny Van", "Teana", "Terrano", "Terrano II", "Tilda", "Trade", "Trade 100", "Urvan", "Vanette", "Cargo", "X-Trail");
let opel = new Array("Adam", "Agila", "Ampera", "Ampera-e", "Antara", "Arena", "Ascona", "Astra", "Astra GTC", "Astra K", "Cabrio", "Calibra", "Campo", "Chevette", "Combo", "Combo Life", "Commodore", "Corsa", "Crossland X", "Frontera", "Grandland X", "GT", "Insignia", "Insignia Country Tourer", "Insignia CT", "Insignia Grand Sport", "Insignia Sports Tourer", "Kadett", "Karl", "Manta", "Meriva", "Mokka", "Mokka X", "Monterey", "Monza", "Movano", "Omega", "Rekord", "Senator", "Signum", "Sintra", "Speedster", "Tigra", "Vectra", "Vivare", "Zafira", "Zafira Tourer");
let peugeot = new Array("1007", "104", "106", "107", "108", "2008", "205", "206", "207", "208", "3008", "301", "305", "306", "307", "308", "309", "4007", "4008", "405", "406", "407", "5008", "504", "505", "508", "604", "605", "607", "806", "807", "Bipper", "Boxer", "Expert", "iOn", "J5", "Partner", "RCZ", "Talbot City-Laster");
let piaggio = new Array("Porter");
let pontiac = new Array("Trans Sport");
let porsche = new Array("718 Boxster", "718 Cayman", "911", "918 Spyder", "924", "928", "944", "968", "Cayenne", "Cayman", "Macan", "Panamera", "Panamera Sport Turismo");
let renault = new Array("21", "25", "4", "5", "Alaskan", "Alpine", "Avantime", "Captur", "Clio", "Fluence", "Fuego", "Grand Espace", "Grand Modus", "Grand Scenic", "Kadjar", "Kangoo", "Koleos", "Laguna", "Latitude", "Master", "MAX", "Megane", "Modus", "R 18 ", "R 19", "R 30", "R 9", "Rapid", "Renault Sport Spider", "Safrane", "Scenic", "Talisman", "Trafic", "Twingo", "Twizy", "Vel Satis", "Wind", "Zoe");
let rover = new Array("200", "45", "800");
let saab = new Array("9-3", "9-3X", "9-5", "90", "900", "9000", "99");
let seat = new Array("Alhambra", "Altea", "Altea XL", "Arona", "Arosa", "Ateca", "Cordoba", "Exeo", "Fura", "Ibiza", "Inca", "Leon", "Malaga", "Marbella", "Mii", "Ronda", "Tarraco", "Terra", "Toledo");
let skoda = new Array("105", "120", "130", "Citigo", "Fabia", "Favorit", "Felicia", "Forman", "Karoq", "Kodiaq", "Octavia", "Pick-up", "Rapid", "Rapid Spaceback", "Roomster", "Superb", "Yeti");
let smart = new Array("Cabriolet", "Crossblade", "ForFour", "ForTwo", "Roadster");
let ssangyong = new Array("Actyon", "Korando", "Kyron", "Musso", "Rexton", "Rodius", "Tivoli", "XLV");
let subaru = new Array("1800", "BRZ", "Forester", "Impreza", "Justy", "Legazy", "Levorg", "Libero", "Outback", "SVX", "Trezia", "Tribeca", "Vivio", "XT", "XV");
let suzuki = new Array("Alto", "Baleno", "Carry GA413", "Carry ST90", "Celerio", "Grand Vitara", "Ignis", "Jimny", "Kizashi", "Liana", "SJ", "Splash", "Super Carry SK", "Swift", "SX4", "SX4 S-Cross", "Vitara", "Wagon", "X-90");
let tata = new Array("Indica");
let tesla = new Array("Model S", "Model X");
let toyota = new Array("4-Runner", "Auris", "Auris Touring Sports", "Avensis", "Avensis Verso", "AYGO", "C-HR", "Camry", "Carina", "Celica", "Corolla", "Corolla Verso", "Dyna", "GT 86", "Hiace", "Hilux", "iQ", "Land Cruiser", "LiteAce", "Modell F", "MR 2", "Paseo", "Picnic", "Previa", "Prius", "Prius+", "ProAce", "ProAce Verso", "RAV 4", "Supra", "Urban Cruiser", "Verso", "Verso-S", "Yaris", "Yaris VersoB");
let volkswagen = new Array("Amarok", "Arteon", "Beetle", "Bora", "Caddy", "CC", "Corrado", "Crafter", "Derby", "Fox", "Golf", "Golf III", "Golf IV", "Golf Plus", "Golf V", "Golf VI", "Golf VII", "Golf VII Sportsvan", "Jetta", "Kofer 1200", "Kofer 1303", "LT", "Lupo", "New Beetle", "Passat", "Passat Alltrack", "Passat CC", "Phaeton", "Polo", "Santana", "Scirocco", "Sharan", "T-Cross", "T-Roc", "T3", "T4 California", "T4 Caravelle", "T4 Kombi", "T4 Multivan", "T4 Transporter", "T5 California", "T5 Caravelle", "T5 Kombi", "T5 Multivan", "T5 Shuttle", "T5 Transporter", "T6 California", "T6 Caravelle", "T6 Kombi", "T6 Multivan", "T6 Transporter", "Taro", "Tiguan", "Tiguan Allspace", "Touareg", "Touran", "up!", "Vento");
let volvo = new Array("C 30", "C 70", "S 40", "S 60", "S 70", "S 80", "Serie 240", "Serie 260", "Serie 340", "Serie 360", "Serie 440", "Serie 460", "Serie 480", "Serie 66", "Serie 740", "Serie 760", "Serie 85", "Serie 940", "Serie 960", "SS90 90", "V 60", "V40", "V50", "V70", "V90", "XC 40", "XC 60", "XC 70", "XC90");
let westfield = new Array("Cabrio");

function modelo() {
	let model;
	//captar modelo segun la marca
	model = document.formOT.marcaCarro[document.formOT.marcaCarro.selectedIndex].id;
	//definir si existen modelos para la marca
	if (model != "none") {
		mis_modelos = eval(model);
		//calcular numero de modelos
		num_modelos = mis_modelos.length;
		//marcar el numero de opciones en el select
		document.formOT.modeloCarro.length = num_modelos;
		//para cada modelo, incluir en el select
		for (i = 0; i < num_modelos; i++) {
			document.formOT.modeloCarro.options[i].value = mis_modelos[i];
			document.formOT.modeloCarro.options[i].text = mis_modelos[i];
		}
	} else {
		//si no habia ninguna opción seleccionada, eliminar los modelos del select
		document.formOT.modeloCarro.length = 1;
		document.formOT.modeloCarro.options[0].value = "Modelo";
		document.formOT.modeloCarro.options[0].text = "Modelo";
	}
	//reset de los modelos 
	document.formOT.modeloCarro.options[0].selected = true;
}

function modeloProforma() {
	let model;
	//captar modelo segun la marca
	model = document.formProforma.marcaCarro[document.formProforma.marcaCarro.selectedIndex].id;
	//definir si existen modelos para la marca
	if (model != "none") {
		mis_modelos = eval(model);
		//calcular numero de modelos
		num_modelos = mis_modelos.length;
		//marcar el numero de opciones en el select
		document.formProforma.modeloCarro.length = num_modelos;
		//para cada modelo, incluir en el select
		for (i = 0; i < num_modelos; i++) {
			document.formProforma.modeloCarro.options[i].value = mis_modelos[i];
			document.formProforma.modeloCarro.options[i].text = mis_modelos[i];
		}
	} else {
		//si no habia ninguna opción seleccionada, eliminar los modelos del select
		document.formProforma.modeloCarro.length = 1;
		document.formProforma.modeloCarro.options[0].value = "Modelo";
		document.formProforma.modeloCarro.options[0].text = "Modelo";
	}
	//reset de los modelos 
	document.formProforma.modeloCarro.options[0].selected = true;
}

// Contador general para llevar un control sobre los detalles y los importes
var lelyBonita = 1;
var lelyCrack = 1;

// Función para agregar un nuevo reglón de detalle-importe en la descripción de la orden
function agregarInput() {
	// Se crea el div padre para los detalles de la orden
	var detalleDiv = document.getElementById('input-dinamico').appendChild(document.createElement('div'))
	detalleDiv.className = 'col-7 m-auto'
	// Se usa el contador para llevar un control individual de cada nodo creado
	detalleDiv.id = 'divDetalle' + lelyCrack

	// Se crea el input de los detalles de la orden
	var detalleInput = detalleDiv.appendChild(document.createElement('input'))
	// Uso del contador para el id
	detalleInput.id = 'detalle' + lelyCrack
	// Tipo del input
	detalleInput.type = 'text'
	// Uso del contador para el nombre
	detalleInput.name = 'detalle' 
	// Definir el placeholder
	detalleInput.placeholder = 'Descripción'
	// Definir las Clases
	detalleInput.className = 'form-control form-control-sm w-100 m-auto'
	// Agregar los atributos para llamar a la función de agreagr dinamicamente
	detalleInput.setAttribute('onchange', 'agregarInput()')

	// Se repite la misma estructura anterior pero con otra función en el atributo onchange
	var importeDiv = document.getElementById('input-dinamico').appendChild(document.createElement('div'))
	importeDiv.className = 'col-4 m-auto'
	importeDiv.id = 'divImporte' + lelyCrack
	var importeInput = importeDiv.appendChild(document.createElement('input'))
	importeInput.id = 'importe' + lelyCrack
	importeInput.type = 'text'
	importeInput.value = 0
	importeInput.name = 'importe' 
	importeInput.placeholder = 'Importe'
	importeInput.className = 'form-control form-control-sm'
	importeInput.setAttribute('onchange', 'calculoPrecio(value)')

	// Se repite la estructura inicial, ahora con un botón
	var eliminarBtn = document.getElementById('input-dinamico').appendChild(document.createElement('button'))
	eliminarBtn.id = 'botonImporte' + lelyCrack
	eliminarBtn.value = lelyCrack
	eliminarBtn.className = 'col-1 m-auto btn btn-danger rounded'
	// Valor dentro del botón
	eliminarBtn.innerHTML = '-'
	// Se llama a la función eliminarInput() con el atributo onclick
	eliminarBtn.setAttribute('onclick', 'eliminarInput(value)')

	// Se aumenta el contador para llevar un control de cuantos inputs hay creados
	lelyBonita++
	lelyCrack++

	calculoPrecio()

}
function agregarInputProforma() {
	// Se crea el div padre para los detalles de la orden
	var detalleDiv = document.getElementById('input-dinamico').appendChild(document.createElement('div'))
	detalleDiv.className = 'col-7 m-auto'
	// Se usa el contador para llevar un control individual de cada nodo creado
	detalleDiv.id = 'divDetalle' + lelyCrack

	// Se crea el input de los detalles de la orden
	var detalleInput = detalleDiv.appendChild(document.createElement('input'))
	// Uso del contador para el id
	detalleInput.id = 'detalle' + lelyCrack
	// Tipo del input
	detalleInput.type = 'text'
	// Uso del contador para el nombre
	detalleInput.name = 'detalle' 
	// Definir el placeholder
	detalleInput.placeholder = 'Descripción'
	// Definir las Clases
	detalleInput.className = 'form-control form-control-sm w-100 m-auto'
	// Agregar los atributos para llamar a la función de agreagr dinamicamente
	detalleInput.setAttribute('onchange', 'agregarInputProforma()')

	// Se repite la misma estructura anterior pero con otra función en el atributo onchange
	var importeDiv = document.getElementById('input-dinamico').appendChild(document.createElement('div'))
	importeDiv.className = 'col-4 m-auto'
	importeDiv.id = 'divImporte' + lelyCrack
	var importeInput = importeDiv.appendChild(document.createElement('input'))
	importeInput.id = 'importe' + lelyCrack
	importeInput.type = 'number'
	importeInput.value = 0
	importeInput.name = 'importe' 
	importeInput.placeholder = 'Importe'
	importeInput.className = 'form-control form-control-sm'
	importeInput.setAttribute('onchange', 'calculoPrecioProforma(value)')

	// Se repite la estructura inicial, ahora con un botón
	var eliminarBtn = document.getElementById('input-dinamico').appendChild(document.createElement('button'))
	eliminarBtn.id = 'botonImporte' + lelyCrack
	eliminarBtn.value = lelyCrack
	eliminarBtn.className = 'col-1 m-auto btn btn-danger rounded'
	// Valor dentro del botón
	eliminarBtn.innerHTML = '-'
	// Se llama a la función eliminarInput() con el atributo onclick
	eliminarBtn.setAttribute('onclick', 'eliminarInputProforma(value)')

	// Se aumenta el contador para llevar un control de cuantos inputs hay creados
	lelyBonita++
	lelyCrack++

	calculoPrecioProforma()

}
function agregarInputTrabajo() {
	// Se crea el div padre para los detalles de la orden
	var detalleDiv = document.getElementById('input-dinamico').appendChild(document.createElement('div'))
	detalleDiv.className = 'col-12 m-auto'
	// Se usa el contador para llevar un control individual de cada nodo creado
	detalleDiv.id = 'divDetalle' + lelyCrack

	// Se crea el input de los detalles de la orden
	var detalleInput = detalleDiv.appendChild(document.createElement('input'))
	// Uso del contador para el id
	detalleInput.id = 'detalle' + lelyCrack
	// Tipo del input
	detalleInput.type = 'text'
	// Uso del contador para el nombre
	detalleInput.name = 'detalle' 
	// Definir el placeholder
	detalleInput.placeholder = 'Descripción'
	// Definir las Clases
	detalleInput.className = 'form-control form-control-sm w-100 m-auto'
	// Agregar los atributos para llamar a la función de agreagr dinamicamente
	detalleInput.setAttribute('onchange', 'agregarInputTrabajo()')

	// Se repite la misma estructura anterior pero con otra función en el atributo onchange
	var importeDiv = document.getElementById('input-dinamico').appendChild(document.createElement('div'))
	importeDiv.className = 'col-6 m-auto'
	importeDiv.id = 'divImporte' + lelyCrack
	var importeInput = importeDiv.appendChild(document.createElement('input'))
	importeInput.id = 'fecha' + lelyCrack
	importeInput.type = 'date'
	importeInput.name = 'fecha' 
	importeInput.className = 'form-control form-control-sm'
	// Se repite la estructura inicial, ahora con un botón
	var eliminarBtnDiv = document.getElementById('input-dinamico').appendChild(document.createElement('div'))
	eliminarBtnDiv.className = 'col-6 d-flex align-items-center'
	eliminarBtnDiv.id = 'divBotonImporte' + lelyCrack
	var eliminarBtn = eliminarBtnDiv.appendChild(document.createElement('button'))
	eliminarBtn.id = 'botonImporte' + lelyCrack
	eliminarBtn.value = lelyCrack
	eliminarBtn.className = 'w-100 m-auto btn btn-danger rounded'
	// Valor dentro del botón
	eliminarBtn.innerHTML = '-'
	// Se llama a la función eliminarInput() con el atributo onclick
	eliminarBtn.setAttribute('onclick', 'eliminarInput(value)')

	// Se aumenta el contador para llevar un control de cuantos inputs hay creados
	lelyBonita++
	lelyCrack++

}


// Función para eliminar inputs
function eliminarInput(l) {

	// Se disminuye el contador para avisar que se está eliminando un input
	lelyBonita--


	// Se selecciona el nodo del botón para eliminarlo
	var btn = document.getElementById('botonImporte' + l)
	// Se llama el metodo removeChild usando el parentNode para que pueda borrarse exitosamente
	btn.parentNode.removeChild(btn)
	// Se llama selecciona el nodo del div donde se encuentran los detalles para borrar este y su nodo hijo del input
	var detalleDiv = document.getElementById('divDetalle' + l)
	detalleDiv.parentNode.removeChild(detalleDiv)
	var importeDiv = document.getElementById('divImporte' + l)
	importeDiv.parentNode.removeChild(importeDiv)

	calculoPrecio()
}

function eliminarInputProforma(l) {

	// Se disminuye el contador para avisar que se está eliminando un input
	lelyBonita--


	// Se selecciona el nodo del botón para eliminarlo
	var btn = document.getElementById('botonImporte' + l)
	// Se llama el metodo removeChild usando el parentNode para que pueda borrarse exitosamente
	btn.parentNode.removeChild(btn)
	// Se llama selecciona el nodo del div donde se encuentran los detalles para borrar este y su nodo hijo del input
	var detalleDiv = document.getElementById('divDetalle' + l)
	detalleDiv.parentNode.removeChild(detalleDiv)
	var importeDiv = document.getElementById('divImporte' + l)
	importeDiv.parentNode.removeChild(importeDiv)

	calculoPrecioProforma()
}


// Función para calcular los precios
function calculoPrecio() {
	// Se declara el array en el que se incrustaran los valores de los importes
	arr = []
	
	// Ciclo for para enumerar todos los importes
	for (let i = 0; i < lelyCrack; i++) {
		
		if (document.getElementById('importe' + i) != null) {
			// Capto los valores de los imputs de importe
			k = document.getElementById('importe' + i).value
			// Agrego los valores al array y convierto el valor en numero
			arr.push(parseFloat(k))
		} 
	}

	// Declaro la variable que tendrá el valor final de los importes
	valor = 0;
	// Sumar cada importe
	arr.forEach(function (number) {
		valor += number;
	})
	
	let d = document.getElementById('descuento-form-ot').value

	valor -= parseFloat(d)

	// Definir el Subtotal
	subtotal = valor
	// Definir el IVA
	iva = subtotal * 0.18
	// Definir el total
	total = subtotal + iva

	

	// Agregar el valor del subtotal en el HTML
	let psubtotal = document.getElementById('subtotal-form-ot');
	psubtotal.setAttribute('value', subtotal)

	// Agregar el valor del iva en el HTML
	let piva = document.getElementById('iva-form-ot');
	piva.setAttribute('value', iva.toFixed(2));

	// Agregar el valor del total en el HTML
	let ptotal = document.getElementById('total-form-ot');
	ptotal.setAttribute('value', total.toFixed(2));

}

// Función para calcular los precios en Proformas
function calculoPrecioProforma() {
	// Se declara el array en el que se incrustaran los valores de los importes
	arr = []
	
	// Ciclo for para enumerar todos los importes
	for (let i = 0; i < lelyCrack; i++) {
		
		if (document.getElementById('importe' + i) != null) {
			// Capto los valores de los imputs de importe
			k = document.getElementById('importe' + i).value
			// Agrego los valores al array y convierto el valor en numero
			arr.push(parseFloat(k))
		} 
	}

	// Declaro la variable que tendrá el valor final de los importes
	valor = 0;
	// Sumar cada importe
	arr.forEach(function (number) {
		valor += number;
	})

	// Definir el Subtotal
	subtotal = valor
	// Definir el IVA
	iva = subtotal * 0.18
	// Definir el total
	total = subtotal + iva

	

	// Agregar el valor del subtotal en el HTML
	let psubtotal = document.getElementById('subtotal-form-ot');
	psubtotal.setAttribute('value', subtotal)

	// Agregar el valor del iva en el HTML
	let piva = document.getElementById('iva-form-ot');
	piva.setAttribute('value', iva.toFixed(2));

	// Agregar el valor del total en el HTML
	let ptotal = document.getElementById('total-form-ot');
	ptotal.setAttribute('value', total.toFixed(2));

}

