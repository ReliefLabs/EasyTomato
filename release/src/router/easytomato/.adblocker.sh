#!/bin/sh
## ALL-U-NEED Ad Blocking v3.9e
## http://goo.gl/mhykQ
## Original script by YAQUI
## Updated by ~nephelim~, Syl, jochen, groosh, ng12345, ray123, mstombs
## base64 decoder by Danny Chouinard's

echo `cat /proc/uptime` >> /tmp/mylog
echo "Starting adblocker.sh \n" >> /tmp/mylog

sleep 10

echo `cat /proc/uptime` >> /tmp/mylog
echo "Checkpoint 1 adblocker.sh \n" >> /tmp/mylog

ADB="/tmp/ADBLOCK.sh"
{
cat <<'ENDF' >$ADB
#!/bin/sh

OPTIMISE="Y"
GETS="1 2 3 4"
TRIM_BEGIN=3
S1="http://pgl.yoyo.org/as/serverlist.php?hostformat=nohtml"  #44K
S2="http://mirror1.malwaredomains.com/files/justdomains"    #189K
S3="http://www.malwaredomainlist.com/hostslist/hosts.txt"   #97K
S4="http://winhelp2002.mvps.org/hosts.txt"              #620K
S5="http://hosts-file.net/hphosts-partial.asp"              #460K
S6="http://hostsfile.mine.nu/Hosts"                         #2641K
S7="http://support.it-mate.co.uk/downloads/hosts.txt"       #3851K

USEWHITELIST="Y" # N/Y/R for remote
WURL="http://example.com/whitelist.txt"
WHITE="intel.com"
BLACK=""

USEPIXELSERV="N"
PXL_IP=192.168.1.2
PXL_EXE="/tmp/pixelserv"
PXL_URL="http://example.com/pixelserv"

UPLOAD="N"
FTP_SERVER="example.com"
FTP_USER=""
FTP_PASS=""
FTP_PORT=21
FTP_PATH="/gen"

ADD_CONF="N"
USEHOSTS="N"
ROUTER="Y"

NIP="0.0.0.0"

ENDF
}

UPDATE="Y"
AUP() {
if [[ "$UPDATE" == "Y" ]] ; then
if [[ "$(cru l | grep AdUpd | cut -d '#' -f2)" != "AdUpd" ]] ; then
cru a AdUpd "0 4 * * * $ADB"
fi
fi
}

#### DO NOT EDIT BELOW ####

b64="openssl enc -base64 -d"
[[ "$(echo WQ==|$b64)" != "Y" ]] && b64="b64" 

b64(){
awk 'BEGIN{b64="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"}
{for(i=1;i<=length($0);i++){c=index(b64,substr($0,i,1));if(c--)
for(b=0;b<6;b++){o=o*2+int(c/32);c=(c*2)%64;if(++obc==8){if(o)
{printf"%c",o}else{system("echo -en \"\\0\"")}obc=o=0}}}}';}

{
cat <<'ENDF'| $b64 |gunzip >>$ADB
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
AocMj8rT81cK0v4De76CG9wPAAA=
ENDF
}

chmod 775 $ADB
$ADB
AUP
