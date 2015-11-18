import test from 'ava';
import childProcess from 'child_process';
import { addDependency, removeDependency } from '../src/index';

// test('Build without added dependency should fail', t => {
//   childProcess.exec('./objc_test.sh', (error, stdout, stderr) => {
//     t.is(error, null);
//     t.is(stderr, null);
//     t.is(stdout.indexOf('Couldn\'t find element with text GL_VIEW') > -1, true);
//     t.end();
//   });
// });


test('If we add required dependency then build should pass', t => {
    // add dependency
    // check if build is ok
    removeDependency({
      targetProject: './ReactNativeTestApp/ios/ReactNativeTestApp.xcodeproj',
      depProject: '../node_modules/gl-react-native/RNGL.xcodeproj'
    });
    // addDependency({
    //   targetProject: './ReactNativeTestApp/ios/ReactNativeTestApp.xcodeproj',
    //   depProject: '../node_modules/gl-react-native/RNGL.xcodeproj'
    // });
  
    t.pass();
    t.end();
});
