import ballerina/http;

//import ballerina/log;
import ballerina/log;
import ballerina/uuid;
import ballerinax/googleapis.gcalendar;
//import ballerina/uuid;
import ballerinax/mongodb;

configurable string host = "localhost";
configurable int port = 27017;

configurable string clientId = ?;
configurable string clientSecret = ?;
configurable string redirectUrl = "http://localhost:9090/oauth2/callback";

gcalendar:Client? calendarClient = ();
string? currentUserName = ();

final mongodb:Client mongoDb = check new ({
    connection: {
        serverAddress: {
            host,
            port
        }
    }
});

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        allowCredentials: true,
        exposeHeaders: ["Set-Cookie"]
    }
}

service on new http:Listener(9091) {

    private final mongodb:Database Univents;

    function init() returns error? {
        self.Univents = check mongoDb->getDatabase("Univents");
    }

    resource function get events() returns Event[]|error {
        mongodb:Collection events = check self.Univents->getCollection("Events");
        stream<Event, error?> result = check events->find();
        return from Event e in result
            select e;
    }

    // resource function get movies/[string id]() returns Movie|error {
    //     return getMovie(self.moviesDb, id);
    // }

    resource function post events(EventInput newEvent) returns string|error {
        string id = uuid:createType1AsString();
        Event event = {id, ...newEvent};
        mongodb:Collection events = check self.Univents->getCollection("Events");
        check events->insertOne(event);
        return id;
    }

    resource function put events/[string id](EventUpdate update) returns Event|error {
        mongodb:Collection events = check self.Univents->getCollection("Events");
        mongodb:UpdateResult updateResult = check events->updateOne({id}, {set: update});
        if updateResult.modifiedCount != 1 {
            return error(string `Failed to update the event with id ${id}`);
        }
        return getEvent(self.Univents, id);
    }

    // resource function delete movies/[string id]() returns string|error {
    //     mongodb:Collection movies = check self.moviesDb->getCollection("movies");
    //     mongodb:DeleteResult deleteResult = check movies->deleteOne({id});
    //     if deleteResult.deletedCount != 1 {
    //         return error(string `Failed to delete the movie ${id}`);
    //     }
    //     return id;
    // }
}

isolated function getEvent(mongodb:Database Univents, string id) returns Event|error {
    mongodb:Collection events = check Univents->getCollection("Events");
    stream<Event, error?> findResult = check events->find({id});
    Event[] result = check from Event e in findResult
        select e;
    if result.length() != 1 {
        return error(string `Failed to find a movie with id ${id}`);
    }
    return result[0];
}

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        allowCredentials: true,
        exposeHeaders: ["Set-Cookie"]
    }
}

