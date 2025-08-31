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
    string startTime;
    string endTime;
    string description;

|};

public type EventUpdate record {|
    string image?;
    string month?;
    string day?;
    string title?;
    string subtitle?;
    string eventType?;
    string faculty?;
    string mode?;
    string date?;
    string startTime?;
    string endTime?;
    string description?;
|};

public type Event record {|
    readonly string id;
    *EventInput;
|};

type EventPayload record {|
    string summary;
    string description;
    string startDateTime;
    string endDateTime;
|};
