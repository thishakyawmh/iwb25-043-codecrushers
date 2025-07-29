// Single event data
const eventData = {
  image: 'images/banners/banner1.jpg',
  date: '2025-08-25T12:00:00'
};

// Get user name from localStorage or prompt for it
function getUserName() {
  let userName = localStorage.getItem('userName');
  if (!userName) {
    userName = prompt('Please enter your name:');
    if (userName && userName.trim()) {
      localStorage.setItem('userName', userName.trim());
    } else {
      userName = 'User'; // Default name if user cancels or enters empty
    }
  }
  return userName;
}

function updateGreeting() {
  const now = new Date();
  const hour = now.getHours();
  const userName = getUserName();
  let greeting = '';
  
  if (hour < 12) {
    greeting = `Good Morning, ${userName}`;
  } else if (hour < 17) {
    greeting = `Good Afternoon, ${userName}`;
  } else {
    greeting = `Good Evening, ${userName}`;
  }
  
  document.getElementById('greeting').textContent = greeting;
}

function updateCountdown() {
  const target = new Date(eventData.date);
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

// Modal functionality
function openModal(event) {
  const modal = document.getElementById('eventModal');
  const modalTitle = document.getElementById('modalEventTitle');
  const modalImage = document.getElementById('modalEventImage');
  const modalFaculty = document.getElementById('modalFaculty');
  const modalEventType = document.getElementById('modalEventType');
  const modalMode = document.getElementById('modalMode');
  const modalDescription = document.getElementById('modalDescription');

  // Populate modal with event data
  modalTitle.textContent = event.title;
  modalImage.src = event.image;
  modalImage.alt = event.title;
  modalFaculty.textContent = event.faculty;
  modalEventType.textContent = event.eventType;
  modalMode.textContent = event.mode;
  modalDescription.textContent = event.description || `Join us for ${event.title} organized by ${event.faculty}. This ${event.eventType} will be conducted ${event.mode}.`;

  modal.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal() {
  const modal = document.getElementById('eventModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto'; // Restore scrolling
}

function addToCalendar() {
  const button = document.querySelector('.add-to-calendar-btn');
  const icon = button.querySelector('i');
  
  if (button.classList.contains('removed')) {
    // Remove from calendar
    button.classList.remove('removed');
    button.innerHTML = '<i class="fas fa-plus"></i> Add to Calendar';
    alert('Event removed from calendar!');
  } else {
    // Add to calendar
    button.classList.add('removed');
    button.innerHTML = '<i class="fas fa-minus"></i> Remove from Calendar';
    alert('Event added to calendar!');
  }
}

function toggleCalendar(button, eventTitle) {
  if (button.classList.contains('removed')) {
    // Remove from calendar
    button.classList.remove('removed');
    button.innerHTML = '<i class="fas fa-plus"></i> Add to Calendar';
    alert(`${eventTitle} removed from calendar!`);
  } else {
    // Add to calendar
    button.classList.add('removed');
    button.innerHTML = '<i class="fas fa-minus"></i> Remove from Calendar';
    alert(`${eventTitle} added to calendar!`);
  }
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('eventModal');
  if (event.target === modal) {
    closeModal();
  }
}

function renderEventCards() {
  const events = [
    {
      image: 'images/banners/banner1.jpg',
      month: 'JAN',
      day: '15',
      title: 'Winter Sports Meet',
      subtitle: 'Campus Athletics Championship',
      eventType: 'Competition',
      faculty: 'Student Union',
      mode: 'Offline',
      date: '2025-01-15',
      description: 'Annual winter sports championship featuring football, basketball, swimming, and track events. Students compete for the prestigious campus trophy and individual medals.'
    },
    {
      image: 'images/banners/banner1.jpg',
      month: 'AUG',
      day: '15',
      title: 'Tech Innovation Summit',
      subtitle: 'AI & Machine Learning Conference',
      eventType: 'Workshop',
      faculty: 'Faculty of Computing',
      mode: 'Online',
      date: '2025-08-15',
      description: 'Join us for an exciting workshop on the latest developments in artificial intelligence and machine learning. Learn from industry experts about practical applications, hands-on coding sessions, and networking opportunities with tech professionals.'
    },
    {
      image: 'images/banners/banner1.jpg',
      month: 'AUG',
      day: '22',
      title: 'Campus Cultural Festival',
      subtitle: 'Unity in Diversity',
      eventType: 'Cultural',
      faculty: 'Student Union',
      mode: 'Offline',
      date: '2025-08-22',
      description: 'Experience the rich cultural diversity of our campus through music, dance, art exhibitions, and traditional performances. This annual festival celebrates unity and promotes cross-cultural understanding among students.'
    },
    {
      image: 'images/banners/banner1.jpg',
      month: 'AUG',
      day: '29',
      title: 'Hackathon 2025',
      subtitle: 'Code for Change',
      eventType: 'Competition',
      faculty: 'Faculty of Computing',
      mode: 'Offline',
      date: '2025-08-29',
      description: 'A 48-hour coding competition where teams work together to solve real-world problems using innovative technology solutions. Prizes worth $10,000 and internship opportunities await the winners.'
    },
    {
      image: 'images/banners/banner1.jpg',
      month: 'SEP',
      day: '5',
      title: 'Business Leadership Seminar',
      subtitle: 'Entrepreneurship in Digital Age',
      eventType: 'Seminar',
      faculty: 'Faculty of Management',
      mode: 'Online',
      date: '2025-09-05',
      description: 'Learn from successful entrepreneurs and business leaders about building and scaling businesses in the digital era. Topics include digital marketing, e-commerce strategies, and startup funding.'
    },
    {
      image: 'images/banners/banner1.jpg',
      month: 'SEP',
      day: '12',
      title: 'Medical Research Symposium',
      subtitle: 'Advances in Healthcare',
      eventType: 'Webinar',
      faculty: 'Faculty of Medicine',
      mode: 'Online',
      date: '2025-09-12',
      description: 'Explore cutting-edge medical research and innovations in healthcare. Presentations from leading medical researchers on topics including precision medicine, telemedicine, and medical technology.'
    },
    {
      image: 'images/banners/banner1.jpg',
      month: 'SEP',
      day: '19',
      title: 'Engineering Design Challenge',
      subtitle: 'Sustainable Solutions',
      eventType: 'Competition',
      faculty: 'Faculty of Engineering',
      mode: 'Offline',
      date: '2025-09-19',
      description: 'Teams compete to design and build sustainable engineering solutions for environmental challenges. Projects focus on renewable energy, waste management, and green building technologies.'
    },
    {
      image: 'images/banners/banner1.jpg',
      month: 'SEP',
      day: '26',
      title: 'Social Sciences Conference',
      subtitle: 'Global Perspectives',
      eventType: 'Seminar',
      faculty: 'Faculty of Social Science',
      mode: 'Online',
      date: '2025-09-26',
      description: 'An international conference bringing together researchers and scholars to discuss global social issues, policy development, and sustainable social change initiatives.'
    },
    {
      image: 'images/banners/banner1.jpg',
      month: 'JUN',
      day: '6',
      title: 'Agricultural Innovation Workshop',
      subtitle: 'Smart Farming Technologies',
      eventType: 'Workshop',
      faculty: 'Faculty of Agriculture',
      mode: 'Offline',
      date: '2025-06-06',
      description: 'Learn about modern agricultural technologies including precision farming, IoT applications in agriculture, and sustainable farming practices for the future.'
    },
    {
      image: 'images/banners/banner1.jpg',
      month: 'OCT',
      day: '3',
      title: 'IEEE Technical Symposium',
      subtitle: 'Emerging Technologies',
      eventType: 'Webinar',
      faculty: 'IEEE / AIESEC / GDSC clubs',
      mode: 'Online',
      date: '2025-10-03',
      description: 'A technical symposium featuring presentations on emerging technologies, research papers, and networking opportunities with IEEE professionals and industry experts.'
    }
  ];

  // Get filter values
  const dateFilter = document.getElementById('dateFilter').value;
  const eventTypeFilter = document.getElementById('eventTypeFilter').value;
  const facultyFilter = document.getElementById('facultyFilter').value;
  const modeFilter = document.getElementById('modeFilter').value;

  // Filter events based on criteria
  const filteredEvents = events.filter(event => {
    // Date filter
    if (dateFilter !== 'all' && dateFilter !== '') {
      const eventDate = new Date(event.date);
      const today = new Date();
      const diffTime = eventDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateFilter === 'past' && diffDays >= 0) return false;
      if (dateFilter === 'today' && diffDays !== 0) return false;
      if (dateFilter === 'week' && (diffDays < 0 || diffDays > 7)) return false;
      if (dateFilter === 'month' && (diffDays < 0 || diffDays > 30)) return false;
    }

    // Event type filter - convert dropdown value to match event data
    if (eventTypeFilter !== 'all' && eventTypeFilter !== '') {
      const eventTypeMapping = {
        'workshop': 'Workshop',
        'seminar': 'Seminar',
        'competition': 'Competition',
        'cultural': 'Cultural',
        'webinar': 'Webinar',
        'other': 'Other'
      };
      if (eventTypeMapping[eventTypeFilter] !== event.eventType) return false;
    }

    // Faculty filter - convert dropdown value to match event data
    if (facultyFilter !== 'all' && facultyFilter !== '') {
      const facultyMapping = {
        'engineering': 'Faculty of Engineering',
        'medicine': 'Faculty of Medicine',
        'technology': 'Faculty of Technology',
        'social': 'Faculty of Social Science',
        'management': 'Faculty of Management',
        'agriculture': 'Faculty of Agriculture',
        'computing': 'Faculty of Computing',
        'student-union': 'Student Union',
        'clubs': 'IEEE / AIESEC / GDSC clubs',
        'other': 'Other'
      };
      if (facultyMapping[facultyFilter] !== event.faculty) return false;
    }

    // Mode filter - convert dropdown value to match event data
    if (modeFilter !== 'all' && modeFilter !== '') {
      const modeMapping = {
        'online': 'Online',
        'offline': 'Offline'
      };
      if (modeMapping[modeFilter] !== event.mode) return false;
    }

    return true;
  });

  const container = document.getElementById("eventCards");
  
  if (filteredEvents.length === 0) {
    container.innerHTML = `
      <div class="no-events">
        <img src="images/notfound.webp" alt="No events found" class="no-events-image">
        <h3>No events found</h3>
        <p>Try adjusting your filters to see more events.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredEvents.map(e => {
    // Calculate remaining days
    const eventDate = new Date(e.date);
    const today = new Date();
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Format the remaining days text
    let remainingText = '';
    if (diffDays < 0) {
      remainingText = 'Past';
    } else if (diffDays === 0) {
      remainingText = 'Today';
    } else if (diffDays === 1) {
      remainingText = '1 day left';
    } else {
      remainingText = `${diffDays} days left`;
    }

    // Add class for past events
    const cardClass = diffDays < 0 ? 'event-card past-event' : 'event-card';

    return `
      <div class="${cardClass}" onclick="openModal(${JSON.stringify(e).replace(/"/g, '&quot;')})">
        <div class="event-image">
          <img src="${e.image}" alt="${e.title}" />
          <div class="price">${remainingText}</div>
          <div class="icons">
            <span></span>
            <span>❤️</span>
          </div>
        </div>
        <div class="event-info">
          <div class="event-date">
            <div class="month">${e.month}</div>
            <div class="day">${e.day}</div>
          </div>
          <div class="event-details">
            <h4>${e.title}</h4>
            <p>By ${e.faculty}</p>
            <div class="event-tags">
              <span class="tag event-type">${e.eventType}</span>
              <span class="separator">|</span>
              <span class="tag mode">${e.mode}</span>
            </div>
          </div>
        </div>
        <div class="event-actions">
          <button class="card-calendar-btn" onclick="event.stopPropagation(); toggleCalendar(this, '${e.title}')">
            <i class="fas fa-plus"></i> Add to Calendar
          </button>
        </div>
      </div>
    `;
  }).join("");
}

// Add event listeners for filters
function initializeFilters() {
  const filters = ['dateFilter', 'eventTypeFilter', 'facultyFilter', 'modeFilter'];
  filters.forEach(filterId => {
    document.getElementById(filterId).addEventListener('change', renderEventCards);
  });
}

// Initialize
updateGreeting();
updateCountdown();
renderEventCards();
initializeFilters();
setInterval(updateCountdown, 1000);