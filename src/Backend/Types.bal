public type EventInput record {|
    string image;
    string month;
    string day;
    string title;
    string subtitle;
    string eventType;
    string faculty;
    string mode;
    string date;
    string description;

|};

public type EventUpdate record {|
    string title?;
    int year?;
    string directorId?;
|};

public type Event record {|
    readonly string id;
    *EventInput;
|};
