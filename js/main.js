window.onload = function getData() {
    getCalendar();
    getFormat();
    getValues();
}

// Get Date & Time
function getCalendar() {
    document.getElementById("date").innerHTML = getCurrentDay() + " " + getCurrentDate();
}

function getCurrentDay() {
    const day = new Date().getDay();
    const daySelection = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return daySelection[day];
}

function getCurrentDate() {
    const month = new Date().getMonth();
    const date = new Date().getDate();
    
    return (month + 1) + '/' + date;
}

setInterval(getTime, 1000);
function getTime() {
    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();
    document.getElementById("time").innerHTML = convertTo12Hour(hours, minutes);
}

// Getters
function getFormat() {
    if (localStorage.getItem("format") === null || localStorage.getItem("format").includes("undefined")) {
        document.getElementById("timeSheet").innerHTML = "";
        localStorage.format = "";
    } else {
        document.getElementById("timeSheet").innerHTML = localStorage.format;
    }
}

function getValues() {
    Array.from(document.querySelectorAll("input[value]")).map( (x, i) => x.value = JSON.parse(localStorage.values)[i] );
}

// Setters
function storeFormat() {
    localStorage.format = document.getElementById("timeSheet").innerHTML;
}

function storeValues() {
    localStorage.values = JSON.stringify( Array.from(document.querySelectorAll("input[value]")).map( x => x.value ) );
}

// Autosave Data
setInterval(function() { 
    storeData();
    autosaveMessage(); 
}, 25000);

function storeData() {
    storeFormat();
    storeValues();
}

function autosaveMessage() {
    document.getElementById("autosave").setAttribute("class", "autosave autosave--active");
    setTimeout(removeAutosaveMessage, 2500);
}

function removeAutosaveMessage() {
    document.getElementById("autosave").setAttribute("class", "autosave");
}

// Reset all data
function resetAll() {
    if (confirm("Do you want to reset EVERYTHING?")) {
        document.getElementById("timeSheet").innerHTML = "";
        localStorage.clear();
    } else {
        return;
    }
}

// Time Sheet Creation
function createCategory() {
    let categoryName = prompt("Enter a category name:", "Week 1");
    let regex = /^([a-zA-Z0-9 _-]+)$/;
    if (categoryName == null || categoryName == "" || !categoryName.match(regex) ) {
        alert("Invalid Input; category name must be alpha-numeric!");
        return;
    }

    // Create Category & Append to timeSheet
    let category = document.createElement('div');
    category.className = "category";
    document.getElementById("timeSheet").appendChild(category);

    // Create Category Header & Append to Category
    let categoryHeader = document.createElement('div');
    categoryHeader.className = "category__header";
    categoryHeader.innerHTML = categoryName;
    category.appendChild(categoryHeader);
    let categoryBreak = document.createElement('div');
    categoryBreak.className = "category__headerBreak";
    categoryHeader.appendChild(categoryBreak);

    // Create Category Content & Append to Category
    let categoryContent = document.createElement('div');
    categoryContent.className = "category__content";
    category.appendChild(categoryContent);

    // Initialize First Records
    for (let i = 0; i < 5; i+=1) {
        recordTime(categoryContent);
    }

    let totalCategoryHours = document.createElement('div');
    totalCategoryHours.className = "category__totalHours";
    totalCategoryHours.innerHTML = "Total " + category.childNodes[0].childNodes[0].data + " Hours: " + "0.0";
    category.appendChild(totalCategoryHours);

    // Create Record Button & Add event listener to recordTime
    let categoryFooter = document.createElement('div');
    categoryFooter.className = "category__footer";
    categoryFooter.innerHTML = "&plus;";
    category.appendChild(categoryFooter);
    categoryFooter.addEventListener("click", function() {
        recordTime(categoryContent);
    });
}

function calculateCategoryHours(relativeNode) {
    let categoryContent = relativeNode.parentNode.parentNode.parentNode.parentNode;
    let category = relativeNode.parentNode.parentNode.parentNode.parentNode.parentNode;
    let totalCategoryHours = relativeNode.parentNode.parentNode.parentNode.parentNode.parentNode.childNodes[2];

    let totalCategoryTime = 0;
    for (i = 0; i < categoryContent.childNodes.length; i+=1) {
        totalCategoryTime += parseFloat( categoryContent.childNodes[i].childNodes[1].childNodes[1].childNodes[0].data.replace(/[^0-9\.]+/g,'') );
    }

    totalCategoryHours.innerHTML = "Total " + category.childNodes[0].childNodes[0].data + " Hours: " + parseFloat(totalCategoryTime).toFixed(1);
}

function recordTime(categoryContent) {
    let categoryRecord = document.createElement('div');
    categoryRecord.className = "category__record";
    categoryContent.appendChild(categoryRecord);

    timeIn(categoryRecord, true);
    rowTotal(categoryRecord);
    timeIn(categoryRecord, false);
}

