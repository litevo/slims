// https://github.com/litevo/datetimepicker
// src/utils/Formatter.js
// مسئولیت: مدیریت فرمت‌های تاریخ/زمان و چندزبانه‌گی moment
// نکته: از moment.js و افزونه‌های jalali و hijri استفاده می‌کند.

(function (global) {
  'use strict';

  // Defensive: بررسی وجود moment
  if (typeof global.moment === 'undefined') {
    console.error('[Formatter] moment.js is required but not found.');
  }

  const DEFAULT_FORMAT = 'YYYY/MM/DD HH:mm';

  const Formatter = {
    /**
     * تنظیم locale برای moment (چندزبانه)
     * @param {string} locale - مثل 'en', 'fa', 'ar'
     */
    setLocale(locale) {
      try {
        if (!global.moment) return;
        global.moment.locale(locale || 'en');
      } catch (e) {
        console.error('[Formatter.setLocale] Failed to set locale:', e);
      }
    },

    /**
     * فرمت کردن یک شیء moment به رشته
     * @param {object} m - شیء moment
     * @param {string} format - مثل 'YYYY/MM/DD' یا 'DD-MM-YYYY HH:mm'
     * @returns {string}
     */
    format(m, format) {
      try {
        if (!m || !global.moment.isMoment(m)) return '';
        return m.format(format || DEFAULT_FORMAT);
      } catch (e) {
        console.error('[Formatter.format] Failed:', e);
        return '';
      }
    },

    /**
     * پارس رشته تاریخ به moment (با فرمت مشخص)
     * @param {string} value
     * @param {string} format
     * @returns {object|null} moment or null
     */
    parse(value, format) {
      try {
        if (!value || !global.moment) return null;
        const m = global.moment(value, format || DEFAULT_FORMAT, true);
        return m.isValid() ? m : null;
      } catch (e) {
        console.error('[Formatter.parse] Failed:', e);
        return null;
      }
    },

    /**
     * تولید رشته ISO از moment برای ذخیره در پایگاه داده
     * @param {object} m
     * @returns {string}
     */
    toISO(m) {
      try {
        if (!m || !global.moment.isMoment(m)) return '';
        return m.toISOString();
      } catch (e) {
        console.error('[Formatter.toISO] Failed:', e);
        return '';
      }
    }
  };

  // UMD سبک ساده
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Formatter;
  } else {
    global.Formatter = Formatter;
  }
})(window);
