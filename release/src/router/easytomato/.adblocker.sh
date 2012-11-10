#!/bin/sh
## ALL-U-NEED Ad Blocking v3.9e
## http://goo.gl/mhykQ
## Original script by YAQUI
## Updated by ~nephelim~, Syl, jochen, groosh, ng12345, ray123, mstombs
## base64 decoder by Danny Chouinard's


# EasyTomato Addition: Check an nvram variable named "adblock" to determine if we should run this at startup

if [ "$(nvram get adblock)" = "1" ]; then
    echo "Adblocking is enabled, starting it up..." >> /tmp/mylog
else
    echo "Adblocking script disabled via nvram variable: nvram get adblock=$(nvram get adblock)" >> /tmp/mylog
    exit
fi

echo `cat /proc/uptime` >> /tmp/mylog
echo "Starting .adblocker.sh" >> /tmp/mylog

sleep 10

echo `cat /proc/uptime` >> /tmp/mylog
echo "Checkpoint 1 .adblocker.sh" >> /tmp/mylog

UPDATE="Y"

##ADB="/easytomato/.adblocker.sh"

##AUP() {
##if [[ "$UPDATE" == "Y" ]] ; then
## if [[ "$(cru l | grep AdUpd | cut -d '#' -f2)" != "AdUpd" ]] ; then
## cru a AdUpd "0 4 * * * $ADB"
## fi
##fi
##}

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

USEPIXELSERV="Y"
PXL_IP=$(nvram get dhcpd_endip)
PXL_EXE="/easytomato/pixelserv"
PXL_OPT="-g /easytomto/adblock.gif"
PXL_URL=""

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

ARGS=$#
GEN="/tmp/gen"
TMP="/tmp/temp"
CONF="/tmp/conf"
HOSTS="/tmp/hosts"
WFILE="/tmp/white"



if [[ $ARGS != 0 ]] || [[ "$(ps | grep -e '--conf' | grep 'nobody')" == "" ]]; then
rm -f $GEN.md5
rm -f $GEN.last
fi



CLR() {
rm -f $GEN
rm -f $TMP
rm -f $CONF
rm -f $WFILE
}



PXL() {
if [[ "$USEPIXELSERV" == "Y" ]]; then
if [[ ! -x $PXL_EXE ]]; then
wget -O $PXL_EXE $PXL_URL
chmod +x $PXL_EXE
fi
ifconfig br0:0 $PXL_IP
if [[ "$(pidof pixelserv)" == "" ]]; then $PXL_EXE $PXL_IP $PXL_OPT; sleep 1 ; else  kill -SIGUSR1 $(pidof pixelserv); fi
if [[ "$(pidof pixelserv)" == "" ]]; then
logger ADBLOCK ERROR: cannot start pixelserv
else
eval "NIP=$PXL_IP"
fi
fi
}



NC() {
UNDEF=0
for i in $GETS; do 
eval url="\$S$i" 
P1=$(echo $url| sed 's|^http[s]*://[^/]*\(/.*\)$|\1|')
H1=$(echo $url| sed 's|^http[s]*://\([^/]*\)/.*$|\1|')
for x in 1 2 3; do
time=$(echo -e "HEAD $P1 HTTP/1.1\r\nHost: $H1\r\nConnection: close\r\n"|
nc -w 5 $H1 80|grep -i Last-Modified:|tr -d "\r")
if [ "$time" != "" ]; then break; fi
done
if [ "$time" == "" ]; then UNDEF=1; fi
echo $time>>$GEN.new
done

if [ $UNDEF -eq 1 ]; then rm -f $GEN.last; fi

if [ -f $GEN.last ]; then
MD1=$(md5sum $GEN.last|cut -d " " -f1) 
MD2=$(md5sum $GEN.new|cut -d " " -f1) 
if [ "$MD1" == "$MD2" ]; then
logger ADBLOCK: no changes since last time, exiting.
rm -f $GEN.new
exit
fi
fi
mv -f $GEN.new $GEN.last
}



TRIM() {
sed -ie '
s/\#.*$//
s/^127\.0\.0\.1[ \t]*//
s/[ \t]*$//
s/^::1[ \t]*//
s/localhost$//
/^$/d' $TMP
}



