let links = [];
const form = document.querySelector("#bookmark-form");
const list = document.querySelector("#bookmark-list");
const emptyMessage = document.querySelector("#empty-message");
const search = document.querySelector("#search");
const filter = document.querySelector("#filter");

async function apiRequest(path = "", options = {}) {
  const response = await fetch(`/api/bookmarks${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers }
  });
  if (!response.ok) {
    throw new Error(response.status === 404 ? "Bookmark not found." : "Could not save the bookmark.");
  }
  return response.status === 204 ? null : response.json();
}

function setStatus(message) {
  document.querySelector("#status-message").textContent = message;
}

function makeRow(link) {
  const row = document.createElement("article");
  row.className = "bookmark-row";

  const mark = document.createElement("span");
  mark.className = "link-mark";
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = link.title.charAt(0).toUpperCase();

  const info = document.createElement("div");
  info.className = "bookmark-info";
  const title = document.createElement("a");
  title.className = "bookmark-title";
  title.href = link.url;
  title.target = "_blank";
  title.rel = "noopener noreferrer";
  title.textContent = link.title;
  const url = document.createElement("div");
  url.className = "bookmark-url";
  url.textContent = new URL(link.url).hostname.replace(/^www\./, "");
  const meta = document.createElement("div");
  meta.className = "bookmark-meta";
  const category = document.createElement("span");
  category.className = "category";
  category.textContent = link.category;
  meta.append(category);
  if (link.tag) {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = link.tag;
    meta.append(tag);
  }
  info.append(title, url, meta);

  const actions = document.createElement("div");
  actions.className = "row-actions";
  const favorite = document.createElement("button");
  favorite.className = `row-button${link.favorite ? " is-favorite" : ""}`;
  favorite.type = "button";
  favorite.textContent = link.favorite ? "★" : "☆";
  favorite.setAttribute("aria-label", link.favorite ? "Remove from favorites" : "Add to favorites");
  favorite.addEventListener("click", () => toggleFavorite(link));
  const edit = document.createElement("button");
  edit.className = "row-button";
  edit.type = "button";
  edit.textContent = "Edit";
  edit.addEventListener("click", () => editLink(link));
  const remove = document.createElement("button");
  remove.className = "row-button remove";
  remove.type = "button";
  remove.textContent = "Delete";
  remove.addEventListener("click", () => deleteLink(link.id));
  actions.append(favorite, edit, remove);
  row.append(mark, info, actions);
  return row;
}

function render() {
  const query = search.value.trim().toLowerCase();
  const chosenFilter = filter.value;
  const visibleLinks = links.filter((link) => {
    const matchesFilter = chosenFilter === "all"
      || (chosenFilter === "favorites" ? link.favorite : link.category === chosenFilter);
    const matchesSearch = `${link.title} ${link.url} ${link.category} ${link.tag || ""}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
  list.replaceChildren(...visibleLinks.map(makeRow));
  list.hidden = visibleLinks.length === 0;
  emptyMessage.hidden = visibleLinks.length > 0;
  emptyMessage.textContent = links.length === 0
    ? "No bookmarks yet. Add one to get started."
    : "No bookmarks match. Try another search or category.";
}

async function toggleFavorite(link) {
  try {
    const saved = await apiRequest(`/${link.id}`, {
      method: "PUT",
      body: JSON.stringify({ ...link, favorite: !link.favorite })
    });
    links = links.map((item) => String(item.id) === String(saved.id) ? saved : item);
    render();
  } catch (error) {
    setStatus(error.message);
  }
}

function editLink(link) {
  document.querySelector("#bookmark-id").value = link.id;
  document.querySelector("#bookmark-name").value = link.title;
  document.querySelector("#bookmark-url").value = link.url;
  document.querySelector("#bookmark-category").value = link.category;
  document.querySelector("#bookmark-tag").value = link.tag || "";
  document.querySelector("#form-title").textContent = "Edit bookmark";
  document.querySelector("#save-button").textContent = "Save changes";
  form.hidden = false;
  document.querySelector("#bookmark-name").focus();
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

function clearForm() {
  form.reset();
  document.querySelector("#bookmark-id").value = "";
  document.querySelector("#form-title").textContent = "Add a bookmark";
  document.querySelector("#save-button").textContent = "Save bookmark";
  document.querySelector("#form-error").textContent = "";
}

async function deleteLink(id) {
  if (!window.confirm("Delete this bookmark?")) return;
  try {
    await apiRequest(`/${id}`, { method: "DELETE" });
    links = links.filter((link) => String(link.id) !== String(id));
    render();
    setStatus("Bookmark deleted.");
  } catch (error) {
    setStatus(error.message);
  }
}

document.querySelector("#show-form").addEventListener("click", () => {
  clearForm();
  form.hidden = false;
  document.querySelector("#bookmark-name").focus();
  form.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.querySelector("#cancel-form").addEventListener("click", () => {
  form.hidden = true;
  clearForm();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const rawUrl = document.querySelector("#bookmark-url").value.trim();
  let validUrl;
  try { validUrl = new URL(rawUrl); } catch { validUrl = null; }
  if (!validUrl || !["http:", "https:"].includes(validUrl.protocol)) {
    document.querySelector("#form-error").textContent = "Enter a valid link starting with http:// or https://.";
    return;
  }

  const id = document.querySelector("#bookmark-id").value;
  const previous = links.find((link) => link.id === id);
  const bookmark = {
    id: id || String(Date.now()),
    title: document.querySelector("#bookmark-name").value.trim(),
    url: validUrl.href,
    category: document.querySelector("#bookmark-category").value,
    tag: document.querySelector("#bookmark-tag").value.trim(),
    favorite: previous?.favorite || false
  };
  try {
    const saved = await apiRequest(id ? `/${id}` : "", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(bookmark)
    });
    if (previous) links = links.map((link) => String(link.id) === id ? saved : link);
    else links.unshift(saved);
    form.hidden = true;
    clearForm();
    render();
    setStatus(previous ? "Bookmark updated." : "Bookmark added.");
  } catch (error) {
    document.querySelector("#form-error").textContent = error.message;
  }
});

search.addEventListener("input", render);
filter.addEventListener("change", render);

async function loadLinks() {
  try {
    links = await apiRequest();
    render();
  } catch {
    render();
    setStatus("Could not load bookmarks. Check the app and MySQL connection.");
  }
}

loadLinks();
