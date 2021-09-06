define("basic.types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("toasty", ["require", "exports", "lodash"], function (require, exports, lodash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Toasty = void 0;
    var _transitions = [
        "fade",
        "slideLeftFade",
        "slideLeftRightFade",
        "slideRightFade",
        "slideRightLeftFade",
        "slideUpFade",
        "slideUpDownFade",
        "slideDownFade",
        "slideDownUpFade",
        "pinItUp",
        "pinItDown",
    ];
    var _defaults = {
        classname: "toast",
        transition: "fade",
        insertBefore: true,
        duration: 4000,
        enableSounds: false,
        autoClose: true,
        progressBar: false,
        sounds: {
            info: "./dist/sounds/info/1.mp3",
            success: "./dist/sounds/success/1.mp3",
            warning: "./dist/sounds/warning/1.mp3",
            error: "./dist/sounds/error/1.mp3",
        },
        onShow: function (type) { },
        onHide: function (type) { },
        prependTo: document.body.childNodes[0],
    };
    var _mappings = {
        container: "{:class-name}-container",
        mainwrapp: "{:class-name}-wrapper",
        toasts: {
            info: "{:class-name}--info",
            success: "{:class-name}--success",
            warning: "{:class-name}--warning",
            error: "{:class-name}--error",
        },
        animate: {
            init: "{:transition}-init",
            show: "{:transition}-show",
            hide: "{:transition}-hide",
        },
        progressbar: "{:class-name}-progressbar",
        playerclass: "{:class-name}-soundplayer",
    };
    function init() {
        (0, lodash_1.set)(window, "Toasty", new Toasty({}));
    }
    exports.default = init;
    var _timeOffset = 100;
    function node(name) {
        return document.createElement(name || "div");
    }
    function parentElement(el) {
        var parent = el.parentElement || el.parentNode;
        return parent ? parent : null;
    }
    function classReg(className) {
        return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
    }
    function containsClass(el, className) {
        var fn;
        if (document.documentElement.classList) {
            fn = function (el, className) {
                return el.classList.contains(className);
            };
        }
        else {
            fn = function (el, className) {
                if (!el || !el.className)
                    return false;
                return el.className.match(classReg(className));
            };
        }
        return fn(el, className);
    }
    function addClass(el) {
        var classNames = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            classNames[_i - 1] = arguments[_i];
        }
        var fn;
        if (classNames.length <= 1 || typeof el != "object")
            return false;
        if (document.documentElement.classList)
            fn = function (el, classNames) {
                for (var i = 1; i < classNames.length; i++)
                    if (typeof classNames[i] == "string") {
                        el.classList.add(classNames[i]);
                    }
                return el;
            };
        else
            fn = function (el, classNames) {
                for (var i = 1; i < classNames.length; i++)
                    if (!containsClass(el, classNames[i]) &&
                        typeof classNames[i] == "string") {
                        el.className += (el.className ? " " : "") + classNames[i];
                    }
                return el;
            };
        return fn(el, classNames);
    }
    function removeClass(el) {
        var classNames = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            classNames[_i - 1] = arguments[_i];
        }
        var fn;
        if (classNames.length <= 1 || typeof el != "object")
            return false;
        if (document.documentElement.classList)
            fn = function (el, classNames) {
                for (var i = 1; i < classNames.length; i++)
                    if (typeof classNames[i] == "string") {
                        el.classList.remove(classNames[i]);
                    }
                return el;
            };
        else
            fn = function (el, classNames) {
                for (var i = 1; i < classNames.length; i++)
                    if (containsClass(el, classNames[i]) &&
                        typeof classNames[i] == "string") {
                        el.className = el.className.replace(classReg(classNames[i]), "$2");
                    }
                return el;
            };
        return fn(el, classNames);
    }
    function toggleClass(el, className) {
        var fn;
        if (document.documentElement.classList)
            fn = function (el, className) {
                return el.classList.toggle(className);
            };
        else
            fn = function (el, className) {
                var exists = containsClass(el, className);
                var caller = exists === true ? removeClass : addClass;
                caller(el, className);
                return !exists;
            };
        return fn(el, className);
    }
    function addEvent(el, evt, fn, bubble) {
        if (bubble === void 0) { bubble = false; }
        try {
            el.addEventListener(evt, fn, bubble);
        }
        catch (e) {
            if (typeof fn === "object" && fn.handleEvent) {
                el.addEventListener(evt, function (e) {
                    fn.handleEvent.call(fn, e);
                }, bubble);
            }
            else {
                throw e;
            }
        }
        return el;
    }
    function removeEvent(el, evt, fn, bubble) {
        if (bubble === void 0) { bubble = false; }
        try {
            el.removeEventListener(evt, fn, bubble);
        }
        catch (e) {
            if (typeof fn === "object" && fn.handleEvent) {
                el.removeEventListener(evt, function (e) {
                    fn.handleEvent.call(fn, e);
                }, bubble);
            }
            else {
                throw e;
            }
        }
        return el;
    }
    function whichTransitionEvent() {
        var el = node("transitionElement");
        var transitions = {
            WebkitTransition: "webkitTransitionEnd",
            MozTransition: "transitionend",
            OTransition: "oTransitionEnd otransitionend",
            transition: "transitionend",
        };
        for (var _i = 0, _a = Object.keys(transitions); _i < _a.length; _i++) {
            var t = _a[_i];
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    }
    function getAutoCloseDuration(message, duration, settings) {
        duration = duration || settings.duration;
        if (duration == 0)
            duration = message.length * (_timeOffset / 2);
        return Math.floor(duration);
    }
    function walker(obj, map) {
        var newObject = {};
        for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
            var o = _a[_i];
            if (!!obj[o]) {
                if (obj[o] instanceof Object) {
                    walker(obj[o], map);
                }
                else {
                    for (var m in map) {
                        if (map.hasOwnProperty(m) === true) {
                            obj[o] = obj[o].replace(m, map[m]);
                        }
                        break;
                    }
                }
            }
        }
        return obj;
    }
    var Toasty = (function () {
        function Toasty(options) {
            if (options === void 0) { options = {}; }
            this.classmap = {};
            this.settings = (0, lodash_1.merge)(_defaults, options);
            if (typeof _transitions === "object")
                for (var key in _transitions)
                    if (_transitions.hasOwnProperty(key) === true) {
                        this.registerTransition(this, _transitions[key]);
                    }
        }
        Toasty.prototype.playSound = function (type, container, sounds, playerclass) {
            var sound = sounds[type], audio = addClass(node("audio"), playerclass);
            addEvent(audio, "ended", function () {
                var parent = parentElement(audio);
                audio.remove();
                if (parent !== null && parent.childNodes.length < 1) {
                    var parentParent = parentElement(parent);
                    if (parentParent)
                        parentParent.remove();
                }
            });
            audio.setAttribute("autoplay", "autoplay");
            audio.innerHTML =
                '<source src="' +
                    sound +
                    '" type="audio/mpeg"/>' +
                    '<embed hidden="true" autoplay="false" loop="false" src="' +
                    sound +
                    '" />';
            var containerParent = parentElement(container);
            if (containerParent)
                containerParent.appendChild(audio);
        };
        Toasty.prototype.showToast = function (type, el, container, animate, insertBefore, callback) {
            if (insertBefore === void 0) { insertBefore = false; }
            var onShowToast = function (e) {
                removeEvent(e.target || el, e.type, onShowToast, false);
                if (callback)
                    callback(type);
            };
            var show = function () {
                var transitionEvent = whichTransitionEvent();
                if (transitionEvent !== undefined) {
                    addEvent(el, transitionEvent, onShowToast, false);
                }
                else {
                    if (callback)
                        callback(type);
                }
                addClass(el, animate.show);
            };
            var beforeNodes = container.childNodes;
            var beforeNode = beforeNodes[insertBefore === true ? 0 : beforeNodes.length];
            container.insertBefore(el, beforeNode);
            (0, lodash_1.delay)(show, _timeOffset);
        };
        Toasty.prototype.hideToast = function (type, el, duration, animate, callback) {
            var onHideToast = function (e) {
                removeEvent(e.target || el, e.type, onHideToast, false);
                remove();
                if (callback)
                    callback(type);
            };
            var remove = function () {
                var container = parentElement(el);
                if (container) {
                    el.remove();
                    var num = container.childNodes.length;
                    if (num < 1) {
                        var containerParent = parentElement(container);
                        if (containerParent)
                            containerParent.remove();
                    }
                }
            };
            var hide = function () {
                var transitionEvent = whichTransitionEvent();
                if (transitionEvent !== undefined) {
                    addEvent(el, transitionEvent, onHideToast, false);
                }
                else {
                    remove();
                    if (callback)
                        callback(type);
                }
                addClass(el, animate.hide);
            };
            (0, lodash_1.delay)(hide, _timeOffset * 10 + duration);
        };
        Toasty.prototype.hideToastOnClick = function (type, el, animate, callback, class2close) {
            var _this = this;
            var hideOnClick = function (e) {
                e.stopPropagation();
                removeClass(el, class2close);
                _this.hideToast(type, el, 0, animate, callback);
            };
            addClass(el, class2close);
            addEvent(el, "click", hideOnClick);
        };
        Toasty.prototype.showProgressBar = function (type, el, duration, transition) {
            var progressbar = function () {
                var progressBar = addClass(node("div"), transition.progressbar, transition.progressbar + "--" + type);
                el.appendChild(progressBar);
                var iterat = 0, offset = 0;
                var interval = setInterval(function () {
                    iterat++;
                    offset = Math.round((1000 * iterat) / duration);
                    if (offset > 100) {
                        clearInterval(interval);
                    }
                    else {
                        progressBar.style.width = offset + "%";
                    }
                }, 10);
            };
            (0, lodash_1.delay)(progressbar, _timeOffset * 10);
        };
        Toasty.prototype.registerTransition = function (self, name) {
            if (typeof name === "string") {
                self.classmap[name] = (0, lodash_1.merge)(_mappings, {});
                self.classmap[name] = walker(self.classmap[name], {
                    "{:class-name}": self.settings.classname,
                    "{:transition}": name,
                });
            }
            return name;
        };
        Toasty.prototype.configure = function (options) {
            this.settings = (0, lodash_1.merge)(_defaults, this.settings, options);
            return this;
        };
        Toasty.prototype.transition = function (name) {
            this.settings.transition = this.registerTransition(this, name);
            return this;
        };
        Toasty.prototype.toast = function (type, message, duration) {
            var classes = this.classmap;
            var options = this.settings;
            if (classes.hasOwnProperty(options.transition) === false)
                this.registerTransition(this, options.transition);
            var transition = classes[options.transition];
            var toastContainer = typeof options.transition === "string"
                ? document.querySelector("." + transition.container + "--" + options.transition)
                : document.querySelector("." + transition.container);
            var container;
            if (!!toastContainer) {
                container = toastContainer.querySelector("." + transition.mainwrapp);
            }
            else {
                var outerContainer = addClass(node("div"), transition.container, transition.container + "--" + options.transition);
                container = addClass(node("div"), transition.mainwrapp);
                outerContainer.appendChild(container);
            }
            var newToast = addClass(node("div"), options.classname, transition.toasts[type], transition.animate.init);
            newToast.innerHTML = message;
            if (!toastContainer)
                document.body.insertBefore(parentElement(container), options.prependTo);
            if (options.enableSounds == true)
                this.playSound(type, container, options.sounds, transition.playerclass);
            this.showToast(type, newToast, container, transition.animate, options.insertBefore, options.onShow);
            if (options.autoClose == true)
                this.hideToast(type, newToast, duration, transition.animate, options.onHide);
            else
                this.hideToastOnClick(type, newToast, transition.animate, options.onHide, "close-on-click");
            if (options.progressBar == true && options.autoClose == true)
                this.showProgressBar(type, newToast, duration, transition);
            return this;
        };
        Toasty.prototype.info = function (message, duration) {
            duration = getAutoCloseDuration(message, duration, this.settings);
            this.toast("info", message, duration);
        };
        Toasty.prototype.success = function (message, duration) {
            duration = getAutoCloseDuration(message, duration, this.settings);
            this.toast("success", message, duration);
        };
        Toasty.prototype.warning = function (message, duration) {
            duration = getAutoCloseDuration(message, duration, this.settings);
            this.toast("warning", message, duration);
        };
        Toasty.prototype.error = function (message, duration) {
            duration = getAutoCloseDuration(message, duration, this.settings);
            this.toast("error", message, duration);
        };
        return Toasty;
    }());
    exports.Toasty = Toasty;
});
//# sourceMappingURL=toasty.js.map