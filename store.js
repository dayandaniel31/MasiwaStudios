"use strict";

// Remplace les fiches d’exemple par tes propres produits et leurs liens d’achat.
// Publie uniquement des extraits ici. Confie la livraison des fichiers au prestataire de paiement.
const modeDemo = true;
const products = [
  {
    id: "saas",
    brand: "Forme",
    thumbnail: "Le travail, mieux organisé.",
    category: "Landing page",
    title: "Lancement SaaS",
    price: 9,
    description: "Présente ton logiciel avec une démo, un comparatif d’offres et un appel à l’essai.",
    excerpt: "Conçois une page de lancement pour [produit] destinée à [public]. Décris le problème dès le premier écran et propose [action principale] comme prochaine étape…",
    checkout: "",
  },
  {
    id: "boutique",
    brand: "Maison Moka",
    thumbnail: "L’art du café.",
    category: "E-commerce",
    title: "Boutique indépendante",
    price: 19,
    description: "Structure un catalogue avec collections, fiches produit et panier.",
    excerpt: "Crée une boutique pour [marque]. Organise les produits par [collections] et ajoute un parcours de découverte adapté aux achats sur mobile…",
    checkout: "",
  },
  {
    id: "portfolio",
    brand: "Studio Alba",
    thumbnail: "Design & direction artistique.",
    category: "Portfolio",
    title: "Portfolio créatif",
    price: 12,
    description: "Compose un portfolio avec une sélection de projets, des études de cas et un formulaire de contact.",
    excerpt: "Sélectionne [projets] et raconte pour chacun le contexte, le processus et le résultat. Prévois une mise en page qui laisse de la place aux visuels…",
    checkout: "",
  },
  {
    id: "vitrine",
    brand: "Atelier Rivage",
    thumbnail: "Des espaces qui respirent.",
    category: "Vitrine",
    title: "Vitrine pour indépendants",
    price: 15,
    description: "Présente tes services, ta zone d’intervention et tes modalités de réservation.",
    excerpt: "Organise les services de [activité] autour des questions de [clientèle]. Précise le secteur géographique et rends le contact accessible en un geste…",
    checkout: "",
  },
  {
    id: "createur",
    brand: "Éditions Sol",
    thumbnail: "Crée à ton rythme.",
    category: "Landing page",
    title: "Page de vente créateur",
    price: 12,
    description: "Présente une formation, un ebook ou un atelier avec un programme et une FAQ.",
    excerpt: "Introduis [offre] par le résultat concret que les visiteurs peuvent atteindre. Présente le programme, les prérequis, le format et les modalités d’accès…",
    checkout: "",
  },
  {
    id: "fiche",
    brand: "Objet Nord",
    thumbnail: "La lampe N° 04.",
    category: "E-commerce",
    title: "Fiche produit premium",
    price: 9,
    description: "Mets en valeur un produit avec galerie, caractéristiques et réponses aux questions d’achat.",
    excerpt: "Présente [produit] à partir de son usage principal et de ses variantes. Rassemble les dimensions, le prix et les informations de livraison à proximité de l’achat…",
    checkout: "",
  },
];

const grid = document.getElementById("produits");
const filters = document.getElementById("filtres");
const search = document.getElementById("recherche");
const results = document.getElementById("resultats");
const cartButton = document.getElementById("ouvrir-panier");
const cartBadge = document.getElementById("nombre");
const dialog = document.getElementById("fenetre");
const panel = document.getElementById("panneau");
const status = document.getElementById("statut");
const demoNotice = document.getElementById("mode-demo");
const productsById = new Map(products.map(product => [product.id, product]));
const categories = [...new Set(products.map(product => product.category))];
const currency = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const cartKey = "prompt-studio-panier-v1";
let activeCategory = "";
let cart = readCart();
let announcementFrame;

demoNotice.hidden = !modeDemo;

function readCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(cartKey));
    if (Array.isArray(stored)) {
      return new Set(stored.filter(id => productsById.has(id)));
    }
  } catch {
    // Le panier reste utilisable si le navigateur refuse le stockage local.
  }
  return new Set();
}

function updateCart() {
  cartBadge.textContent = cart.size;
  cartButton.setAttribute("aria-label", `Panier (${cart.size} ${cart.size === 1 ? "prompt" : "prompts"})`);
  try {
    localStorage.setItem(cartKey, JSON.stringify([...cart]));
  } catch {
    // La sélection est maintenue en mémoire pendant la visite.
  }
}

