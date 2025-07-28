/**
 * Web entry point for React Native WebView
 */

import React from 'react';
import { AppRegistry } from 'react-native';
import App from './AppWorking';

// Register the app
AppRegistry.registerComponent('Bife', () => App);

// For web rendering
if (typeof document !== 'undefined') {
  AppRegistry.runApplication('Bife', {
    rootTag: document.getElementById('react-root')
  });
}
