#!/bin/bash

set -e

export REACT_PACKAGER_LOG="server.log"

function cleanup {
  echo "cleanup before exit"
  EXIT_CODE=$?
  set +e

  if [ $EXIT_CODE -ne 0 ];
  then
    WATCHMAN_LOGS=/usr/local/Cellar/watchman/3.1/var/run/watchman/$USER.log
    [ -f $WATCHMAN_LOGS ] && cat $WATCHMAN_LOGS

    [ -f $REACT_PACKAGER_LOG ] && cat $REACT_PACKAGER_LOG
  fi
  [ $SERVER_PID ] && kill -9 $SERVER_PID
}
trap cleanup EXIT

./ReactNativeTestApp/node_modules/react-native/packager/packager.sh --nonPersistent &
SERVER_PID=$!

xctool test \
  -project ReactNativeTestApp/ios/ReactNativeTestApp.xcodeproj \
  -scheme ReactNativeTestApp \
  -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 5,OS=9.1'
