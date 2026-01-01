//https://github.com/litevo/datetimepicker
// src/adapters/CalendarAdapter.js
// مسئولیت: انتزاع تقویم‌ها (Gregorian, Persian[Jalali], Islamic[Hijri]) روی moment
// وابستگی: moment.js, moment-jalali.js, moment-hijri.js

(function (global) {
  'use strict';

  if (typeof global.moment === 'undefined') {
    console.error('[CalendarAdapter] moment.js is required but not found.');
  }

  // Helper: ایمن‌سازی ورودی‌های تاریخ
  function ensureMoment(m) {
    try {
      if (!m) return global.moment();
      if (!global.moment.isMoment(m)) return global.moment(m);
      return m;
    } catch (e) {
      console.error('[CalendarAdapter.ensureMoment] Failed:', e);
      return global.moment();
    }
  }

  // آداپتر گرگوری
  const GregorianAdapter = {
    name: 'gregorian',

    now() { return moment(); },

    startOfMonth(m) { return ensureMoment(m).clone().startOf('month'); },
    endOfMonth(m) { return ensureMoment(m).clone().endOf('month'); },
    addMonth(m, count) { return ensureMoment(m).clone().add(count || 1, 'month'); },

    getMonthYearLabel(m) { return ensureMoment(m).format('MMMM YYYY'); },

    format(m, formatStr) {
      m = ensureMoment(m);
      return m.isValid() ? m.format(formatStr) : '';
    },

    parse(str, formatStr) {
      if (!str) return null;
      const m = moment(str, formatStr, true);
      return m.isValid() ? m : null;
    },

    getMonthNames() {
      const names = [];
      const locale = this.displayLocale || 'en'; // زبان نمایش
      for (let i = 0; i < 12; i++) {
        const m = moment().locale(locale).month(i);
        names.push(m.format('MMMM'));
      }
      return names;
    },
getWeekdayNames() {
  const locale = this.displayLocale || 'en';

  const weekdaysFa = [
    'یک', 'دو', 'سه‌', 'چهار',
    'پنج', 'جمعه', 'شنبه'
  ];

  const weekdaysAr = [
    'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء',
    'الخميس', 'الجمعة', 'السبت'
  ];

  const weekdaysEn = [
    'Sun', 'Mon', 'Tue', 'Wed',
    'Thu', 'Fri', 'Sat'
  ];

  if (locale.startsWith('fa')) {
    return weekdaysFa;
  } else if (locale.startsWith('ar')) {
    return weekdaysAr;
  } else {
    return weekdaysEn;
  }
},
    getMonth(m) { return ensureMoment(m).month(); },
    setMonth(m, idx) { return ensureMoment(m).clone().month(idx); },
    getYear(m) { return ensureMoment(m).year(); },
    setYear(m, y) { return ensureMoment(m).clone().year(y); }
  };


  // آداپتر جلالی (شمسی)
  const PersianAdapter = {
    name: 'persian',

    now() {
      if (moment.loadPersian) {
        moment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' });
      }
      return moment();
    },

    startOfMonth(m) { return ensureMoment(m).clone().startOf('jMonth'); },
    endOfMonth(m) { return ensureMoment(m).clone().endOf('jMonth'); },
    addMonth(m, count) { return ensureMoment(m).clone().add(count || 1, 'jMonth'); },

    getMonthYearLabel(m) { return ensureMoment(m).format('jMMMM jYYYY'); },

    format(m, formatStr) {
      m = ensureMoment(m);
      return m.isValid() ? m.format(formatStr) : '';
    },

    parse(str, formatStr) {
      if (!str) return null;
      const m = moment(str, formatStr, true);
      return m.isValid() ? m : null;
    },

    getMonthNames() {
      const names = [];
      const locale = this.displayLocale || 'fa';
      for (let i = 0; i < 12; i++) {
        const m = moment().locale(locale).jMonth(i).jYear(1400);
        names.push(m.format('jMMMM'));
      }
      return names;
    },
getWeekdayNames() {
  const locale = this.displayLocale || 'fa';

  const weekdaysFa = [
    'یک', 'دو', 'سه‌', 'چهار',
    'پنج', 'جمعه', 'شنبه'
  ];

  const weekdaysAr = [
    'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء',
    'الخميس', 'الجمعة', 'السبت'
  ];

  const weekdaysEn = [
    'Sun', 'Mon', 'Tue', 'Wed',
    'Thu', 'Fri', 'Sat'
  ];

  if (locale.startsWith('fa')) {
    return weekdaysFa;
  } else if (locale.startsWith('ar')) {
    return weekdaysAr;
  } else {
    return weekdaysEn;
  }
},
    getMonth(m) { return ensureMoment(m).jMonth(); },
    setMonth(m, idx) { return ensureMoment(m).clone().jMonth(idx); },
    getYear(m) { return ensureMoment(m).jYear(); },
    setYear(m, y) { return ensureMoment(m).clone().jYear(y); }
  };


  // آداپتر هجری (اسلامی)
  const IslamicAdapter = {
    name: 'islamic',

    now() { return moment(); },

    startOfMonth(m) {
      m = ensureMoment(m);
      return m.clone().iDate(1);
    },
    endOfMonth(m) {
      m = ensureMoment(m);
      return m.clone().iMonth(m.iMonth() + 1).iDate(1).subtract(1, 'day');
    },
    addMonth(m, count) { return ensureMoment(m).clone().add(count || 1, 'iMonth'); },

    getMonthYearLabel(m) { return ensureMoment(m).format('iMMMM iYYYY'); },

    format(m, formatStr) {
      m = ensureMoment(m);
      return m.isValid() ? m.format(formatStr) : '';
    },

    parse(str, formatStr) {
      if (!str) return null;
      const m = moment(str, formatStr, true);
      return m.isValid() ? m : null;
    },

    getMonthNames() {
      const locale = this.displayLocale || 'ar';

      const hijriMonthsFa = [
        'محرم', 'صفر', 'ربیع‌الاول', 'ربیع‌الثانی',
        'جمادی‌الاول', 'جمادی‌الثانی', 'رجب',
        'شعبان', 'رمضان', 'شوال', 'ذی‌القعده', 'ذی‌الحجه'
      ];

      const hijriMonthsAr = [
        'مُحَرَّم', 'صَفَر', 'رَبيع الأوّل', 'رَبيع الآخر',
        'جُمادى الأولى', 'جُمادى الآخرة', 'رَجَب',
        'شَعبان', 'رَمَضان', 'شَوّال', 'ذو القعدة', 'ذو الحجة'
      ];

      const hijriMonthsEn = [
        'Muharram', 'Safar', 'Rabi al-awwal', 'Rabi al-thani',
        'Jumada al-awwal', 'Jumada al-thani', 'Rajab',
        'Sha’ban', 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'
      ];

      if (locale.startsWith('fa')) {
        return hijriMonthsFa;
      } else if (locale.startsWith('ar')) {
        return hijriMonthsAr;
      } else {
        return hijriMonthsEn;
      }
    },
getWeekdayNames() {
  const locale = this.displayLocale || 'ar';

  const weekdaysFa = [
    'یک', 'دو', 'سه‌', 'چهار',
    'پنج', 'جمعه', 'شنبه'
  ];

  const weekdaysAr = [
    'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء',
    'الخميس', 'الجمعة', 'السبت'
  ];

  const weekdaysEn = [
    'Sun', 'Mon', 'Tue', 'Wed',
    'Thu', 'Fri', 'Sat'
  ];

  if (locale.startsWith('fa')) {
    return weekdaysFa;
  } else if (locale.startsWith('ar')) {
    return weekdaysAr;
  } else {
    return weekdaysEn;
  }
},
    getMonth(m) { return ensureMoment(m).iMonth(); },
    setMonth(m, idx) { return ensureMoment(m).clone().iMonth(idx); },
    getYear(m) { return ensureMoment(m).iYear(); },
    setYear(m, y) { return ensureMoment(m).clone().iYear(y); }
  };


  const CalendarAdapter = {
    /**
     * گرفتن آداپتر بر اساس نام
     * @param {'gregorian'|'persian'|'islamic'} name
     * @returns {object}
     */
    get(name) {
      switch ((name || '').toLowerCase()) {
        case 'persian':
        case 'jalali':
          return PersianAdapter;
        case 'islamic':
        case 'hijri':
          return IslamicAdapter;
        case 'gregorian':
        default:
          return GregorianAdapter;
      }
    },

    /**
     * تولید آرایه روزهای ماه برای رندر
     * @param {object} adapter
     * @param {object} currentMoment
     * @returns {Array<{date: object, isCurrentMonth: boolean}>}
     */
    buildMonthGrid(adapter, currentMoment) {
      try {
        const start = adapter.startOfMonth(currentMoment);
        const end = adapter.endOfMonth(currentMoment);
        const startWeekday = start.weekday(); // 0..6
        const days = [];

        // پر کردن روزهای قبل از شروع ماه جهت تراز
        for (let i = 0; i < startWeekday; i++) {
          const d = start.clone().subtract(startWeekday - i, 'day');
          days.push({ date: d, isCurrentMonth: false });
        }

        // روزهای ماه جاری
        let cursor = start.clone();
        while (cursor.isSameOrBefore(end, 'day')) {
          days.push({ date: cursor.clone(), isCurrentMonth: true });
          cursor.add(1, 'day');
        }

        // تکمیل تا انتهای هفته آخر
        let cursorAfter = end.clone().add(1, 'day');
        while (days.length % 7 !== 0) {
          days.push({ date: cursorAfter.clone(), isCurrentMonth: false });
          cursorAfter.add(1, 'day');
        }

        return days;
      } catch (e) {
        console.error('[CalendarAdapter.buildMonthGrid] Failed:', e);
        return [];
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalendarAdapter;
  } else {
    global.CalendarAdapter = CalendarAdapter;
  }
})(window);
