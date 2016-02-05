(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var common = require("../helpers/Common.js");
var Storage = require("../helpers/Storage.js");
var Const = require("../helpers/Const.js");

var stored_data = {};
var local_stored_data = {};

$(function () {
    var app_detail = common.getAppDetail();
    var version = app_detail.version;
    setVersionType(version);

    $("#chatpp_version").html(common.getAppFullName());

    var pages = ["setting", "emoticon", "room", "group", "shortcut", "change_logs", "features", "notification"];
    pages.forEach(function (page_name) {
        var url = "html/" + page_name + ".html";
        $("#" + page_name + "_page").click(function () {
            common.openNewUrl(url);
        });
    });

    $(".ext-url").click(function () {
        common.openNewUrl($(this).attr("href"));
    });

    $("#btn-emo-status").click(function () {
        switchEmoticonStatus();
    });

    $("#btn-mention-status").click(function () {
        switchMentionStatus();
    });

    $("#btn-shortcut-status").click(function () {
        switchShortcutStatus();
    });

    chrome.storage.onChanged.addListener(function (changes, namespace) {
        var data = changes[Const.CHROME_SYNC_KEY];
        if (!$.isEmptyObject(data) && !$.isEmptyObject(data.newValue)) {
            data = data.newValue;
            updateViewData(data);
        }
    });

    loadChatppEmoData();
});

function loadStatus(name, value) {
    if (value !== undefined && value === false) {
        $("#" + name + "-status").removeClass().addClass("text-danger").html("DISABLED");
    } else {
        $("#" + name + "-status").removeClass().addClass("text-primary").html("ENABLED");
    }
}

function loadChatppEmoData() {
    var storage = new Storage();
    storage.get(Const.CHROME_SYNC_KEY, function (data) {
        stored_data = data;
        data = data[Const.CHROME_SYNC_KEY];
        if ($.isEmptyObject(data)) {
            common.openNewExtensionPageUrl(common.app_detail.options_page);
        } else {
            updateViewData(data);
        }
    });
}

function updateViewData(data) {
    var features = ["emoticon", "mention", "shortcut", "thumbnail", "highlight"];
    for (var i in features) {
        loadStatus(features[i], data[features[i] + "_status"]);
    }
}

function setVersionType(version) {
    chrome.storage.local.get(Const.CHROME_LOCAL_KEY, function (data) {
        if ($.isEmptyObject(data)) {
            local_stored_data = {};
        } else {
            local_stored_data = data;
        }
        if (local_stored_data[Const.CHROME_LOCAL_KEY] === undefined) {
            local_stored_data[Const.CHROME_LOCAL_KEY] = {};
        }
        local_stored_data[Const.CHROME_LOCAL_KEY]["version"] = version;
        chrome.browserAction.getBadgeText({}, function (result) {
            if (result === "new") {
                chrome.browserAction.setBadgeText({ text: "" });
                //chrome.tabs.create({url: "change_logs.html"});
            }
        });
        chrome.storage.local.set(local_stored_data);
    });
}

},{"../helpers/Common.js":2,"../helpers/Const.js":3,"../helpers/Storage.js":4}],2:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Const = require("./Const.js");

