La roue de STAINSBEAUPAYS™
============

#Prérequis

Afin de générer le projet vous avez besoin de [nodejs+npm](http://nodejs.org), [Sass en ligne de commande](http://sass-lang.com/install) et `grunt-cli`.

L'installation de `grunt-cli` se fait depuis un outil de commande — Terminal si vous êtes sur Mac, Invite de commande si vous êtes sur Window – en tappant `npm install grunt-cli -g`. Une fois ces éléments installés, rendez-vous dans le répertoire du projet avec votre outil de commande et tapez `npm install`. Cette commande installera toutes les dépendances requises pour utiliser le projet.

Le projet est basé sur la librairie [Backbone](http://backbonejs.org). Des connaissances en Backbone ou tout autre MV* sont fortement conseillées.

#Utilisation

`npm start` lance un écouteur de fichier permettant de compiler le projet à chaque modification de code. Il lance aussi un serveur de consultation local à l'adresse `http://localhost:3000`

Le code compilé et accessible depuis `http://localhost:3000` se trouve dans le répertoire `/publish`, à la racine du projet.

#Modifications

##config.json
Le fichier `config.json` donne accès aux paramètres suivants :

###cdn
Permet de choisir le serveur utilisé pour servir les vidéos et les images lors de l'avancée dans une vidéo. Utiliser `"/"` pour utiliser le même serveur que celui sur lequel est hébergé le code.
````json
{
  "cdn": "/",
  ...
}
````

###colors
Les 3 types de couleurs utilisées sur la roue. Par défaut :

* **outer**: contenus jaunes
* **center**: contenus jaunes strillés
* **inner**: contenus noirs

````json
{
  ...,
  "colors": {
    "outer": "#fff700",
    "center": "#fff700",
    "inner": "#111111"
  },
  ...
}
````

###pages

Tableau associatif entre les identifiants internes de pages et les hash localisés visibles dans l'url
````json
{
  ...,
  "pages": {
    "link1": "lien1",
    "link2": "lien2",
    "wheel": "roue"
  },
  ...
}
````

###tracks
Tableau comprenant les vidéos à utiliser dans la roue.
Chaque vidéo comprend les informations suivantes :

* **id** : identifiant de la vidéo (utilisé comme nom de fichier si `name` n'est pas fourni)
* **type** : placement dans la roue
* **duration** : durée en secondes de la vidéo (utilisé pour générer la portion de cercle)
* **name** : nom du fichier vidéo (sans extension)
* **title** : titre de la vidéo
* **description** : description de la vidéo

````json
{
  ...,
  "tracks": [
    {
      "id": 1,
      "type": "inner",
      "duration": 102957.279,
      "name": "video01",
      "title": "Titre 1",
      "description": "Description 1"
    },
    {
      "id": 2,
      "type": "outer",
      "duration": 12957.79,
      "name": "video02",
      "title": "Titre 2",
      "description": "Description 2"
    },
    ...
  ]
}
````

#Vidéos

Le projet se base sur des vidéos aux formats suivants :

* **.mp4** — codec video : h264, codex audio : AAC — pour Safari, Chrome et Internet Explorer
* **.webm** - codec video : vp8, codec audio : Ogg Vorbis — pour Firefox, Opera et Chrome

Le chemin d'appel des vidéos se base sur la valeur du noeud `cdn` défini dans le fichier `config.json` puis du répertoire `wheel` ; s'en suit le répertoire qualité (`sd`, `md`, `hd`) puis le nom du fichier vidéo et enfin l'extension.

Par exemple, dans le cas où l'on appelle une vidéo nommée `video01` en qualité `sd` depuis un `cdn` `"/"` sous le navigateur Safari on optiendra l'appel suivant :`/wheel/sd/video01.mp4`

#Rotation de la roue

Lors de la rotation de la roue, des images de fond sont affichées. Ces images sont appelées depuis le répertoire `/medias/dyn/rotation`. Le nom du fichier image est lié à la rotation de la roue : `000.jpg`, `200.jpg` jusqu'au fichier `360.jpg`. Le code est prévu pour appeller des images au format `.webp` si le navigateur prend en charge ce type d'images sinon le format `.jpg` est utilisé.


#Compilation

La compilation du projet est gérée par [Grunt](http://gruntjs.com). La liste des tâches disponibles sur le projet se trouve dans le répertoire `/tasks`.

Les commandes `grunt dev` et `grunt release` compilent respectivement le projet dans une version développement non optimisé et une version de production générant, entre autres, des `css` et les `js` minifiés.