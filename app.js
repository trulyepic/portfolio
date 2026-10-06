const { projects } = window.portfolioData;
const projectView = document.querySelector("#project-view");
const projectScroller = document.querySelector("#project-scroller");
const projectExternal = document.querySelector("#project-external");
const progress = document.querySelector(".chapter-progress");
const aboutDialog = document.querySelector("#about-dialog");
const imageDialog = document.querySelector("#image-dialog");
const imageDialogPreview = document.querySelector("#image-dialog-preview");
const homeView = document.querySelector("#home");
const siteHeader = document.querySelector(".site-header");
const backButton = document.querySelector("[data-close-project]");
let activeProjectKey = null;
let activeNodeId = null;
let projectTrigger = null;

function getProjectNodes(project) {
  if (project.mode === "system") return project.systemNodes;
  if (project.mode === "protocol") return project.protocolNodes;
  if (project.mode === "career") return project.careerNodes;
  if (project.mode === "quest") return project.questNodes;
  return [];
}

function parseProjectHash() {
  const [projectKey, nodeId] = window.location.hash.slice(1).split("/");
  return { projectKey, nodeId };
}

function projectHash(projectKey, nodeId) {
  return `#${projectKey}/${nodeId}`;
}

function updateProjectHistory(projectKey, nodeId, mode = "push") {
  const nextHash = projectHash(projectKey, nodeId);
  if (window.location.hash === nextHash || mode === "none") return;
  history[mode === "replace" ? "replaceState" : "pushState"](null, "", nextHash);
}

function renderProgress(project) {
  progress.innerHTML = getProjectNodes(project).map((node) => `
    <button type="button" data-chapter="${node.id}" aria-label="Explore ${escapeHtml(node.label)}">
      <span class="chapter-short">${escapeHtml(node.short)}</span>
      <span class="chapter-label">${escapeHtml(node.label)}</span>
    </button>`).join("");
}

function renderJourneyControls(project, node) {
  const nodes = getProjectNodes(project);
  const index = nodes.findIndex((item) => item.id === node.id);
  const previous = nodes[index - 1];
  const next = nodes[index + 1];
  return `
    <nav class="journey-controls" aria-label="Project journey">
      <button type="button" data-journey-node="${previous?.id || ""}" ${previous ? `aria-label="Previous: ${escapeHtml(previous.label)}"` : "disabled"}>
        <span aria-hidden="true">←</span><small>Previous</small><strong>${previous ? escapeHtml(previous.label) : "Start"}</strong>
      </button>
      <span class="journey-count"><b>${String(index + 1).padStart(2, "0")}</b> / ${String(nodes.length).padStart(2, "0")}</span>
      <button type="button" data-journey-node="${next?.id || ""}" ${next ? `aria-label="Next: ${escapeHtml(next.label)}"` : "disabled"}>
        <small>Next</small><strong>${next ? escapeHtml(next.label) : "Complete"}</strong><span aria-hidden="true">→</span>
      </button>
    </nav>`;
}

function renderEvidence(node, className = "system-detail-image") {
  if (!node.image) return "";
  const alt = escapeHtml(node.imageAlt || `${node.label} product interface`);
  const caption = escapeHtml(node.imageCaption || "Enlarge interface");
  return `
    <button class="${className} evidence-trigger" type="button" data-image-expand="${node.image}" data-image-alt="${alt}" aria-label="Enlarge ${alt}">
      <img src="${node.image}" alt="${alt}" loading="lazy" decoding="async" />
      <span>${caption}<i aria-hidden="true">↗</i></span>
    </button>`;
}

function updateNodePresentation(project, node) {
  activeNodeId = node.id;
  document.querySelectorAll("[data-chapter]").forEach((button) => {
    const active = button.dataset.chapter === node.id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "step" : "false");
  });
}

function configureLinks(root = document) {
  root.querySelectorAll("a").forEach((link) => {
    if (link.protocol === "mailto:") {
      link.removeAttribute("target");
      return;
    }
    link.target = "_blank";
    link.rel = "noreferrer";
  });
}

