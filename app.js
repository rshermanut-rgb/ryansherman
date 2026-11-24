(() => {
  'use strict';
  const config = window.PORTFOLIO;
  const page = document.body.dataset.page;
  const id = new URLSearchParams(location.search).get('id');
  document.getElementById('main').innerHTML = window.PortfolioRender.render(config,page,id);
  window.PortfolioCards?.init(document);
  document.getElementById('footer-content').innerHTML = window.PortfolioRender.footer(config);
  document.querySelectorAll('[data-name]').forEach(node => node.textContent = config.name);
  const section = config.sections.find(section => section.id === page);
  const project = config.projects.find(project => project.id === id);
  const title = page === 'home' ? 'Portfolio' : page === 'project' ? project?.title || 'Project not found' : section?.title || 'Portfolio';
  document.title = title + ' — ' + config.name;
  document.querySelector('meta[name="description"]').content = page === 'home' ? config.description : project && page === 'project' ? project.summary : section?.intro || config.description;
  const active = page === 'about' ? 'about' : page === 'cv' ? 'cv' : 'work';
  document.querySelectorAll('[data-nav]').forEach(node => {
    if (node.dataset.nav === active) node.setAttribute('aria-current','page');
    else node.removeAttribute('aria-current');
  });
  document.querySelector('[data-print]')?.addEventListener('click', () => window.print());
  const cvDetails=[...document.querySelectorAll('.cv-details')];
  const setCvExpanded=open=>{
    cvDetails.forEach(detail=>{detail.open=open;});
    const status=document.getElementById('cv-expansion-status');
    if(status)status.textContent=open?'All CV entries expanded.':'All CV entries collapsed.';
  };
  document.querySelector('[data-cv-expand]')?.addEventListener('click',()=>setCvExpanded(true));
  document.querySelector('[data-cv-collapse]')?.addEventListener('click',()=>setCvExpanded(false));
  let cvPrintState;
  window.addEventListener('beforeprint',()=>{
    if(!cvDetails.length)return;
    cvPrintState=cvDetails.map(detail=>detail.open);
    cvDetails.forEach(detail=>{detail.open=true;});
  });
  window.addEventListener('afterprint',()=>{
    if(!cvPrintState)return;
    cvDetails.forEach((detail,index)=>{detail.open=cvPrintState[index];});
    cvPrintState=undefined;
  });
  const projectSearch = document.getElementById('project-search');
  const projectSort = document.getElementById('project-sort');
  const initialGroup = new URLSearchParams(location.search).get('group');
  let projectFilter = ['all','work','grants',...(config.projectGroups || []).map(group=>group.id)].includes(initialGroup) ? initialGroup : 'all';
  const updateProjects = () => {
    const items = window.PortfolioRender.filterProjects(config,projectFilter,projectSearch.value,projectSort.value);
    document.getElementById('project-catalogue').innerHTML = window.PortfolioRender.projectCollection(config,items);
    document.getElementById('project-count').textContent = `${items.length} ${items.length === 1 ? 'entry' : 'entries'}`;
    document.getElementById('project-empty').hidden = items.length > 0;
  };
  projectSearch?.addEventListener('input',updateProjects);
  projectSort?.addEventListener('change',updateProjects);
  document.querySelectorAll('[data-project-filter]').forEach(button=>button.addEventListener('click',()=>{
    projectFilter = button.dataset.projectFilter;
    document.querySelectorAll('[data-project-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item === button)));
    const url = new URL(location.href);
    if(projectFilter === 'all')url.searchParams.delete('group');else url.searchParams.set('group',projectFilter);
    history.replaceState(null,'',url);
    updateProjects();
  }));
  if(projectSearch){
    document.querySelectorAll('[data-project-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.projectFilter === projectFilter)));
    updateProjects();
  }
  const search = document.getElementById('document-search');
  const documentType = document.getElementById('document-type');
  const library = document.querySelector('[data-library]')?.dataset.library;
  const updateDocuments = () => {
    const term = search.value;
    const items = library === 'reports' ? config.reports : config.publications;
    let count = 0;
    document.querySelectorAll('[data-document]').forEach(node => {
      const item = items[Number(node.dataset.document)];
      const matches = window.PortfolioRender.matchesDocument(item,documentType.value,term);
      node.hidden = !matches;
      if(matches) count++;
    });
    document.getElementById('document-count').textContent = count + (library === 'reports' ? (count === 1 ? ' document' : ' documents') : (count === 1 ? ' publication' : ' publications'));
    const empty = document.getElementById('document-empty');
    empty.hidden = count > 0;
    empty.textContent = 'No documents match your search or selected type.';
  };
  search?.addEventListener('input',updateDocuments);
  documentType?.addEventListener('change',updateDocuments);
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-copy]');
    if(!button) return;
    const index = Number(button.dataset.copy);
    const status = document.getElementById('copy-status-' + index);
    try {
      await navigator.clipboard.writeText(config.publications[index].citation);
      status.textContent = 'Citation copied.';
    } catch {
      const citation = button.closest('.publication-body').querySelector('.citation');
      citation.open = true;
      const range = document.createRange();
      range.selectNodeContents(citation.querySelector('p'));
      const selection = window.getSelection();
      selection.removeAllRanges(); selection.addRange(range);
      status.textContent = 'Citation selected. Press Ctrl+C or ⌘C to copy.';
    }
  });
})();

