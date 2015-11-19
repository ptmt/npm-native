#! /usr/bin/env node
const cli = require('cli');
const npmNative = require('./index');
const path = require('path');
const fs = require('fs');

cli.parse({
    install:   ['i', 'Install Xcode project', 'path', false],
    uninstall:   ['u', 'Uninstall Xcode project', 'path', false],
});

cli.main(function(args, options) {

    if (options.install || options.uninstall) {
      const targetProject = npmNative.findTargetProject(process.cwd() + '/../..'); // get back from node_modules
      if (!targetProject || targetProject.length === 0) {
        return this.fatal('target project can not be found');
      } else {
        this.debug(targetProject[0])
      }
      const depProject = process.cwd() + '/' + (options.install || options.uninstall);
      if (!fs.existsSync(depProject)) {
        return this.fatal((options.install || options.uninstall) + ' not found');
      }
      const targetProjectPath = path.normalize(targetProject[0]);
      this.debug('dirname=' + process.cwd());
      this.debug('targetProjectPath=' + targetProjectPath);
      this.debug('depProjectPath=' + depProject);
      if (options.install) {
        if (npmNative.addDependency({
          targetProject: targetProjectPath,
          depProject: depProject
        })) {
          this.ok('Successfully installed!')
        } else {
          this.info('Already installed')
        }
      } else {
        if (npmNative.removeDependency({
          targetProject: targetProjectPath,
          depProject: depProject
        })) {
          this.ok('Successfully uninstalled!')
        } else {
          this.info('Already uninstalled')
        }
      }

    } else {
      this.fatal('run npm-native --help');
    }

});
