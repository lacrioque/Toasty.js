import { merge, delay, get, set } from "lodash";

import {
  TransitionClassListMappings,
  ToastySettings,
  ToastyOptions,
  TransitionAnimateRecord,
} from "./basic.types";

/**
 * All available default CSS transitions for plug-in:
 *
 * @var array
 */
const _transitions = [
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

/**
 * Default configuration for plug-in:
 *
 * @var object
 */
const _defaults: ToastySettings = {
  // STRING: main class name used to styling each toast message with CSS:
  // .... IMPORTANT NOTE:
  // .... if you change this, the configuration consider that you´re
  // .... re-stylized the plug-in and default toast styles, including CSS3 transitions are lost.
  classname: "toast",
  // STRING: name of the CSS transition that will be used to show and hide all toast by default:
  transition: "fade",
  // BOOLEAN: specifies the way in which the toasts will be inserted in the HTML code:
  // .... Set to BOOLEAN TRUE and the toast messages will be inserted before those already generated toasts.
  // .... Set to BOOLEAN FALSE otherwise.
  insertBefore: true,
  // INTEGER: duration that the toast will be displayed in milliseconds:
  // .... Default value is set to 4000 (4 seconds).
  // .... If it set to 0, the duration for each toast is calculated by text-message length.
  duration: 4000,
  // BOOLEAN: enable or disable toast sounds:
  // .... Set to BOOLEAN TRUE  - to enable toast sounds.
  // .... Set to BOOLEAN FALSE - otherwise.
  // NOTE: this is not supported by mobile devices.
  enableSounds: false,
  // BOOLEAN: enable or disable auto hiding on toast messages:
  // .... Set to BOOLEAN TRUE  - to enable auto hiding.
  // .... Set to BOOLEAN FALSE - disable auto hiding. Instead the user must click on toast message to close it.
  autoClose: true,
  // BOOLEAN: enable or disable the progressbar:
  // .... Set to BOOLEAN TRUE  - enable the progressbar only if the autoClose option value is set to BOOLEAN TRUE.
  // .... Set to BOOLEAN FALSE - disable the progressbar.
  progressBar: false,
  // IMPORTANT: mobile browsers does not support this feature!
  // Yep, support custom sounds for each toast message when are shown if the
  // enableSounds option value is set to BOOLEAN TRUE:
  // NOTE: the paths must point from the project's root folder.
  sounds: {
    // path to sound for informational message:
    info: "./dist/sounds/info/1.mp3",
    // path to sound for successfull message:
    success: "./dist/sounds/success/1.mp3",
    // path to sound for warn message:
    warning: "./dist/sounds/warning/1.mp3",
    // path to sound for error message:
    error: "./dist/sounds/error/1.mp3",
  },

  // callback:
  // onShow function will be fired when a toast message appears.
  onShow: (type: string) => {},

  // callback:
  // onHide function will be fired when a toast message disappears.
  onHide: (type: string) => {},

  // the placement where prepend the toast container:
  prependTo: document.body.childNodes[0],
};

/**
 * Map to create each necessary CSS classess:
 *
 * @var object
 */
const _mappings = {
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

export default function init() {
  set(window, "Toasty", new Toasty({}));
}

/**
 * A time offset to define the plug-in behavior:
 *
 * @var object
 */
const _timeOffset: number = 100;

/**
 * Simple creation of an Element Node with the specified 'name'.
 *
 * @return HTML Element
 */
function node(name: string) {
  return document.createElement(name || "div");
}

/**
 * Returns the parent Element or Node from any other HTML Element.
 *
 * @return HTML Element
 */
function parentElement(el: HTMLElement): HTMLElement | null {
  const parent = el.parentElement || el.parentNode;
  return parent ? (parent as HTMLElement) : null;
}

/**
 * Regexp to find a className on a string.
 *
 * @return RegExp Obj
 */
function classReg(className: string): RegExp {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

/**
 * Returns a Boolean value, indicating whether an element has
 * the specified class name.
 *
 * Usage:
 *
 * var exists = containsClass(element, 'className');
 *
 * @return bool
 */
function containsClass(el: HTMLElement, className: string) {
  let fn;
  if (document.documentElement.classList) {
    fn = function (el: HTMLElement, className: string) {
      return el.classList.contains(className);
    };
  } else {
    fn = function (el: HTMLElement, className: string) {
      if (!el || !el.className) return false;
      return el.className.match(classReg(className));
    };
  }
  return fn(el, className);
}

/**
 * Adds one or more class names to an element.
 * If the specified class already exist, the class will not be added.
 *
 * Usage:
 *
 * addClass(el, 'class1', 'class2', 'class3', ...);
 *
 * @return HTML Element|bool false
 */
function addClass(
  el: HTMLElement,
  ...classNames: string[]
): HTMLElement | false {
  let fn;
  if (classNames.length <= 1 || typeof el != "object") return false;

  if (document.documentElement.classList)
    fn = function (el: HTMLElement, classNames: string[]) {
      for (let i = 1; i < classNames.length; i++)
        if (typeof classNames[i] == "string") {
          el.classList.add(classNames[i]);
        }
      return el;
    };
  else
    fn = function (el: HTMLElement, classNames: string[]) {
      for (let i = 1; i < classNames.length; i++)
        if (
          !containsClass(el, classNames[i]) &&
          typeof classNames[i] == "string"
        ) {
          el.className += (el.className ? " " : "") + classNames[i];
        }
      return el;
    };

  return fn(el, classNames);
}

/**
 * Removes one or more class names from an element.
 * Note: Removing a class that does not exist, does NOT throw an error.
 *
 * Usage:
 *
 * removeClass(el, 'class1', 'class2', 'class3', ...);
 *
 * @return HTML Element|bool false
 */
function removeClass(
  el: HTMLElement,
  ...classNames: string[]
): HTMLElement | false {
  let fn;
  if (classNames.length <= 1 || typeof el != "object") return false;

  if (document.documentElement.classList)
    fn = function (el: HTMLElement, classNames: string[]) {
      for (let i = 1; i < classNames.length; i++)
        if (typeof classNames[i] == "string") {
          el.classList.remove(classNames[i]);
        }
      return el;
    };
  else
    fn = function (el: HTMLElement, classNames: string[]) {
      for (let i = 1; i < classNames.length; i++)
        if (
          containsClass(el, classNames[i]) &&
          typeof classNames[i] == "string"
        ) {
          el.className = el.className.replace(classReg(classNames[i]), "$2");
        }
      return el;
    };

  return fn(el, classNames);
}

/**
 * Toggles between a class name for an element.
 *
 * Usage:
 *
 * var result = toggleClass(el, 'className');
 *
 * @return bool
 */
function toggleClass(el: HTMLElement, className: string) {
  let fn;
  if (document.documentElement.classList)
    fn = function (el: HTMLElement, className: string) {
      return el.classList.toggle(className);
    };
  else
    fn = function (el: HTMLElement, className: string) {
      const exists = containsClass(el, className);
      const caller = exists === true ? removeClass : addClass;
      caller(el, className);
      return !exists;
    };
  return fn(el, className);
}

/**
 * Add Event
 *
 * Attaches an event handler to the document.
 *
 * http://www.thecssninja.com/javascript/handleevent
 *
 * @param  {element}  element
 * @param  {event}    event
 * @param  {Function} fn
 * @param  {boolean}  bubbling
 * @return el
 */
function addEvent(el: HTMLElement, evt: string, fn: any, bubble = false) {
  try {
    el.addEventListener(evt, fn, bubble);
  } catch (e) {
    if (typeof fn === "object" && fn.handleEvent) {
      el.addEventListener(
        evt,
        function (e) {
          // bind fn as this and set first arg as event object:
          fn.handleEvent.call(fn, e);
        },
        bubble
      );
    } else {
      throw e;
    }
  }

  return el;
}

/**
 * Remove Event
 *
 * Removes an event handler that has been attached with the 'addEvent' method.
 *
 * http://www.thecssninja.com/javascript/handleevent
 *
 * @param  {element}  element
 * @param  {event}    event
 * @param  {Function} fn
 * @param  {boolean}  bubbling
 * @return el
 */
function removeEvent(el: HTMLElement, evt: string, fn: any, bubble = false) {
  try {
    el.removeEventListener(evt, fn, bubble);
  } catch (e) {
    if (typeof fn === "object" && fn.handleEvent) {
      el.removeEventListener(
        evt,
        function (e) {
          fn.handleEvent.call(fn, e);
        },
        bubble
      );
    } else {
      throw e;
    }
  }

  return el;
}

/**
 * Detect the property name of supported transition event.
 *
 * Function from David Walsh:
 * http://davidwalsh.name/css-animation-callback
 *
 * @return string|undefined (if transitions not supported by client)
 */
function whichTransitionEvent() {
  const el = node("transitionElement");

  const transitions: Record<string, string> = {
    WebkitTransition: "webkitTransitionEnd",
    MozTransition: "transitionend",
    OTransition: "oTransitionEnd otransitionend",
    transition: "transitionend",
  };

  for (let t of Object.keys(transitions))
    if ((el.style as unknown as Record<string, unknown>)[t] !== undefined) {
      return transitions[t];
    }
}

/**
 * Calculates the auto close duration to be set in
 * each toast message:
 *
 * @return number
 */
function getAutoCloseDuration(
  message: string,
  duration: number,
  settings: ToastyOptions
) {
  duration = duration || (settings.duration as number);
  if (duration == 0) duration = message.length * (_timeOffset / 2);
  return Math.floor(duration);
}

/**
 * Replace each object values with a map of key => values:
 *
 * @return object
 */
function walker(
  obj:
    | Record<string, string | Record<string, string>>
    | TransitionClassListMappings,
  map: Record<string, string>
): Record<string, string | Record<string, string>> {
  const newObject = {};
  for (let o of Object.keys(obj)) {
    if (!!(obj as { [key: string]: any })[o as string]) {
      // ini loop:
      if ((obj as { [key: string]: any })[o as string] instanceof Object) {
        walker(
          (obj as { [key: string]: any })[o as string] as Record<
            string,
            string
          >,
          map
        );
      } else {
        for (let m in map) {
          if (map.hasOwnProperty(m) === true) {
            (obj as { [key: string]: any })[o as string] = (
              (obj as { [key: string]: any })[o as string] as string
            ).replace(m, map[m]);
          }
          break;
        }
      }
      // end loop.
    }
  }

  return obj as Record<string, string | Record<string, string>>;
}

export class Toasty {
  private settings: ToastySettings;
  private classmap: Record<string, TransitionClassListMappings>;

  /*!
   * The exposed public object:
   */

  constructor(options: ToastyOptions = {}) {
    this.classmap = {};
    this.settings = merge(_defaults, options) as ToastySettings;
    // add classmap for default transitions:
    if (typeof _transitions === "object")
      for (var key in _transitions)
        if (_transitions.hasOwnProperty(key) === true) {
          this.registerTransition(this, _transitions[key]);
        }
  }

  /**
   * Generate an HTML audio instance for each type of
   * toast message:
   *
   * @return void
   */
  private playSound(
    type: string,
    container: HTMLElement,
    sounds: Record<string, string>,
    playerclass: string
  ) {
    const sound = sounds[type],
      audio = addClass(node("audio"), playerclass) as HTMLElement;
    addEvent(audio, "ended", () => {
      const parent = parentElement(audio);
      audio.remove();
      // also, remove the main container if it empty:
      if (parent !== null && parent.childNodes.length < 1) {
        const parentParent = parentElement(parent);
        if (parentParent) parentParent.remove();
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
    const containerParent = parentElement(container);
    if (containerParent) containerParent.appendChild(audio);
  }

  /**
   * Show the toast message with an CSS3 transition
   * if transition event is supported:
   *
   * @return void
   */
  private showToast(
    type: string,
    el: HTMLElement,
    container: HTMLElement,
    animate: TransitionAnimateRecord,
    insertBefore: boolean = false,
    callback?: (type: string) => void
  ) {
    const onShowToast = function (e: Event) {
      removeEvent((e.target as HTMLElement) || el, e.type, onShowToast, false);
      if (callback) callback(type);
    };

    const show = function () {
      const transitionEvent = whichTransitionEvent();
      if (transitionEvent !== undefined) {
        // initialize the CSS transition event:
        addEvent(el, transitionEvent, onShowToast, false);
      } else {
        // navigator does not support transition events:
        if (callback) callback(type);
      }
      addClass(el, animate.show);
    };

    // insert in the DOM and show toast:
    const beforeNodes = container.childNodes;
    const beforeNode =
      beforeNodes[insertBefore === true ? 0 : beforeNodes.length];
    container.insertBefore(el, beforeNode);
    delay(show, _timeOffset);
  }

  /**
   * Hide the toast message with an CSS3 transition
   * if transition event is supported:
   *
   * @return void
   */
  private hideToast(
    type: string,
    el: HTMLElement,
    duration: number,
    animate: TransitionAnimateRecord,
    callback: (type: string) => void
  ) {
    const onHideToast = function (e: Event) {
      removeEvent((e.target as HTMLElement) || el, e.type, onHideToast, false);
      remove();
      if (callback) callback(type);
    };

    const remove = function () {
      const container = parentElement(el); // the wrapper.
      if (container) {
        el.remove();
        const num = container.childNodes.length;
        if (num < 1) {
          const containerParent = parentElement(container);
          if (containerParent) containerParent.remove();
        }
      }
    };

    const hide = function () {
      const transitionEvent = whichTransitionEvent();
      if (transitionEvent !== undefined) {
        // initialize the CSS transition event:
        addEvent(el, transitionEvent, onHideToast, false);
      } else {
        // navigator does not support transition events:
        remove();
        if (callback) callback(type);
      }
      addClass(el, animate.hide);
    };

    delay(hide, _timeOffset * 10 + duration);
  }

  /**
   * Hide the toast message with an CSS3 transition when
   * the user clicks on the message:
   *
   * @return void
   */
  private hideToastOnClick(
    type: string,
    el: HTMLElement,
    animate: TransitionAnimateRecord,
    callback: (type: string) => void,
    class2close: string
  ) {
    const hideOnClick = (e: Event) => {
      e.stopPropagation();
      removeClass(el, class2close);
      this.hideToast(type, el, 0, animate, callback);
    };
    addClass(el, class2close);
    addEvent(el, "click", hideOnClick);
  }

  /**
   * The progressbar:
   *
   * @return void
   */
  private showProgressBar(
    type: string,
    el: HTMLElement,
    duration: number,
    transition: TransitionClassListMappings
  ) {
    const progressbar = function () {
      const progressBar = addClass(
        node("div"),
        transition.progressbar,
        transition.progressbar + "--" + type
      ) as HTMLElement;
      el.appendChild(progressBar);

      let iterat = 0,
        offset = 0;
      const interval = setInterval(function () {
        iterat++;
        offset = Math.round((1000 * iterat) / duration);

        if (offset > 100) {
          clearInterval(interval);
        } else {
          progressBar.style.width = offset + "%";
        }
      }, 10);
    };

    delay(progressbar, _timeOffset * 10);
  }

  /**
   * Register a new transition only:
   *
   * @return string
   */
  private registerTransition(self: Toasty, name: string) {
    if (typeof name === "string") {
      self.classmap[name] = merge(_mappings, {});
      self.classmap[name] = walker(self.classmap[name], {
        "{:class-name}": self.settings.classname,
        "{:transition}": name,
      }) as unknown as TransitionClassListMappings;
    }
    return name;
  }

  public configure(options: ToastyOptions) {
    this.settings = merge(_defaults, this.settings, options);
    return this;
  }

  public transition(name: string) {
    this.settings.transition = this.registerTransition(this, name);
    return this;
  }

  public toast(type: string, message: string, duration: number) {
    const classes = this.classmap;
    const options = this.settings;

    // check if the transition name provided in options
    // exists in classes, if not register it:
    if (classes.hasOwnProperty(options.transition) === false)
      this.registerTransition(this, options.transition);
    // use the transition name provided in options:
    const transition = classes[options.transition];

    // check if the toast container exists:
    const toastContainer =
      typeof options.transition === "string"
        ? document.querySelector(
            "." + transition.container + "--" + options.transition
          )
        : document.querySelector("." + transition.container);

    let container: HTMLElement;
    if (!!toastContainer) {
      // create the toast container if not exists:
      container = toastContainer.querySelector(
        "." + transition.mainwrapp
      ) as HTMLElement; // use the wrapper instead of main container.
    } else {
      const outerContainer = addClass(
        node("div"),
        transition.container,
        transition.container + "--" + options.transition
      ) as HTMLElement;
      // create a alert wrapper instance:
      container = addClass(node("div"), transition.mainwrapp) as HTMLElement;
      // append the alert wrapper and now, this is the main container:
      outerContainer.appendChild(container);
    }

    // create a new toast instance
    const newToast = addClass(
      node("div"),
      options.classname,
      (transition.toasts as unknown as { [key: string]: string })[type],
      transition.animate.init
    ) as HTMLElement;
    newToast.innerHTML = message;

    // insert the toast container into the HTML:
    if (!toastContainer)
      document.body.insertBefore(
        parentElement(container) as HTMLElement,
        options.prependTo
      );

    // OPTIONAL STEP (must be first):
    // INI: enable or disable toast sounds.
    // --------------------------------------------------------------------
    if (options.enableSounds == true)
      this.playSound(type, container, options.sounds, transition.playerclass);
    // --------------------------------------------------------------------
    // END: enable or disable toast sounds.

    // STEP 1:
    // INI: showing the toas message
    // --------------------------------------------------------------------
    this.showToast(
      type,
      newToast,
      container,
      transition.animate,
      options.insertBefore,
      options.onShow
    );
    // --------------------------------------------------------------------
    // END: showing the toas message

    // STEP 2:
    // INI: prepare the toast to hide it.
    // --------------------------------------------------------------------
    if (options.autoClose == true)
      // hide the toast message automatically:
      this.hideToast(
        type,
        newToast,
        duration,
        transition.animate,
        options.onHide
      );
    // hide the toast message on click it with an CSS3 transition:
    else
      this.hideToastOnClick(
        type,
        newToast,
        transition.animate,
        options.onHide,
        "close-on-click"
      );
    // --------------------------------------------------------------------
    // END: prepare the toast to hide it.

    // OPTIONAL STEP (must be last):
    // INI: Enable or disable the progressbar.
    // --------------------------------------------------------------------
    if (options.progressBar == true && options.autoClose == true)
      this.showProgressBar(type, newToast, duration, transition);
    // --------------------------------------------------------------------
    // END: Enable or disable the progressbar.

    return this;
  }

  public info(message: string, duration: number) {
    duration = getAutoCloseDuration(message, duration, this.settings);
    this.toast("info", message, duration);
  }

  public success(message: string, duration: number) {
    duration = getAutoCloseDuration(message, duration, this.settings);
    this.toast("success", message, duration);
  }

  public warning(message: string, duration: number) {
    duration = getAutoCloseDuration(message, duration, this.settings);
    this.toast("warning", message, duration);
  }

  public error(message: string, duration: number) {
    duration = getAutoCloseDuration(message, duration, this.settings);
    this.toast("error", message, duration);
  }
}
