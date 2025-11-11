// Setup Nunjucks loader
const env = new nunjucks.Environment(
  new nunjucks.WebLoader("../../templates/aliens"), // path to your .njk templates
  { autoescape: true }
);

// Generic render function for pages
async function renderPage(endpoint, templateName, targetId) {
  const res = await fetch(endpoint);
  if (!res.ok) {
    document.getElementById(targetId).innerHTML = `<p>Failed to load page.</p>`;
    return;
  }
  const data = await res.json();
  const rendered = env.render(templateName, data);
  document.getElementById(targetId).innerHTML = rendered;
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  renderPage("typinggame-production.up.railway.app/aliens", "index.njk", "main-content");
});
