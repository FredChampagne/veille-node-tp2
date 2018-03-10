/* 
  Pour établir une communication socket il faut un premier appel de
   la fonction io()
   Cette fonction est incluse dans la librairie socket.io. 
   Cette fonction déclenche un événement connect vers le serveur
   */
let socket;
window.onload = () => {
    socket = io();
    console.log(socket.id);
    // Connexion
    socket.on('connect', function () {
        console.log('Le socket id = ' + socket.id);
    });
    // Valide l'utilisateur pour accéder au chat
    socket.on('valide_user', function (data) {
        console.log('data en provenance du serveur = ' + data.user)
        let elmEnregistrement = document.getElementById('enregistrement');
        elmEnregistrement.style.display = 'none';
        let elmChat = document.getElementById('chat');
        elmChat.style.display = 'flex';
    })
    // Permet la diffusion des utilisateurs connectés
    socket.on('diffuser_list_user', function (data) {
        afficher_table_users(data);
    });
    // Permet de diffuser le message aux utilisateurs
    socket.on('diffuser_message', function (data) {
        afficher_mon_message(data.user, data.message, 'rgb(236, 236, 236)');
    });
    // Permet de valider le message (l'utilisateur en cours qui l'envoie)
    socket.on('valide_message', function (data) {
        afficher_mon_message(data.user, data.message, 'rgb(167, 211, 255)');
    });
    // Affiche la déconnexion d'un utilisateur
    socket.on('deconnexion', function (data) {
        deconnexion(data);
    });
}
/**
 * Enregistre l'utilisateur entré dans le champs de texte approprié
*/
function enregistrement() {
    var elmUser = document.querySelector('#enregistrement input');
    // l'événement « setUser » est transmit avec un objet contenant le nom de l'utilisateur
    socket.emit('setUser', { user: elmUser.value });
}
/**
 * Transmet le message entré dans le champs de texte approprié
*/
function transmettre() {
    //console.log("J'envoie un message");
    let msg = document.getElementById('txtMessage').value;
    // l'événement « setMessage » est transmit avec un objet contenant le message
    socket.emit('setMessage', { message: msg });
}
/**
 * Affiche les utilisateurs dans le tableau list_user
 * @param {obj} data - Les utilisateurs du chat
*/
function afficher_table_users(data) {
    let sChaine = "";
    let elmListUser = document.querySelector('#list_user tbody');
    // Pour chaque utilisateur (id), on l'affiche dans une rangée
    for (id in data) {
        sChaine = "";
        let objRow = document.createElement('tr');
        sChaine += '<td>' + id + '</td>'
            + '<td>' + data[id] + '</td>';
        elmListUser.appendChild(objRow);
        objRow.innerHTML += sChaine;
    }
}
/**
 * Affiche le message envoyé dans le tableau chat
 * @param {string} user - Nom de l'utilisateur qui envoie le message
 * @param {string} msg - Message envoyé
 * @param {string} couleur - Couleur selon le destinateur
*/
function afficher_mon_message(user, msg, couleur) {
    let sChaine = '';
    let elmMessages = document.querySelector('#message tbody');
    let objRow = document.createElement('tr');
    objRow.style.backgroundColor = couleur;
    sChaine += '<td>' + user + '</td>'
        + '<td>' + msg + '</td>'
    elmMessages.appendChild(objRow);
    objRow.innerHTML += sChaine;
}
/**
* Gère la déconnexion
* @param {user} L'utilisateur qui s'est déconnecté
*/
function deconnexion(user) {
    let elmLog = document.getElementById('log');
    elmLog.style.display = "block";
    let msgDeconnexion = document.createElement('p');
    msgDeconnexion.innerHTML = "L'utilisateur " + user + " s'est déconnecté.";
    elmLog.appendChild(msgDeconnexion);
}