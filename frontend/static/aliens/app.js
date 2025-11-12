// Setup Nunjucks loader
const env = new nunjucks.Environment(
  new nunjucks.WebLoader("/templates/aliens"), // path to .njk templates relative to root folder
  { autoescape: true }
);

// Generic render function for pages
async function renderPage(endpoint, templateName, targetId) {
  const res = await fetch(endpoint);
  console.log(endpoint);
  if (!res.ok) {
    document.getElementById(targetId).innerHTML = `<p>Failed to load page.</p>`;
    return;
  }
  const data = await res.json();
  console.log(data);
  const rendered = env.render(templateName, data);
  console.log(templateName);
  document.getElementById(targetId).innerHTML = rendered;
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
    console.log('is this running?');
    renderPage("typinggame-production.up.railway.app/aliens/", "layout.njk", "main-content");
});
