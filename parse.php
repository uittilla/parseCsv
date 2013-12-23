<?php

/**
 * Class Parse
 *
 * Take a csv of (N) links with multiple links to a domain
 * Truncate it to 20 links max per domain
 *
 */
class Parse {

    public $filename;
    public $links = array();

    /**
     * @param $file
     */
    public function __construct ($file) {
        $this->filename = $file;
    }

    /**
     *
     */
    public function open () {
       if($fp = fopen($this->filename, "r")) {
           while (($line = fgets($fp)) !== false) {
               $line = str_replace(",", "", $line);
               $line = str_replace("\n", "", $line);

               $this->links[] = $line;
           }

           fclose ($fp);
       }
    }

    /**
     * create hash of arrays
     */
    public function parse () {

       $hash = array();

       // create hash
       foreach($this->links as $link) {
           $parts = parse_url($link);

           if( !array_key_exists($parts['host'], $hash) ) {
               $hash[$parts['host']] = array();
           }
       }

       // populate it
       foreach($this->links as $link) {
           $parts = parse_url($link);

           if(array_key_exists($parts['host'], $hash)) {
               array_push($hash[$parts['host']], $link);
           }
       }

       $this->reduce($hash);
    }

    /**
     * @param $hash
     */
    public function reduce ($hash) {

        foreach($hash as $key=>$val) {
            if(is_array($val) && count($val) > 20) {
                array_splice($val, 20);
            }

            $hash[$key] = $val;
        }

        $this->shuffle($hash);
    }

    /**
     * @param $hash
     */
    public function shuffle ($hash) {

        $parsed = array();

        foreach($hash as $key=>$val) {
             foreach($val as $link) {
                 if(!empty($link)) {
                     $parsed[] = $link;
                 }
             }
        }

        shuffle($parsed);

        $this->save($parsed);
    }

    /**
     * @param $array
     */
    public function save ($array) {

        $file = basename ($this->filename, ".csv");

        if($fp = fopen("$file-parsed.csv", "a")) {

            foreach($array as $link) {
                if(!empty($link)) {
                    fputs($fp, "$link,\n");
                }
            }

            fclose ($fp);
        }

        print "Done";
    }
}

$parser = new Parse("./php-testParse.csv");
$parser->open();
$parser->parse();