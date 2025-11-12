// Setup Nunjucks loader
const env = new nunjucks.Environment(
  new nunjucks.WebLoader("/templates/aliens"), // path to .njk templates relative to root folder
  { autoescape: true }
);

async function renderPage(endpoint, templateName, targetId) {
  console.log("Fetching from:", endpoint);

  try {
    const res = await fetch(endpoint);
    console.log("Response status:", res.status);

    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status}`);
    }

    const data = await res.json();
    console.log("Fetched data:", data);

    const rendered = env.render(templateName, data);
    document.getElementById(targetId).innerHTML = rendered;

  } catch (err) {
    console.error("Error fetching or rendering:", err);
    document.getElementById(targetId).innerHTML = `<p>Failed to load page.</p>`;
  }
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
    console.log('is this running?');
    renderPage("https://typinggame-production.up.railway.app/aliens/", "layout.njk", "main-content");
});

document.addEventListener("click", (e) => {
  const link = e.target.closest(".nav-link-api");
  if (!link) return;

  e.preventDefault();
  const endpoint = link.dataset.endpoint;
  const template = link.dataset.template;

  renderPage(endpoint, template, "main-content");
});
