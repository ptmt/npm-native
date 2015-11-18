import test from 'ava';
import childProcess from 'child_process';
import { addDependency, removeDependency } from '../src/index';

const targetProject = './ReactNativeTestApp/ios/ReactNativeTestApp.xcodeproj';
const depProject = '../node_modules/gl-react-native/RNGL.xcodeproj';

test.before(t => {
    removeDependency({
      targetProject,
      depProject
    });
    t.end();
});

test.after('cleanup', t => {
  removeDependency({
    targetProject,
    depProject
  });
    t.end();
});


test('Build without added dependency should fail', t => {
  childProcess.exec('./objc_test.sh', (error, stdout, stderr) => {
    t.is(error, null);
    t.is(stderr, null);
    t.is(stdout.indexOf('Couldn\'t find element with text GL_VIEW') > -1, true);
    t.end();
  });
});


test('If we add required dependency then build should pass', t => {
    // add dependency
    // check if build is ok
    addDependency({
      targetProject,
      depProject
    });
    childProcess.exec('./objc_test.sh', (error, stdout, stderr) => {
      t.is(error, null);
      t.is(stderr, null);
      t.is(stdout.indexOf('Couldn\'t find element with text GL_VIEW') === -1, true);
      t.end();
    });

});
