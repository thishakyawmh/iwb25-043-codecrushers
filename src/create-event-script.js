document.getElementById('date').addEventListener('change', function() {
    if (this.value) {
        const selectedDate = new Date(this.value);
        const month = selectedDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const day = selectedDate.getDate();
        document.getElementById('month').value = month;
        document.getElementById('day').value = day;
    }
});

// Handle form submission
document.getElementById('createEventForm').addEventListener('submit', function(event) {
    event.preventDefault(); 
    
    const imageFile = document.getElementById('image').files[0];
    const reader = new FileReader();

    // This function runs after the file has been read into memory
    reader.onload = function(e) {
        // The result is the Base64 encoded string of the image
        const imageBase64 = e.target.result;

        console.log(typeof imageBase64);
        
        // 1. Gather all form data into a single JavaScript object
        const eventData = {
            image: imageBase64, // Use the Base64 string here
            month: document.getElementById('month').value,
            day: document.getElementById('day').value,
            title: document.getElementById('title').value,
            subtitle: document.getElementById('subtitle').value,
            eventType: document.getElementById('eventType').value,
            faculty: document.getElementById('faculty').value,
            mode: document.getElementById('mode').value,
            date: document.getElementById('date').value,
            description: document.getElementById('description').value
        };

          console.log(eventData);
        
        // 2. Construct the URL for the POST endpoint
        //    Note: Your new Ballerina service uses '/plans' for creating events.
        const url = `http://localhost:9091/events`;

        // 3. Send the data as a JSON object using the POST method
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
        })
        .then(response => {
            if (!response.ok) {
                // Try to get more error details from the response body
                return response.text().then(text => { 
                    throw new Error(`Server responded with status: ${response.status}. Body: ${text}`);
                });
            }
             return response.text();
        })
        .then(data => {
            console.log('Success:', data);
            alert('Event created successfully!');
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Failed to create event. Please check the console for details.');
        });
    };

    // Start the file reading process.
    if (imageFile) {
        reader.readAsDataURL(imageFile);
    } else {
        alert('Please select an image to upload.');
    }
});