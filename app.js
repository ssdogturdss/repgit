(() => {
  'use strict';

  const STORAGE_KEY = 'launchpilot.local-demo.v1';
  const BUILD_STEPS = [
    ['QUEUED', 'Build request accepted and added to the local simulation queue.'],
    ['PROVISIONING_WORKER', 'Preparing an isolated simulated macOS worker.'],
    ['CONFIGURING', 'Applying the reviewed build plan and app configuration.'],
    ['BUILDING', 'Compiling simulated project targets. No source code is executed.'],
    ['VALIDATING', 'Running simulated artifact validation checks.'],
    ['UPLOADING', 'Simulating protected artifact handoff.'],
    ['APPLE_PROCESSING', 'Simulating App Store Connect processing.'],
    ['TESTFLIGHT_READY', 'Simulation complete: this is not a real TestFlight upload.']
  ];
  const ACTIVE_STATES = BUILD_STEPS.slice(0, -1).map(([state]) => state);
  const NAVIGATION = [
    ['overview', '◫', 'Overview'], ['projects', '◈', 'Projects'], ['builds', '◌', 'Builds'], ['testflight', '✈', 'TestFlight'], ['connections', '⌘', 'Connections'], ['settings', '⚙', 'Settings']
  ];
  const timers = new Map();

  const now = () => new Date().toISOString();
  const uid = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const formatDate = (iso) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
  const relativeTime = (iso) => {
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60); if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  function seedState() {
    const recent = new Date(Date.now() - 1000 * 60 * 36).toISOString();
    const earlier = new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString();
    const older = new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString();
    return {
      version: 2,
      selectedProjectId: null,
      selectedBuildId: null,
      testFlightProjectId: 'orbit',
      activity: [
        { id: 'activity_1', time: recent, title: 'Orbit Commerce compatibility report updated', text: 'Ready with setup requirements.' },
        { id: 'activity_2', time: earlier, title: 'Field Notes reached simulated TestFlight readiness', text: 'Demo workflow completed; no Apple upload occurred.' },
        { id: 'activity_3', time: older, title: 'Legacy Portal build requires review', text: 'Legacy web dependencies were detected.' }
      ],
      connections: [
        { id: 'github', icon: '◉', name: 'GitHub', description: 'Repository snapshots and commit metadata', state: 'Demo / Mock', configured: false },
        { id: 'replit', icon: '◌', name: 'Replit', description: 'Project export intake boundary', state: 'Not configured', configured: false },
        { id: 'apple', icon: '', name: 'App Store Connect', description: 'Signing and TestFlight delivery boundary', state: 'No account connection', configured: false },
        { id: 'worker', icon: '◫', name: 'macOS Build Worker', description: 'Ephemeral compilation worker boundary', state: 'Simulated', configured: false }
      ],
      projects: [
        {
          id: 'orbit', name: 'Orbit Commerce', description: 'A storefront experience prepared for native iOS delivery.', source: { type: 'GitHub', reference: 'acme/orbit-commerce@9a3de81', importedAt: recent }, compatibility: 'READY_WITH_SETUP', compatibilityText: 'Ready with setup', strategy: 'SwiftUI shell with embedded commerce API client', plan: { status: 'AWAITING_APPROVAL', hash: 'sha256:17a2d0b5…f40c', generatedAt: recent },
          requirements: ['Confirm Bundle ID and App Store Connect app record', 'Provide production API base URL before a real build', 'Review privacy nutrition labels'],
          risks: [{ type: 'setup', text: 'OAuth redirect handling needs a native callback configuration.' }, { type: 'setup', text: 'Push notification entitlement requires an Apple developer team.' }], builds: []
        },
        {
          id: 'field-notes', name: 'Field Notes', description: 'A lightweight field-reporting workflow for distributed teams.', source: { type: 'Replit', reference: 'workspace/field-notes-v2', importedAt: earlier }, compatibility: 'READY', compatibilityText: 'Ready', strategy: 'Native SwiftUI migration with offline-first storage', plan: { status: 'APPROVED', hash: 'sha256:86cc109e…19ab', generatedAt: earlier },
          requirements: ['Add production signing configuration before a live release'], risks: [{ type: 'setup', text: 'Camera permission copy requires final product wording.' }],
          builds: [{ id: 'build_field_1042', number: 1042, state: 'TESTFLIGHT_READY', simulated: true, createdAt: earlier, updatedAt: earlier, events: [{ state: 'QUEUED', message: 'Build request accepted.', at: earlier }, { state: 'BUILDING', message: 'Simulated project compilation completed.', at: earlier }, { state: 'TESTFLIGHT_READY', message: 'Simulation complete: no Apple upload occurred.', at: earlier }] }]
        },
        {
          id: 'legacy', name: 'Legacy Portal', description: 'A legacy administrative portal under compatibility review.', source: { type: 'ZIP archive', reference: 'legacy-portal-release.zip', importedAt: older }, compatibility: 'NEEDS_REVIEW', compatibilityText: 'Needs review', strategy: 'Pending architecture review', plan: { status: 'BLOCKED', hash: 'sha256:9b150d12…c83d', generatedAt: older },
          requirements: ['Replace browser-only plugins or provide native equivalents', 'Review unsupported desktop authentication flow'], risks: [{ type: 'blocker', text: 'The imported dependency graph includes unsupported browser extension APIs.' }, { type: 'blocker', text: 'Desktop-only filesystem access has no approved iOS equivalent.' }],
          builds: [{ id: 'build_legacy_981', number: 981, state: 'FAILED', simulated: true, createdAt: older, updatedAt: older, events: [{ state: 'QUEUED', message: 'Build entered the demo queue.', at: older }, { state: 'FAILED', message: 'Simulation stopped: compatibility review is required.', at: older }] }]
        }
      ]
    };
  }

  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const loaded = stored ? JSON.parse(stored) : seedState();
      if (!loaded.testFlightProjectId || !loaded.projects?.some((project) => project.id === loaded.testFlightProjectId)) loaded.testFlightProjectId = loaded.projects?.[0]?.id || null;
      return loaded;
    } catch (_) { return seedState(); }
  }

  let state = loadState();
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function allBuilds() { return state.projects.flatMap((project) => project.builds.map((build) => ({ ...build, project }))).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); }
  function getProject(id) { return state.projects.find((project) => project.id === id); }
  function getBuild(id) { return allBuilds().find((entry) => entry.id === id); }
  function route() { const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean); return { page: parts[0] || 'overview', id: parts[1] || null }; }
  function navigate(path) { location.hash = `#/${path}`; }
  function label(value) { return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }

  function statusClass(status) {
    if (['READY', 'APPROVED'].includes(status)) return 'ready';
    if (['READY_WITH_SETUP', 'AWAITING_APPROVAL', 'BLOCKED'].includes(status)) return 'setup';
    if (['NEEDS_REVIEW', 'FAILED'].includes(status)) return 'review';
    if (['TESTFLIGHT_READY'].includes(status)) return 'complete';
    if (['CANCELLED'].includes(status)) return 'cancelled';
    return 'running';
  }
  function badge(value, text) { return `<span class="badge ${statusClass(value)}">${text || label(value)}</span>`; }
  function isActive(build) { return ACTIVE_STATES.includes(build.state); }
  function toast(text, type = 'success') { const node = document.createElement('div'); node.className = `toast ${type}`; node.textContent = text; document.getElementById('toast-region').append(node); setTimeout(() => node.remove(), 4200); }
  function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }

  function addActivity(title, text) { state.activity.unshift({ id: uid('activity'), time: now(), title, text }); state.activity = state.activity.slice(0, 20); }
  function renderNavigation(current) {
    document.getElementById('navigation').innerHTML = NAVIGATION.map(([id, icon, text]) => `<button class="nav-link ${current === id ? 'active' : ''}" data-nav="${id}"><span class="nav-icon" aria-hidden="true">${icon}</span>${text}</button>`).join('');
    document.querySelectorAll('[data-nav]').forEach((button) => button.addEventListener('click', () => { closeMobileNav(); navigate(button.dataset.nav); }));
  }
  function header(title) { document.getElementById('breadcrumb').textContent = title; }
  function pageHeader(eyebrow, title, description, actions = '') { return `<div class="page-header"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p>${description}</p></div>${actions ? `<div class="button-row">${actions}</div>` : ''}</div>`; }
  function metric(labelText, value, note) { return `<article class="metric"><div class="metric-label">${labelText}</div><div class="metric-value">${value}</div><div class="metric-note">${note}</div></article>`; }
  function activityItem(item) { return `<li class="event"><span class="event-dot"></span><div class="event-main"><div class="event-title">${item.title}</div><div class="event-text">${item.text}</div></div><time class="event-time" datetime="${item.time}">${relativeTime(item.time)}</time></li>`; }

  function renderOverview() {
    const builds = allBuilds(); const active = builds.filter(isActive); const readyProjects = state.projects.filter((p) => p.plan.status === 'APPROVED' && p.compatibility !== 'NEEDS_REVIEW'); const complete = builds.filter((b) => b.state === 'TESTFLIGHT_READY');
    return `${pageHeader('Workspace', 'Delivery overview', 'Monitor transparent plans, controlled simulated work, and real-world handoff requirements.')}
      <div class="notice"><strong>Local simulation.</strong> Build activity is deterministic demo data. No code is executed, no credentials are stored, and no Apple service is contacted.</div>
      <section class="grid metrics" aria-label="Workspace metrics">${metric('Projects', state.projects.length, 'Source compatibility tracked')}${metric('Handoff ready', readyProjects.length, 'Approved project plans')}${metric('Active builds', active.length, active.length ? 'Workflow in progress' : 'No active simulations')}${metric('Simulated ready', complete.length, 'Not Apple uploads')}</section>
      <section class="grid columns"><article class="card"><div class="card-header"><div><h2>Recent activity</h2><p class="card-description">State changes are retained in this browser.</p></div><button class="text-link" data-nav="builds">View builds →</button></div><ul class="event-list">${state.activity.slice(0, 6).map(activityItem).join('')}</ul></article>
      <article class="card"><div class="card-header"><div><h2>Real TestFlight handoff</h2><p class="card-description">Complete Apple-side release work in your own account.</p></div><p class="card-description">A signed archive, App Store Connect metadata, Apple processing, and tester setup are required before people can test.</p><div class="button-row" style="margin-top:16px"><button class="button" data-nav="testflight">Open launch guide</button></div></article></section>`;
  }

  function renderProjects() { return `${pageHeader('Projects', 'Source compatibility', 'Review immutable source snapshots, delivery requirements, and build-plan decisions.')}<section class="grid project-grid">${state.projects.map(projectCard).join('')}</section>`; }
  function projectCard(project) { const latest = [...project.builds].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]; return `<article class="card project-card" data-project="${project.id}" tabindex="0" role="link" aria-label="Open ${project.name}"><div>${badge(project.compatibility, project.compatibilityText)}</div><h2>${project.name}</h2><div class="project-meta">${project.description}</div><div class="card-footer"><span>${project.source.type}</span><span>${latest ? label(latest.state) : label(project.plan.status)}</span></div></article>`; }

  function renderProjectDetail(project) {
    const canApprove = project.plan.status === 'AWAITING_APPROVAL';
    const canBuild = project.plan.status === 'APPROVED' && project.compatibility !== 'NEEDS_REVIEW';
    const latest = [...project.builds].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
    const actions = `${canApprove ? `<button class="button" data-action="approve" data-project="${project.id}">Approve build plan</button>` : ''}${canBuild ? `<button class="button" data-action="start" data-project="${project.id}">Start simulated build</button>` : ''}${latest ? `<button class="button secondary" data-build-link="${latest.id}">View latest build</button>` : ''}`;
    return `${pageHeader('Project', project.name, project.description, actions)}<div class="detail-top"><button class="back-button" data-nav="projects">← All projects</button><span class="detail-status">${badge(project.compatibility, project.compatibilityText)}</span></div><section class="grid detail-grid" style="margin-top:18px"><div class="grid"><article class="card"><div class="card-header"><div><h2>Compatibility report</h2><p class="card-description">Fixture metadata analysis; imported source is never executed.</p></div>${badge(project.compatibility, project.compatibilityText)}</div><dl class="section-list"><div><dt>Source snapshot</dt><dd>${project.source.reference}</dd></div><div><dt>Intake method</dt><dd>${project.source.type}</dd></div><div><dt>Imported</dt><dd>${formatDate(project.source.importedAt)}</dd></div><div><dt>Selected strategy</dt><dd>${project.strategy}</dd></div></dl></article><article class="card"><div class="card-header"><div><h2>Risks and requirements</h2><p class="card-description">Items requiring explicit human review before a real delivery workflow.</p></div></div>${project.risks.map((risk) => `<div class="risk ${risk.type === 'blocker' ? 'blocker' : ''}">${risk.text}</div>`).join('')}<ul class="event-list" style="margin-top:10px">${project.requirements.map((item) => `<li class="event"><span class="event-dot"></span><div class="event-main"><div class="event-text">${item}</div></div></li>`).join('')}</ul></article></div><aside class="grid"><article class="card"><div class="card-header"><div><h2>Build plan</h2><p class="card-description">Plan is tied to its source snapshot.</p></div>${badge(project.plan.status)}</div><dl class="section-list"><div><dt>Plan hash</dt><dd><code>${project.plan.hash}</code></dd></div><div><dt>Generated</dt><dd>${formatDate(project.plan.generatedAt)}</dd></div><div><dt>Approval</dt><dd>${label(project.plan.status)}</dd></div></dl>${project.plan.status === 'BLOCKED' ? '<div class="risk blocker">A build cannot start until compatibility blockers are resolved through an architecture review.</div>' : ''}</article><article class="card"><div class="card-header"><div><h2>Real TestFlight handoff</h2></div><p class="card-description">Use the launch guide to complete signing, upload, Apple processing, and tester setup outside this demo.</p><div class="button-row" style="margin-top:15px"><button class="button secondary" data-action="open-testflight" data-project="${project.id}">Open launch guide</button></div></article><article class="card"><div class="card-header"><div><h2>Build history</h2></div></div>${latest ? `<p><strong>#${latest.number}</strong> ${badge(latest.state)}</p><p class="card-description">Updated ${relativeTime(latest.updatedAt)}${latest.simulated ? ' · simulated only' : ''}</p>` : '<div class="empty">No builds have been requested for this project.</div>'}</article></aside></section>`;
  }

  function renderBuilds() { const builds = allBuilds(); return `${pageHeader('Builds', 'Build activity', 'Simulated workflow events are persisted locally and can be inspected by project.')}<article class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Build</th><th>Project</th><th>Status</th><th>Updated</th><th></th></tr></thead><tbody>${builds.length ? builds.map((entry) => `<tr class="clickable" data-build-link="${entry.id}"><td><strong>#${entry.number}</strong><div class="subtext">Local simulation</div></td><td>${entry.project.name}</td><td>${badge(entry.state)}</td><td>${relativeTime(entry.updatedAt)}</td><td><button class="button secondary small" data-build-link="${entry.id}">Inspect</button></td></tr>`).join('') : '<tr><td colspan="5"><div class="empty">No build records exist.</div></td></tr>'}</tbody></table></div></article>`; }

  function renderBuildDetail(build) {
    const currentIndex = BUILD_STEPS.findIndex(([name]) => name === build.state); const isTerminal = ['TESTFLIGHT_READY', 'FAILED', 'CANCELLED'].includes(build.state);
    const timeline = BUILD_STEPS.map(([name, message], index) => { const done = currentIndex > index || build.state === 'TESTFLIGHT_READY'; const current = currentIndex === index && !isTerminal; return `<li class="${done ? 'done' : ''} ${current ? 'current' : ''}"><span class="timeline-dot"></span><div class="timeline-title">${label(name)}</div><div class="timeline-detail">${message}</div></li>`; }).join('');
    const action = isActive(build) ? `<button class="button danger" data-action="cancel" data-build="${build.id}">Cancel simulation</button>` : ['FAILED', 'CANCELLED'].includes(build.state) ? `<button class="button" data-action="retry" data-build="${build.id}">Retry build</button>` : '';
    return `${pageHeader('Build', `Build #${build.number}`, `${build.project.name} · started ${formatDate(build.createdAt)}`, action)}<div class="detail-top"><button class="back-button" data-nav="builds">← All builds</button><span class="detail-status">${badge(build.state)}</span></div><div class="notice" style="margin-top:18px"><strong>Simulation status.</strong> This workflow is local-only. It does not create an artifact or perform an App Store Connect upload.</div><section class="grid detail-grid"><article class="card"><div class="card-header"><div><h2>Delivery timeline</h2><p class="card-description">Current position in the simulated worker lifecycle.</p></div></div><ol class="timeline">${timeline}</ol></article><article class="card"><div class="card-header"><div><h2>Build events</h2><p class="card-description">Persisted local event log.</p></div></div><ul class="event-list">${[...build.events].reverse().map((event) => `<li class="event"><span class="event-dot"></span><div class="event-main"><div class="event-title">${label(event.state)}</div><div class="event-text">${event.message}</div></div><time class="event-time">${formatDate(event.at)}</time></li>`).join('')}</ul></article></section>`;
  }

  function handoffStatus(project) {
    if (project.compatibility === 'NEEDS_REVIEW') return { state: 'NEEDS_REVIEW', title: 'Not ready for TestFlight handoff', text: 'Compatibility blockers must be resolved and the architecture reviewed before a signed iOS build can be prepared.' };
    if (project.plan.status !== 'APPROVED') return { state: 'AWAITING_APPROVAL', title: 'Build plan approval required', text: 'Review and approve the immutable build plan before beginning the real signing and release process.' };
    return { state: 'READY', title: 'Ready to prepare a real handoff', text: 'The demo project plan is approved. You still need a signed archive and must complete every Apple-side step yourself.' };
  }

  function checklistFor(project) {
    const status = handoffStatus(project);
    const completed = project.builds.some((build) => build.state === 'TESTFLIGHT_READY');
    return [
      `TestFlight launch checklist — ${project.name}`,
      '',
      `Demo readiness: ${status.title}.`,
      'Important: LaunchPilot did not build, sign, upload, or submit this app to Apple.',
      '',
      '1. Confirm Apple Developer Program membership and App Store Connect permissions.',
      `2. Verify the App Store Connect app record, Bundle ID, version, and build number for ${project.name}.`,
      '3. Finalize privacy details, export compliance, age rating, and required app metadata.',
      '4. On macOS, create a signed archive in Xcode or a trusted macOS CI environment using your Apple signing configuration.',
      '5. Upload the archive with Xcode Organizer, Transporter, or approved CI delivery tooling authenticated to your App Store Connect account.',
      '6. Wait for Apple processing to complete in App Store Connect.',
      '7. Add internal testers. For external testers, create a tester group and submit for Beta App Review when Apple requires it.',
      '8. Send the TestFlight invitation after the build is available.',
      '',
      `Local simulation note: ${completed ? 'A simulated workflow reached TESTFLIGHT_READY; no artifact was sent to Apple.' : 'No simulated completion changes the Apple upload requirement.'}`
    ].join('\n');
  }

  function renderTestFlight() {
    const project = getProject(state.testFlightProjectId) || state.projects[0];
    const handoff = handoffStatus(project);
    const simulatedComplete = project.builds.some((build) => build.state === 'TESTFLIGHT_READY');
    const statusCopy = simulatedComplete ? 'A local build simulation completed. That is not evidence of a signed archive or Apple upload.' : 'No completed simulation is required to use this checklist, but a real signed archive is always required for TestFlight.';
    const checklist = checklistFor(project);
    return `${pageHeader('TestFlight', 'Launch real-world testing', 'Use this handoff guide to get a signed build into your own App Store Connect account and invite testers.')}<div class="notice high-priority"><strong>LaunchPilot cannot autonomously submit to TestFlight.</strong> It has no Apple credentials, signing certificates, source execution, or upload connection. Complete the following steps in your own Apple tooling.</div>
      <section class="grid testflight-grid"><article class="card"><div class="card-header"><div><h2>Project handoff readiness</h2><p class="card-description">Choose the project you want to distribute.</p></div></div><label class="field-label" for="testflight-project">Project</label><select id="testflight-project" class="select-control">${state.projects.map((item) => `<option value="${item.id}" ${item.id === project.id ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}</select><div class="handoff-status ${statusClass(handoff.state)}"><div>${badge(handoff.state, handoff.title)}</div><p>${handoff.text}</p></div><dl class="section-list"><div><dt>Compatibility</dt><dd>${badge(project.compatibility, project.compatibilityText)}</dd></div><div><dt>Build plan</dt><dd>${badge(project.plan.status)}</dd></div><div><dt>Local simulation</dt><dd>${simulatedComplete ? badge('TESTFLIGHT_READY', 'Completed locally only') : 'No completed local simulation'}</dd></div></dl><p class="card-description" style="margin-top:15px">${statusCopy}</p></article>
      <aside class="card"><div class="card-header"><div><h2>Tester paths</h2><p class="card-description">Apple controls tester availability.</p></div></div><div class="path-item"><strong>Internal testing</strong><span>Add App Store Connect users with eligible roles. This is usually the fastest path after Apple processing.</span></div><div class="path-item"><strong>External testing</strong><span>Create a tester group and provide required beta details. Apple may require Beta App Review before distribution.</span></div><a class="button secondary external-link" href="https://appstoreconnect.apple.com/" target="_blank" rel="noopener noreferrer">Open App Store Connect <span aria-hidden="true">↗</span><span class="sr-only">(opens in a new tab)</span></a></aside></section>
      <section class="card checklist-card"><div class="card-header"><div><h2>Launch checklist</h2><p class="card-description">Copy this checklist, then perform the Apple-side work with your own approved tools and account.</p></div><button class="button" data-action="copy-checklist" data-project="${project.id}">Copy launch checklist</button></div><ol class="launch-checklist"><li>Confirm Apple Developer Program membership and App Store Connect permissions.</li><li>Verify the app record, Bundle ID, version, build number, privacy details, and export compliance.</li><li>Create a signed archive on macOS with Xcode or trusted macOS CI.</li><li>Upload through Xcode Organizer, Transporter, or approved CI delivery tooling.</li><li>Wait for Apple processing in App Store Connect.</li><li>Add internal testers, or configure external testing and Beta App Review if required.</li><li>Send the TestFlight invitation once Apple makes the build available.</li></ol><details class="checklist-preview"><summary>Preview copied text</summary><pre>${escapeHtml(checklist)}</pre></details></section>`;
  }

  function renderConnections() { return `${pageHeader('Connections', 'Integration boundaries', 'The local application exposes integration status without attempting OAuth, signing, or uploads.')}<div class="notice"><strong>Fail closed by design.</strong> These adapters are demonstrations only. No token, key, certificate, or provider connection is created from this screen.</div><article class="card">${state.connections.map((connection) => `<div class="connection"><div class="connection-icon">${connection.icon}</div><div class="connection-copy"><strong>${connection.name}</strong><span>${connection.description}</span></div>${badge(connection.configured ? 'READY' : 'AWAITING_APPROVAL', connection.state)}</div>`).join('')}</article>`; }
  function renderSettings() { return `${pageHeader('Settings', 'Local environment', 'Inspect demo behavior and clear browser-only simulated data.')}<article class="card settings-list"><div class="setting"><div><strong>Runtime mode</strong><p>All build workflows use deterministic local simulation.</p></div><div class="setting-value">LOCAL DEMO</div></div><div class="setting"><div><strong>Persistence</strong><p>Projects, build events, and approvals are stored only in this browser.</p></div><div class="setting-value">localStorage</div></div><div class="setting"><div><strong>Apple delivery</strong><p>Credentials, signing, upload, tester administration, and Apple services are intentionally unavailable.</p></div><div class="setting-value">DISABLED</div></div><div class="setting"><div><strong>Application address</strong><p>Loopback server address for this session.</p></div><div class="setting-value">${location.origin}</div></div><div class="setting"><div><strong>Version</strong><p>Dependency-free static local application.</p></div><div class="setting-value">1.1.0</div></div><div class="setting"><div><strong>Reset demo data</strong><p>Restore seeded projects and remove all local approvals and build activity.</p></div><button class="button danger" data-action="reset">Reset demo data</button></div></article>`; }

  function render() {
    const { page, id } = route(); renderNavigation(page); let title = 'Overview'; let output = '';
    if (page === 'projects' && id) { const project = getProject(id); if (project) { title = project.name; output = renderProjectDetail(project); } else output = notFound(); }
    else if (page === 'builds' && id) { const build = getBuild(id); if (build) { title = `Build #${build.number}`; output = renderBuildDetail(build); } else output = notFound(); }
    else if (page === 'projects') { title = 'Projects'; output = renderProjects(); }
    else if (page === 'builds') { title = 'Builds'; output = renderBuilds(); }
    else if (page === 'testflight') { title = 'TestFlight'; output = renderTestFlight(); }
    else if (page === 'connections') { title = 'Connections'; output = renderConnections(); }
    else if (page === 'settings') { title = 'Settings'; output = renderSettings(); }
    else output = renderOverview();
    header(title); document.getElementById('main-content').innerHTML = output; bindActions(); resumeActiveBuilds();
  }
  function notFound() { return `${pageHeader('Not found', 'This record is unavailable', 'It may have been removed when local demo data was reset.', '<button class="button" data-nav="overview">Return to overview</button>')}`; }

  function bindActions() {
    document.querySelectorAll('[data-nav]').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.nav)));
    document.querySelectorAll('[data-project]').forEach((node) => { node.addEventListener('click', () => navigate(`projects/${node.dataset.project}`)); node.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigate(`projects/${node.dataset.project}`); } }); });
    document.querySelectorAll('[data-build-link]').forEach((node) => node.addEventListener('click', (event) => { event.stopPropagation(); navigate(`builds/${node.dataset.buildLink}`); }));
    document.querySelectorAll('[data-action="approve"]').forEach((button) => button.addEventListener('click', () => approvePlan(button.dataset.project)));
    document.querySelectorAll('[data-action="start"]').forEach((button) => button.addEventListener('click', () => startBuild(button.dataset.project)));
    document.querySelectorAll('[data-action="cancel"]').forEach((button) => button.addEventListener('click', () => cancelBuild(button.dataset.build)));
    document.querySelectorAll('[data-action="retry"]').forEach((button) => button.addEventListener('click', () => retryBuild(button.dataset.build)));
    document.querySelectorAll('[data-action="open-testflight"]').forEach((button) => button.addEventListener('click', () => { state.testFlightProjectId = button.dataset.project; save(); navigate('testflight'); }));
    document.querySelector('[data-action="copy-checklist"]')?.addEventListener('click', () => copyChecklist(document.querySelector('[data-action="copy-checklist"]').dataset.project));
    document.getElementById('testflight-project')?.addEventListener('change', (event) => { state.testFlightProjectId = event.target.value; save(); render(); });
    document.querySelector('[data-action="reset"]')?.addEventListener('click', confirmReset);
  }

  async function copyChecklist(projectId) {
    const project = getProject(projectId); if (!project) return;
    const text = checklistFor(project);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(text);
      toast('Launch checklist copied to your clipboard.');
    } catch (_) {
      const fallback = document.createElement('textarea'); fallback.value = text; fallback.style.position = 'fixed'; fallback.style.opacity = '0'; document.body.append(fallback); fallback.select();
      try { document.execCommand('copy'); toast('Launch checklist copied to your clipboard.'); } catch (_) { toast('Unable to copy automatically. Use the preview text instead.', 'error'); }
      fallback.remove();
    }
  }

  function approvePlan(projectId) { const project = getProject(projectId); if (!project || project.plan.status !== 'AWAITING_APPROVAL') return; project.plan.status = 'APPROVED'; project.plan.approvedAt = now(); addActivity(`${project.name} build plan approved`, 'The immutable demo plan is now eligible for a simulated build.'); save(); toast('Build plan approved. You can start a simulation.'); render(); }
  function nextBuildNumber() { return Math.max(1000, ...allBuilds().map((entry) => entry.number)) + 1; }
  function startBuild(projectId) { const project = getProject(projectId); if (!project || project.plan.status !== 'APPROVED' || project.compatibility === 'NEEDS_REVIEW') { toast('This project is not eligible for a build simulation.', 'error'); return; } const at = now(); const build = { id: uid('build'), number: nextBuildNumber(), state: 'QUEUED', simulated: true, createdAt: at, updatedAt: at, events: [{ state: 'QUEUED', message: BUILD_STEPS[0][1], at }] }; project.builds.push(build); addActivity(`${project.name} build #${build.number} started`, 'Local simulated worker workflow entered the queue.'); save(); toast(`Build #${build.number} simulation started.`); navigate(`builds/${build.id}`); scheduleBuild(build.id); }
  function locateBuild(id) { for (const project of state.projects) { const build = project.builds.find((item) => item.id === id); if (build) return { project, build }; } return null; }
  function scheduleBuild(buildId) { if (timers.has(buildId)) return; const step = () => { const found = locateBuild(buildId); if (!found || !isActive(found.build)) { timers.delete(buildId); return; } const index = BUILD_STEPS.findIndex(([name]) => name === found.build.state); const next = BUILD_STEPS[index + 1]; if (!next) { timers.delete(buildId); return; } const at = now(); found.build.state = next[0]; found.build.updatedAt = at; found.build.events.push({ state: next[0], message: next[1], at }); addActivity(`${found.project.name} build #${found.build.number}: ${label(next[0])}`, next[1]); save(); render(); if (next[0] === 'TESTFLIGHT_READY') { timers.delete(buildId); toast(`Build #${found.build.number} reached simulated TestFlight readiness; no Apple upload occurred.`); return; } timers.set(buildId, setTimeout(step, 1800)); }; timers.set(buildId, setTimeout(step, 1500)); }
  function resumeActiveBuilds() { allBuilds().filter(isActive).forEach((entry) => scheduleBuild(entry.id)); }
  function cancelBuild(buildId) { const found = locateBuild(buildId); if (!found || !isActive(found.build)) return; clearTimeout(timers.get(buildId)); timers.delete(buildId); const at = now(); found.build.state = 'CANCELLED'; found.build.updatedAt = at; found.build.events.push({ state: 'CANCELLED', message: 'Simulation cancelled by the local operator.', at }); addActivity(`${found.project.name} build #${found.build.number} cancelled`, 'The simulated workflow was stopped before completion.'); save(); toast(`Build #${found.build.number} cancelled.`); render(); }
  function retryBuild(buildId) { const found = locateBuild(buildId); if (!found || !['FAILED', 'CANCELLED'].includes(found.build.state)) return; startBuild(found.project.id); }
  function confirmReset() { document.getElementById('modal-root').innerHTML = `<div class="modal-backdrop" role="presentation"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="reset-title"><h2 id="reset-title">Reset local demo data?</h2><p>This removes plan approvals, simulated builds, activity, and TestFlight guide selection saved in this browser. The seeded scenario will be restored.</p><div class="button-row"><button class="button danger" id="confirm-reset">Reset demo data</button><button class="button secondary" id="dismiss-reset">Keep current data</button></div></section></div>`; document.getElementById('confirm-reset').focus(); document.getElementById('dismiss-reset').addEventListener('click', closeModal); document.getElementById('confirm-reset').addEventListener('click', () => { timers.forEach((timer) => clearTimeout(timer)); timers.clear(); state = seedState(); save(); closeModal(); toast('Demo data restored.'); navigate('overview'); }); }
  function closeModal() { document.getElementById('modal-root').innerHTML = ''; }
  function closeMobileNav() { const sidebar = document.querySelector('.sidebar'); sidebar.classList.remove('open'); document.getElementById('mobile-menu').setAttribute('aria-expanded', 'false'); }

  document.getElementById('mobile-menu').addEventListener('click', () => { const sidebar = document.querySelector('.sidebar'); const open = sidebar.classList.toggle('open'); document.getElementById('mobile-menu').setAttribute('aria-expanded', String(open)); });
  window.addEventListener('hashchange', render);
  document.getElementById('clock').textContent = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date());
  setInterval(() => { document.getElementById('clock').textContent = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date()); }, 30000);
  render();
})();