// Initialize row totals
function rowTotal(categoryRecord) {
    let rowTime = document.createElement('div');
    rowTime.className = "record__rowTime";
    categoryRecord.appendChild(rowTime);

    let totalRowHeader = document.createElement('div');
    totalRowHeader.innerHTML = "Total";
    rowTime.appendChild(totalRowHeader);

    let totalRowTime = document.createElement('div');
    totalRowTime.innerHTML = "- " + "0.0h" + " -";
    rowTime.appendChild(totalRowTime);
}

function timeIn(categoryRecord, isAM) {
    let timePair = document.createElement('div');
    timePair.className = "category__timePair";
    categoryRecord.appendChild(timePair);

    let time = document.createElement('div');
    timePair.appendChild(time);
    time.className = "category__time";

    let timeHeader = document.createElement('h2');
    timeHeader.innerHTML = "Time In";
    time.appendChild(timeHeader);

    // Hour Input
    let hourInput = document.createElement('input');
    hourInput.setAttribute("type", "text");
    hourInput.setAttribute("maxlength", "2");
    hourInput.setAttribute("value", "00");
    hourInput.setAttribute("onblur", "this.value=this.value.replace(/[^0-9]/g,''); this.value = validateInputHour(this.value); calculateRowTotal(this.parentNode.parentNode.parentNode); calculateCategoryHours(this);");
    time.appendChild(hourInput);
    let timeDivider = document.createElement('span');
    timeDivider.innerHTML = ":";
    timeDivider.className = "time__break";
    time.appendChild(timeDivider);

    // Minute Input
    let minuteInput = document.createElement('input');
    minuteInput.className = "category__timeInput";
    minuteInput.setAttribute("type", "text");
    minuteInput.setAttribute("maxlength", "2");
    minuteInput.setAttribute("value", "00");
    minuteInput.setAttribute("onblur", "this.value=this.value.replace(/[^0-9]/g,''); this.value = validateInputMinute(this.value); calculateRowTotal(this.parentNode.parentNode.parentNode); calculateCategoryHours(this);");
    time.appendChild(minuteInput);

    // 12 Hour Format Selection (AM | PM)
    let selection = document.createElement('select');
    selection.className = "time__selection";
    selection.setAttribute("onblur", "calculateRowTotal(this.parentNode.parentNode.parentNode); calculateCategoryHours(this); storeData();");
    time.appendChild(selection);

    if (isAM) {
        let selectionAM = document.createElement('option');
        selectionAM.innerHTML = "AM";
        selection.appendChild(selectionAM);

        let selectionPM = document.createElement('option');
        selectionPM.innerHTML = "PM";
        selection.appendChild(selectionPM);
    } else {
        let selectionPM = document.createElement('option');
        selectionPM.innerHTML = "PM";
        selection.appendChild(selectionPM);

        let selectionAM = document.createElement('option');
        selectionAM.innerHTML = "AM";
        selection.appendChild(selectionAM);
    }

    timeOut(timePair);
}

function timeOut(timePair) {
    let time = document.createElement('div');
    timePair.appendChild(time);
    time.className = "category__time";

    let timeHeader = document.createElement('h2');
    timeHeader.innerHTML = "Time Out";
    time.appendChild(timeHeader);

    // Hour Input
    let hourInput = document.createElement('input');
    hourInput.setAttribute("type", "text");
    hourInput.setAttribute("maxlength", "2");
    hourInput.setAttribute("value", "00");
    hourInput.setAttribute("onblur", "this.value=this.value.replace(/[^0-9]/g,''); this.value = validateInputHour(this.value); calculateRowTotal(this.parentNode.parentNode.parentNode); calculateCategoryHours(this);");
    time.appendChild(hourInput);
    let timeDivider = document.createElement('span');
    timeDivider.innerHTML = ":";
    timeDivider.className = "time__break";
    time.appendChild(timeDivider);

    // Minute Input
    let minuteInput = document.createElement('input');
    minuteInput.className = "category__timeInput";
    minuteInput.setAttribute("type", "text");
    minuteInput.setAttribute("maxlength", "2");
    minuteInput.setAttribute("value", "00");
    minuteInput.setAttribute("onblur", "this.value=this.value.replace(/[^0-9]/g,''); this.value = validateInputMinute(this.value); calculateRowTotal(this.parentNode.parentNode.parentNode); calculateCategoryHours(this);");
    time.appendChild(minuteInput);

    // 12 Hour Format Selection (AM | PM)
    let selection = document.createElement('select');
    selection.className = "time__selection";
    selection.setAttribute("onblur", "calculateRowTotal(this.parentNode.parentNode.parentNode); calculateCategoryHours(this); storeData();");
    time.appendChild(selection);

    let selectionPM = document.createElement('option');
    selectionPM.innerHTML = "PM";
    selection.appendChild(selectionPM);

    let selectionAM = document.createElement('option');
    selectionAM.innerHTML = "AM";
    selection.appendChild(selectionAM);
}

