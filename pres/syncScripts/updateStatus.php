<?php
$filename = 'location.txt';
//$string = "This is some text that will be written to the test file!";

if (!empty($_GET['newLocation']) && $_GET['newLocation']>=0)
{
	$newLocation = $_GET['newLocation'];
}
else $newLocation = 0;

$fp = fopen($filename, 'w');
fwrite($fp, $newLocation);
fclose($fp);
?>