service / on new http:Listener(9090) {

    resource function get user() returns http:Ok|http:Unauthorized {
        string|() userName;
        lock {
            userName = currentUserName;
        }

        if userName is () {
            return <http:Unauthorized>{body: "User not authenticated or user info not available."};
        }

        return <http:Ok>{body: {"userName": userName}};
    }

    resource function post logout() returns http:Ok {
        // Clear the user session data
        lock {
            calendarClient = ();
            currentUserName = ();
        }

        // Clear cookies using Set-Cookie headers with Max-Age=0
        map<string|string[]> responseHeaders = {
            "Set-Cookie": [
                "G_ENABLED_IDPS=; Path=/; Max-Age=0; HttpOnly=false",
                "isLoggedIn=; Path=/; Max-Age=0; HttpOnly=false"
            ]
        };

        log:printInfo("User logged out successfully");
        return <http:Ok>{
            body: {"message": "Logged out successfully"},
            headers: responseHeaders
        };
    }

    resource function get login() returns http:TemporaryRedirect {
        string authorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
        string scope = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile";
        string authUrl = authorizationEndpoint +
            string `?response_type=code&client_id=${clientId}&redirect_uri=${redirectUrl}&scope=${scope}&access_type=offline`;

        log:printInfo("Redirecting user to Google for authentication", url = authUrl);
        // FIX: Construct a redirect response record instead of calling `new http:Redirect()`
        return {headers: {"Location": authUrl}};
    }

    resource function get auth/status() returns http:Ok|http:Unauthorized {
        string|() userName;
        gcalendar:Client|() calendarClientLocal; // Renamed to avoid conflict with 'client' keyword

        lock {
            userName = currentUserName;
            calendarClientLocal = calendarClient;
        }

        log:printInfo("Auth status check", userName = userName, hasClient = (calendarClientLocal is gcalendar:Client));

        if userName is string && calendarClientLocal is gcalendar:Client {
            return <http:Ok>{
                body: {
                    "isAuthenticated": true,
                    "userName": userName
                }
            };
        } else {
            return <http:Unauthorized>{
                body: {
                    "isAuthenticated": false,
                    "message": "User not authenticated"
                }
            };
        }
    }

    resource function get oauth2/callback(string code) returns http:TemporaryRedirect|http:InternalServerError|error {
        log:printInfo("Received authorization code from Google", authCode = code);

        // FIX: Properly handle the client creation with error handling
        http:Client tokenClient = check new ("https://oauth2.googleapis.com");

        map<string> payload = {
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            redirect_uri: redirectUrl,
            grant_type: "authorization_code"
        };

        do {
            http:Response response = check tokenClient->post("/token", payload);

            var jsonPayload = response.getJsonPayload();
            if jsonPayload is json {
                json|error refreshToken = jsonPayload.refresh_token;
                json|error accessToken = jsonPayload.access_token;

                if refreshToken is string && accessToken is string {
                    // Get user information
                    http:Client userInfoClient = check new ("https://www.googleapis.com");

                    map<string> headers = {
                        "Authorization": "Bearer " + accessToken
                    };

                    http:Response userInfoResponse = check userInfoClient->get("/oauth2/v1/userinfo", headers);
                    var userInfoPayload = userInfoResponse.getJsonPayload();

                    if userInfoPayload is json {
                        json|error userName = userInfoPayload.name;
                        if userName is string {
                            lock {
                                currentUserName = userName;
                            }
                            log:printInfo("Retrieved user information", userName = userName);
                        }
                    }

                    var clientResult = new gcalendar:Client({
                        auth: {
                            clientId: clientId,
                            clientSecret: clientSecret,
                            refreshToken: refreshToken,
                            refreshUrl: "https://oauth2.googleapis.com/token"
                        }
                    });

                    if clientResult is gcalendar:Client {
                        lock {
                            calendarClient = clientResult;
                        }
                        log:printInfo("Successfully exchanged code for tokens and created a new client.");

                        return <http:TemporaryRedirect>{
                            headers: {"Location": "http://localhost:5501/src/index.html?auth=success"}
                        };
                    }
                }
            }

            string payloadForLog = (jsonPayload is error) ? jsonPayload.toString() : jsonPayload.toString();
            log:printError("Could not extract refresh token from Google's response.", responsePayload = payloadForLog);
            return <http:InternalServerError>{body: "Authentication failed: Invalid response from Google."};

        } on fail error err {
            log:printError("Failed to exchange authorization code for tokens", 'error = err);
            return <http:InternalServerError>{body: "Error during authentication."};
        }
    }

    resource function post 'events(@http:Payload EventPayload payload) returns http:Ok|http:InternalServerError|http:Unauthorized {

        gcalendar:Client|() localClient;
        lock {
            localClient = calendarClient;
        }

        if localClient is () {
            log:printWarn("Attempted to create event without logging in.");
            return <http:Unauthorized>{body: "User not authenticated. Please login first."};
        }

        do {
            gcalendar:EventReminder[] remindersList = [
                {
                    method: "popup",
                    minutes: 1440 // 24 hours before
                },
                {
                    method: "popup",
                    minutes: 30 // 24 hours before
                }
            ];

            gcalendar:EventReminders reminders = {
                useDefault: false, // Don't use default reminders
                overrides: remindersList
            };

            gcalendar:Event eventData = {
                summary: payload.summary,
                description: payload.description,
                'start: {dateTime: payload.startDateTime},
                end: {dateTime: payload.endDateTime},
                reminders: reminders
            };

            gcalendar:Event createdEvent = check localClient->/calendars/primary/events.post(eventData);
            log:printInfo("Event created successfully!", eventId = createdEvent.id);
            return http:OK;

        } on fail error err {
            log:printError("Failed to create event", 'error = err);
            return <http:InternalServerError>{
                body: {"error": "Failed to create calendar event.", "details": err.toString()}
            };
        }
    }
}
