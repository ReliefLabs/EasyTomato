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
<title>[<% ident(); %>] Advanced: Miscellaneous</title>

<% include("common-header.html"); %>


<script type='text/javascript' src='tomato.js'></script>

<!-- / / / -->

<script type='text/javascript' src='debug.js'></script>

<script type='text/javascript'>

//	<% nvram("t_features,wait_time,wan_speed,clkfreq,jumbo_frame_enable,jumbo_frame_size,ctf_disable"); %>

et1000 = features('1000et');

function verifyFields(focused, quiet)
{
	E('_jumbo_frame_size').disabled = !E('_f_jumbo_frame_enable').checked;
	return 1;
}

function save()
{
	var fom = E('_fom');
	fom.jumbo_frame_enable.value = E('_f_jumbo_frame_enable').checked ? 1 : 0;
/* CTF-BEGIN */
	fom.ctf_disable.value = E('_f_ctf_disable').checked ? 0 : 1;
/* CTF-END */

	if ((fom.wan_speed.value != nvram.wan_speed) ||
/* CTF-BEGIN */
	    (fom.ctf_disable.value != nvram.ctf_disable) ||
/* CTF-END */
	    (fom.jumbo_frame_enable.value != nvram.jumbo_frame_enable) ||
	    (fom.jumbo_frame_size.value != nvram.jumbo_frame_size)) {
		fom._reboot.value = '1';
		form.submit(fom, 0);
	}
	else {
		form.submit(fom, 1);
	}
}
</script>

</head>
<body>

    
<% include(header.html); %>


<!-- / / / -->
<form id='_fom' method='post' action='tomato.cgi'>
<input type='hidden' name='_nextpage' value='advanced-misc.asp'>
<input type='hidden' name='_reboot' value='0'>

<input type='hidden' name='jumbo_frame_enable'>
<!-- CTF-BEGIN -->
<input type='hidden' name='ctf_disable'>
<!-- CTF-END -->

<h3>Miscellaneous</h3>
<div class='section'>
<script type='text/javascript'>
a = [];
for (i = 3; i <= 20; ++i) a.push([i, i + ' seconds']);
createFieldTable('', [
	{ title: 'Boot Wait Time *', name: 'wait_time', type: 'select', options: a, value: fixInt(nvram.wait_time, 3, 20, 3) },
	{ title: 'WAN Port Speed *', name: 'wan_speed', type: 'select', options: [[0,'10Mb Full'],[1,'10Mb Half'],[2,'100Mb Full'],[3,'100Mb Half'],[4,'Auto']], value: nvram.wan_speed },
	{ title: 'CPU Frequency *', name: 'clkfreq', type: 'select', options: [['188,94'],['200,100'],['216,108'],['240,120'],['250,125'],['266,133'],['300,150,75'],['354,177,88'],['400,200,100'],['453,226,113'],['480,240,120'],['500,250,125'],['532,266,133'],['600,300,150']], value: nvram.clkfreq },

	null,

/* CTF-BEGIN */
	{ title: 'CTF (Cut-Through Forwarding)', name: 'f_ctf_disable', type: 'checkbox', value: nvram.ctf_disable != '1' },
	null,
/* CTF-END */

	{ title: 'Enable Jumbo Frames *', name: 'f_jumbo_frame_enable', type: 'checkbox', value: nvram.jumbo_frame_enable != '0', hidden: !et1000 },
	{ title: 'Jumbo Frame Size *', name: 'jumbo_frame_size', type: 'text', maxlen: 4, size: 6, value: fixInt(nvram.jumbo_frame_size, 1, 9720, 2000),
		suffix: ' <small>Bytes (range: 1 - 9720; default: 2000)</small>', hidden: !et1000 }

]);
</script>

<h3>Notes</h3>
	<ul>
	<li>CPU clock frequencies up to 266 are for older MIPSR1 routers, and set 2 parameters</li>
	<li>Frequencies above 266 are used for later models of router, and set 3 parameters</li>
	<li>You must reboot the router for the new CPU clock frequency to take effect</li>
	<li>Not all models support these options</li>
	</ul>

</div>

<span id='footer-msg'></span>
	<input type='button' value='Save' id='save-button' onclick='save()' class='btn'>
	<input type='button' value='Cancel' id='cancel-button' onclick='reloadPage();' class='btn'>
</form>

<!-- / / / -->

		</div><!--/span-->
      </div><!--/row-->
      <hr>
      <footer>
        <p>&copy; Tomato 2012</p>
      </footer>
    </div><!--/.fluid-container-->
<script type='text/javascript'>verifyFields(null, 1);</script>
</body>
</html>