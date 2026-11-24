/* Optional: regenerate static HTML after content changes. No dependencies. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'..');
const context = {window:{}};
vm.createContext(context);
for(const file of ['content.js','render.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const config = context.window.PORTFOLIO;
const render = context.window.PortfolioRender;
const pages = [['index.html','home','Portfolio'],...config.sections.map(section=>[section.href,section.id,section.title]),['project.html','project','Project']];
for(const [file,page,title] of pages){
  const active = page === 'about' ? 'about' : page === 'cv' ? 'cv' : 'work';
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${render.escape(config.description)}">
  <meta name="theme-color" content="${page === 'home' ? '#081d13' : '#121713'}">
  <title>${render.escape(title)} — ${render.escape(config.name)}</title>
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="theme.css">
  <script defer src="content.js"></script>
  <script defer src="render.js"></script>
  <script defer src="cards.js"></script>
  <script defer src="app.js"></script>
</head>
<body data-page="${page}">
  <a href="#main" class="skip-link">Skip to content</a>
  <header class="site-header shell">
    <a href="index.html" class="site-name" data-name>${render.escape(config.name)}</a>
    <nav class="site-nav" aria-label="Main navigation">${page === 'home' ? `
      <a class="home-contact" href="mailto:${render.escape(config.cv.email)}">Contact Me</a>` : `
      <a href="index.html" data-nav="work"${active === 'work' ? ' aria-current="page"' : ''}>Work</a>
      <a href="about.html" data-nav="about"${active === 'about' ? ' aria-current="page"' : ''}>About</a>
      <a href="cv.html" data-nav="cv"${active === 'cv' ? ' aria-current="page"' : ''}>CV</a>`}
    </nav>
  </header>
  <main id="main" class="shell" tabindex="-1">${page === 'project' ? '<header class="page-head"><h1>Project details</h1><p class="page-intro"><a href="projects.html">Browse the project collection</a></p></header>' : render.render(config,page)}</main>
  <footer class="site-footer shell" id="footer-content">${render.footer(config)}</footer>
</body>
</html>
`;
  fs.writeFileSync(path.join(root,file),html);
  console.log(file);
}
// Preserve links to the former section without retaining its old content.
fs.writeFileSync(path.join(root,'data-integration.html'),`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0;url=projects.html"><title>Projects — ${render.escape(config.name)}</title></head><body><main><h1>Projects</h1><p><a href="projects.html">Continue to Projects</a></p></main></body></html>`);
