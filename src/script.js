document.addEventListener('DOMContentLoaded', () => {
  fetchEvents();
});
 // Loader (Do not Change)
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    loader.classList.add("hidden");

    setTimeout(() => {
    loader.style.display = "none";
    }, 2000); 
});

let nextUpcomingEvent = null;

let events;
//  user name (set here)
let USER_NAME = 'User';
let USER_MAIL = 'user@gmail.com';
let IS_ADMIN = false;
let currentModalEvent = null;

function isEventCreator(event) {
    return event.createdBy && event.createdBy === USER_MAIL;
}

async function fetchEvents() {
            // Get references to the HTML elements we'll be working with.
            const eventsList = document.getElementById('events-list');
            const loadingMessage = document.getElementById('loading-message');
            
            // The URL of your Ballerina service.
            // This assumes the Ballerina service is running on the same machine on port 9090.
            const ballerinaServiceUrl = 'http://localhost:9091/events';

            try {
                // 1. Make the GET request to the Ballerina service using the Fetch API.
                const response = await fetch(ballerinaServiceUrl, {credentials: 'include'});
                console.log(response);

                // Check if the HTTP response is successful (status codes 200-299).
                if (!response.ok) {
                    // If not, throw an error to be caught by the catch block.
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                // 2. Parse the JSON response body into a JavaScript object (an array of events).
                events = await response.json();
                console.log(events);

                findNextUpcomingEvent();
                initializePage();

              }catch (error) {
                // If any error occurs during the fetch or processing, it will be caught here.
                console.error('Failed to fetch events:', error);
                
                // Display an error message to the user.
                loadingMessage.style.display = 'none'; // Hide loading message
                eventsList.innerHTML = `<p class="text-center text-red-500">Error loading events. Please check the console for details.</p>`;
            }
}

function findNextUpcomingEvent() {
    const now = new Date();
    
    // Filter future events and sort by date
    const upcomingEvents = events
        .filter(event => {
            const eventDate = new Date(event.date || event.startTime);
            return eventDate > now;
        })
        .sort((a, b) => {
            const dateA = new Date(a.date || a.startTime);
            const dateB = new Date(b.date || b.startTime);
            return dateA - dateB;
        });
    
    // Get the next upcoming event or fallback to a default
    if (upcomingEvents.length > 0) {
        nextUpcomingEvent = upcomingEvents[0];
    } else {
        // Fallback if no upcoming events
        nextUpcomingEvent = {
            image: 'images/banners/banner.jpg',
            month: 'NO',
            day: 'EVENTS',
            title: 'No Upcoming Events',
            subtitle: 'Check back later',
            eventType: 'N/A',
            faculty: 'N/A',
            mode: 'N/A',
            date: new Date().toISOString(),
            description: 'There are currently no upcoming events. Please check back later for new events.'
        };
    }
}

async function checkAuthStatus() {
    try {
        const response = await fetch("http://localhost:9090/auth/status", {
            method: "GET",
            credentials: 'include'
        });

        console.log("Auth status response:", response);

        if (response.ok) {
            const data = await response.json();
            console.log("Auth data:", data);
            return {
                isAuthenticated: data.isAuthenticated,
                userName: data.userName || 'User',
                userMail: data.userMail || 'User@gmail.com',
                isAdmin: data.isAdmin || false
            };
        } else {
            console.log("Auth check failed:", response.status);
            return {
                isAuthenticated: false,
                userName: 'User',
                userMail: 'User@gmail.com',
                isAdmin: false
            };
        }
    } catch (error) {
        console.error("Error checking auth status:", error);
        return {
            isAuthenticated: false,
            userName: 'User',
            userMail: 'User@gmail.com',
            isAdmin: false
        };
    }
}

function updateAdminElements() {
    const createEventBtn = document.getElementById('createEventBtn');
    const adminPanel = document.getElementById('adminPanel');
    const adminMenuItems = document.querySelectorAll('.admin-only');
    
    if (IS_ADMIN) {
        // Show admin elements
        if (createEventBtn) {
            createEventBtn.style.display = 'block';
            console.log("Create Event button shown for admin user");
        }
        if (adminPanel) {
            adminPanel.style.display = 'block';
        }
        adminMenuItems.forEach(item => {
            item.style.display = 'block';
        });
        
        // Add admin badge to user name if needed
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay && !userNameDisplay.textContent.includes('(Admin)')) {
            userNameDisplay.textContent = USER_NAME + ' (Admin)';
        }
    } else {
        // Hide admin elements
        if (createEventBtn) {
            createEventBtn.style.display = 'none';
            console.log("Create Event button hidden for non-admin user");
        }
        if (adminPanel) {
            adminPanel.style.display = 'none';
        }
        adminMenuItems.forEach(item => {
            item.style.display = 'none';
        });
    }
}


