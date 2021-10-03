<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<?php
		// Get Presentation ID
		if (!empty($_GET['presId'])) $presId = $_GET['presId'];
		else $presId = 0;
		
		// Get Director Mode
		if (!empty($_GET['dMode'])) $dMode = $_GET['dMode'];
		else $dMode = 'false';
	?>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<title>
	<?php
		if($dMode=='true') echo 'Director Mode';
		else echo 'Client Mode';
	?>
	</title>
	
	<link rel="stylesheet" href="assets/css.css" type="text/css" charset="utf-8" />
	<link rel="stylesheet" href="assets/cssIphone.css" type="text/css" charset="utf-8" media="only screen and (max-device-width: 480px)" />
	
	<script type="text/javascript">
		var directorMode=<?php
			if($dMode=='true') echo $dMode."\n";
			else echo "false\n";
		?>
		var presId=<?=$presId; ?>;
	</script>
	<script src="assets/scripts/mootoolsCore.js" type="text/javascript" charset="utf-8"></script>
	<script src="assets/scripts/mootoolsMore.js" type="text/javascript" charset="utf-8"></script>
	<script src="assets/scripts/core.js" type="text/javascript" charset="utf-8"></script>
	<meta name="viewport" content="width = device-width">
	<meta name="viewport" content="user-scalable=false; initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
</head>
<body oncontextmenu="javascript:return false;" onorientationchange="iMode();">
<div class="slide"><h1>...loading...<small>please wait</small></h1></div>
</body>
</html>