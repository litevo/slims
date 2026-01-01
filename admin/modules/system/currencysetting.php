<?php
/**
 * @author Drajat Hasan
 * @email drajathasan20@gmail.com
 * @create date 2022-10-11 07:25:22
 * @modify date 2022-10-11 13:11:26
 * @license GPLv3
 * @desc [description]
 */

use SLiMS\Currency;

// key to authenticate
define('INDEX_AUTH', '1');

// main system configuration
require '../../../sysconfig.inc.php';
// IP based access limitation
require LIB.'ip_based_access.inc.php';
do_checkIP('smc');
do_checkIP('smc-system');

// start the session
require SB.'admin/default/session.inc.php';
require SB.'admin/default/session_check.inc.php';
require SIMBIO.'simbio_GUI/form_maker/simbio_form_table_AJAX.inc.php';
require SIMBIO.'simbio_GUI/table/simbio_table.inc.php';
require SIMBIO.'simbio_DB/simbio_dbop.inc.php';

// privileges checking
$can_read = utility::havePrivilege('system', 'r');
$can_write = utility::havePrivilege('system', 'w');

if (!($can_read AND $can_write)) {
    die('<div class="errorBox">'.__('You don\'t have enough privileges to view this section').'</div>');
}

if (!function_exists('addOrUpdateSetting')) {
    function addOrUpdateSetting($name, $value) {
        global $dbs;
        $sql_op = new simbio_dbop($dbs);
        $data['setting_value'] = $dbs->escape_string(serialize($value));

        $query = $dbs->query("SELECT setting_value FROM setting WHERE setting_name = '{$name}'");
        if ($query->num_rows > 0) {
            // update
            $sql_op->update('setting', $data, "setting_name='{$name}'");
        } else {
            // insert
            $data['setting_name'] = $name;
            $sql_op->insert('setting', $data);
        }
    }
}

if (isset($_POST['saveData']))
{
    // set setting
    $currencysetting = [
        'enable' => $_POST['currencyenable'],
        'region' => $_POST['region'],
        'detail' => [
            'attribute' => $_POST['attribute'],
            // 'textAttribute' => $_POST['textAttribute']
        ]
    ];
    $datetimesetting = [
        'enable' => $_POST['datetimeenable'],
        'region' => $_POST['region'],
        'calendar' => $_POST['calendar'],
        'dateformat' => $_POST['dateformat'],
        'timeformat' => $_POST['timeformat']
    ];
    
    // resetter
    if (config('custom_currency_locale.region') !== $_POST['region']) unset($currencysetting['detail']);

    addOrUpdateSetting('custom_currency_locale', $currencysetting);
    addOrUpdateSetting('custom_datetime_locale', $datetimesetting);
    toastr(__('Successfully save localisation configuration'))->success();
    echo '<script>top.$("#mainContent").simbioAJAX("' . $_SERVER['PHP_SELF'] . '")</script>';
    exit;
}


// create currency instance
$currency = new Currency;
?>

<div class="menuBox">
  <div class="menuBoxInner systemIcon">
    <div class="per_title">
      <h2><?= __('Localisation Configuration'); ?></h2>
    </div>
    <div class="<?= $currency->isSupport() ? 'info' : 'error' ?>Box">
      <?php
        if (!$currency->isSupport())
        {
            echo '<b>' . __('Extension Intl must be enable first.') . "</b>";
            exit;
        }
      ?>
    </div>
  </div>
</div>
<?php
// get currency formatter to override default value of formatter
$currencyFormatter = $currency->getFormatter();

// create new instance
$form = new simbio_form_table_AJAX('mainForm', $_SERVER['PHP_SELF'], 'post');

// form table attributes
$form->table_attr = 'id="dataList" class="s-table table"';
$form->table_header_attr = 'class="alterCell font-weight-bold"';
$form->table_content_attr = 'class="alterCell2"';

/* Set field */
$form->submit_button_attr = 'name="saveData" value="'.__('Save Settings').'" class="btn btn-default"';

// Enable or not
$form->addSelectList('currencyenable', __('Currency Localisation'), [[1, __('Enable')],[0, __('Disable')]], config('custom_currency_locale.enable')??1 ,'class="form-control col-3"');

// set Locale
$form->addSelectList('region', __('Region'), $currency->getIsoCode(), config('custom_currency_locale.region') ,'class="select select2 form-control col-3"', __('By default region value same as default language'));

// set how many decimal character will show
$defaultDecimal = config('custom_currency_locale.detail.attribute.MAX_FRACTION_DIGITS');
$form->addTextField('text', 'attribute[MAX_FRACTION_DIGITS]', __('Number of decimal position'), $defaultDecimal, 'style="width: 20%;" class="form-control"');

/*----- Text attribute -----*/
// default prefix
// $positivePrefix = config('custom_currency_locale.detail.textAttribute.POSITIVE_PREFIX', $currencyFormatter->getTextAttribute(NumberFormatter::POSITIVE_PREFIX));
// $sample = __('Example') . ' : ' . currency(100)->get();
// $form->addAnything(__('Positive Prefix'), <<<HTML
//     <input type="text" class="form-control w-25" name="textAttribute[POSITIVE_PREFIX]" value="{$positivePrefix}"/>
//     <strong>{$sample}</strong>
// HTML);