DS() {
for i in $GETS; do
eval url="\$S$i"
if wget $url -O - | tr -d "\r" > $TMP ; then
if [[ $i -ge $TRIM_BEGIN ]]; then TRIM ; fi
cat $TMP >> $GEN
logger ADBLOCK: $url
else
logger ADBLOCK ERROR: cannot get $url
fi
done
}



TST(){
MD5=$(md5sum $GEN|cut -d " " -f1)
if [[ -f $GEN.md5 ]] && [[ $MD5 == $(cat $GEN.md5) ]];  then
logger ADBLOCK: no changes since last time, exiting.
CLR; exit
else
echo $MD5>$GEN.md5
fi
}



LWHT() {
if [[ "$USEWHITELIST" == "Y" ]]; then
for site in $WHITE
do
sed -i "/$(echo $site|sed 's/\./\\./g')/d" $GEN
done
elif [[ "$USEWHITELIST" == "R" ]]; then 
if wget $WURL -O - | tr -d "\r" > $WFILE ; then
logger ADBLOCK: whitelist $WURL
sed -i -e '/\#.*$/ s/\#.*$//' -e '/^$/d' $WFILE
for site in $(cat $WFILE)
do
sed -i "/$(echo $site|sed 's/\./\\./g')/d" $GEN
done
else
logger ADBLOCK ERROR: cannot get whitelist $WURL
fi
fi
echo "$BLACK" |sed 's/[ \t]*/\n/g'|sed '/^$/d' >> $GEN
}



OPT() {
if [[ "$OPTIMISE" == "Y" ]]; then
logger ADBLOCK: sorting hosts...
if [[ "$USEHOSTS" == "Y" ]]; then
sort -u -o $TMP $GEN
else
awk -F '.' 'BEGIN{ORS=""}{for(i=NF;i>0;i--)print $i"#";print "\n"}' $GEN|sort|
awk -F '#' 'BEGIN{ORS="";d = "%"}{if(index($0,d)!=1&&NF!=0){d=$0;print $--NF;
for(i=--NF;i>0;i--)print "."$i;print "\n"}}' > $TMP
fi
logger ADBLOCK: hosts sorted.
fi
mv -f $TMP $GEN
}



CNT() {
TOT=$(wc -l < $GEN)
logger ADBLOCK: $TOT entries
}



FTPUP() {
if [[ "$UPLOAD" == "Y" ]]; then
if [[ "$ROUTER" == "Y" ]]; then
ftpput -u $FTP_USER -p $FTP_PASS -P $FTP_PORT $FTP_SERVER $FTP_PATH $GEN
else
ncftpput -u $FTP_USER -p $FTP_PASS -P $FTP_PORT $FTP_SERVER $FTP_PATH $GEN
fi
fi
}



FDNSM() {
if [[ "$USEHOSTS" == "Y" ]]; then
cp -f $GEN $HOSTS
chmod 644 $HOSTS
sed -i -e 's|^|'$NIP' |' $HOSTS
sed -i -e '1i127.0.0.1 localhost' $HOSTS
else
sed -i 's|^.*$|address=/&/'$NIP'|' $GEN
fi
}



LCFG() {
if [[ "$USEHOSTS" == "Y" ]]; then 
cat /etc/dnsmasq.conf >> $CONF
cat >> $CONF <<EOF
addn-hosts=/tmp/hosts
EOF
else
cat /etc/dnsmasq.conf >> $GEN
fi
}



ADDCFG() {
if [[ "$ADD_CONF" == "Y" ]]; then 
if [[ "$USEHOSTS" == "Y" ]]; then 
eval "CFG=$CONF"
else
eval "CFG=$GEN"
fi
cat >> $CFG <<EOF
dhcp-authoritative
cache-size=2048
log-async=5
EOF
fi
}



LBLK() {
service dnsmasq stop
if [[ "$USEHOSTS" == "Y" ]]; then 
dnsmasq --conf-file=$CONF
else
dnsmasq --conf-file=$GEN
fi
}



FS() { 
if ps | grep 'dnsmasq' | grep 'nobody' ; then 
logger ADBLOCK: dnsmasq is running
else
logger ADBLOCK ERROR: restarting dnsmasq...
dnsmasq
fi
}



CLR
PXL

NC
DS
TST
LWHT
CNT
OPT
CNT
FTPUP

if [[ "$ROUTER" == "Y" ]]; then
FDNSM
LCFG
ADDCFG
LBLK
FS
fi

CLR
AUP