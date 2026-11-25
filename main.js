const features = [
  ['Cerarl · Fire-retardant panels', 'The quiet\nstrength of stone.', 'Stone-inspired finishes for interior walls.', 'Explore Cerarl', 'cerarl'],
  ['Ultra-Shield · Exterior HPL', 'A finish for\nthe elements.', 'Exterior laminates for architectural façades.', 'Explore Ultra-Shield', 'ultra-shield-exterior-hpl'],
  ['Sakura · Decorative laminates', 'A softer side\nof surfaces.', 'Explore the 1 mm decorative laminate collection.', 'Explore Sakura', '1mm-sakura'],
  ['VelTouch · Velvet-matte finish', 'A surface you\nwant to touch.', 'A soft matte finish for contemporary interiors.', 'Explore VelTouch', 'veltouch']
];
const featureButtons = document.querySelectorAll('[data-feature]');
const heroImages = document.querySelectorAll('.hero-image');
const heroCopy = document.querySelector('.hero-copy');
const heroKicker = document.querySelector('#hero-kicker');
const heroTitle = document.querySelector('#hero-title');
const heroDesc = document.querySelector('#hero-desc');
const heroLink = document.querySelector('#hero-link');
const heroLinkLabel = heroLink.querySelector('span');
const rotation = document.querySelector('.hero-rotation');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let currentFeature = 0;
let rotationEnabled = !motionPreference.matches;
let rotationTimer;

function showFeature(index) {
  const [category, title, description, linkText, slug] = features[index];
  currentFeature = index;
  heroKicker.textContent = category;
  heroTitle.textContent = title;
  heroDesc.textContent = description;
  heroLinkLabel.textContent = linkText;
  heroLink.href = 'https://aicasunmica.com/' + slug;
  heroImages.forEach((image, i) => image.classList.toggle('is-current', i === index));
  featureButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
}

function scheduleRotation() {
  clearInterval(rotationTimer);
  const running = rotationEnabled && !document.hidden && document.activeElement !== heroLink;
  heroCopy.setAttribute('aria-live', running ? 'off' : 'polite');
  if (running) {
    rotationTimer = setInterval(() => {
      const next = (currentFeature + 1) % features.length;
      if (heroImages[next].complete && heroImages[next].naturalWidth) showFeature(next);
    }, 6000);
  }
}

function setRotation(enabled) {
  rotationEnabled = enabled;
  rotation.textContent = enabled ? 'Pause slideshow' : 'Play slideshow';
  scheduleRotation();
}

featureButtons.forEach((button, index) => button.addEventListener('click', () => {
  setRotation(false);
  showFeature(index);
}));
rotation.addEventListener('click', () => setRotation(!rotationEnabled));
heroLink.addEventListener('focus', scheduleRotation);
heroLink.addEventListener('blur', () => queueMicrotask(scheduleRotation));
document.addEventListener('visibilitychange', scheduleRotation);
motionPreference.addEventListener('change', event => setRotation(!event.matches));
rotation.hidden = false;
setRotation(rotationEnabled);

const filters = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('[data-project]');
filters.forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.filter;
  projects.forEach(project => {
    project.hidden = category !== 'all' && category !== project.dataset.project;
  });
  filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}));

const menu = document.querySelector('.menu');
const navigation = document.querySelector('#navigation');
const navDropdowns = document.querySelectorAll('.nav-dropdown');
const megaMenus = document.querySelectorAll('.mega-menu');
function closeMegaMenus() {
  navDropdowns.forEach(button => button.setAttribute('aria-expanded', 'false'));
  megaMenus.forEach(panel => { panel.hidden = true; });
}
menu.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', String(menu.getAttribute('aria-expanded') === 'false'));
});
navDropdowns.forEach(button => button.addEventListener('click', event => {
  event.stopPropagation();
  const panel = document.querySelector('#' + button.getAttribute('aria-controls'));
  const isOpen = button.getAttribute('aria-expanded') === 'true';
  closeMegaMenus();
  if (!isOpen) {
    button.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
  }
}));
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) menu.setAttribute('aria-expanded', 'false');
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header')) closeMegaMenus();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    menu.setAttribute('aria-expanded', 'false');
    menu.focus();
  }
  if (event.key === 'Escape') closeMegaMenus();
});

