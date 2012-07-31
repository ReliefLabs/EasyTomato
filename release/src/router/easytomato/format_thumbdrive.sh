#!/bin/sh

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

+13000M
n
p
2


a
1
w
" | fdisk /dev/sda

# Second, format the first partition (/dev/sda1)
mkfs.ext3 /dev/sda1

# Third, format the second partition (/dev/sda2)
mkfs.vfat /dev/sda2


# Do a mount of the newly created file systems here


# Download the easyoptionals.tar.gz package from some webserver

# Extract the easyoptionals.tar.gz package to /easytomato/easyoptionals/

