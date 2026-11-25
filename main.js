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
  heroLink.textContent = linkText;
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
    }, 3000);
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
menu.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', String(menu.getAttribute('aria-expanded') === 'false'));
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) menu.setAttribute('aria-expanded', 'false');
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    menu.setAttribute('aria-expanded', 'false');
    menu.focus();
  }
});

const shadeTrack = document.querySelector('#shade-track');
const shadeFilters = document.querySelectorAll('[data-shade-filter]');
const shades = shadeTrack.querySelectorAll('[data-shade]');
const shadeCategory = document.querySelector('#shade-category');
const shadePrevious = document.querySelector('#shade-prev');
const shadeNext = document.querySelector('#shade-next');

function updateShadeControls() {
  shadePrevious.disabled = shadeTrack.scrollLeft <= 1;
  shadeNext.disabled = shadeTrack.scrollLeft + shadeTrack.clientWidth >= shadeTrack.scrollWidth - 2;
}

function moveShades(direction) {
  const first = shadeTrack.querySelector('li:not([hidden])');
  const gap = Number.parseFloat(getComputedStyle(shadeTrack).columnGap);
  const step = first.getBoundingClientRect().width + gap;
  const itemsPerPage = Math.max(1, Math.floor((shadeTrack.clientWidth + gap) / step));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  shadeTrack.scrollBy({ left: direction * step * itemsPerPage, behavior: reduceMotion ? 'instant' : 'smooth' });
}

shadeFilters.forEach(button => button.addEventListener('click', () => {
  const group = button.dataset.shadeFilter;
  shades.forEach(shade => {
    shade.hidden = shade.dataset.shade !== group;
  });
  shadeFilters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  shadeCategory.href = button.dataset.categoryUrl;
  shadeCategory.textContent = 'View all ' + button.textContent + ' shades';
  shadeTrack.scrollTo({ left: 0, behavior: 'instant' });
  updateShadeControls();
}));
shadePrevious.addEventListener('click', () => moveShades(-1));
shadeNext.addEventListener('click', () => moveShades(1));
shadeTrack.addEventListener('scroll', updateShadeControls, { passive: true });
new ResizeObserver(updateShadeControls).observe(shadeTrack);
updateShadeControls();

const roomOptions = document.querySelectorAll('[data-room-shade]');
const roomFinish = document.querySelector('.room-finish');
const roomShadeName = document.querySelector('#room-shade-name');

const roomSelectedSwatch = document.querySelector('#room-selected-swatch');
const roomSearch = document.querySelector('.room-search');
const roomQuery = document.querySelector('#room-query');
const roomResults = document.querySelector('#room-results');
const roomSearchStatus = document.querySelector('#room-search-status');
const roomNoResults = document.querySelector('#room-no-results');
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

function updateRoomResults() {
  const query = normalizeShadeCode(roomQuery.value);
  const matches = query ? roomShades.filter(shade => normalizeShadeCode(shade.code).includes(query)) : [];
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
    label.textContent = shade.code + ' · ' + shade.collection;
    button.append(image, label);
    button.addEventListener('click', () => {
      applyRoomShade(shade.swatch, shade.collection + ' · ' + shade.code);
      roomQuery.value = '';
      updateRoomResults();
      roomQuery.focus();
    });
    item.append(button);
    roomResults.append(item);
  });
  roomResults.hidden = matches.length === 0;
  roomNoResults.hidden = !query || matches.length > 0;
  roomSearchStatus.textContent = query ? matches.length + ' matching shades' : '';
}

roomOptions.forEach(button => button.addEventListener('click', () => {
  applyRoomShade(button.querySelector('img').getAttribute('src'), button.dataset.roomShade);
}));
roomQuery.addEventListener('input', updateRoomResults);
roomSearch.addEventListener('submit', event => {
  event.preventDefault();
  roomResults.querySelector('button')?.click();
});
roomSearch.addEventListener('keydown', event => {
  if (event.key === 'Escape' && roomQuery.value) {
    event.preventDefault();
    roomQuery.value = '';
    updateRoomResults();
    roomQuery.focus();
  }
});