const shadeTrack = document.querySelector('#shade-track');
const shadeFilters = document.querySelectorAll('[data-shade-filter]');
const shades = shadeTrack.querySelectorAll('[data-shade]');
const shadeCategory = document.querySelector('#shade-category');
const shadeWindow = document.querySelector('.shade-loop-window');
const reduceShadeMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let shadeOffset = 0;
let shadeLoopWidth = 0;
let shadePaused = false;
let shadeLastFrame = performance.now();
let shadeDragStart = 0;
let shadeDragOffset = 0;
let shadeDragged = false;

shades.forEach(shade => {
  const code = shade.querySelector('strong').textContent.trim();
  const collection = Array.from(shadeFilters).find(filter => filter.dataset.shadeFilter === shade.dataset.shade).textContent.trim();
  const overlay = document.createElement('span');
  overlay.className = 'shade-overlay';
  overlay.innerHTML = '<i class="fa-solid fa-plus" aria-hidden="true"></i><strong>' + code + '</strong><small>' + collection + '</small><em>Know More</em>';
  shade.querySelector('a').append(overlay);
});

function normalizeShadeOffset() {
  if (!shadeLoopWidth) return;
  while (shadeOffset >= shadeLoopWidth) shadeOffset -= shadeLoopWidth;
  while (shadeOffset < 0) shadeOffset += shadeLoopWidth;
}

function renderShadePosition() {
  normalizeShadeOffset();
  shadeTrack.style.transform = 'translate3d(' + -shadeOffset + 'px, 0, 0)';
}

function buildShadeLoop(group) {
  shadeTrack.querySelectorAll('[data-shade-clone]').forEach(clone => clone.remove());
  const activeShades = Array.from(shades).filter(shade => shade.dataset.shade === group);
  shades.forEach(shade => { shade.hidden = shade.dataset.shade !== group; });
  activeShades.forEach(shade => {
    const clone = shade.cloneNode(true);
    clone.dataset.shadeClone = 'true';
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelector('a').tabIndex = -1;
    shadeTrack.append(clone);
  });
  shadeOffset = 0;
  requestAnimationFrame(() => {
    const firstClone = shadeTrack.querySelector('[data-shade-clone]');
    shadeLoopWidth = firstClone ? firstClone.offsetLeft : 0;
    renderShadePosition();
  });
}

function animateShades(now) {
  const elapsed = Math.min(now - shadeLastFrame, 40);
  shadeLastFrame = now;
  if (!shadePaused && !reduceShadeMotion && shadeLoopWidth) {
    shadeOffset += elapsed * .025;
    renderShadePosition();
  }
  requestAnimationFrame(animateShades);
}

shadeFilters.forEach(button => button.addEventListener('click', () => {
  const group = button.dataset.shadeFilter;
  shadeFilters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  shadeCategory.href = button.dataset.categoryUrl;
  shadeCategory.textContent = 'View all ' + button.textContent + ' shades';
  buildShadeLoop(group);
}));

shadeWindow.addEventListener('mouseenter', () => { shadePaused = true; });
shadeWindow.addEventListener('mouseleave', () => { shadePaused = false; });
shadeWindow.addEventListener('focusin', () => { shadePaused = true; });
shadeWindow.addEventListener('focusout', () => { shadePaused = false; });
shadeWindow.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse') return;
  shadePaused = true;
  shadeDragged = false;
  shadeDragStart = event.clientX;
  shadeDragOffset = shadeOffset;
  shadeWindow.classList.add('is-dragging');
  shadeWindow.setPointerCapture(event.pointerId);
});
shadeWindow.addEventListener('pointermove', event => {
  if (!shadeWindow.hasPointerCapture(event.pointerId)) return;
  const distance = event.clientX - shadeDragStart;
  if (Math.abs(distance) > 5) shadeDragged = true;
  shadeOffset = shadeDragOffset - distance;
  renderShadePosition();
});
shadeWindow.addEventListener('pointerup', event => {
  if (shadeWindow.hasPointerCapture(event.pointerId)) shadeWindow.releasePointerCapture(event.pointerId);
  shadeWindow.classList.remove('is-dragging');
  shadePaused = false;
});
shadeTrack.addEventListener('click', event => {
  const shade = event.target.closest('li');
  if (!shade || matchMedia('(hover: hover)').matches || shadeDragged) return;
  if (!shade.classList.contains('is-active')) {
    event.preventDefault();
    shadeTrack.querySelectorAll('.is-active').forEach(item => item.classList.remove('is-active'));
    shade.classList.add('is-active');
  }
});
new ResizeObserver(() => buildShadeLoop(document.querySelector('[data-shade-filter][aria-pressed="true"]').dataset.shadeFilter)).observe(shadeWindow);
buildShadeLoop('cerarl');
requestAnimationFrame(animateShades);

