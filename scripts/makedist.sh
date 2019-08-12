#!/bin/sh
set +x

DIRECTORY=`pwd`

mkdir -p $DIRECTORY/dist
cd $DIRECTORY/build/
zip -r $DIRECTORY/dist/dashboard-landing-page.zip .
cd ..
ls -l $DIRECTORY/dist/dashboard-landing-page.zip