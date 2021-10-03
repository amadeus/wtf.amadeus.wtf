{"status":<?php

$locString = file_get_contents('location.txt');
if($locString==null || $locString=="") $locString=0;
echo $locString;

?>}