function escapeHtml(value) {
  const node = document.createElement("div");
  node.textContent = value;
  return node.innerHTML;
}

function renderSystemDetail(project, nodeId) {
  const node = project.systemNodes.find((item) => item.id === nodeId) || project.systemNodes[0];
  const detail = document.querySelector("#system-detail");
  if (!detail) return;
  const facts = node.facts.map((fact) => `<li>${fact}</li>`).join("");
  const links = (node.links || []).map(([label, href]) => `<a href="${href}">${label}<span>↗</span></a>`).join("");
  detail.innerHTML = `
    <div class="system-detail-copy">
      <p class="kicker">${project.type} · ${node.label}</p>
      <h2>${node.title}</h2>
      <p>${node.copy}</p>
      <ul>${facts}</ul>
      ${links ? `<div class="system-detail-links">${links}</div>` : ""}
    </div>
    ${renderEvidence(node)}
    ${renderJourneyControls(project, node)}
  `;
  configureLinks(detail);
  document.querySelectorAll("[data-system-node]").forEach((button) => {
    const active = button.dataset.systemNode === node.id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  updateNodePresentation(project, node);
  const routeMap = {
    web: ["web", "security", "api"], mobile: ["mobile", "security", "api"], security: ["web", "mobile", "security", "api"],
    api: ["security", "api"], data: ["api", "data"], aws: ["api", "aws"], email: ["api", "email"],
    catalog: ["api", "catalog"], delivery: ["api", "delivery"]
  };
  const activeRoutes = routeMap[node.id] || [];
  document.querySelectorAll("[data-system-path]").forEach((path) => path.classList.toggle("active", activeRoutes.includes(path.dataset.systemPath)));
}

function renderSystemProject(project, initialNodeId = "overview") {
  renderProgress(project);
  projectScroller.className = "project-scroller system-scroller";
  projectScroller.innerHTML = `
    <section class="system-explorer" aria-label="ToonRanks system explorer">
      <div class="system-map-wrap">
        <div class="map-heading"><span>TOONRANKS SYSTEM</span><small>Select a layer to trace the product</small></div>
        <div class="system-map">
          <svg class="system-lines" viewBox="0 0 760 560" preserveAspectRatio="none" aria-hidden="true">
            <path data-system-path="web" d="M128 118 C190 118 188 230 258 230" />
            <path data-system-path="mobile" d="M128 420 C190 420 188 282 258 282" />
            <path data-system-path="security" d="M342 256 L392 256" />
            <path data-system-path="data" d="M484 250 C536 222 556 116 632 112" />
            <path data-system-path="aws" d="M484 258 L632 272" />
            <path data-system-path="email" d="M478 270 C536 310 558 414 632 432" />
            <path data-system-path="catalog" d="M454 302 C472 372 500 432 546 486" />
            <path data-system-path="delivery" d="M340 486 C350 420 382 338 408 298" />
          </svg>
          <button class="system-node node-overview" type="button" data-system-node="overview"><img src="./assets/toonranks-app-icon.png" alt="" /><span>ToonRanks</span></button>
          <button class="system-node node-web" type="button" data-system-node="web"><b>WEB</b><span>SSR web</span><small>Railway</small></button>
          <button class="system-node node-mobile" type="button" data-system-node="mobile"><b>APP</b><span>Native mobile</span><small>Expo</small></button>
          <button class="system-node node-security" type="button" data-system-node="security"><b>SEC</b><span>Security</span><small>auth · guards</small></button>
          <button class="system-node node-api" type="button" data-system-node="api"><b>API</b><span>FastAPI</span><small>Railway</small></button>
          <button class="system-node node-data" type="button" data-system-node="data"><b>RDS</b><span>Amazon RDS</span><small>PostgreSQL</small></button>
          <button class="system-node node-aws" type="button" data-system-node="aws"><b>S3</b><span>AWS media</span><small>covers · avatars</small></button>
          <button class="system-node node-email" type="button" data-system-node="email"><b>MAIL</b><span>Account email</span><small>SMTP + TLS</small></button>
          <button class="system-node node-catalog" type="button" data-system-node="catalog"><b>EXT</b><span>AniList</span><small>GraphQL</small></button>
          <button class="system-node node-delivery" type="button" data-system-node="delivery"><b>OPS</b><span>CI + delivery</span><small>GitHub · Railway</small></button>
          <span class="service-tag tag-cloudflare">Cloudflare DNS · Railway TLS</span>
          <span class="service-tag tag-google">Google OAuth · reCAPTCHA</span>
        </div>
        <div class="map-legend"><span><i></i> Protected request path</span><span>Both clients cross the same security boundary before reaching API and data services.</span></div>
      </div>
      <aside class="system-detail" id="system-detail" aria-live="polite"></aside>
    </section>
  `;
  renderSystemDetail(project, initialNodeId);
}

function renderProtocolDetail(project, nodeId) {
  const node = project.protocolNodes.find((item) => item.id === nodeId) || project.protocolNodes[0];
  const detail = document.querySelector("#protocol-detail");
  if (!detail) return;
  detail.innerHTML = `
    <div class="system-detail-copy">
      <p class="kicker">${project.type} · ${node.label}</p>
      <h2>${node.title}</h2>
      <p>${node.copy}</p>
      <ul>${node.facts.map((fact) => `<li>${fact}</li>`).join("")}</ul>
    </div>
    ${renderJourneyControls(project, node)}
  `;
  document.querySelectorAll("[data-protocol-node]").forEach((button) => {
    const active = button.dataset.protocolNode === node.id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  updateNodePresentation(project, node);
}

function renderProtocolProject(project, initialNodeId = "overview") {
  renderProgress(project);
  projectScroller.className = "project-scroller protocol-scroller";
  projectScroller.innerHTML = `
    <section class="protocol-explorer" aria-label="MCP trust boundary explorer">
      <div class="protocol-map-wrap">
        <div class="map-heading"><span>DESIGN FOUNDATIONS MCP</span><small>Select a control to trace the trust boundary</small></div>
        <div class="protocol-boundary">
          <span class="boundary-label">AUTHORIZED CONTEXT ONLY</span>
          <svg class="protocol-lines" viewBox="0 0 760 500" preserveAspectRatio="none" aria-hidden="true">
            <path d="M132 120 C230 120 230 250 332 250" />
            <path d="M132 380 C230 380 230 250 332 250" />
            <path d="M428 250 C510 250 520 120 626 120" />
            <path d="M428 250 C510 250 520 380 626 380" />
            <path d="M380 205 L380 100" />
          </svg>
          <button class="protocol-node protocol-overview" type="button" data-protocol-node="overview"><b>MCP</b><span>Trust gateway</span><small>read-only adapter</small></button>
          <button class="protocol-node protocol-identity" type="button" data-protocol-node="identity"><b>ID</b><span>Identity</span><small>Entra JWT</small></button>
          <button class="protocol-node protocol-integrity" type="button" data-protocol-node="integrity"><b>SHA</b><span>Integrity</span><small>verified bundle</small></button>
          <button class="protocol-node protocol-tools" type="button" data-protocol-node="tools"><b>API</b><span>Bounded tools</span><small>check · search · retrieve</small></button>
          <button class="protocol-node protocol-provenance" type="button" data-protocol-node="provenance"><b>SRC</b><span>Provenance</span><small>source context</small></button>
          <button class="protocol-node protocol-operations" type="button" data-protocol-node="operations"><b>OPS</b><span>Operations</span><small>setup · runbooks</small></button>
        </div>
        <div class="map-legend"><span><i></i> Verified request path</span><span>Identity and bundle integrity gate every read-only response.</span></div>
      </div>
      <aside class="protocol-detail" id="protocol-detail" aria-live="polite"></aside>
    </section>
  `;
  renderProtocolDetail(project, initialNodeId);
}

function renderCareerDetail(project, nodeId) {
  const node = project.careerNodes.find((item) => item.id === nodeId) || project.careerNodes[0];
  const detail = document.querySelector("#career-detail");
  if (!detail) return;
  detail.innerHTML = `
    <div class="system-detail-copy">
      <p class="kicker">${node.period} · ${node.label}</p>
      <h2>${node.title}</h2>
      <p>${node.copy}</p>
      <ul>${node.facts.map((fact) => `<li>${fact}</li>`).join("")}</ul>
    </div>
    ${renderJourneyControls(project, node)}
  `;
  document.querySelectorAll("[data-career-node]").forEach((button) => {
    const active = button.dataset.careerNode === node.id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  updateNodePresentation(project, node);
}

function renderCareerProject(project, initialNodeId = "overview") {
  renderProgress(project);
  projectScroller.className = "project-scroller career-scroller";
  projectScroller.innerHTML = `
    <section class="career-explorer" aria-label="Career constellation">
      <div class="career-map-wrap">
        <div class="map-heading"><span>CAREER CONSTELLATION</span><small>Select a point in the journey</small></div>
        <div class="career-map">
          <svg class="career-lines" viewBox="0 0 760 520" preserveAspectRatio="none" aria-hidden="true">
            <path class="career-route" d="M132 386 C220 382 238 300 324 286 S470 222 548 160" />
            <path d="M126 112 C120 190 116 282 132 386" />
            <path d="M324 286 C332 360 382 414 454 456" />
            <path d="M548 160 C610 164 640 224 652 292" />
            <path d="M380 86 C382 142 360 214 324 286" />
          </svg>
          <button class="career-node career-overview" type="button" data-career-node="overview"><b>PATH</b><span>Career</span><small>2015 — now</small></button>
          <button class="career-node career-education" type="button" data-career-node="education"><b>EDU</b><span>Education</span><small>business + software</small></button>
          <button class="career-node career-operations" type="button" data-career-node="operations"><b>OPS</b><span>Operations</span><small>2015 — 2021</small></button>
          <button class="career-node career-engineering" type="button" data-career-node="engineering"><b>ENG</b><span>Engineering</span><small>2022 — 2025</small></button>
          <button class="career-node career-product" type="button" data-career-node="product"><b>P&S</b><span>Product + services</span><small>2025 — now</small></button>
          <button class="career-node career-ai" type="button" data-career-node="ai"><b>AI</b><span>AI systems</span><small>current practice</small></button>
          <button class="career-node career-credentials" type="button" data-career-node="credentials"><b>CERT</b><span>Credentials</span><small>AWS · Java</small></button>
        </div>
        <div class="career-legend"><span><i></i> Production work became engineering context</span><span>Education and credentials reinforce the path.</span></div>
      </div>
      <aside class="career-detail" id="career-detail" aria-live="polite"></aside>
    </section>
  `;
  renderCareerDetail(project, initialNodeId);
}

function renderQuestDetail(project, nodeId) {
  const node = project.questNodes.find((item) => item.id === nodeId) || project.questNodes[0];
  const detail = document.querySelector("#quest-detail");
  if (!detail) return;
  const links = (node.links || []).map(([label, href]) => `<a href="${href}">${label}<span>↗</span></a>`).join("");
  detail.innerHTML = `
    <div class="system-detail-copy">
      <p class="kicker">${project.type} · ${node.label}</p>
      <h2>${node.title}</h2>
      <p>${node.copy}</p>
      <ul>${node.facts.map((fact) => `<li>${fact}</li>`).join("")}</ul>
      ${links ? `<div class="system-detail-links">${links}</div>` : ""}
    </div>
    ${renderEvidence(node, "quest-detail-image")}
    ${renderJourneyControls(project, node)}
  `;
  configureLinks(detail);
  document.querySelectorAll("[data-quest-node]").forEach((button) => {
    const active = button.dataset.questNode === node.id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  updateNodePresentation(project, node);
}

function renderQuestProject(project, initialNodeId = "overview") {
  renderProgress(project);
  projectScroller.className = "project-scroller quest-scroller";
  projectScroller.innerHTML = `
    <section class="quest-explorer" aria-label="Gamified Habit Tracker quest path">
      <div class="quest-map-wrap">
        <div class="map-heading"><span>HABIT TRACKER QUEST</span><small>Select a checkpoint to follow the system</small></div>
        <div class="quest-map">
          <span class="quest-stage-status">WORK IN PROGRESS</span>
          <svg class="quest-lines" viewBox="0 0 760 520" preserveAspectRatio="none" aria-hidden="true">
            <path class="quest-route" d="M104 404 C176 404 184 310 260 310 S340 178 420 178 S512 290 584 290 S626 120 674 98" />
          </svg>
          <span class="quest-terrain terrain-one" aria-hidden="true"></span>
          <span class="quest-terrain terrain-two" aria-hidden="true"></span>
          <button class="quest-node quest-overview" type="button" data-quest-node="overview"><b>START</b><span>Habit Arena</span><small>the player loop</small></button>
          <button class="quest-node quest-experience" type="button" data-quest-node="experience"><b>UI</b><span>Experience</span><small>quests · rewards</small></button>
          <button class="quest-node quest-contract" type="button" data-quest-node="contract"><b>GQL</b><span>Contract</span><small>Apollo · Graphene</small></button>
          <button class="quest-node quest-rules" type="button" data-quest-node="rules"><b>BOSS</b><span>Rule engine</span><small>claims · rotation</small></button>
          <button class="quest-node quest-data" type="button" data-quest-node="data"><b>DATA</b><span>Persistence</span><small>local · PostgreSQL</small></button>
          <button class="quest-node quest-quality" type="button" data-quest-node="quality"><b>CI</b><span>Verification</span><small>Playwright · Actions</small></button>
        </div>
        <div class="quest-legend"><span><i></i> Player action becomes verified progression</span><span>UI feedback follows a backend-owned result.</span></div>
      </div>
      <aside class="quest-detail" id="quest-detail" aria-live="polite"></aside>
    </section>
  `;
  renderQuestDetail(project, initialNodeId);
}

function renderProject(key, requestedNodeId, { historyMode = "push" } = {}) {
  const project = projects[key];
  if (!project) return;
  const nodes = getProjectNodes(project);
  const initialNode = nodes.find((node) => node.id === requestedNodeId) || nodes[0];
  if (!projectView.classList.contains("is-open") && document.activeElement instanceof HTMLElement) projectTrigger = document.activeElement;
  if (aboutDialog.open) aboutDialog.close();
  activeProjectKey = key;
  document.documentElement.style.setProperty("--project-accent", project.accent);
  if (project.mode === "system") {
    renderSystemProject(project, initialNode.id);
  } else if (project.mode === "protocol") {
    renderProtocolProject(project, initialNode.id);
  } else if (project.mode === "career") {
    renderCareerProject(project, initialNode.id);
  } else if (project.mode === "quest") {
    renderQuestProject(project, initialNode.id);
  }
  if (project.externalUrl) {
    projectExternal.href = project.externalUrl;
    projectExternal.textContent = project.externalLabel;
    projectExternal.hidden = false;
  } else projectExternal.hidden = true;
  configureLinks(projectScroller);
  projectView.classList.add("is-open");
  projectView.inert = false;
  projectView.setAttribute("aria-hidden", "false");
  homeView.inert = true;
  siteHeader.inert = true;
  document.body.classList.add("project-open");
  projectScroller.scrollTop = 0;
  updateProjectHistory(key, initialNode.id, historyMode);
  window.setTimeout(() => backButton.focus(), 50);
}

function selectProjectNode(nodeId, { updateHistory = true, scrollDetail = true } = {}) {
  const project = projects[activeProjectKey];
  if (!project) return;
  const node = getProjectNodes(project).find((item) => item.id === nodeId);
  if (!node) return;
  if (project.mode === "system") renderSystemDetail(project, node.id);
  if (project.mode === "protocol") renderProtocolDetail(project, node.id);
  if (project.mode === "career") renderCareerDetail(project, node.id);
  if (project.mode === "quest") renderQuestDetail(project, node.id);
  if (updateHistory) updateProjectHistory(activeProjectKey, node.id);
  if (scrollDetail && window.matchMedia("(max-width: 1100px)").matches) {
    document.querySelector(`#${project.mode}-detail`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function closeProject({ updateHistory = true, restoreFocus = true } = {}) {
  projectView.classList.remove("is-open");
  projectView.inert = true;
  projectView.setAttribute("aria-hidden", "true");
  homeView.inert = false;
  siteHeader.inert = false;
  document.body.classList.remove("project-open");
  activeProjectKey = null;
  activeNodeId = null;
  if (updateHistory) history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  document.documentElement.style.removeProperty("--project-accent");
  if (restoreFocus && projectTrigger?.isConnected) requestAnimationFrame(() => projectTrigger.focus());
}

document.addEventListener("click", (event) => {
  const projectButton = event.target.closest("[data-project]");
  const chapterButton = event.target.closest("[data-chapter]");
  const systemButton = event.target.closest("[data-system-node]");
  const protocolButton = event.target.closest("[data-protocol-node]");
  const careerButton = event.target.closest("[data-career-node]");
  const questButton = event.target.closest("[data-quest-node]");
  const journeyButton = event.target.closest("[data-journey-node]");
  const expandableImage = event.target.closest("[data-image-expand]");
  if (projectButton) renderProject(projectButton.dataset.project);
  if (event.target.closest("[data-close-project]")) closeProject();
  if (event.target.closest("[data-open='about']")) aboutDialog.showModal();
  if (event.target.closest("[data-close-dialog]")) aboutDialog.close();
  if (expandableImage) {
    imageDialogPreview.src = expandableImage.dataset.imageExpand;
    imageDialogPreview.alt = expandableImage.dataset.imageAlt || "Expanded project interface";
    imageDialog.showModal();
  }
  if (event.target.closest("[data-close-image]")) imageDialog.close();
  if (systemButton) selectProjectNode(systemButton.dataset.systemNode);
  if (protocolButton) selectProjectNode(protocolButton.dataset.protocolNode);
  if (careerButton) selectProjectNode(careerButton.dataset.careerNode);
  if (questButton) selectProjectNode(questButton.dataset.questNode);
  if (journeyButton?.dataset.journeyNode) selectProjectNode(journeyButton.dataset.journeyNode);
  if (chapterButton && activeProjectKey && getProjectNodes(projects[activeProjectKey]).some((node) => node.id === chapterButton.dataset.chapter)) selectProjectNode(chapterButton.dataset.chapter);
});

aboutDialog.addEventListener("click", (event) => {
  const rect = aboutDialog.getBoundingClientRect();
  const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  if (outside) aboutDialog.close();
});
imageDialog.addEventListener("click", (event) => {
  if (event.target === imageDialog) imageDialog.close();
});
document.addEventListener("keydown", (event) => {
  if (aboutDialog.open || imageDialog.open) return;
  if (event.key === "Escape" && projectView.classList.contains("is-open")) closeProject();
  if (!projectView.classList.contains("is-open") || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
  const nodes = getProjectNodes(projects[activeProjectKey]);
  const index = nodes.findIndex((node) => node.id === activeNodeId);
  const target = event.key === "ArrowRight" ? nodes[index + 1] : nodes[index - 1];
  if (target) selectProjectNode(target.id, { scrollDetail: false });
});
configureLinks();
projectView.inert = true;
const initialLocation = parseProjectHash();
if (projects[initialLocation.projectKey]) renderProject(initialLocation.projectKey, initialLocation.nodeId, { historyMode: "replace" });
window.addEventListener("hashchange", () => {
  const { projectKey, nodeId } = parseProjectHash();
  if (projects[projectKey] && projectKey !== activeProjectKey) renderProject(projectKey, nodeId, { historyMode: "none" });
  else if (projects[projectKey] && nodeId && nodeId !== activeNodeId) selectProjectNode(nodeId, { updateHistory: false, scrollDetail: false });
  if (!projects[projectKey] && projectView.classList.contains("is-open")) closeProject({ updateHistory: false });
});
