#!/bin/sh

EASYOPT_FILE=EasyOptionals_ALPHA_0.1.tar.gz

# Unmount the drive if it was already mounted
umount /dev/sda1
umount /dev/sda2
umount /dev/sda3
umount /dev/sda4

# First, partition the drive
echo "d
1
d
2
d
3
d
4
n
p
1


a
1
w
" | fdisk /dev/sda

# Format the first partition (/dev/sda1)
mkfs.ext3 -L EasyOptionals /dev/sda1

# Do a mount of the newly created file systems here
umount /dev/sda1
mount -t ext3 -w /dev/sda1 /easytomato/easyoptionals

# Download the easyoptionals.tar.gz package from some webserver
cd /easytomato/easyoptionals
wget http://dl.dropbox.com/u/91016047/Squid%20Tar/$EASYOPT_FILE

# Extract the easyoptionals.tar.gz package to /easytomato/easyoptionals/
tar -xzf $EASYOPT_FILE
rm $EASYOPT_FILE