// $negativePrefix = config('custom_currency_locale.detail.textAttribute.NEGATIVE_PREFIX', $currencyFormatter->getTextAttribute(NumberFormatter::NEGATIVE_PREFIX));
// $sample = __('Example') . ' : ' . currency(-100)->get();
// $form->addAnything(__('Negative Prefix'), <<<HTML
//     <input type="text" class="form-control w-25" name="textAttribute[NEGATIVE_PREFIX]" value="{$negativePrefix}"/>
//     <strong>{$sample}</strong>
// HTML);

$form->addSelectList('datetimeenable', __('DateTime Localisation'), [[1, __('Enable')],[0, __('Disable')]], config('custom_datetime_locale.enable')??1 ,'class="form-control col-3"');
/*
$bundle=new ResourceBundle('','ICUDATA');
	$cnames=[];
	$calendars=$bundle->get('calendar');
	foreach($calendars as $n=>$v){
		$cnames[$n]=$n;
		}
    
//Unicode CLDR - Islamic Calendar Types
//https://cldr.unicode.org/development/development-process/design-proposals/islamic-calendar-types		
// set Calendar
$form->addSelectList('calendar', __('Calendar'), $cnames, config('custom_datetime_locale.calendar') ,'class="select select2 form-control col-3"', __('By default calendar value is gregorian'));
*/
// Define 4 fixed calendar options
$cnames ['default']=['default',__('Default')]; // Default Gregorian
$cnames ['gregorian']=['gregorian',__('Gregorian')]; // Gregorian
$cnames ['persian']=['persian',__('Persian')]; // Persian (Solar Hijri)
$cnames ['islamic']=['islamic',__('Islamic')]; // Islamic (Lunar)


// نمایش Select
$form->addSelectList(
    'calendar',
    __('Calendar'),
    $cnames,
    config('custom_datetime_locale.calendar'),
    'class="select select2 form-control col-3"',
    __('By default calendar value is gregorian')
);

$formats[IntlDateFormatter::NONE]=[IntlDateFormatter::NONE, 'NONE'];
$formats[IntlDateFormatter::FULL]=[IntlDateFormatter::FULL, 'FULL'];
$formats[IntlDateFormatter::LONG]=[IntlDateFormatter::LONG, 'LONG'];
$formats[IntlDateFormatter::MEDIUM]=[IntlDateFormatter::MEDIUM, 'MEDIUM'];
$formats[IntlDateFormatter::SHORT]=[IntlDateFormatter::SHORT, 'SHORT'];
$form->addSelectList('dateformat', __('Date Format'), $formats, config('custom_datetime_locale.dateformat'),'class="select select2 form-control col-3"', '');
$form->addSelectList('timeformat', __('Time Format'), $formats, config('custom_datetime_locale.timeformat'),'class="select select2 form-control col-3"', '');
/* ----- Dynamic DateTime Format Examples ----- */

// Retrieve locale and calendar settings exactly as in SLiMS
$region = config('custom_datetime_locale.region') ?: 'en_US';
$calendarSel = config('custom_datetime_locale.calendar') ?: 'gregorian';
$locale      = $region . '@calendar=' . $calendarSel;

// زمان فعلی
$currentTime = time();

/**
 * Create an example of date/time formatting similar to SLiMS behavior
 */
function exampleFormat($dateType, $timeType, $locale, $timestamp) {
    $fmt = new IntlDateFormatter(
        $locale,
        $dateType,
        $timeType,
        config('timezone'),
        IntlDateFormatter::TRADITIONAL  
    );
    return $fmt->format($timestamp);
}

// Real examples
$example_full   = exampleFormat(IntlDateFormatter::FULL,   IntlDateFormatter::FULL,   $locale, $currentTime);
$example_long   = exampleFormat(IntlDateFormatter::LONG,   IntlDateFormatter::LONG,   $locale, $currentTime);
$example_medium = exampleFormat(IntlDateFormatter::MEDIUM, IntlDateFormatter::MEDIUM, $locale, $currentTime);
$example_short  = exampleFormat(IntlDateFormatter::SHORT,  IntlDateFormatter::SHORT,  $locale, $currentTime);

// Display examples section
$form->addAnything(__('Date Time Formats'), <<<HTML
<table class="table">

    <dt><strong><code>IntlDateFormatter::NONE</code></strong></dt>
    <dd>Do not include this element.</dd>

    <dt><strong><code>IntlDateFormatter::FULL</code></strong></dt>
    <dd>
        Completely specified style<br>
        <b>Example:</b> {$example_full}
    </dd>

    <dt><strong><code>IntlDateFormatter::LONG</code></strong></dt>
    <dd>
        Long date format<br>
        <b>Example:</b> {$example_long}
    </dd>

    <dt><strong><code>IntlDateFormatter::MEDIUM</code></strong></dt>
    <dd>
        Medium date format<br>
        <b>Example:</b> {$example_medium}
    </dd>

    <dt><strong><code>IntlDateFormatter::SHORT</code></strong></dt>
    <dd>
        Short date format<br>
        <b>Example:</b> {$example_short}
    </dd>

</table>
HTML
);

// print out the object
echo $form->printOut();