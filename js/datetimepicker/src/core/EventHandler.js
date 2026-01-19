//https://github.com/litevo/datetimepicker
// src/core/EventHandler.js
// مسئولیت: مدیریت و فراخوانی ایونت‌های پلاگین با امنیت

(function (global) {
  'use strict';

  const EventHandler = class {
    constructor(handlers) {
      this.handlers = Object.assign({
        onSelect: null,
        onChange: null,
        onOpen: null,
        onClose: null
      }, handlers || {});
    }

    safeCall(name, payload) {
      const fn = this.handlers[name];
      if (typeof fn === 'function') {
        try {
          fn(payload);
        } catch (e) {
          console.error(`[EventHandler.${name}] Handler failed:`, e);
        }
      }
    }

    set(name, fn) {
      if (['onSelect', 'onChange', 'onOpen', 'onClose'].includes(name)) {
        if (typeof fn === 'function' || fn === null) {
          this.handlers[name] = fn;
        } else {
          console.warn(`[EventHandler.set] Invalid handler for ${name}`);
        }
      } else {
        console.warn(`[EventHandler.set] Unknown event: ${name}`);
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventHandler;
  } else {
    global.EventHandler = EventHandler;
  }
})(window);
