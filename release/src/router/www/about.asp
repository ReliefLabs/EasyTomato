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
<title>[<% ident(); %>] About</title>
<% include("common-header.html"); %>

<script type='text/javascript' src='tomato.js'></script>
<script type='text/javascript'>
//	<% nvram(''); %>	// http_id
</script>

<!-- / / / -->

</head>
<body onload='init()'>

<% include(header.html); %>

<div style='margin:30px 30px;font-size:14px;color:#555;'>
<b>EasyTomato Firmware Version 0.8</b><br>
<b>Proudly Based on Toastman's 1.28.0502.7 Tomato Release</b><br>
<br>
Based on TomatoUSB by Fedor Kozhevnikov<br>
- Linux kernel <% version(2); %> and Broadcom Wireless Driver <% version(3); %> updates<br>
- Support for additional router models, dual-band and Wireless-N mode.<br>
<!-- USB-BEGIN -->
- USB support integration and GUI,
<!-- USB-END -->
<!-- IPV6-BEGIN -->
IPv6 support
<!-- IPV6-END -->
<br>
Copyright (C) 2008-2011 Fedor Kozhevnikov, Ray Van Tassle, Wes Campaigne<br>
<a href='http://www.tomatousb.org/' target='_new'>http://www.tomatousb.org</a><br>
<br>
<div style='border-top:2px solid #e7e7e7;margin:1em 0;padding:1em 0;font-size:12px'>
</div>
<b>This compilation by Toastman may also include:</b><br>
<br>
<br>
<!-- OPENVPN-BEGIN -->
<b>OpenVPN integration and GUI</b><br>
Copyright (C) 2010 Keith Moyer<br>
<a href='mailto:tomatovpn@keithmoyer.com'>tomatovpn@keithmoyer.com</a><br>
<br>
<!-- OPENVPN-END -->
<b>"Teddy Bear" current features, notably:</b><br>
- USB Support, Samba, FTP, Media Servers<br>
- Web Monitor, Per-connection transfer rates<br>
- Additional ipv6 support in GUI, QOS, Conntrack<br>
<a href='http://www.linksysinfo.org/index.php?forums/tomato-firmware.33//' target='_new'>http://www.linksysinfo.org/index.php?forums/tomato-firmware.33/</a><br>
<br>
<b>"Victek RAF" features:</b><br>
- CPU Freq | Previous WAN IP<br>
- HFS/HFS+MAC OS x read support<br>
<!-- NOCAT-BEGIN -->
- Captive Portal (Based on NocatSplash) <br>
<!-- NOCAT-END -->
Copyright (C) 2007-2011 Vicente Soriano<br>
<!-- NOCAT-BEGIN -->
Captive Portal Copyright (C) 2011 Ofer Chen & Vicente Soriano<br>
<!-- NOCAT-END -->
<a href='http://victek.is-a-geek.com' target='_new'>http://victek.is-a-geek.com</a><br>
<br>
<b>"Shibby" features:</b><br>
- Custom log file path<br>
<!-- LINUX26-BEGIN -->
- SD-idle tool integration for kernel 2.6<br>
<!-- USB-BEGIN -->
- 3G Modem support (big thanks for @LDevil)<br>
<!-- USB-END -->
<!-- LINUX26-END -->
<!-- SNMP-BEGIN -->
- SNMP integration and GUI<br>
<!-- SNMP-END -->
Copyright (C) 2011 Michał Rupental<br>
<a href='http://openlinksys.info' target='_new'>http://openlinksys.info</a><br>
<br>
<!-- JYAVENARD-BEGIN -->
<b>"JYAvenard" Features:</b><br>
<!-- OPENVPN-BEGIN -->
- OpenVPN enhancements &amp; username/password only authentication<br>
<!-- OPENVPN-END -->
<!-- USERPPTP-BEGIN -->
- PPTP VPN Client integration and GUI<br>
<!-- USERPPTP-END -->
Copyright (C) 2010-2011 Jean-Yves Avenard<br>
<a href='mailto:jean-yves@avenard.org'>jean-yves@avenard.org</a><br>
<br>
<!-- JYAVENARD-END -->
<b>"Teaman" Features:</b><br>
- QOS-detailed & ctrate improved filters<br>
- Real-time bandwidth monitoring of LAN clients<br>
- Per-IP bandwidth monitoring of LAN clients [cstats v2]<br>
- IPTraffic conn/BW ratios graphs<br>
- Static ARP binding<br>
- CPU % usage<br>  
- Udpxy v1.0-Chipmunk-build 21<br>
<!-- VLAN-BEGIN -->
- Multiple LAN support integration and GUI<br>
- Multiple/virtual SSID support (experimental)<br>
<!-- VLAN-END -->
<!-- PPTPD-BEGIN -->
- PPTP VPN Server integration and GUI</a><br>
<!-- PPTPD-END -->
Copyright (C) 2011-2012 Augusto Bott<br>
<a href='http://code.google.com/p/tomato-sdhc-vlan/' target='_new'>http://code.google.com/p/tomato-sdhc-vlan/</a><br>
<br>
<b>"Tiomo" Features:</b><br>
- IMQ based QOS Ingress<br>
- Incoming Class Bandwidth pie chart<br>
Copyright (C) 2012 Tiomo<br>
<br>
<b>"Toastman" Features:</b><br>
- 250 entry limit in Static DHCP  & Wireless Filter<br>
- 500 entry limit in Access Restriction rules<br>
- Up to 80 QOS rules (all dependent on nvram <br>
- IMQ based QOS/Bandwidth Limiter<br>
- Configurable QOS class names<br>
- Comprehensive QOS rule examples set by default<br>
- TC-ATM overhead calculation - patch by tvlz<br>
- GPT support for HDD by Yaniv Hamo<br>
- Continuing IPv6 development by Kevin Darbyshire-Bryant<br>
Copyright (C) 2010-2012 Toastman<br>
<a href='http://www.toastmanfirmware.yolasite.com'>http://www.toastmanfirmware.yolasite.com</a><br>
<br>
Built on <% build_time(); %><br>
<br>
<b>If you enjoy this firmware, and would like to thank me for all the time I spent<br>
working on it, you can make a PayPal donation:</b>
<br>
<br>
<form action="http://toastmanfirmware.yolasite.com/donations.php" method="post">
<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit">
</form>
<br>
<br>
<div style='border-top:2px solid #e7e7e7;margin:1em 0;padding:1em 0;font-size:12px'>
</div>
<b>Based on Tomato Firmware v<% version(); %></b><br>
Copyright (C) 2006-2010 Jonathan Zarate<br>
<a href='http://www.polarcloud.com/tomato/' target='_new'>http://www.polarcloud.com/tomato/</a><br>
<br>
<!--

	Please do not remove or change the homepage link or donate button.

	Thanks.
	- Jon

-->

<form action="https://www.paypal.com/cgi-bin/webscr" method="post">
<input type="hidden" name="cmd" value="_s-xclick">
<input type="image" src="pp.gif" border="0" name="submit" alt="Donate">
<input type="hidden" name="encrypted" value="-----BEGIN PKCS7-----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-----END PKCS7-----">
</form>

<div style='border-top:2px solid #e7e7e7;margin:2em 0;padding:2em 0;font-size:12px'>
<b>Thanks to everyone who risked their routers, tested, reported bugs, made
suggestions and contributed to this project. ^ _ ^</b><br>
</div>

</div>

<!-- / / / -->
 </div><!--/span-->
      </div><!--/row-->

      <hr>

      <footer>
        <p>&copy; Tomato 2012</p>
      </footer>

    </div><!--/.fluid-container-->

</body>
</html>
