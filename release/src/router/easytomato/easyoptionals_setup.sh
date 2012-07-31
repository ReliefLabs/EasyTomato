#!/bin/sh

# First, move the mount from the default mounting point of /tmp/mnt/sda1 to /easytomato/easyoptionals
mount -O move /dev/sda1 /easytomato/easyoptionals

# Next, start up squid
/easytomato/easyoptionals/etc/start_squid


