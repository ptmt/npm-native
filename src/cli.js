#! /usr/bin/env node
const cli = require('cli');
const npmNative = require('./index');

cli.parse({
    install:   ['i', 'Install Xcode project', 'path', false],
    uninstall:   ['u', 'Uninstall Xcode project', 'path', false],
});

cli.main(function(args, options) {

    if (options.install || options.uninstall) {
      if (options.install) {
        const targetProject = npmNative.findTargetProject();
        console.log(targetProject);
        if (!targetProject || targetProject.length === 0) {
          return this.fatal('target project could not be found');
        } else {
          this.info(targetProject)
        }
        npmNative.addDependency({
          targetProject: targetProject,
          depProject: '../node_modules/' + options.install
        })
      }

    } else {
      this.fatal('run npm-native --help');
    }

});
