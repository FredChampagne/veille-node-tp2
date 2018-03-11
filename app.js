// Éléments qui permettent le fonctionnement de l'application
"use strict";
const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const ObjectID = require('mongodb').ObjectID;
const cookieParser = require('cookie-parser');
const i18n = require("i18n");
const $ = require('jquery');
const peupler = require("./mes_modules/peupler");

// Permet d'ajouter la librairie socket.io
const server = require('http').createServer(app);
const io = require('./mes_modules/chat_socket').listen(server);

// Configuration du multilingue
i18n.configure({
	locales: ['fr', 'en'],
	cookie: 'langueChoisie',
	directory: __dirname + '/locales'
})

// Associe le moteur de vue au module «ejs» 
app.set('view engine', 'ejs'); // Générateur de template 

// Utilisation
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(i18n.init);
app.use('/jquery', express.static('./node_modules/jquery/dist/'));
let util = require("util");

////////////////////////////////////////////////////
//                     ROUTES                     //
////////////////////////////////////////////////////

// Transfert vers la langue choisie
app.get('/:locale(fr|en)', (req, res) => {
	let locale = req.params.locale;
	req.setLocale(req.params.locale);
	res.cookie('langueChoisie', req.params.locale);
	res.redirect(req.headers.referer);
})

// Affichage de l'accueil (root)
app.get('/', (req, res) => {
	if (req.cookies.langueChoisie == null) {
		res.cookie('langueChoisie', 'fr');
		req.setLocale('fr');
	}
	res.render('accueil.ejs');
})

// Affichage de la liste
app.get('/list', (req, res) => {
	let cursor = db.collection('adresse').find().toArray((err, resultat) => {
		if (err) return console.log(err)
		res.render('adresses.ejs', { adresses: resultat })
	})
})

// Accède au profil d'un membre
app.get('/profil/:id', (req, res) => {
	let id = req.params.id;
	let critere = ObjectID(id);
	let cursor = db.collection('adresse').findOne({ "_id": critere }, (err, resultat) => {
		if (err) return console.log(err)
		res.render('profil.ejs', { membre: resultat });
	})
})

// Supprime un membre à partir du profil membre
app.get('/detruire/:id', (req, res) => {
	let id = req.params.id;
	let critere = ObjectID(id);
	db.collection('adresse').findOneAndDelete({ "_id": critere }, (err, resultat) => {
		if (err) return console.log(err)
		res.redirect('/list');
	})
});

// Tri les adresses
app.get('/trier/:cle/:ordre', (req, res) => {
	let cle = req.params.cle
	let ordre = (req.params.ordre == 'asc' ? 1 : -1)
	let cursor = db.collection('adresse').find().sort(cle, ordre).toArray((err, resultat) => {
		ordre = (ordre == 1 ? "desc" : "asc");
		res.render('adresses.ejs', { adresses: resultat, ordre: ordre, cle: cle })
	});
});

// Peuple la base de données de membres
app.get('/peupler', (req, res) => {
	let peupler = require('./mes_modules/peupler/');
	let listeMembres = peupler();
	db.collection('adresse').insert(listeMembres, (err, resultat) => {
		if (err) return console.log(err)
		listeMembres = [];
		res.redirect('/list');
	});
})

// Vide la base de données
app.get('/vider', (req, res) => {
	db.collection('adresse').drop((err, resultat) => {
		if (err) return console.log(err)
		res.redirect('/list');
	});
})

// Recherche un membre
app.post('/rechercher', (req, res) => {
	let chaine = req.body.chaine;
	let critere = { $regex: ".*" + chaine + ".*" }
	let cursor = db.collection('adresse').find({
		$or: [
			{ "nom": critere },
			{ "prenom": critere },
			{ "telephone": critere },
			{ "courriel": critere }
		]
	}).toArray((err, resultat) => {
		if (err) return console.log(err)
		res.render('adresses.ejs', { adresses: resultat });
	})
});

// Affichage du clavardage
app.get('/chat', (req, res) => {
	res.render('socket_vue.ejs')
});

///////////////////////////
// ROUTES UTILISANT AJAX //
///////////////////////////

// Modifie le profil d'un membre et l'affiche
app.post('/modifier-profil-ajax', (req, res) => {
	let id = ObjectID(req.body['_id'])
	let oModif = {
		"_id": id,
		nom: req.body.nom,
		prenom: req.body.prenom,
		ville: req.body.ville,
		telephone: req.body.telephone,
		courriel: req.body.courriel
	};
	db.collection('adresse').save(oModif, (err, resultat) => {
		if (err) return console.log(err)
		res.send({
			oModif,
			msg: "Profil mis à jour"
		});
	})
});

// Modifie un membre du tableau et affiche un message
app.post('/modifier-tab-ajax', (req, res) => {
	let id = ObjectID(req.body.id)
	let oModif = {
		"_id": id,
		nom: req.body.nom,
		prenom: req.body.prenom,
		ville: req.body.ville,
		telephone: req.body.telephone,
		courriel: req.body.courriel
	};
	db.collection('adresse').save(oModif, (err, resultat) => {
		if (err) return console.log(err);
		res.send(oModif.prenom + " " + oModif.nom + " a été correctement modifié");
	})
});

// Ajoute un membre et l'affiche directement
app.post('/ajouter-ajax', (req, res) => {
	let oNouveau = {
		nom: req.body.nom,
		prenom: req.body.prenom,
		ville: req.body.ville,
		telephone: req.body.telephone,
		courriel: req.body.courriel
	}
	db.collection('adresse').save(oNouveau, (err, resultat) => {
		if (err) return console.log(err)
		res.send({
			oNouveau,
			id: resultat.ops[0]._id,
			msg: oNouveau.prenom + " " + oNouveau.nom + " a été correctement ajouté",
			membreVide:false
		})
	})
});

// Ajoute un membre vide et l'affiche directement
app.post('/ajout-vide-ajax', (req, res) => {
	db.collection('adresse').save(req.body, (err, resultat) => {
		if (err) return console.log(err)
		res.send({
			id: resultat.ops[0]._id,
			msg: "Un membre vide a été ajouté",
			membreVide: true
		});
	})
});

// Supprime un membre dans le tableau des membres et envoie l'id et un message
app.post('/detruire-ajax', (req, res) => {
	let id = ObjectID(req.body.id);
	let prenom = req.body.prenom;
	let nom = req.body.nom;
	db.collection('adresse').findOneAndDelete({_id: id}, (err, resultat) => {
		res.send({ 
			id: id, 
			msg: prenom + " " + nom + " - Membre supprimé" 
		});
	});
});

let db // Initialisation de la base de données
// Connection à la BD
MongoClient.connect('mongodb://127.0.0.1:27017', (err, database) => {
	if (err) return console.log(err)
	db = database.db('carnet_adresse')
	// lancement du serveur Express sur le port 8081
	server.listen(8081, () => {
		console.log('connexion à la BD et on écoute sur le port 8081')
	})
})