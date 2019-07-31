#!/bin/sh
set +x

DIRECTORY=`pwd`

mkdir -p $DIRECTORY/dist
zip -r $DIRECTORY/dist/dashboard-landing-page.zip $DIRECTORY/build/*
ls -l $DIRECTORY/dist/dashboard-landing-page.zip