var Common = function () {
    function Common() {
        _classCallCheck(this, Common);

        this.version = Const.VERSION_CHROME;
        this.app_detail = this.getAppDetail();
    }

    _createClass(Common, [{
        key: "isChromeVersion",
        value: function isChromeVersion() {
            return this.version === Const.VERSION_CHROME;
        }
    }, {
        key: "isFirefoxVersion",
        value: function isFirefoxVersion() {
            return this.version === Const.VERSION_FIREFOX;
        }
    }, {
        key: "isDevVersion",
        value: function isDevVersion() {
            var app_name = this.app_detail.name;
            return app_name.indexOf(Const.VERSION_NAME_DEV, app_name.length - Const.VERSION_NAME_DEV.length) !== -1;
        }
    }, {
        key: "getStorage",
        value: function getStorage() {
            if (this.isChromeVersion()) {
                return chrome.storage.sync;
            }

            return chrome.storage.local;
        }
    }, {
        key: "sync",
        value: function sync(key, data, callback) {
            var sync = {};
            sync[key] = data;
            var storage = this.getStorage();
            storage.set(sync, function () {
                if (callback) {
                    callback();
                }
            });
        }
    }, {
        key: "getObjectLength",
        value: function getObjectLength(object) {
            return Object.keys(object).length;
        }
    }, {
        key: "htmlEncode",
        value: function htmlEncode(value) {
            return $("<div/>").text(value).html();
        }
    }, {
        key: "getEmoUrl",
        value: function getEmoUrl(img) {
            if (img.indexOf("https://") == 0 || img.indexOf("http://") == 0) {
                return img;
            }
            return Const.DEFAULT_IMG_HOST + "img/emoticons/" + img;
        }
    }, {
        key: "parseRoomId",
        value: function parseRoomId(text) {
            var room = text.match(/\d+/g);
            if (!room || room.length == 0) {
                return null;
            }
            room = room[0];
            var regex = /^[0-9]{6,10}$/g;
            if (regex.test(room)) {
                return room;
            }
            return null;
        }
    }, {
        key: "reload",
        value: function reload() {
            location.reload();
        }
    }, {
        key: "getAppDetail",
        value: function getAppDetail() {
            return chrome.app.getDetails();
        }
    }, {
        key: "getAppFullName",
        value: function getAppFullName() {
            var version_name = Const.VERSION_NAME_RELEASE;
            if (this.isDevVersion()) {
                version_name = Const.VERSION_NAME_DEV;
            }

            return this.app_detail.short_name + " " + this.app_detail.version + " " + version_name;
        }
    }, {
        key: "openNewUrl",
        value: function openNewUrl(url) {
            chrome.tabs.create({ url: url });
        }
    }, {
        key: "getExtensionPageUrl",
        value: function getExtensionPageUrl(page_name) {
            return chrome.extension.getURL(page_name);
        }
    }, {
        key: "openNewExtensionPageUrl",
        value: function openNewExtensionPageUrl(page_name) {
            this.openNewUrl(this.getExtensionPageUrl(page_name));
        }
    }, {
        key: "validateUrl",
        value: function validateUrl(url) {
            var regexp = /(https):\/\/(\w+:?\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
            return regexp.test(url);
        }
    }, {
        key: "isPage",
        value: function isPage(page_name) {
            return $("#page-name").data("page-name") === page_name;
        }
    }, {
        key: "setPageTitle",
        value: function setPageTitle() {
            $("#chatpp_name").html(this.getAppFullName());
        }
    }]);

    return Common;
}();

var common = new Common();
module.exports = common;

},{"./Const.js":3}],3:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Const = function Const() {
    _classCallCheck(this, Const);
};

Const.LOCAL_STORAGE_DATA_KEY = "YACEP_EMO_DATA";
Const.LOCAL_STORAGE_INFO_KEY = "YACEP_EMO_INFO";
Const.LOCAL_STORAGE_GROUP_MENTION = "CHATPP_GROUP_MENTION";
Const.LOCAL_STORAGE_ROOM_SHORTCUT = "CHATPP_ROOM_SHORTCUT";
Const.LOCAL_STORAGE_DISABLE_NOTIFY_ROOM = "CHATPP_DISABLE_NOTIFY_ROOM";
Const.CHROME_LOCAL_KEY = "CHATPP_CHROME_LOCAL_DATA";
Const.CHROME_SYNC_KEY = "CHATPP_CHROME_SYNC_DATA";
Const.CHROME_SYNC_GROUP_KEY = "CHATPP_CHROME_SYNC_GROUP";
Const.CHROME_SYNC_ROOM_KEY = "CHATPP_CHROME_SYNC_ROOM";
Const.CHROME_SYNC_DISABLE_NOTIFY_ROOM_KEY = "CHATPP_CHROME_SYNC_DISABLE_NOTIFY_ROOM";
Const.DEFAULT_DATA_URL = "https://dl.dropboxusercontent.com/sh/rnyip87zzjyxaev/AACBVYHPxG88r-1BhYuBNkmHa/new.json?dl=1";
Const.ADVERTISEMENT_URL = "https://www.dropbox.com/s/flbiyfqhcqapdbe/chatppad.json?dl=1";
Const.VERSION_CHROME = "VERSION_CHROME";
Const.VERSION_FIREFOX = "VERSION_FIREFOX";
Const.VERSION_NAME_DEV = "dev";
Const.VERSION_NAME_RELEASE = "final";
Const.DEFAULT_IMG_HOST = "https://chatpp.thangtd.com/";

module.exports = Const;

},{}],4:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var common = require("./Common.js");

var Storage = function () {
    function Storage() {
        _classCallCheck(this, Storage);

        this.common = common;
        this.storage = this.common.getStorage();
    }

    _createClass(Storage, [{
        key: "get",
        value: function get(key, callback) {
            this.storage.get(key, function (info) {
                callback(info);
            });
        }
    }, {
        key: "set",
        value: function set(key, data, callback) {
            var sync = {};
            sync[key] = data;
            this.storage.set(sync, function () {
                if (callback) {
                    callback();
                }
            });
        }
    }, {
        key: "setData",
        value: function setData(data, callback) {
            this.storage.set(data, function () {
                if (callback) {
                    callback();
                }
            });
        }
    }]);

    return Storage;
}();

module.exports = Storage;

},{"./Common.js":2}]},{},[1]);
