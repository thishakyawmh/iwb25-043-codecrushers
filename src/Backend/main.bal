import ballerina/http;
import ballerina/uuid;
//import ballerina/uuid;
import ballerinax/mongodb;

//import ballerina/log;

configurable string host = "localhost";
configurable int port = 27017;

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
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
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
