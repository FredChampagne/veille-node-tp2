
    // Gère le click sur le bouton qui permet de supprimer un membre du tableau
    $(".supprimer").each(function() {
        $(this).on("click", requeteSupprimer);
    });

    // Gère le click sur le bouton qui permet de modifier un membre du tableau
    $(".sauver").each(function() {
        $(this).on("click", requeteModifier);
    });

    // Fonction qui envoie une requête AJAX pour supprimer le membre
    function requeteSupprimer() {
        $.ajax({
            method: "POST",
            url: "/detruire-ajax",
            data: {
                id: $(this).closest('tr').find('.identifiant').text(),
                prenom: $(this).closest('tr').find('.prenom').text(),
                nom: $(this).closest('tr').find('.nom').text(),
                telephone: $(this).closest('tr').find('.telephone').text(),
                courriel: $(this).closest('tr').find('.courriel').text()
            }
        }).done(retirer);
    }

    // Fonction qui envoie une requête AJAX pour modifier le membre
    function requeteModifier() {
        $.ajax({
            method: "POST",
            url: "/modifier-ajax",
            data: {
                id: $(this).closest('tr').find('.identifiant').text(),
                prenom: $(this).closest('tr').find('.prenom').text(),
                nom: $(this).closest('tr').find('.nom').text(),
                telephone: $(this).closest('tr').find('.telephone').text(),
                courriel: $(this).closest('tr').find('.courriel').text()
            }
        }).done(modifier);
    }

    /**
     * Retire le membre supprimé de l'affichage
     * @param {string} id Identifiant du membre supprimé
     */
    function retirer(id) {
        $("td:contains('"+id+"')").closest('tr').remove();
    }