async function initializePage() {
    // Check for auth success parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        console.log("Authentication successful");
    }

    const logoutBtn = document.getElementById("logoutBtn");
    const loginBtn = document.getElementById("loginBtn");

    // Check authentication status
    const authStatus = await checkAuthStatus();
    const isLoggedIn = authStatus.isAuthenticated;
    USER_NAME = authStatus.userName;
    USER_MAIL = authStatus.userMail;
    IS_ADMIN = authStatus.isAdmin;

    console.log("Auth status:", isLoggedIn, "User:", USER_NAME, "Admin:", IS_ADMIN);

    if (isLoggedIn) {
        // If the user is logged in, show the Logout button and hide the Sign In button.
        if(loginBtn) loginBtn.style.display = 'none';
        if(logoutBtn) logoutBtn.style.display = 'flex';

        updateAdminElements();
    } else {
        // If the user is not logged in, show the Sign In button and hide the Logout button.
        if(loginBtn) loginBtn.style.display = 'flex';
        if(logoutBtn) logoutBtn.style.display = 'none';

        IS_ADMIN = false;
        updateAdminElements();
    }

    // Remove the old loadUserInfo function call since we're now doing it above
    
    // Updated handleLogout function
    async function handleLogout() {
        try {
            const response = await fetch("http://localhost:9090/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include'
            });

            console.log("Logout response:", response);

            IS_ADMIN = false;
            updateAdminElements();

            // Redirect regardless of response
            setTimeout(() => {
                window.location.href = "http://localhost:5501/src/index.html";
            }, 1000);

        } catch (error) {
            console.error("Error during logout:", error);
            // Redirect anyway
            window.location.href = "http://localhost:5501/src/index.html";
        }
    }

    if(logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }

    // Add create event button listener for admins
    const createEventBtn = document.getElementById('createEventBtn');
    if (createEventBtn) {
        createEventBtn.addEventListener('click', function() {
            if (IS_ADMIN) {
                // Redirect to create event page or open create event modal
                window.location.href = 'create-event.html'; // or openCreateEventModal();
            } else {
                alert('Access denied. Admin privileges required.');
            }
        });
    }

    updateBanner();


    const bannerBtn = document.getElementById('bannerViewMore');
    if(bannerBtn) {
        bannerBtn.addEventListener('click', () => openModal(bannerEvent));
    }

    updateGreeting();
    updateCountdown();
    renderEventCards();
    initializeFilters();
    setInterval(updateCountdown, 1000);
}

function updateBanner() {
    if (!nextUpcomingEvent) return;
    
    // Update banner image
    const bannerImg = document.querySelector('.banner img');
    if (bannerImg) {
        bannerImg.src = nextUpcomingEvent.image;
        bannerImg.alt = nextUpcomingEvent.title;
    }
    
    // Update banner text elements if they exist in your HTML
    const bannerTitle = document.querySelector('.banner .title');
    const bannerSubtitle = document.querySelector('.banner .subtitle');
    const bannerEventType = document.querySelector('.banner .event-type');
    const bannerFaculty = document.querySelector('.banner .faculty');
    const bannerMode = document.querySelector('.banner .mode');
    
    if (bannerTitle) bannerTitle.textContent = nextUpcomingEvent.title;
    if (bannerSubtitle) bannerSubtitle.textContent = nextUpcomingEvent.subtitle || nextUpcomingEvent.description;
    if (bannerEventType) bannerEventType.textContent = nextUpcomingEvent.eventType;
    if (bannerFaculty) bannerFaculty.textContent = nextUpcomingEvent.faculty;
    if (bannerMode) bannerMode.textContent = nextUpcomingEvent.mode;
}



