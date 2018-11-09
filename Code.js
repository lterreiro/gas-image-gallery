var scriptProperties = PropertiesService.getScriptProperties();
scriptProperties.setProperties({
    'FULL_PICS_FOLDER': 'pics',
    'CAROUSEL_FOLDER': 'carousel',
    'PICS_URL': 'https://drive.google.com/uc',
    'THUMBNAIL_URL': 'https://drive.google.com/thumbnail',
    'THUMBNAIL_SIZE_PX': '200',
    'HTML_INDEX': 'Index',
    'HTML_CSS': 'Css',
    'HTML_JS': 'Js',
    'DATE_FORMAT': "dd-MM-yyyy HH:mm:ss",
    'TIMEZONE': "Europe/London"
});

var picsData;
var fullPicsData;
var thumbsData;

/**
 *
 */
function doGet() {
    return HtmlService.createTemplateFromFile(scriptProperties.getProperty('HTML_INDEX')).evaluate();
}


/**
 * Creates an import or include function so files can be added
 * inside the main index.
 * @param {string} filename : name of the file to obtian content from.
 */
function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename)
        .getContent();
};

/**
 * Opens de index template and logs its content.
 *
 */
function debugTemplate() {
    Logger.log(HtmlService.createTemplateFromFile(scriptProperties.getProperty('HTML_INDEX')).evaluate().getContent());
}

/**
 * Returns the first object in an array of objects with the key value pair.
 *
 * @param {Object[]} arrObj
 * @param {string} pQuery
 * @param {string} val
 * @returns {Object}
 */
function findObjIn(arrObj, pQuery, val) {
    for (var i = 0; i < arrObj.length; i++) {
        var obj = arrObj[i];
        for (var prop in obj) {
            if (obj.hasOwnProperty(pQuery) && prop == pQuery && obj[prop] == val) {
                return obj;
            }
        }
    }
}

/**
 * Returns a value from the first matching object in the array.
 *
 * @param {Object[]} arrObj
 * @param {string} pQuery
 * @param {string} val
 * @param {string} pReturn
 * @returns {*}
 */
function findObjValIn(arrObj, pQuery, val, pReturn) {
    Logger.log('arrObj len: "' + arrObj.length + '" pQuery: "' + pQuery + '" val: "' + val + '" pReturn: "' + pReturn + '"')
    for (var i = 0; i < arrObj.length; i++) {
        var obj = arrObj[i];
        for (var prop in obj) {
            if (obj.hasOwnProperty(pQuery) && prop == pQuery && obj[prop] == val) {
                Logger.log('valor encontrado: ' + obj[pReturn]);
                return obj[pReturn];
            }
        }
    }
}

/**
 * Returns a string of array values.
 * Elements are separated by a delimiter and a space.
 *
 * @param {Array} arr
 * @param {string} delim
 * @returns {string}
 */
function delimStrFromArr(arr, delim) {
    var _arr = rmDuplicatesFrom(arr).sort();
    var result = "";
    for (var i = 0; i < _arr.length; i++) {
        result += _arr[i] + delim + " ";
    }
    result = result.slice(0, -2);
    return result;
}

/**
 * Returns an array with no duplicate values.
 *
 * @param {Array} arr
 * @returns {Array}
 */
function rmDuplicatesFrom(arr) {
    var check = {};
    var result = [];
    var j = 0;
    for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        if (check[item] !== 1) {
            check[item] = 1;
            result[j++] = item;
        }
    }
    return result;
}

/**
 *
 */
function getThumbsData() {
    if (thumbsData === undefined) {
        thumbsData = [];
        var folders = DriveApp.getFoldersByName(scriptProperties.getProperty('CAROUSEL_FOLDER'));
        while (folders.hasNext()) {
            var folder = folders.next();
            var files = folder.getFiles();
            while (files.hasNext()) {
                var file = files.next();
                var fileUrl = scriptProperties.getProperty('THUMBNAIL_URL') + '?authuser=0&id=' + file.getId() + '&sz=h' + scriptProperties.getProperty('THUMBNAIL_SIZE_PX');
                var obj = { id: file.getId(), name: file.getName(), url: fileUrl, alt: file.getDescription() };
                thumbsData.push(obj);
            }
        }
    }
    //Logger.log(thumbsData);
    return thumbsData;
}

/**
 *
 */
function getPicsData() {
    if (picsData === undefined) {
        picsData = [];
        var folders = DriveApp.getFoldersByName(scriptProperties.getProperty('CAROUSEL_FOLDER'));
        while (folders.hasNext()) {
            var folder = folders.next();
            var files = folder.getFiles();
            while (files.hasNext()) {
                var file = files.next();
                var fileUrl = scriptProperties.getProperty('PICS_URL') + '?export=view&id=' + file.getId();
                var obj = { id: file.getId(), name: file.getName(), url: fileUrl, fullUrl: getFullPicUrlByName(file.getName()), alt: file.getDescription() };
                picsData.push(obj);
            }
        }
        picsData.sort(compareByName);
    }
    //Logger.log(picsData);
    return picsData;
}

/**
 *
 */
function getFullPicsData() {
    if (fullPicsData === undefined) {
        fullPicsData = [];
        var folders = DriveApp.getFoldersByName(scriptProperties.getProperty('FULL_PICS_FOLDER'));
        while (folders.hasNext()) {
            var folder = folders.next();
            var files = folder.getFiles();
            while (files.hasNext()) {
                var file = files.next();
                var fileUrl = scriptProperties.getProperty('PICS_URL') + '?export=view&id=' + file.getId();
                var obj = { id: file.getId(), name: file.getName(), url: fileUrl, alt: file.getDescription() };
                fullPicsData.push(obj);
            }
        }
        fullPicsData.sort(compareByName);
    }
    //Logger.log(fullPicsData);
    return fullPicsData;
}

function compareByAlt(a, b) {
    if (a.alt < b.alt) return -1;
    if (a.alt > b.alt) return 1;
    return 0;
}

function compareByName(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
}

/**
 *
 */
function getPicById(picId) {
    return findObjIn(getPicsData(), 'id', picId);
}

/**
 *
 */
function getPicByName(picName) {
    return findObjIn(getPicsData(), 'name', picName);
}

/**
 *
 */
function getFullPicUrlByName(picName) {
    return findObjValIn(getFullPicsData(), 'name', picName, 'url');
}

/**
 *
 */
function getFullPicUrlByNameTest() {
    Logger.log(findObjValIn(getFullPicsData(), 'name', '0d1cf68d-2d74-4d67-9a34-7bc65360b273.jpg', 'url'));
}