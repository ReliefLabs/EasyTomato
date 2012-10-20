Set up Git:
1) Create an rsa public/private key pair to use with github
       - ssh-keygen <enter>
       - Accept defaults, up to you if you want to password protect it (I don't usually)
       - cat ~/.ssh/id_rsa.pub <enter>
       - Copy the output from the above command and set it up as a public key in your Github account settings
2) sudo apt-get install git
3) git clone git@github.com:ReliefLabs/EasyTomato.git
       - This will copy the entire repository down to your development machine

Set up all the dependencies needed to build TomatoUSB/EasyTomato:
1) sudo apt-get install libncurses5 libncurses5-dev m4 bison gawk flex libstdc++6-4.4-dev g++-4.4 g++ git zlib1g-dev
2) If running a 64 bit OS, you'll need the 32 bit build tools:
       - sudo apt-get install libc6-i386 lib32z-dev
3) sudo ln -s $HOME/EasyTomato/tools/brcm /opt/brcm
4) echo "export PATH=$PATH:/opt/brcm/hndtools-mipsel-linux/bin:/opt/brcm/hndtools-mipsel-uclibc/bin" >> ~/.profile
5) source ~/.profile

Build the firmware image:
1) cd ~/EasyTomato/release/src
2) make <target> V1=# V2=<name>
       - I think it should be "make s V1=0 V2=ALPHA" (the "s" is the important thing)
