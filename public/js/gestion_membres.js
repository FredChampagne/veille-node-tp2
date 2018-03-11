
    // Gère le click sur le bouton qui permet de supprimer un membre du tableau
    $(".supprimer").each(function() {
        $(this).on("click", requeteSupprimer);
    });

    // Gère le click sur le bouton qui permet de modifier un membre du tableau
    $(".sauver").each(function() {
        $(this).on("click", requeteModifier);
    });

     // Gère le click sur le bouton qui permet d'ajouter un nouveau membre depuis le formulaire
     $(".form_ajout .bouton").on("click", requeteFormAjout);

    // Gère le click sur le lien "Ajouter un membre vide"
    $("#ajouterVide").on("click", requeteAjoutVide);
     



    // Fonction qui envoie une requête AJAX pour supprimer le membre
    function requeteSupprimer() {
        // Requête Ajax contenant les données nécessaires
        $.ajax({
            method: "POST",
            url: "/detruire-ajax",
            data: {
                id: $(this).closest('tr').find('.identifiant').text(),
                prenom: $(this).closest('tr').find('.prenom').text(),
                nom: $(this).closest('tr').find('.nom').text()
            }
        }).done(retirer);
    }

    // Fonction qui envoie une requête AJAX pour modifier le membre
    function requeteModifier(e) {
        let prenomMaj = majChaine($(this).closest('tr').find('.prenom').text()); 
        let nomMaj = majChaine($(this).closest('tr').find('.nom').text());
        // Requête Ajax contenant les données nécessaires
        $.ajax({
            method: "POST",
            url: "/modifier-ajax",
            data: {
                id: $(this).closest('tr').find('.identifiant').text(),
                prenom: prenomMaj,
                nom: nomMaj,
                telephone: $(this).closest('tr').find('.telephone').text(),
                courriel: $(this).closest('tr').find('.courriel').text()
            }
        }).done(modifier);
    }

    // Fonction qui envoie une requête AJAX pour ajouter le membre créé à partir du formulaire
    function requeteFormAjout(e) {
        // Ne pas soumettre le formulaire
        e.preventDefault();
        // On formatte le prénom et le nom avant l'envoie de la requête
        let champPrenom = $(this).closest('.form_ajout').find("input[name='prenom']");
        let champNom = $(this).closest('.form_ajout').find("input[name='nom']");
        let prenomMaj = majChaine($(champPrenom).val()); 
        let nomMaj = majChaine($(champNom).val());
        champPrenom.val(prenomMaj);
        champNom.val(nomMaj);
        // Requête Ajax contenant les éléments du formulaire
        $.ajax({
            method: "POST",
            url: "/ajouter-ajax",
            data: $(this).closest('form').serialize()
        }).done(ajouter);
    }

    // Fonction qui envoie une requête AJAX pour ajouter le membre créé à partir du formulaire
    function requeteAjoutVide(e) {
        // Ne pas se déplacer sur la page
        e.preventDefault();
        // Requête Ajax pour faire l'ajout simple
        $.ajax({
            method: "POST",
            url: "/ajout-vide-ajax"
        }).done(ajouter);
    }

    /**
     * Retire le membre supprimé de l'affichage
     * @param {object} data Informations retournées (id et msg)
     */
    function retirer(data) {
        // Retire le membre de l'affichage
        $("td:contains('"+data.id+"')").closest('tr').remove();
        // Affiche le message de réussite
        afficherMsg(data.msg);
    }

    /**
     * Met à jour le membre dans l'affichage
     * @param {string} msg Message confirmant la modification
     */
    function modifier(msg) {
        // Affiche le message de réussite
        afficherMsg(msg);
    }

    /**
     * Ajoute le membre créé dans l'affichage
     * @param {object} data Informations retournées (infos membre et msg)
     */
    function ajouter(data) {
        // Affiche le message de réussite
        afficherMsg(data.msg);
        // Copie le gabarit, retire la classe gabarit
        // et le met dans le tableau
        let rangeMembre = $('tr.gabarit').clone();
        $(rangeMembre).removeClass("gabarit");
        $(rangeMembre).appendTo(".tableau tbody");
        if(data.membreVide == false) {
            // Ajoute les différents champs
            $(rangeMembre).find('.prenom').text(data.oNouveau.prenom);
            $(rangeMembre).find('.nom').text(data.oNouveau.nom);
            $(rangeMembre).find('.telephone').text(data.oNouveau.telephone);
            $(rangeMembre).find('.courriel').text(data.oNouveau.courriel);
        }
        $(rangeMembre).find('.identifiant').text(data.id);
        $(rangeMembre).find('.profil a').attr("href", "/profil/" + data.id);
        // Se positionne au message
        $(document).scrollTo('#msgAjax');
    }



    function afficherMsg(msg) {
        $('#msgAjax').css("display","block");
        $('#msgAjax').text(msg);
    }

    function majChaine(chaine) {
        chaine = chaine.charAt(0).toUpperCase() + chaine.slice(1).toLowerCase();
        return chaine;
    }
