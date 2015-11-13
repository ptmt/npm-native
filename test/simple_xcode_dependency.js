import test from 'ava';
import childProcess from 'child_process';

test('Build without added dependency should fail', t => {
  childProcess.exec('./objc_test.sh', (error, stdout, stderr) => {
    t.is(error, null);
    t.is(stderr, null);
    t.is(stdout.indexOf('Couldn't find element with text 'GL_VIEW') > -1, true);
    t.end();
  });

});

test('If we add required dependency then build should passed', t => {
    // add dependency
    // check if build is ok

    // remove dependency
    t.pass();
    t.end();
});
