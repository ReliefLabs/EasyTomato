<!DOCTYPE html>
<!--
	Tomato GUI
	Copyright (C) 2006-2010 Jonathan Zarate
	http://www.polarcloud.com/tomato/

	For use with Tomato Firmware only.
	No part of this file may be used without permission.
-->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv='content-type' content='text/html;charset=utf-8'>
<meta name='robots' content='noindex,nofollow'>
<title>[<% ident(); %>] Status: Logs</title>
<% include("common-header.html"); %>

<% css(); %>
<script type='text/javascript' src='tomato.js'></script>

<script type='text/javascript'>

//	<% nvram("log_file"); %>

function find()
{
	var s = E('find-text').value;
	if (s.length) document.location = 'logs/view.cgi?find=' + escapeCGI(s) + '&_http_id=' + nvram.http_id;
}

function init()
{
	var e = E('find-text');
	if (e) e.onkeypress = function(ev) {
		if (checkEvent(ev).keyCode == 13) find();
	}
}
</script>

</head>
<body onload='init()'>



<% include(header.html); %>

<!-- / / / -->

<div id='logging'>
	<h3>Logs</h3>
	<div class='section'>
		<a href="logs/view.cgi?which=25&_http_id=<% nv(http_id) %>">View Last 25 Lines</a><br>
		<a href="logs/view.cgi?which=50&_http_id=<% nv(http_id) %>">View Last 50 Lines</a><br>
		<a href="logs/view.cgi?which=100&_http_id=<% nv(http_id) %>">View Last 100 Lines</a><br>
		<a href="logs/view.cgi?which=all&_http_id=<% nv(http_id) %>">View All</a><br><br>
		<a href="logs/syslog.txt?_http_id=<% nv(http_id) %>">Download Log File</a><br><br>
		<input type="text" maxsize=32 size=33 id="find-text"> <input type="button" value="Find" onclick="find()" class='btn'>
		&raquo; <a href="admin-log.asp">Logging Configuration</a><br><br>
	</div>
</div>

<script type='text/javascript'>
if (nvram.log_file != '1') {
	W('<div class="note-disabled">Internal logging disabled.</b><br><br><a href="admin-log.asp">Enable &raquo;</a></div>');
	E('logging').style.display = 'none';
}
</script>

<!-- / / / -->

 </div><!--/row-->
          
        </div><!--/span-->
      </div><!--/row-->

      <hr>

      <footer>
        <p>&copy; Tomato 2012</p>
      </footer>

    </div><!--/.fluid-container-->

<script type='text/javascript'>earlyInit()</script>
</body>
</html>