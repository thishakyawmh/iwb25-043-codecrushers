Univents - Campus Event Management Platform
===========================================

This is Univents, a simple solution to a classic problem. It’s a dynamic event platform where students and organizations publish their own events directly, and you see everything in one, easy-to-use feed. With a powerful Ballerina backend integrating everything from our database to your personal Google Calendar, it’s the smartest way to stay connected to campus.


Key Features
------------

### User Features

*   **View All Events:** Browse a comprehensive list of all upcoming and past campus events.
    
*   **Dynamic Banner:** Instantly see the next upcoming event featured prominently with a live countdown timer.
    
*   **Advanced Filtering:** Easily search and filter events by date, event type, faculty, or mode (Online/Physical).
    
*   **Event Details Popup:** Click on any event to view a detailed popup with its full description and information.
    
*   **Google Calendar Integration:** Add any event directly to a personal Google Calendar with a single click after signing in.
    
*   **Secure Google Sign-In:** Log in seamlessly and securely using an existing Google account.
    

### Admin Features

*   **Event Creation:** Admins have the exclusive ability to create and publish new events to the platform.
    
*   **Content Management:** Admins can delete any event that they have personally created.
    
*   **Full User Access:** Admins retain all the features available to regular users.
    

Prerequisites
-------------

Before you begin, ensure you have the following installed:

*   **Ballerina:** [Download and install the latest version](https://ballerina.io/downloads/).
    
*   **MongoDB:** A running instance of MongoDB. You can use a local installation or a cloud service like MongoDB Atlas.
    
*   **VS Code:** Or any other code editor.
    
*   **Live Server Extension for VS Code:** This is highly recommended for running the frontend.
    

Setup and Execution Guide
-------------------------

Follow these steps carefully to get the application running on your local machine.

### Step 1: Google Cloud Project Configuration

To handle Google Sign-In and Calendar integration, you need to set up a project in the Google Cloud Console.

1.  **Create a Google Cloud Project:**
    
    *   Go to the [Google Cloud Console](https://console.cloud.google.com/).
        
    *   Click the project drop-down and select **"New Project"**.
        
    *   Give your project a name (e.g., "Univents Project") and click **"Create"**.
        
2.  **Enable Necessary APIs:**
    
    *   In your new project, navigate to **"APIs & Services" > "Library"**.
        
    *   Search for and **enable** the following API:
        
        *   Google Calendar API
            
3.  **Configure OAuth Consent Screen:**
    
    *   Go to **"APIs & Services" > "OAuth consent screen"**.
        
    *   Choose **"External"** for the User Type and click **"Create"**.
        
    *   Fill in the required fields:
        
        *   **App name:** Univents
            
        *   **User support email:** Your email address
            
        *   **Developer contact information:** Your email address
            
    *   Add /auth/userinfo.email , /auth/userinfo.profile , openid , /auth/calendar Scopes
        
    *   On the "Test users" step, click **"+ Add Users"** and add the Gmail account(s) you will use for testing.
        
    *   Click **"Save and Continue"**, then **"Back to Dashboard"**.
        
4.  **Create OAuth 2.0 Credentials:**
    
    *   Go to **"APIs & Services" > "Credentials"**.
        
    *   Click **"+ Create Credentials"** and select **"OAuth client ID"**.
        
    *   For **"Application type"**, select **"Web application"**.
        
    *   Under "Authorized redirect URIs", click "+ Add URI" and enter the following exactly: <br> http://localhost:9090/oauth2/callback
        
    *   Click **"Create"**. A popup will appear with your **Client ID** and **Client Secret**. Copy these immediately.
        

### Step 2: Backend Configuration (Ballerina)

1.  Add Credentials to Config.toml:
    
    *   In the backend project folder, find or create the Config.toml file.
        
    *   Add your copied Client ID and Client Secret to this file. It should look like this:
        <br>clientId="YOUR_CLIENT_ID_HERE"<br>clientSecret="YOUR_CLIENT_SECRET_HERE"
        
2.  Set Admin Privileges (Optional):
    
    *   If you want to test the admin features (like creating events), open the main.bal file.
        
    *   Find the ADMIN\_EMAILS constant (around line 30).
        
    *   Add the email address of your admin user(s) to the array.
        

### Step 3: Frontend Configuration & The Port Issue

The backend is configured to redirect to a specific frontend URL after a successful login. This can cause an issue if your frontend runs on a different port.

*   **The Problem:** The Ballerina backend will redirect the user to **http://127.0.0.1:5501/src/index.html?auth=success** after login. If your Live Server is running on a different port (like the default 5500), you will get an error.
    
*   **The Solution (Choose one):**
    
    *   **Option A (Recommended): Change Live Server Port**
        
        1.  In VS Code, go to File > Preferences > Settings.
            
        2.  Search for Live Server Port.
            
        3.  Find "Live Server › Settings: Port" and change the value from 5500 to 5501.
            
        4.  Restart the Live Server.
            
    *   **Option B: Change Backend Code**
        
        1.  Open the main.bal file in the backend project.
            
        2.  Go to the oauth2/callback resource function (around line 342).
            
        3.  Find the line with the redirect URL and change 5501 to the port your Live Server is using.
            

### Step 4: Run the Application

1.  **Start the Backend:**
    
    *   Open a terminal in the backend project directory.
        
    *   Run the command: bal run
        
2.  **Start the Frontend:**
    
    *   Open the frontend project folder in VS Code.
        
    *   Right-click on index.html and select **"Open with Live Server"**.
        
3.  **Use the App:**
    
    *   Your browser should open to the Univents homepage.
        
    *   You can now sign in with the Google account you added as a test user. If you configured an admin email, you will see the "Create Event" button and have the ability to post new events.