// Time Input Validation
function validateInputHour(value) {
    if (value === '' || value === null  || value === undefined) {
        return 0 + '' + 0;
    } else if (value > 12) {
        return 12;
    } else if (value < 1) {
        return 0 + '' + 0;
    } else {
        return value;
    }
}

function validateInputMinute(value) {
    if (value === '' || value === null  || value === undefined) {
        return 0 + '' + 0;
    } else if (value > 59) {
        return 59;
    } else if (value < 10 && value > 0) {
        value = parseFloat(value).toString();
        return value.replace(value, 0 + value);
    } else {
        return value;
    }
}

// Calculate row total
function calculateRowTotal(categoryRecord) {
    let firstTimePair = categoryRecord.childNodes[0].childNodes;
    let secondTimePair = categoryRecord.childNodes[2].childNodes;
    categoryRecord.childNodes[1].childNodes[1].innerHTML = "- " + parsePairs(firstTimePair, secondTimePair).toFixed(1) + "h -";
}

// Parses pairs of time and calls for conversion function
function parsePairs(firstTimePair, secondTimePair) {
    // First pair of time nodes
    let firstPairFirstHourFormat = firstTimePair[0].childNodes[1].value;
    let firstPairFirstMinuteFormat = firstTimePair[0].childNodes[3].value;
    let firstPairFirstTimeFormat = firstTimePair[0].childNodes[4].value;
    let firstPairSecondHourFormat = firstTimePair[1].childNodes[1].value;
    let firstPairSecondMinuteFormat = firstTimePair[1].childNodes[3].value;
    let firstPairSecondTimeFormat = firstTimePair[1].childNodes[4].value;

    let firstPairTimeIn = convertTo24Hour(firstPairFirstHourFormat, firstPairFirstMinuteFormat, firstPairFirstTimeFormat);
    let firstPairTimeOut = convertTo24Hour(firstPairSecondHourFormat, firstPairSecondMinuteFormat, firstPairSecondTimeFormat);

    // Second pair of time nodes
    let secondPairFirstHourFormat = secondTimePair[0].childNodes[1].value;
    let secondPairFirstMinuteFormat = secondTimePair[0].childNodes[3].value;
    let secondPairFirstTimeFormat = secondTimePair[0].childNodes[4].value;
    let secondPairSecondHourFormat = secondTimePair[1].childNodes[1].value;
    let secondPairSecondMinuteFormat = secondTimePair[1].childNodes[3].value;
    let secondPairSecondTimeFormat = secondTimePair[1].childNodes[4].value;

    let secondPairTimeIn = convertTo24Hour(secondPairFirstHourFormat, secondPairFirstMinuteFormat, secondPairFirstTimeFormat);
    let secondPairTimeOut = convertTo24Hour(secondPairSecondHourFormat, secondPairSecondMinuteFormat, secondPairSecondTimeFormat);

    return calculateTimeDifference(firstPairTimeIn, firstPairTimeOut) + calculateTimeDifference(secondPairTimeIn, secondPairTimeOut);
}

function convertTo12Hour(hours, minutes) {
    if (minutes < 10) {
        minutes = 0 + '' + minutes;
    }

    if (hours > 12) {
        return (hours-12) + ":" + minutes + " PM";
    } else if (hours === 12) {
        return hours + ":" + minutes + " PM";
    } else {
        return hours + ":" + minutes + " AM";
    }
}

function convertTo24Hour(hours, minutes, timeFormat) {
    // Converts minutes to hour decimal form rounded to nearest tenth
    let minuteDecimal = Math.round((parseInt(minutes)/60) * 10);

    // Converts hours to 24 format
    if (timeFormat === "PM") {
        if (hours === "12") {
            return 12 + (minuteDecimal / 10);
        } else if (hours === "00") {
            return parseInt(hours) + parseFloat(minuteDecimal / 10);
        } else {
            return (parseInt(hours) + 12) + parseFloat(minuteDecimal / 10);
        }
    } else if (timeFormat == "AM") {
        if (hours === "12") {
            return 0 + (minuteDecimal / 10);
        } else {
            return parseInt(hours) + parseFloat(minuteDecimal / 10);
        }
    }
}

// Accepts 1 pair of time in/out and returns total hours in decimal
function calculateTimeDifference(timeIn, timeOut) {
    if (timeIn < timeOut) {
        return Math.round((timeOut - timeIn) * 10) / 10;
    } else {
        return Math.round((timeIn - timeOut) * 10) / 10;
    }
}