const roomOptions = document.querySelectorAll('[data-room-shade]');
const roomFinish = document.querySelector('.room-finish');
const roomShadeName = document.querySelector('#room-shade-name');

const roomSelectedSwatch = document.querySelector('#room-selected-swatch');
const roomSearch = document.querySelector('.room-search');
const roomQuery = document.querySelector('#room-query');
const roomResults = document.querySelector('#room-results');
const roomSearchStatus = document.querySelector('#room-search-status');
const roomNoResults = document.querySelector('#room-no-results');
const roomDropdownToggle = document.querySelector('.room-dropdown-toggle');
const roomShades = Array.from(shades, shade => ({
  code: shade.querySelector('strong').textContent,
  collection: Array.from(shadeFilters).find(filter => filter.dataset.shadeFilter === shade.dataset.shade).textContent.trim(),
  swatch: shade.querySelector('img').getAttribute('src')
}));

function applyRoomShade(swatch, name) {
  roomFinish.style.setProperty('--room-swatch', 'url("' + swatch + '")');
  roomSelectedSwatch.src = swatch;
  roomShadeName.textContent = name;
  roomOptions.forEach(option => {
    option.setAttribute('aria-pressed', String(option.querySelector('img').getAttribute('src') === swatch));
  });
}

function normalizeShadeCode(code) {
  return code.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function setRoomDropdown(open) {
  roomResults.hidden = !open;
  roomQuery.setAttribute('aria-expanded', String(open));
  roomDropdownToggle.setAttribute('aria-expanded', String(open));
}

function updateRoomResults(forceOpen = false) {
  const query = normalizeShadeCode(roomQuery.value);
  const matches = query
    ? roomShades.filter(shade => normalizeShadeCode(shade.code + shade.collection).includes(query))
    : roomShades;
  roomResults.replaceChildren();
  matches.forEach(shade => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    const image = document.createElement('img');
    image.src = shade.swatch;
    image.alt = '';
    image.width = 36;
    image.height = 36;
    const label = document.createElement('span');
    const code = document.createElement('strong');
    const collection = document.createElement('small');
    code.textContent = shade.code;
    collection.textContent = shade.collection;
    label.append(code, collection);
    button.append(image, label);
    button.addEventListener('click', () => {
      applyRoomShade(shade.swatch, shade.collection + ' · ' + shade.code);
      roomQuery.value = '';
      setRoomDropdown(false);
    });
    item.append(button);
    roomResults.append(item);
  });
  setRoomDropdown((forceOpen || query.length > 0) && matches.length > 0);
  roomNoResults.hidden = !query || matches.length > 0;
  roomSearchStatus.textContent = matches.length + (matches.length === 1 ? ' shade' : ' shades') + ' available';
}

roomOptions.forEach(button => button.addEventListener('click', () => {
  applyRoomShade(button.querySelector('img').getAttribute('src'), button.dataset.roomShade);
}));
roomQuery.addEventListener('input', () => updateRoomResults(true));
roomQuery.addEventListener('focus', () => updateRoomResults(true));
roomQuery.addEventListener('click', () => updateRoomResults(true));
roomDropdownToggle.addEventListener('click', () => {
  const open = roomResults.hidden;
  if (open) { updateRoomResults(true); roomQuery.focus(); }
  else setRoomDropdown(false);
});
roomSearch.addEventListener('submit', event => {
  event.preventDefault();
  roomResults.querySelector('button')?.click();
});
roomSearch.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    event.preventDefault();
    setRoomDropdown(false);
    roomQuery.focus();
  }
});
document.addEventListener('click', event => {
  if (!roomSearch.contains(event.target)) setRoomDropdown(false);
});
