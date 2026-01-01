<?php 

namespace SLiMS;

class DateTime
{
    private $input;
    private ?object $formatter = null;

    public function __construct($input)
    {
		$calendar=config('custom_datetime_locale.region').'@calendar='.config('custom_datetime_locale.calendar');
		$this->input = ($input) ? $input : date('Y-m-d H:i:s');
			if ($this->isSupport()) 
				if (strlen($input)==10)
					$this->formatter = new \IntlDateFormatter($calendar, 
												intval(config('custom_datetime_locale.dateformat')), 
												\IntlDateFormatter::NONE,
												config('timezone'), 
												\IntlDateFormatter::TRADITIONAL);
				else
					$this->formatter = new \IntlDateFormatter($calendar, 
												intval(config('custom_datetime_locale.dateformat')), 
												intval(config('custom_datetime_locale.timeformat')),
												config('timezone'), 
												\IntlDateFormatter::TRADITIONAL);

    }

    /**
     * Check if Locale class is enable
     * or not. 
     *
     * @return noolean
     */
    public function isSupport()
    {
        return class_exists('Locale');
    }
	
    /**
     * Get 
     *
     * @return string
     */
    public function get()
    {
        if (!$this->isSupport()) return $this->input;
        
        // override default value
        $custom = config('custom_datetime_locale');

        // enable or not
        if (isset($custom['enable']) && !(bool)$custom['enable']) return $this->input;

        return $this->formatter->format(strtotime($this->input));
    }

    /**
     * Get number formatter instance
     *
     * @return NumberFormatter
     */
    public function getFormatter()
    {
        return $this->formatter;
    }
}