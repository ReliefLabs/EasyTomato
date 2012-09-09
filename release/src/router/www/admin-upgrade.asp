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
<title>[<% ident(); %>] Admin: Upgrade</title>
<% include("common-header.html"); %>

<% css(); %>
<script type='text/javascript' src='tomato.js'></script>

<script type='text/javascript' src='debug.js'></script>

<script type='text/javascript'>

// <% nvram("jffs2_on"); %>

function clock()
{
	var t = ((new Date()).getTime() - startTime) / 1000;
	elem.setInnerHTML('afu-time', Math.floor(t / 60) + ':' + Number(Math.floor(t % 60)).pad(2));
}

function upgrade()
{
	var name;
	var i;
	var fom = document.form_upgrade;
	var ext;

	name = fixFile(fom.file.value);
	if (name.search(/\.(bin|trx|chk)$/i) == -1) {
		alert('Expecting a ".bin" or ".trx" file.');
		return;
	}
	if (!confirm('Are you sure you want to upgrade using ' + name + '?')) return;

	E('afu-upgrade-button').disabled = true;

	elem.display('afu-input', false);
	//E('content').style.verticalAlign = 'middle';
	elem.display('afu-progress', true);
	//elem.display('navi', false)
	//elem.display('ident', false)

	startTime = (new Date()).getTime();
	setInterval('clock()', 800);

	fom.action += '?_reset=' + (E('f_reset').checked ? "1" : "0");
	form.addIdAction(fom);
	fom.submit();
}
</script>

</head>
<body>

    
<% include(header.html); %>

<!-- / / / -->

<div id='afu-input'>
	<h3>Upgrade Firmware</h3>
	<div class='section'>
		<form name='form_upgrade' method='post' action='upgrade.cgi' encType='multipart/form-data'>
		
			<label>Select the file to use:</label>
			<input type='file' name='file' size='50'> <input type='button' value='Upgrade' id='afu-upgrade-button' onclick='upgrade()' class="btn btn-primary">
		</form>
		<br><form name='form_reset' action='javascript:{}'>
		<div id='reset-input'>
			<input type='checkbox' id='f_reset'>&nbsp;&nbsp;After flashing, erase all data in NVRAM memory
		</div>
		</form>

		<br>
		<table class="table table-striped table-condensed table-bordered">
		<tr><td>Current Version:</td><td>&nbsp; <% version(1); %></td></tr>
		<script type='text/javascript'>
		//	<% sysinfo(); %>
		W('<tr><td>Free Memory:</td><td>&nbsp; ' + scaleSize(sysinfo.totalfreeram) + ' &nbsp; <small>(aprox. size that can be buffered completely in RAM)</small></td></tr>');
		</script>
		</table>

	</div>
</div>

/* JFFS2-BEGIN */
<div class='note-disabledw' style='display:none' id='jwarn'>
<b>Cannot upgrade if JFFS is enabled.</b><br><br>
An upgrade may overwrite the JFFS partition currently in use. Before upgrading,
please backup the contents of the JFFS partition, disable it, then reboot the router.<br><br><br>
<a href='admin-jffs2.asp'>Disable &raquo;</a>
</div>
/* JFFS2-END */

<div id='afu-progress' style='display:none;margin:auto'>
	<img src='spin.gif' style='vertical-align:baseline'> <span id='afu-time'>0:00</span><br>
	Please wait while the firmware is uploaded &amp; flashed.<br>
	<b>Warning:</b> Do not interrupt this browser or the router!<br>
</div>

<!-- / / / -->

<div id='footer'></div>
		</div><!--/row-->
        </div><!--/span-->
      </div><!--/row-->
      <hr>
      <footer>
        <p>&copy; Tomato 2012</p>
      </footer>
    </div><!--/.fluid-container-->
    /* JFFS2-BEGIN */
<script type='text/javascript'>
if (nvram.jffs2_on != '0') {
	E('jwarn').style.display = '';
	E('afu-input').style.display = 'none';
}
</script>
/* JFFS2-END */
</body>
</html>
