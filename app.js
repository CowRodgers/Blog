const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // Importez uuid
const app = express();
const port = 3000;

// Utilisation du moteur de templates EJS
app.set('view engine', 'ejs');

// Middleware pour servir les fichiers statiques dans le dossier public
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


// Chemin vers le fichier JSON des articles
const postsPath = 'posts.json';

// Charger les articles à partir du fichier JSON
let posts = [
  { id: 1, title: 'Premier Post', content: 'Ceci est le contenu du premier post.' },
  { id: 2, title: 'Second Post', content: 'Ceci est le contenu du second post.' },
];
if (fs.existsSync(postsPath)) {
  const data = fs.readFileSync(postsPath);
  posts = JSON.parse(data);
}

// Route pour la page d'accueil (liste des articles)
app.get('/', (req, res) => {
  res.render('index', { posts: posts });
});

// gérer la soumission du formulaire et ajouter le nouveau post à la liste
app.post('/add-post', (req, res) => {
  const { title, content } = req.body;
  const newPost = { id: uuidv4(), title, content }; // Générer un nouvel identifiant unique
  posts.push(newPost);
  savePosts();
  res.redirect('/');
});

// Route pour afficher un article individuel
app.get('/post/:id', (req, res) => {
  const id = req.params.id;
  const post = posts.find(post => post.id == String(id));
  if (!post) return res.status(404).send('Post not found.');
  res.render('post', { post });
});

//route pour la page d'édition de l'article
app.get('/edit-post/:id', (req, res) => {
  const postId = req.params.id;
  const post = posts.find(post => post.id == String(postId));
  res.render('edit-post', { post });
});

app.post('/edit-post/:id', (req, res) => {
  const postId = req.params.id;
  const { title, content } = req.body;
  const postIndex = posts.findIndex(post => post.id == String(postId));
  if (postIndex !== -1) {
    posts[postIndex].title = title;
    posts[postIndex].content = content;
    savePosts();
  }
  res.redirect('/');
});

// pour supprimer un article
app.post('/delete-post/:id', (req, res) => {
  const postId = req.params.id;
  posts = posts.filter(post => post.id != String(postId));
  savePosts();
  res.redirect('/');
});

// Enregistrer les articles dans le fichier JSON
function savePosts() {
  fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
}

// Lancement du serveur
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
