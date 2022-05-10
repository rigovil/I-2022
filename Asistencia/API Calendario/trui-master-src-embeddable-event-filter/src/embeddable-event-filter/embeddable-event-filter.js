/*
 * Training Event Calendar - Simple Embed Library Object 
 * 
 * Written by: P.Sherratt (innoflair)
 * Updated and extended by: Martin Tykal (Solenix)
 * Version:    2.0 (03/09/18)
 * Copyright:  EUMETSAT (2018)
 */

function TrainingCalendar(completedCallback) {

    // All event fields of the API are supported as columns
    // At the moment these are:
    // "title", "venue", "date", "attendance", "contactEmail", "contactPerson", "contactUrl", "creator", "description", "eventType", "initiatives", "languages", "regions", "status"
    var columns = ["title", "venue", "date", "attendance", "contactEmail", "contactPerson", "contactUrl", "creator", "description", "eventType", "initiatives", "languages", "regions", "status"];

    var apis = ["https://usc.tools.eumetsat.int/trapi/resources/public/events"];

    var topics = [];
    var self = this;
    // Check whether the event should be displayed
    this.eventToBeDisplayed = function (event) {
        var display = false;
        var registrationDateCheck = false;

        if (event.hasOwnProperty('status') && event.status.hasOwnProperty('value') && event.status.value == "Confirmed") {
            if (topics.size>0 && !topics.includes(event.topic)){
                return false;
            }
            display = self.checkEventListValueContains(event, 'initiative', ["EUMETSAT", "EUMeTrain"]);
            if (!display) {
                display = self.checkEventListValueContains(event, 'trainingPartner', ["EUMETSAT"]);
            }
        }
        return display;
    }

    // Check whether the events named list contains certain values 
    this.checkEventListValueContains = function (event, listName, contains) {
        var exists = false;
        if (event.hasOwnProperty(listName)) {
            $.each(event[listName], function (initKey, initItem) {
                if ((initItem.hasOwnProperty('value') &&
                    ($.inArray(initItem.value, contains) > -1))) {
                    exists = true;
                    return true; // break out of inner $.each 
                }
            });
        }
        return exists;
    }

    this.getEventRow = function (event) {
        row = rowTemplate;
        if (event.id != "") {
            row = row.replace(/\[id\]/, event.id);
        }
        // Display Title
        if (event.title != "" && columns.includes("title")) {
            var formattedTitle = "<a href='" + trainingCalendarUrl + "/?page=details&id=" + event.id + "' target='_blank'>" + event.title + "</a>";
            row = row.replace(/\[title\]/, formattedTitle);
        }
        // Display Venue (City,Country)
        var venue = [];
        if (columns.includes("venue")) {
            if (event.city != "") {
                venue.push(event.city);
            }
            if (event.country != null && event.country.name != "") {
                venue.push(event.country.name);
            }
            if (venue.length > 0) {
                row = row.replace(/\[venue\]/, venue.join(", "));
            }
        }
        // Display Date
        if (columns.includes("date")) {
            row = row.replace(/\[date\]/, self.getDateRangeStr(event.startDate, event.endDate));
        }
        // Display Attendance
        if (columns.includes("attendance")) {
            row = row.replace(/\[attendance\]/, event.attendance.value);
        }
        // Display contact email
        if (columns.includes("contactEmail")) {
            row = row.replace(/\[contactEmail\]/, event.contactEmail);
        }
        // Display contact person
        if (columns.includes("contactPerson")) {
            row = row.replace(/\[contactPerson\]/, event.contactPerson);
        }
        // Display contact url
        if (event.contactUrl!="" && columns.includes("contactUrl")) {
            row = row.replace(/\[contactUrl\]/, "<a href='" + event.contactUrl + "'>Contact</a>");
        }
        // Display creator
        if (columns.includes("creator")) {
            row = row.replace(/\[creator\]/, event.creator.name);
        }
        // Display description
        if (columns.includes("description")) {
            row = row.replace(/\[description\]/, event.description);
        }
        // Display description
        if (columns.includes("eventType")) {
            row = row.replace(/\[eventType\]/, event.eventType.value);
        }
        // Display initiatives
        var initiatives = [];
        if (columns.includes("initiatives")) {
            event.initiative.forEach(function (elem) {
                if (elem.value != "") {
                    initiatives.push(elem.value);
                }
            });
            if (initiatives.length > 0) {
                row = row.replace(/\[initiatives\]/, initiatives.join(", "));
            }
        }
        // Display languages
        var languages = [];
        if (columns.includes("languages")) {
            event.language.forEach(function (elem) {
                if (elem.value != "") {
                    languages.push(elem.value);
                }
            });
            if (languages.length > 0) {
                row = row.replace(/\[languages\]/, languages.join(", "));
            }
        }

        // Display regions
        var regions = [];
        if (columns.includes("regions")) {
            event.regions.forEach(function (elem) {
                if (elem.value != "") {
                    regions.push(elem.value);
                }
            });
            if (regions.length > 0) {
                row = row.replace(/\[regions\]/, regions.join(", "));
            }
        }

        // Display status
        if (columns.includes("status")) {
            row = row.replace(/\[status\]/, event.status.value);
        }

        // Clear any unset tokens
        row = row.replace(/\[[^\]]*\]/, "");

        return row;
    }

    this.getTodaysDateStr = function (time) {
        return time.getFullYear().toString() + "-" + self.pad(time.getMonth() + 1, 2).toString() + "-" + self.pad(time.getDate(), 2).toString();
    }

    this.startOfDay = function (d) {
        var year = d.getUTCFullYear();
        var month = d.getUTCMonth();
        var day = d.getUTCDate();
        return Date.UTC(year, month, day, 0, 0, 0, 0);
    }

    this.pad = function (num, size) {
        return ('000000000' + num).substr(-size)
    };

    this.getDateRangeStr = function (startDateVal, endDateVal) {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var now = new Date();
        var startDateValue = new Date(startDateVal);
        var endDateValue = new Date(endDateVal);

        if (startDateValue != null) {
            if (endDateValue != null) {
                if (startDateValue == endDateValue) { // Event only on one day 
                    return startDateValue.getDate() + " " + months[startDateValue.getMonth()] + ", " + startDateValue.getFullYear(); // 'D MMMM, YYYY'
                } else if (startDateValue.getFullYear() == endDateValue.getFullYear()) { // Dates in same month
                    if (startDateValue.getMonth() == endDateValue.getMonth()) { // Dates in same month
                        if (startDateValue.getDate() == endDateValue.getDate()) { // Dates in same day
                            if (startDateValue == this.startOfDay(startDateValue)) { // Ignore time if set to 00:00:00 UTC
                                return startDateValue.getDate();
                            } else {
                                return startDateValue.getDate() + " " + months[startDateValue.getMonth()] + ", " + startDateValue.getFullYear(); // 'D MMMM, YYYY'
                            }
                        } else {
                            return startDateValue.getDate() + "-" + endDateValue.getDate() + " " + months[endDateValue.getMonth()] + ", " + endDateValue.getFullYear(); // 'D-D MMMM, YYYY';
                        }
                    } else {
                        return startDateValue.getDate() + " " + months[startDateValue.getMonth()] + " - " + endDateValue.getDate() + " " + months[endDateValue.getMonth()] + ", " + endDateValue.getFullYear(); // 'D MMMM - D MMMM, YYYY');
                    }
                } else {
                    return startDateValue.getDate() + " " + months[startDateValue.getMonth()] + ", " + startDateValue.getFullYear() + ' - ' + endDateValue.getDate() + " " + months[endDateValue.getMonth()] + ", " + endDateValue.getFullYear();
                }
            } else {
                return '';
            }
        }
    }

    var now = new Date(/*"2017-01-01"*/); // Set date for testing
    var todaysDate = this.getTodaysDateStr(now);
    var displayCount = -1; // Set to -1 to display all 
    var trainingCalTagId = "trainingEventCalendar";
    var trainingCalendarUrl = "http://trainingevents.eumetsat.int";
    // Display template variables
    var headerTemplate = "<table><colgroup></colgroup><thead><tr>";
    var rowTemplate = "<tr>";
    columns.forEach(function (columnName) {
        headerTemplate += "<th>" + columnName.toUpperCase() + "</th>";
        if (columnName == "date") {
            rowTemplate += "<td nowrap>[" + columnName + "]</td>";
        } else {
            rowTemplate += "<td>[" + columnName + "]</td>";
        }
    });
    rowTemplate += "</tr>";
    headerTemplate += "</tr></thead><tbody>";
    var footerTemplate = "</tbody></table>";

    localHtml = $('#' + trainingCalTagId).html("")
    apis.forEach(function (api) {
        var apiQuery = api+"?filter=startDate>='" + todaysDate + "' or endDate>='" + todaysDate + "' order by startDate asc";
        // Get the data from the API and display the relevant events
        $.getJSON(encodeURI(apiQuery), function (data) {
            console.log(data)
            var count = 0;
            var displayFlag = false;
            var rows = "";
            $.each(data, function (listkey, event) {
                if (self.eventToBeDisplayed(event)) {
                    rows += self.getEventRow(event);
                    count++;
                    // break out of the loop if we have reached the displayCount
                    if (count === displayCount) {
                        return false;
                    }
                }
            });
            if (count > 0) {
                localHtml = $('#' + trainingCalTagId).html() + headerTemplate + rows + footerTemplate;
                $('#' + trainingCalTagId).html(localHtml).promise().done(function () {
                    if (completedCallback != null) {
                        completedCallback();
                    }
                }
                );
            } else {
                $('#' + trainingCalTagId).html("Note: No Training Calendar entries match the criteria.");
            }
        }).fail(function () { // Handle failure case 
            $('#' + trainingCalTagId).html("<p style='color:red'>ERROR: It is currently not possible to load the Training Calendar, please try the following direct link: <a target='_blank' style='color:red' href='" + trainingCalendarUrl + "'>Training Calendar</a>.</p>")
        });
    });
}