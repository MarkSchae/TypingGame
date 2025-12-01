// Setup Nunjucks loader
const env = new nunjucks.Environment(
  new nunjucks.WebLoader("/templates/aliens"), // path to .njk templates relative to root folder
  { autoescape: true }
);

async function renderPage(endpoint, templateName, targetId) {
  console.log("Fetching from:", endpoint);

  try {
    const res = await fetch(endpoint, {
        credentials: "include", // send cookies for session
    });
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
    renderPage("https://typinggame-production.up.railway.app/aliens/", "layout.njk", "page-content");
});

document.addEventListener("click", (e) => {
  const link = e.target.closest(".nav-link-api");
  if (!link) return;

  e.preventDefault();
  const endpoint = link.dataset.endpoint;
  const template = link.dataset.template;

  renderPage(endpoint, template, "page-content");
});


document.addEventListener("submit", async (e) => {
    if(e.target.matches('#login-form')) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        try {
            const res = await fetch("https://typinggame-production.up.railway.app/aliens/login", {
                method: "POST",
                credentials: "include", // send cookies for session
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                // Login successful, render home page
                renderPage("https://typinggame-production.up.railway.app/aliens/", "index.njk", "page-content");
            } else {
                // Show error message
                renderPage("https://typinggame-production.up.railway.app/aliens/login", "login.njk", "page-content");
            }
        } catch (err) {
            console.error("Login error:", err);
        }
    }
});


document.addEventListener("submit", async (e) => {
    if(e.target.matches('#register-form')) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        try {
            const res = await fetch("https://typinggame-production.up.railway.app/aliens/register", {
                method: "POST",
                credentials: "include",
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                // Registration successful, render home page
                renderPage("https://typinggame-production.up.railway.app/aliens/", "index.njk", "main-content");
            } else {
                // Show error message, re-render register page
                renderPage("https://typinggame-production.up.railway.app/aliens/register", "register.njk", "main-content");
            }
        } catch (err) {
            console.error("Registration error:", err);
        }
    }
});