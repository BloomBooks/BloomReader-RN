// This file implements the functions that support bloom-player sending analytics information to BR-RN
// They are so simple I don't think creating TypeScript and getting it compiled to here is worth it.

// Initiate an analytics event with the specified event tag and parameter data.
function sendBloomAnalytics(event, params) {
    window.postMessage(JSON.stringify({event, params}));
}

// Record the specified data as associated with the page. In general, it is required that the data
// must persist through a single opening of the book, even if the reader does not necessarily keep
// no-longer-visible pages in the DOM. However, currently, bloom-player as used by BR-RN does keep
// pages around, so we can conveniently store the data as a property of the page.
// When all the pages that have the same data-analytics value as the page argument have recorded
// analytics data using this function, it will invoke the callback, passing it all the data values.
// (Typically the callback will compute some aggregate data and report it using sendBloomAnalytics.)
// If overwrite is false, and data has already been recorded for this page, the function does nothing:
// it will neither record the data passed nor check for all pages having data nor call the callback.
// (This simplifies handling cases where we're only interested in the user's first answer to a question.)
function acceptBloomAnalyticsData(page, data, overwrite, callback) {
    const event = page.getAttribute("data-analytics");
    if (!event) {
        return;
    }
    if (!overwrite && page.hasOwnProperty("analyticsData")) {
        return;
    }
    page.analyticsData = data;
    const similarPages = Array.from(document.getElementsByClassName("bloom-smart-page")).filter(p => p.getAttribute("data-analytics") === event);
    var values = [];
    for (let i = 0; i < similarPages.length; i++) {
        var page = similarPages[i];
        if (!page.hasOwnProperty("analyticsData")) {
            return; // don't have complete data yet
        }
        values.push(page.analyticsData);
    }
    callback(values);
}