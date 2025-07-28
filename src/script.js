const banners = [
  { image: 'images/banners/banner1.jpg', date: '2025-08-25T12:00:00' },
  { image: 'images/banners/banner1.jpg', date: '2025-09-05T18:00:00' },
  { image: 'images/banners/banner1.jpg', date: '2025-10-01T09:00:00' }
];

let currentSlide = 0;

function renderSlides() {
  const container = document.getElementById("slidesContainer");
  container.innerHTML = banners.map(b => `
    <div class="slide">
      <img src="${b.image}" alt="Event Banner" />
    </div>
  `).join("");
}

function showSlide(index) {
  const container = document.getElementById("slidesContainer");
  if (index < 0) index = banners.length - 1;
  if (index >= banners.length) index = 0;
  currentSlide = index;
  container.style.transform = `translateX(-${index * 100}%)`;
}

function prevSlide() {
  showSlide(currentSlide - 1);
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function updateCountdown() {
  const target = new Date(banners[currentSlide].date);
  const now = new Date();
  const diff = target - now;
  const el = document.getElementById("event-countdown");

  if (diff <= 0) {
    el.innerHTML = `<div class="countdown-block"><span class="countdown-label">Event</span><span class="countdown-value">Started</span></div>`;
    return;
  }

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  el.innerHTML = `
    <div class="countdown-block">
      <span class="countdown-label">Days</span>
      <span class="countdown-value">${d}</span>
    </div>
    <div class="countdown-block">
      <span class="countdown-label">Hours</span>
      <span class="countdown-value">${h}</span>
    </div>
    <div class="countdown-block">
      <span class="countdown-label">Mins</span>
      <span class="countdown-value">${m}</span>
    </div>
    <div class="countdown-block">
      <span class="countdown-label">Secs</span>
      <span class="countdown-value">${s}</span>
    </div>
  `;
}

function renderEventCards() {
  const events = [
    {
      image: 'images/banners/banner1.jpg',
      price: '$45.00',
      month: 'SEP',
      day: '18',
      title: 'Dream World',
      subtitle: 'Boombox & Remy Zero'
    },
    {
      image: 'images/banners/banner1.jpg',
      price: '$60.00',
      month: 'OCT',
      day: '5',
      title: 'Tech Connect',
      subtitle: 'AI & Robotics Meet'
    },
    {
      image: 'images/banners/banner1.jpg',
      price: '$30.00',
      month: 'NOV',
      day: '10',
      title: 'Music Fest',
      subtitle: 'Campus Beats 2025'
    }
  ];

  const container = document.getElementById("eventCards");
  container.innerHTML = events.map(e => `
    <div class="event-card">
      <div class="event-image">
        <img src="${e.image}" alt="${e.title}" />
        <div class="price">${e.price}</div>
        <div class="icons">
          <span>🔗</span>
          <span>❤️</span>
        </div>
      </div>
      <div class="event-info">
        <div class="event-date">
          <span class="month">${e.month}</span>
          <span class="day">${e.day}</span>
        </div>
        <div class="event-details">
          <h4>${e.title}</h4>
          <p>${e.subtitle}</p>
        </div>
      </div>
    </div>
  `).join("");
}

// Initialize
renderSlides();
showSlide(0);
renderEventCards();
setInterval(updateCountdown, 1000);
setInterval(nextSlide, 8000);