function announce(message) {
  cancelAnimationFrame(announcementFrame);
  status.textContent = "";
  announcementFrame = requestAnimationFrame(() => {
    status.textContent = message;
  });
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(label, className, handler) {
  const control = element("button", className, label);
  control.type = "button";
  control.addEventListener("click", handler);
  return control;
}

function textForSearch(value) {
  return value.toLocaleLowerCase("fr").normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function checkoutLink(product, className, label) {
  if (modeDemo || !product.checkout) return null;

  try {
    const url = new URL(product.checkout);
    if (url.protocol === "https:" && !url.username && !url.password) {
      const link = element("a", className, label);
      link.href = url.href;
      return link;
    }
  } catch {
    // Une fiche sans lien de paiement valide reste consultable.
  }
  return null;
}

function productArt(product) {
  const art = element("div", "card-art");
  art.dataset.cover = product.id;
  art.setAttribute("aria-hidden", "true");

  const page = element("div", "mini-page");
  const top = element("div", "mini-top");
  const dots = element("span", "mini-dots");
  dots.append(element("i"), element("i"), element("i"));
  top.append(element("span", "mini-brand", product.brand), dots);

  const body = element("div", "mini-body");
  body.append(
    element("div", "mini-title", product.thumbnail),
    element("span", "mini-lines"),
    element("span", "mini-action")
  );
  page.append(top, body);
  art.append(page);
  return art;
}

function productCard(product) {
  const card = element("article", "card");
  const copy = element("div", "card-copy");
  copy.append(
    element("p", "category", product.category),
    element("h3", "", product.title),
    element("p", "muted", product.description)
  );
  const footer = element("div", "card-footer");
  const details = button("Voir le prompt", "btn btn-outline", () => showProduct(product));
  details.setAttribute("aria-label", `Voir le prompt ${product.title}`);
  footer.append(element("strong", "price", currency.format(product.price)), details);
  copy.append(footer);
  card.append(productArt(product), copy);
  return card;
}

function renderCatalog() {
  const terms = textForSearch(search.value.trim()).split(/\s+/).filter(Boolean);
  const visible = products.filter(product => {
    const matchesCategory = !activeCategory || product.category === activeCategory;
    const searchable = textForSearch(`${product.title} ${product.category} ${product.description}`);
    return matchesCategory && terms.every(term => searchable.includes(term));
  });
  results.textContent = `${visible.length} ${visible.length === 1 ? "prompt" : "prompts"}`;
  grid.replaceChildren(...visible.map(productCard));
  if (!visible.length) {
    grid.append(element("p", "muted", "Aucun prompt ne correspond à ta recherche."));
  }
}

function renderFilters() {
  const filterButtons = ["", ...categories].map(category => {
    const control = button(category || "Tous les prompts", "filter", () => {
      activeCategory = category;
      for (const filter of filters.querySelectorAll("button")) {
        filter.setAttribute("aria-pressed", String(filter.dataset.category === category));
      }
      renderCatalog();
    });
    control.dataset.category = category;
    control.setAttribute("aria-pressed", String(category === activeCategory));
    return control;
  });
  filters.replaceChildren(...filterButtons);
}

function showPanel(heading, ...content) {
  heading.id = "titre-fenetre";
  heading.tabIndex = -1;
  dialog.setAttribute("aria-labelledby", heading.id);
  panel.replaceChildren(...content);
  if (!dialog.open) dialog.showModal();
  heading.focus();
}

function showProduct(product) {
  const category = element("p", "dialog-label category", product.category);
  const heading = element("h2", "", product.title);
  const description = element("p", "muted", product.description);
  const previewLabel = element("h3", "", "Extrait du prompt");
  const preview = element("blockquote", "prompt-excerpt", product.excerpt);
  const actions = element("div", "actions");
  const checkout = checkoutLink(product, "btn btn-primary", `Acheter · ${currency.format(product.price)}`);
  const addButton = button(
    cart.has(product.id) ? "Voir le panier" : "Ajouter au panier",
    checkout ? "btn btn-outline" : "btn btn-primary",
    () => {
      if (cart.has(product.id)) {
        showCart();
        return;
      }

      cart.add(product.id);
      updateCart();
      addButton.textContent = "Voir le panier";
      announce(`${product.title} ajouté au panier.`);
    }
  );
  if (checkout) {
    actions.append(checkout);
  } else {
    actions.append(element("strong", "price", currency.format(product.price)));
  }
  actions.append(addButton);
  const content = [category, heading, description, previewLabel, preview, actions];
  if (!checkout) {
    const notice = modeDemo ? "Fiche de démonstration. Aucun paiement possible." : "Achat momentanément indisponible.";
    content.push(element("p", "muted", notice));
  }
  showPanel(heading, ...content);
}

function showCart(removedIndex) {
  const heading = element("h2", "", "Ton panier");

  if (!cart.size) {
    const browse = button("Voir le catalogue", "btn btn-primary", () => {
      dialog.close();
      document.getElementById("produits").scrollIntoView({ block: "start" });
      search.focus({ preventScroll: true });
    });
    showPanel(heading, heading, element("p", "muted", "Ton panier est vide."), browse);
    return;
  }

  const selection = [...cart].map(id => productsById.get(id));
  const list = element("ul", "cart-list");
  let availableCount = 0;
  const removeButtons = [];

  selection.forEach((product, index) => {
    const item = element("li", "cart-item");
    const details = element("div", "cart-description");
    details.append(element("strong", "", product.title), element("span", "muted", currency.format(product.price)));

    const actions = element("div", "cart-actions");
    const checkout = checkoutLink(product, "btn btn-primary", "Acheter");
    if (checkout) {
      checkout.setAttribute("aria-label", `Acheter ${product.title}`);
      actions.append(checkout);
      availableCount += 1;
    }
    const remove = button("Retirer", "btn btn-outline", () => {
      cart.delete(product.id);
      updateCart();
      showCart(index);
      announce(`${product.title} retiré du panier.`);
    });
    remove.setAttribute("aria-label", `Retirer ${product.title} du panier`);
    actions.append(remove);
    removeButtons.push(remove);
    item.append(details, actions);
    list.append(item);
  });

  const total = selection.reduce((sum, product) => sum + product.price, 0);
  const totalLine = element("p", "cart-total", `Total de la sélection · ${currency.format(total)}`);
  const notice = modeDemo
    ? "Panier de démonstration. Aucun paiement ne sera effectué."
    : availableCount
      ? "Chaque prompt se paie séparément avec le bouton Acheter de sa ligne."
      : "Les achats sont momentanément indisponibles.";

  showPanel(heading, heading, list, totalLine, element("p", "muted", notice));
  if (removedIndex !== undefined) {
    removeButtons[Math.min(removedIndex, removeButtons.length - 1)].focus();
  }
}

cartButton.addEventListener("click", () => showCart());
search.addEventListener("input", renderCatalog);
renderFilters();
renderCatalog();
updateCart();