// Track events added to calendar
const addedEvents = new Set();

function updateGreeting() {
  const now = new Date();
  const hour = now.getHours();
  let userName = USER_NAME;

  if (IS_ADMIN) {
        userName = USER_NAME + " (Admin)";
  }

  let greeting = '';
  
  if (hour < 12) {
    greeting = `Good morning, ${userName}`;
  } else if (hour < 17) {
    greeting = `Good afternoon, ${userName}`;
  } else {
    greeting = `Good evening, ${userName}`;
  }
  
  document.getElementById('greeting').textContent = greeting;
}

function updateCountdown() {
  if (!nextUpcomingEvent) return;
  
  const target = new Date(nextUpcomingEvent.date || nextUpcomingEvent.startTime);
  const now = new Date();
  const diff = target - now;
  const el = document.getElementById("event-countdown");

  if (!el) return; // Exit if element doesn't exist

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

  currentModalEvent = event;

  // Populate modal with event data
  modalTitle.textContent = event.title;
  modalImage.src = event.image;
  modalImage.alt = event.title;
  modalFaculty.textContent = event.faculty;
  modalEventType.textContent = event.eventType;
  modalMode.textContent = event.mode;
  modalDescription.textContent = event.description || `Join us for ${event.title} organized by ${event.faculty}. This ${event.eventType} will be conducted ${event.mode}.`;

  // Set modal button state based on calendar
  const modalBtn = modal.querySelector('.add-to-calendar-btn');
  syncButtonState(modalBtn, addedEvents.has(event.title));

  // Show admin-only modal buttons if user is admin
  const deleteEventBtn = document.getElementById('deleteEventBtn');
  if (deleteEventBtn) {
      const canDelete = isEventCreator(event);
      deleteEventBtn.style.display = canDelete ? 'inline-block' : 'none';
      
      if (canDelete) {
          console.log(`Delete button shown for event "${event.title}" - created by current user`);
      } else {
          console.log(`Delete button hidden for event "${event.title}" - not created by current user`);
      }
  }

  modal.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal() {
  const modal = document.getElementById('eventModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto'; // Restore scrolling
}

async function deleteEvent() {
    if (!currentModalEvent || !isEventCreator(currentModalEvent)) {
        alert('You can only delete events you created.');
        return;
    }

    const confirmDelete = confirm(`Are you sure you want to delete "${currentModalEvent.title}"? This action cannot be undone.`);
    
    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:9091/events/${currentModalEvent.id}`, {
            method: "DELETE",
            credentials: 'include'
        });

        if (response.ok) {
            alert("Event deleted successfully!");
            
            // Remove from local events array
            events = events.filter(e => e.id !== currentModalEvent.id);
            
            // Close modal
            closeModal();
            
            // Re-render events
            findNextUpcomingEvent();
            updateBanner();
            renderEventCards();
            
            console.log(`Event "${currentModalEvent.title}" deleted successfully`);
            
        } else {
            const errorData = await response.json();
            alert(`Failed to delete event: ${errorData.body || 'Permission denied.'}`);
        }
    } catch (error) {
        console.error("Error deleting event:", error);
        alert("An error occurred while deleting the event.");
    }
}

function showPopup(title, message, redirectUrl = null) {
  console.log("showPopup called"); // Debug log
  const overlay = document.getElementById('customPopup');
  if (!overlay) {
    console.error("Popup container not found!");
    return;
  }

  // Create the popup box if it doesn't exist
  if (!overlay.querySelector('.popup-box')) {
    overlay.innerHTML = `
      <div class="popup-box" role="dialog" aria-modal="true">
        <button class="popup-close" type="button" aria-label="Close">×</button>
        <h3 id="popupTitle">${title}</h3>
        <p id="popupMessage">${message}</p>
        <div class="popup-actions">
          <button class="btn btn-primary" type="button" id="popupOkBtn">OK</button>
        </div>
      </div>
    `;
  } else {
    // Update existing popup content
    overlay.querySelector('#popupTitle').textContent = title;
    overlay.querySelector('#popupMessage').textContent = message;
  }

  // Make sure the overlay is visible
  overlay.style.display = 'flex';
  overlay.style.zIndex = '99999';

  // Define the close function
  const closePopup = () => {
    overlay.style.display = 'none';
    if (redirectUrl) window.location.href = redirectUrl;
    console.log("Popup closed"); // Debug log
  };

  // Attach one-time listeners to close buttons
  const closeBtn = overlay.querySelector('.popup-close');
  const okBtn = overlay.querySelector('#popupOkBtn');

  closeBtn.addEventListener('click', closePopup, { once: true });
  okBtn.addEventListener('click', closePopup, { once: true });

  // Close popup if clicking outside the popup box
  overlay.addEventListener('click', function handler(e) {
    if (e.target === overlay) {
      closePopup();
      overlay.removeEventListener('click', handler);
    }
  }, { once: true });
}

async function addToCalendar() {
    console.log(currentModalEvent);

    const payload = {
        summary: currentModalEvent.title,
        description: currentModalEvent.description,
        startDateTime: new Date(currentModalEvent.startTime).toISOString(),
        endDateTime: new Date(currentModalEvent.endTime).toISOString()
    };

    try {
        const response = await fetch("http://localhost:9090/events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            credentials: 'include'
        });

        if (response.ok) {
            showPopup("Success", "Event added to your Google Calendar successfully!");
            addedEvents.add(currentModalEvent.title);
            // Visually update buttons
            const modalBtn = document.querySelector('#eventModal .add-to-calendar-btn');
            const cardBtn = document.querySelector(`.card-calendar-btn[data-title="${currentModalEvent.title}"]`);
            syncButtonState(modalBtn, true);
            if(cardBtn) syncButtonState(cardBtn, true);
        } else {
             const errorData = await response.json();
             showPopup("Error", `Failed to add event: ${errorData.body || "Please make sure you are logged in."}`);
        }
    } catch (error) {
        console.error("Error adding event to calendar:", error);
        showPopup("Error", "An error occurred. Could not add event to calendar.");
    }

    const modalBtn = document.querySelector('#eventModal .add-to-calendar-btn');
    const eventTitle = document.getElementById('modalEventTitle').textContent;
    const isCurrentlyAdded = addedEvents.has(eventTitle);
    if (isCurrentlyAdded) {
      addedEvents.delete(eventTitle);
    } else {
      addedEvents.add(eventTitle);
    }
    // Update modal button state
    syncButtonState(modalBtn, !isCurrentlyAdded);

    // Update corresponding card button
    const cardBtn = document.querySelector(`.card-calendar-btn[data-title="${eventTitle}"]`);
    if(cardBtn){
      syncButtonState(cardBtn, !isCurrentlyAdded);
    }
  }

  function syncButtonState(btn, isAdded){
    if(isAdded){
      btn.classList.add('removed');
      btn.innerHTML = '<i class="fas fa-minus"></i> Remove from Calendar';
    }else{
      btn.classList.remove('removed');
      btn.innerHTML = '<i class="fas fa-plus"></i> Add to Calendar';
    }
  }

  function toggleCalendar(button, eventTitle) {
    const isCurrentlyAdded = addedEvents.has(eventTitle);
    if (isCurrentlyAdded) {
      addedEvents.delete(eventTitle);
    } else {
      addedEvents.add(eventTitle);
    }
    // Update the clicked button
    syncButtonState(button, !isCurrentlyAdded);

    // Update modal button if modal open for same event
    const modal = document.getElementById('eventModal');
    if(modal.style.display === 'block'){
      const currentModalTitle = document.getElementById('modalEventTitle').textContent;
      if(currentModalTitle === eventTitle){
        const modalBtn = modal.querySelector('.add-to-calendar-btn');
        syncButtonState(modalBtn, !isCurrentlyAdded);
      }
    }
  }

  // Hamburger menu toggle for mobile navigation
  function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks.style.display === 'flex' || navLinks.style.display === '') {
      navLinks.style.display = 'none';
    } else {
      navLinks.style.display = 'flex';
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

    // Get filter values
    const dateFilter = document.getElementById('dateFilter').value;
    const eventTypeFilter = document.getElementById('eventTypeFilter').value;
    const facultyFilter = document.getElementById('facultyFilter').value;
    const modeFilter = document.getElementById('modeFilter').value;
    const calendarFilter = document.getElementById('calendarFilter').value;

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
          'physical': 'Physical'
        };
        if (modeMapping[modeFilter] !== event.mode) return false;
      }

      // Calendar filter
      if(calendarFilter === 'added' && !addedEvents.has(event.title)) return false;
      if(calendarFilter === 'not-added' && addedEvents.has(event.title)) return false;

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

      const showDeleteButton = isEventCreator(e);
      
      // Add delete button to event card if user is the creator
      const deleteButtonHtml = showDeleteButton ? 
          `<button class="card-delete-btn" onclick="event.stopPropagation(); deleteEventFromCard('${e.id}')" title="Delete Event">
              <i class="fas fa-trash"></i>
          </button>` : '';

      return `
        <div class="${cardClass}" onclick="openModal(${JSON.stringify(e).replace(/"/g, '&quot;')})">
          <div class="event-image">
            <img src="${e.image}" alt="${e.title}" />
            <div class="price">${remainingText}</div>
             ${deleteButtonHtml}
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
                ${showDeleteButton ? `<span class="creator-badge" title="You created this event"><i class="fas fa-crown"></i></span>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  async function deleteEventFromCard(eventId) {
    const eventToDelete = events.find(e => e.id === eventId);
    
    if (!eventToDelete || !isEventCreator(eventToDelete)) {
        alert('You can only delete events you created.');
        return;
    }

    const confirmDelete = confirm(`Are you sure you want to delete "${eventToDelete.title}"? This action cannot be undone.`);
    
    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:9091/events/${eventId}`, {
            method: "DELETE",
            credentials: 'include'
        });

        if (response.ok) {
            alert("Event deleted successfully!");
            
            // Remove from local events array
            events = events.filter(e => e.id !== eventId);
            
            // Re-render everything
            findNextUpcomingEvent();
            updateBanner();
            renderEventCards();
            
            console.log(`Event "${eventToDelete.title}" deleted successfully`);
            
        } else {
            const errorData = await response.json();
            alert(`Failed to delete event: ${errorData.body || 'Permission denied.'}`);
        }
    } catch (error) {
        console.error("Error deleting event:", error);
        alert("An error occurred while deleting the event.");
    }
}

  // Add event listeners for filters
  function initializeFilters() {
    const filters = ['dateFilter', 'eventTypeFilter', 'facultyFilter', 'modeFilter', 'calendarFilter'];
    filters.forEach(filterId => {
      document.getElementById(filterId).addEventListener('change', renderEventCards);
    });
  }

  // Attach modal opening to banner View More button
 const bannerBtn = document.getElementById('bannerViewMore');
  if (bannerBtn) {
    bannerBtn.addEventListener('click', function(){
      if (nextUpcomingEvent) {
        openModal(nextUpcomingEvent);
      }
  });
}

  document.getElementById("authorize_button").addEventListener("click", () => {
    window.open("https://calendar.google.com/", "_blank");
  });
