# VoX - Overlay Pro : Guide Utilisateur Complet -_- /
**Basé sur le code de shinkonet, adapté et amélioré pour Wplace.**

Bienvenue dans **VoX - Overlay Pro** !  
Ce guide vous aidera à maîtriser tous les outils que le script met à votre disposition, depuis la mise en place de votre premier design jusqu’à l’utilisation des fonctions avancées pour coordonner et planifier vos projets.

---

**<p align="center"><strong>TRANSLATIONS</strong></p>**
<p align="center">
    <a href="README_EN.md"><img src="https://flagcdn.com/48x36/us.png" alt="US Flag"></a>
  &nbsp;
    <a href="README.md"><img src="https://flagcdn.com/48x36/es.png" alt="SpainFlag"></a>
</p>

---

## **1. Installation**

Pour utiliser le script, vous devez d’abord installer une extension de navigateur appelée **Tampermonkey**.

1. Installez Tampermonkey :

**IMPORTANT, SUR TÉLÉPHONE CELA NE FONCTIONNE QU’AVEC LE NAVIGATEUR MICROSOFT EDGE – AJOUTEZ L’EXTENSION VIA LE MENU**

   - [Tampermonkey pour Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Tampermonkey pour Firefox](https://addons.mozilla.org/es/firefox/addon/tampermonkey/)
   - [Autres navigateurs](https://www.tampermonkey.net/)

3. Installez le script :  
   Une fois Tampermonkey installé, allez simplement sur la page des Releases de GitHub et cliquez sur https://github.com/SrCratier/Wplace_VoX-Overlay-Pro/releases/download/v4.9.1/WplacePro-VoX.user.js ou sur le fichier **WplacePro-VoX.user.js**.  
   Tampermonkey s’ouvrira automatiquement et vous proposera d’installer le script.

---

## **2. Votre Premier Overlay : Étapes Essentielles**

C’est la fonction principale du script. Suivez ces étapes pour placer votre premier design sur le canevas.

**Étape 1 : Créer un nouvel Overlay**  
Dans le panneau du script, allez dans l’onglet **Overlays** et cliquez sur le bouton **+ Add**. Cela créera un nouvel espace pour votre image.

**Étape 2 : Ajouter votre image**  
Avec le nouvel overlay sélectionné, allez dans l’onglet **Editor**. Vous avez deux façons d’ajouter votre image :
- **Depuis une URL :** Collez un lien direct vers une image (.png, .jpg, etc.) dans le champ texte et cliquez sur **Load**.  
- **Depuis un fichier local :** Cliquez dans la zone en pointillés ou glissez-déposez un fichier image depuis votre ordinateur.  
  *(Remarque : les overlays avec des images locales ne peuvent pas être exportés ou partagés avec d’autres).*

**Étape 3 : Définir la position (l’étape la plus importante !)**  
Une fois l’image chargée, le script doit savoir où la placer sur le canevas.
1. Cliquez sur le bouton **Set Position: OFF** pour l’activer. Il passera à **Set Position: ON**.  
2. Allez sur le canevas du jeu et cliquez sur le pixel exact correspondant au coin supérieur gauche (0,0) de votre image.  
3. Terminé ! Le script fixera l’image à cette coordonnée. Le mode **Set Position** se désactivera automatiquement.

---

## **3. Le Panneau Principal : Vue d’Ensemble**

L’interface est conçue pour être à la fois puissante et intuitive. Voici un résumé des principaux contrôles :

- **Overlay: ON/OFF** → Active ou désactive l’affichage de tous vos overlays.  
- **Mode: Minify** → Change la façon dont l’overlay est affiché :  
  - *Minify (Recommandé) :* Affiche votre design comme une grille de points, ce qui vous permet de voir le canevas en dessous.  
  - *Behind/Above :* Affiche l’image complète derrière ou devant le canevas.  
  - *Original :* Ne modifie pas le canevas, idéal pour voir l’état réel de la fresque.  
- **Show Errors: ON/OFF** → Met en évidence en rouge les pixels du canevas qui ne correspondent pas à votre design.  
- **Set Position: ON/OFF** → Active le mode permettant de définir la position de votre image sur le canevas.  

---

## **4. Fonctions Détaillées par Onglet**

### **Onglet Overlays**
Ici vous gérez toutes vos images.

- **Activer un Overlay :** Cliquez sur le bouton radio à côté du nom pour le sélectionner comme overlay actif (un seul peut être actif à la fois).  
- **Activer/Désactiver :** Utilisez la case à cocher pour afficher ou masquer un overlay spécifique sans le supprimer.  
- **Aperçu :** Lorsqu’un overlay avec image est sélectionné, un aperçu apparaît en bas.  
- **Importer/Exporter :** Partagez vos designs avec d’autres grâce aux boutons **Import** et **Export**.  

### **Onglet Editor**
Ici vous ajustez l’overlay actif.

- **Nom :** Modifiez le nom de votre overlay pour mieux vous organiser.  
- **Outils d’Image :**  
  - **Save :** Télécharge la version actuelle de l’image de l’overlay sur votre ordinateur.  
  - **Resize :** Ouvre un menu avancé pour redimensionner votre image.  
  - **Color Tools :** Ajuste les couleurs de votre image à la palette officielle du jeu.  
- **Opacité :** Ajustez la transparence de votre overlay.  
- **Ajustement Fin (Nudge) :** Utilisez les flèches pour déplacer votre overlay pixel par pixel.  

### **Onglet Tools**
Ici se trouvent les utilitaires les plus puissants du script.

- **Copier le Canevas :**  
  1. Cliquez sur **Set Point A** puis sur un pixel du canevas.  
  2. Cliquez sur **Set Point B** pour marquer le coin opposé.  
  3. Utilisez **View Area** pour vérifier la sélection.  
  4. Cliquez sur **Detect and Download** pour enregistrer la zone sélectionnée.  

- **Afficher la Progression de l’Overlay :**  
  - Lorsqu’il est activé, un panneau flottant apparaît avec la progression en temps réel de votre overlay.  
  - **Mettre en évidence les manquants :** Marque en cyan les pixels encore manquants.  
  - **Paramètres (⚙️) :** Options pour trier par quantité, mettre en évidence les couleurs disponibles et ajuster la transparence.  
  - **Replier le panneau :** Minimise le panneau pour ne pas gêner pendant la peinture.  

---

## **5. Paramètres et Support**

- **Paramètres Généraux :**  
  - Thème de l’interface (clair/sombre).  
  - Transparence du panneau principal.  

- **Soutenir le Projet :**  
  Ce projet est gratuit et réalisé avec soin. Si vous le trouvez utile, envisagez de soutenir son développement par un don (vous trouverez l’option dans les menus de paramètres).  

---

Amusez-vous à créer et à coordonner vos projets sur **wplace.live** !
