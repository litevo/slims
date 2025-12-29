// https://github.com/litevo/datetimepicker
// src/DateTimePicker.js
// پلاگین اصلی DateTimePicker با پشتیبانی از چند تقویم و زمان

(function (global) {
    'use strict';

    const DEFAULT_OPTIONS = {
        calendar: 'gregorian',        // 'gregorian' | 'persian' | 'islamic'
        storageCalendar: 'gregorian', // برای ذخیره‌سازی در hidden
        displayFormat: 'YYYY-MM-DD',
        storageFormat: 'YYYY-MM-DD',
        locale: 'en',
        displayLocale: 'en',
        storageLocale: 'en',
        minDate: null, // رشته یا Date یا moment
        maxDate: null,
        enableTime: false,
        hourStep: 1,
        minuteStep: 5,
        textOk: 'OK', 
        textClear: 'Clear',
        events: {
            onSelect: null,
            onChange: null,
            onOpen: null,
            onClose: null
        }
    };

    class DateTimePicker {
        constructor(inputEl, options) {
            if (!inputEl) {
                console.error('[DateTimePicker] input element is required.');
                return;
            }
            this.inputEl = inputEl;
            this.opts = Object.assign({}, DEFAULT_OPTIONS, options || {});
            this.adapter = global.CalendarAdapter.get(this.opts.calendar);
            this.storageAdapter = global.CalendarAdapter.get(this.opts.storageCalendar);
            this.events = new global.EventHandler(this.opts.events);

            // وضعیت داخلی
            this.opened = false;
            this.current = this.adapter.now();
            this.selected = null;

            // DOM
            this.container = null;
            this.hiddenTargetSelector = this.inputEl.getAttribute('data-target-hidden') || null;

            // اعمال locale
            global.Formatter.setLocale(this.opts.locale);

            // محدودیت‌ها
            this.minMoment = this.parseBoundary(this.opts.minDate);
            this.maxMoment = this.parseBoundary(this.opts.maxDate);

            // نصب
            this.bind();

            // مقداردهی اولیه 
            this.initValue();
        }

        parseBoundary(value) {
            try {
                if (!value) return null;
                if (global.moment.isMoment(value)) return value.clone();
                if (value instanceof Date) return global.moment(value);
                if (typeof value === 'string') {
                    // مرزها را با storageFormat می‌خوانیم تا مرجعاً گرگوری دقیق باشد
                    const m = global.moment(value, this.opts.storageFormat, true);
                    return m.isValid() ? m : null;
                }
                return null;
            } catch (e) {
                console.error('[DateTimePicker.parseBoundary] Failed:', e);
                return null;
            }
        }

        bind() {
            // باز کردن روی فوکوس یا کلیک
            this.inputEl.addEventListener('focus', () => this.open());
            this.inputEl.addEventListener('click', () => this.open());

            // بستن روی کلیک خارج
            document.addEventListener('click', (ev) => {
                if (!this.opened) return;
                if (this.container && !this.container.contains(ev.target) && ev.target !== this.inputEl) {
                    this.close();
                }
            });

            this.inputEl.addEventListener('change', e => {
                const str = e.target.value.trim();
                if (!str) return;

                // تلاش برای parse تاریخ با فرمت نمایش
                const m = this.adapter.parse(str, this.opts.displayFormat);
                if (m && m.isValid()) {
                    this.selected = m.clone();
                    this.current = m.clone();

                    // فیلد مخفی با locale مخصوص ذخیره
                    const storageVal = m.clone()
                        .locale(this.opts.storageLocale || 'en')
                        .format(this.opts.storageFormat);
                    this.writeHidden(storageVal);

                    // فیلد نمایشی با locale مخصوص نمایش
                    const displayVal = m.clone()
                        .locale(this.opts.displayLocale || this.opts.storageLocale || 'en')
                        .format(this.opts.displayFormat);
                    this.inputEl.value = displayVal;

                    this.refreshGrid();
                    this.refreshHeader();

                    this.events.safeCall('onSelect', { moment: m.clone(), input: this.inputEl });
                    this.events.safeCall('onChange', {
                        display: displayVal,
                        storage: storageVal,
                        input: this.inputEl
                    });
                } else {
                    console.warn('[DateTimePicker] Invalid date typed:', str);
                }
            });

            // پاکسازی روی blur (اختیاری)
            // this.inputEl.addEventListener('blur', () => this.close());
        }


        open() {
            if (this.opened) return;
            this.render();
            this.position();
            this.opened = true;
            this.events.safeCall('onOpen', { input: this.inputEl });
        }

        close() {
            if (!this.opened) return;
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
            this.container = null;
            this.opened = false;
            this.events.safeCall('onClose', { input: this.inputEl });
        }

        position() {
            if (!this.container) return;
            const rect = this.inputEl.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            this.container.style.top = `${rect.bottom + scrollTop + 4}px`;
            this.container.style.left = `${rect.left + scrollLeft}px`;
            this.container.style.width = `${rect.width}px`;
        }

        render() {
            this.container = document.createElement('div');
            this.container.className = 'dtp-container';

            const header = this.renderHeader();
            const grid = this.renderGrid();
            const time = this.opts.enableTime ? this.renderTimePicker() : null;
            const footer = this.renderFooter();

            this.container.appendChild(header);
            this.container.appendChild(grid);
            if (time) this.container.appendChild(time);
            this.container.appendChild(footer);

            document.body.appendChild(this.container);
        }

renderHeader() {
    const header = document.createElement('div');
    header.className = 'dtp-header';

    // --- خط اول: سال و ماه ---
    const titleRow = document.createElement('div');
    titleRow.className = 'dtp-title-row';

    // Select ماه
    const monthSelect = document.createElement('select');
    monthSelect.className = 'dtp-month-select';
    const months = this.adapter.getMonthNames();
    months.forEach((name, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = name;
        if (idx === this.adapter.getMonth(this.current)) opt.selected = true;
        monthSelect.appendChild(opt);
    });
    monthSelect.addEventListener('change', e => {
        this.current = this.adapter.setMonth(this.current, parseInt(e.target.value, 10));
        this.refreshGrid();
        this.refreshHeader();
    });

    // Select سال
    const yearSelect = document.createElement('select');
    yearSelect.className = 'dtp-year-select';
    const currentYear = this.adapter.getYear(this.current);
    for (let y = currentYear - 10; y <= currentYear + 10; y++) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        if (y === currentYear) opt.selected = true;
        yearSelect.appendChild(opt);
    }
    yearSelect.addEventListener('change', e => {
        this.current = this.adapter.setYear(this.current, parseInt(e.target.value, 10));
        this.refreshGrid();
        this.refreshHeader();
    });

    this.monthSelect = monthSelect;
    this.yearSelect = yearSelect;

    titleRow.appendChild(monthSelect);
    titleRow.appendChild(yearSelect);

    // --- خط دوم: کلیدهای قبل و بعد ---
    const navRow = document.createElement('div');
    navRow.className = 'dtp-nav-row';

    // 🔟 ده سال قبل
    const prevDecadeBtn = document.createElement('button');
    prevDecadeBtn.type = 'button';
    prevDecadeBtn.className = 'dtp-nav dtp-nav--prev-decade';
    prevDecadeBtn.textContent = '⟪';
    prevDecadeBtn.addEventListener('click', () => {
        this.current = this.adapter.setYear(this.current, this.adapter.getYear(this.current) - 10);
        this.refreshGrid();
        this.refreshHeader();
    });

    // سال قبل
    const prevYearBtn = document.createElement('button');
    prevYearBtn.type = 'button';
    prevYearBtn.className = 'dtp-nav dtp-nav--prev-year';
    prevYearBtn.textContent = '«';
    prevYearBtn.addEventListener('click', () => {
        this.current = this.adapter.setYear(this.current, this.adapter.getYear(this.current) - 1);
        this.refreshGrid();
        this.refreshHeader();
    });

    // ماه قبل
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'dtp-nav prev';
    prevBtn.textContent = '‹';
    prevBtn.addEventListener('click', () => {
        this.current = this.adapter.addMonth(this.current, -1);
        this.refreshGrid();
        this.refreshHeader();
    });

    // ماه بعد
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'dtp-nav next';
    nextBtn.textContent = '›';
    nextBtn.addEventListener('click', () => {
        this.current = this.adapter.addMonth(this.current, 1);
        this.refreshGrid();
        this.refreshHeader();
    });

    // سال بعد
    const nextYearBtn = document.createElement('button');
    nextYearBtn.type = 'button';
    nextYearBtn.className = 'dtp-nav dtp-nav--next-year';
    nextYearBtn.textContent = '»';
    nextYearBtn.addEventListener('click', () => {
        this.current = this.adapter.setYear(this.current, this.adapter.getYear(this.current) + 1);
        this.refreshGrid();
        this.refreshHeader();
    });

    // 🔟 ده سال بعد
    const nextDecadeBtn = document.createElement('button');
    nextDecadeBtn.type = 'button';
    nextDecadeBtn.className = 'dtp-nav dtp-nav--next-decade';
    nextDecadeBtn.textContent = '⟫';
    nextDecadeBtn.addEventListener('click', () => {
        this.current = this.adapter.setYear(this.current, this.adapter.getYear(this.current) + 10);
        this.refreshGrid();
        this.refreshHeader();
    });

    // اضافه کردن همه دکمه‌ها
    navRow.appendChild(prevDecadeBtn);
    navRow.appendChild(prevYearBtn);
    navRow.appendChild(prevBtn);
    navRow.appendChild(nextBtn);
    navRow.appendChild(nextYearBtn);
    navRow.appendChild(nextDecadeBtn);

    // اضافه کردن همه به هدر
    header.appendChild(titleRow);
    header.appendChild(navRow);

    return header;
}

refreshHeader() {
  if (this.monthSelect) {
    const currentMonth = this.adapter.getMonth(this.current);
    this.monthSelect.value = currentMonth;
  }
  if (this.yearSelect) {
    const currentYear = this.adapter.getYear(this.current);

    // اگر گزینه‌ی سال وجود ندارد، دوباره لیست را بساز
    let found = false;
    for (let opt of this.yearSelect.options) {
      if (parseInt(opt.value, 10) === currentYear) {
        found = true;
        break;
      }
    }
    if (!found) {
      this.yearSelect.innerHTML = '';
      for (let y = currentYear - 10; y <= currentYear + 10; y++) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        if (y === currentYear) opt.selected = true;
        this.yearSelect.appendChild(opt);
      }
    } else {
      this.yearSelect.value = currentYear;
    }
  }
}


        refreshGrid() {
            const body = this.container.querySelector('[data-role="grid-body"]');

            // بازسازی گرید روزها
            if (body) {
                body.innerHTML = '';
                this.fillGridBody(body);
            }

            // هماهنگ‌سازی مقدار select ماه
            if (this.monthSelect) {
                this.monthSelect.value = this.current.month();
            }

            // هماهنگ‌سازی مقدار select سال
            if (this.yearSelect) {
                this.yearSelect.value = this.current.year();
            }
        }


renderGrid() {
  const grid = document.createElement('div');
  grid.className = 'dtp-grid';

  // تنظیم شروع هفته (مثلاً جمعه = 5، شنبه = 6، یکشنبه = 0)
  moment.updateLocale(this.opts.locale, {
    week: {
      dow: this.opts.weekStart || 6, // مقدار پیش‌فرض شنبه
      doy: 6
    }
  });

  // سرتیتر روزهای هفته بر اساس locale
  const weekdays = this.adapter.getWeekdayNames(); // فارسی/عربی/انگلیسی
  const head = document.createElement('div');
  head.className = 'dtp-week-head';

  // مرتب‌سازی بر اساس شروع هفته
  const startIndex = this.opts.weekStart || 6;
  for (let i = 0; i < 7; i++) {
    const idx = (startIndex + i) % 7;
    const el = document.createElement('div');
    el.className = 'dtp-weekday';
    el.textContent = weekdays[idx];
    head.appendChild(el);
  }
  grid.appendChild(head);

  // بدنه‌ی گرید
  const body = document.createElement('div');
  body.className = 'dtp-week-body';
  body.setAttribute('data-role', 'grid-body');
  grid.appendChild(body);

  this.fillGridBody(body);

  return grid;
}





        fillGridBody(body) {
            body.innerHTML = ''; // پاک کردن محتوای قبلی
            const days = global.CalendarAdapter.buildMonthGrid(this.adapter, this.current);

            days.forEach(({ date, isCurrentMonth }) => {
                const cell = document.createElement('button');
                cell.type = 'button';
                cell.className = 'dtp-day';

                if (!isCurrentMonth) {
                    cell.classList.add('dtp-day--muted');
                }

                // شماره روز بر اساس تقویم
                let dayNumber;
                if (this.opts.calendar === 'persian') {
                    dayNumber = date.jDate();
                } else if (this.opts.calendar === 'islamic') {
                    dayNumber = date.iDate();
                } else {
                    dayNumber = date.date();
                }
                cell.textContent = dayNumber;

                // هایلایت روز انتخاب‌شده
                if (this.selected && date.isSame(this.selected, 'day')) {
                    cell.classList.add('dtp-day--selected');
                }

                // رویداد انتخاب
                cell.addEventListener('click', () => this.onDaySelect(date));

                // محدودیت min/max
                if (this.isDisabled(date)) {
                    cell.setAttribute('disabled', 'disabled');
                    cell.classList.add('dtp-day--disabled');
                }

                body.appendChild(cell);
            });
        }






        isDisabled(m) {
            try {
                if (this.minMoment && m.isBefore(this.minMoment, 'day')) return true;
                if (this.maxMoment && m.isAfter(this.maxMoment, 'day')) return true;
                return false;
            } catch (e) {
                console.error('[DateTimePicker.isDisabled] Failed:', e);
                return false;
            }
        }

        renderTimePicker() {
            const wrap = document.createElement('div');
            wrap.className = 'dtp-time';

            const hourLabel = document.createElement('label');
            hourLabel.textContent = 'Hour';
            const hourSelect = document.createElement('select');
            hourSelect.className = 'dtp-hour';
            for (let h = 0; h < 24; h += this.opts.hourStep) {
                const opt = document.createElement('option');
                opt.value = h;
                opt.textContent = String(h).padStart(2, '0');
                hourSelect.appendChild(opt);
            }

            const minuteLabel = document.createElement('label');
            minuteLabel.textContent = 'Minute';
            const minuteSelect = document.createElement('select');
            minuteSelect.className = 'dtp-minute';
            for (let m = 0; m < 60; m += this.opts.minuteStep) {
                const opt = document.createElement('option');
                opt.value = m;
                opt.textContent = String(m).padStart(2, '0');
                minuteSelect.appendChild(opt);
            }

            wrap.appendChild(hourLabel);
            wrap.appendChild(hourSelect);
            wrap.appendChild(minuteLabel);
            wrap.appendChild(minuteSelect);

            return wrap;
        }

renderFooter() {
    const footer = document.createElement('div');
    footer.className = 'dtp-footer';

    // دکمه Clear
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'dtp-action dtp-clear';
    clearBtn.textContent = this.opts.textClear || 'Clear'; // متن از تنظیمات
    clearBtn.addEventListener('click', () => {
        this.selected = null;
        this.inputEl.value = '';
        this.writeHidden('');
        this.events.safeCall('onChange', { value: null, input: this.inputEl });
    });

    // دکمه OK
    const okBtn = document.createElement('button');
    okBtn.type = 'button';
    okBtn.className = 'dtp-action dtp-ok';
    okBtn.textContent = this.opts.textOk || 'OK'; // متن از تنظیمات
    okBtn.addEventListener('click', () => {
        // اگر روزی انتخاب نشده، از روز جاری استفاده شود
        const base = this.selected || this.current;

        const hourSelect = this.container.querySelector('.dtp-hour');
        const minuteSelect = this.container.querySelector('.dtp-minute');
        const hour = hourSelect ? parseInt(hourSelect.value, 10) : 0;
        const minute = minuteSelect ? parseInt(minuteSelect.value, 10) : 0;

        const finalDisplay = base.clone().hour(hour).minute(minute);
        this.commitSelection(finalDisplay);
        this.close();
    });

    footer.appendChild(clearBtn);
    footer.appendChild(okBtn);
    return footer;
}

        onDaySelect(m) {
            if (this.isDisabled(m)) return;

            // ذخیره تاریخ انتخاب‌شده
            this.selected = m.clone();

            // نوشتن در فیلد نمایش
            const displayStr = Formatter.format(
                m.clone().locale(this.opts.locale),
                this.opts.displayFormat
            );
            this.inputEl.value = displayStr;

            // نوشتن در hidden (میلادی یا فرمت ذخیره‌سازی)
            const storageStr = m.clone().locale('en').format(this.opts.storageFormat);
            this.writeHidden(storageStr);

            // هایلایت فوری: گرید را دوباره بساز
            if (this.gridBody) {
                this.fillGridBody(this.gridBody);
            }

            // صدا زدن رویداد بیرونی
            this.events.safeCall('onSelect', { moment: m.clone(), input: this.inputEl });
            this.events.safeCall('onChange', {
                display: displayStr,
                storage: storageStr,
                input: this.inputEl
            });
        }


        commitSelection(displayMoment) {
            try {
                // نمایش: با locale انتخابی (fa, ar, ...)
                const displayStr = Formatter.format(displayMoment, this.opts.displayFormat);
                this.inputEl.value = displayStr;

                // ذخیره‌سازی: همیشه میلادی و انگلیسی
                const storageMoment = displayMoment.clone().locale('en');
                const storageStr = storageMoment.format(this.opts.storageFormat);

                // نوشتن در hidden
                this.writeHidden(storageStr);

                // فراخوانی ایونت onChange
                this.events.safeCall('onChange', {
                    display: displayStr,
                    storage: storageStr,
                    input: this.inputEl
                });
            } catch (e) {
                console.error('[DateTimePicker.commitSelection] Failed:', e);
            }
        }



        writeHidden(value) {
            if (!this.hiddenTargetSelector) return;
            try {
                const hidden = document.querySelector(this.hiddenTargetSelector);
                if (!hidden) {
                    console.warn('[DateTimePicker.writeHidden] Hidden target not found:', this.hiddenTargetSelector);
                    return;
                }
                hidden.value = value || '';
            } catch (e) {
                console.error('[DateTimePicker.writeHidden] Failed:', e);
            }
        }

        initValue() {
            try {
                if (this.hiddenTargetSelector) {
                    const hidden = document.querySelector(this.hiddenTargetSelector);
                    if (hidden && hidden.value) {
                        const storageMoment = moment(hidden.value, this.opts.storageFormat);
                        if (storageMoment.isValid()) {
                            // نمایش با locale انتخابی
                            const displayMoment = storageMoment.clone().locale(this.opts.locale);
                            const displayStr = Formatter.format(displayMoment, this.opts.displayFormat);
                            this.inputEl.value = displayStr;

                            // همگام‌سازی وضعیت داخلی
                            this.selected = displayMoment.clone();
                            this.current = this.adapter.startOfMonth(storageMoment.clone());
                        } else {
                            console.error('[DateTimePicker.initValue] Failed: value not valid');
                        }
                    } else {
                        console.warn('[DateTimePicker.initValue] No initial hidden value');
                    }
                } else {
                    const val = this.inputEl.value;
                    if (val) {
                        const displayMoment = moment(val, this.opts.displayFormat, true);
                        if (displayMoment.isValid()) {
                            const storageStr = displayMoment.clone().locale('en').format(this.opts.storageFormat);
                            this.writeHidden(storageStr);

                            this.selected = displayMoment.clone();
                            this.current = this.adapter.startOfMonth(displayMoment.clone());
                        }
                    }
                }
            } catch (e) {
                console.error('[DateTimePicker.initValue] Failed:', e);
            }
        }



    }

    // API: نصب روی انتخابگرها
    DateTimePicker.attachAll = function (selector, options) {
        const nodes = document.querySelectorAll(selector || 'input[data-dtp="true"]');
        const instances = [];
        nodes.forEach((node) => {
            instances.push(new DateTimePicker(node, options));
        });
        return instances;
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = DateTimePicker;
    } else {
        global.DateTimePicker = DateTimePicker;
    }
})(window);
