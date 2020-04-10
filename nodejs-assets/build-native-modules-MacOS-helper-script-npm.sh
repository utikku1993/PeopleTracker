#!/bin/bash
      # Helper script for Gradle to call npm on macOS in case it is not found
      export PATH=$PATH:/Users/lexxtechnologies/.nvm/versions/node/v10.16.0/lib/node_modules/npm/node_modules/npm-lifecycle/node-gyp-bin:/Users/lexxtechnologies/Desktop/Projects/ComputingProject/FastFoodVisitCounterApp/node_modules/nodejs-mobile-react-native/node_modules/.bin:/Users/lexxtechnologies/Desktop/Projects/ComputingProject/FastFoodVisitCounterApp/node_modules/.bin:/Users/lexxtechnologies/.nvm/versions/node/v10.16.0/bin:/usr/local/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
      npm $@
    