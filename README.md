

EasyTomato
==========



Ubuntu 12.04
------------

Setup the environment.

    sudo apt-get install git-core libncurses5 libncurses5-dev m4 bison gawk flex libstdc++6-4.4-dev g++-4.4 g++ git zlib1g-dev

If running a 64 bit OS, you'll need the 32 bit build tools:
    sudo apt-get install libc6-i386 lib32z-dev


    git clone git@github.com:ReliefLabs/EasyTomato.git


    sudo ln -s $HOME/EasyTomato/tools/brcm /opt/brcm

    echo "export PATH=$PATH:/opt/brcm/hndtools-mipsel-linux/bin:/opt/brcm/hndtools-mipsel-uclibc/bin" >> ~/.profile

    source ~/.profile


Build the firmware

	cd ~/EasyTomato/release/src-rt

	make r2nc V1=<build> V2=<optional-suffix>

V1 and V2 specify build number and an extra suffix. Both are optional.