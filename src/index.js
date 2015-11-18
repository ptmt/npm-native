/* @flow */

var xcode = require('xcode');
var pbxFile = require('xcode/lib/pbxFile');
var fs = require('fs');
var path = require('path');
// import xcode from 'xcode';
// import fs from 'fs';

/*::
type XCodeProjectPath = string;
type DependencyOptions = {
  targetProject: XCodeProjectPath,
  DependencyOptions:
  dependencyProject: XCodeProjectPath
}

type PbxFile = any;
*/

/*
 *  Firstly we should find xcode project.
 *  Should we do it recursively?
 *  What if there are more than one instance?
 */
function findTargetProject()/*: XCodeProjectPath*/ {
  return '';
}

function getDepPath(dependency/*: DependencyOptions*/) {
  return dependency.targetProject.split('/').slice(0, -1).join('/') + '/' +
    dependency.depProject + '/project.pbxproj';
}

/*
 *  Then we should do something like a transaction:
 *  If one operation fails, all operations should be rollback
*/
module.exports.addDependency = function(dependency/*: DependencyOptions*/)/*: void*/ {
  //const { targetProject, dependencyProject } = dependency;
  const targetProjectPath = dependency.targetProject + '/project.pbxproj';
  const parsedTarget = xcode.project(targetProjectPath).parseSync();
  const parsedDependency = xcode.project(getDepPath(dependency)).parseSync();
  const pbxGroup = parsedTarget.pbxGroupByName('Libraries');

  if (pbxGroup.children.filter(c => c.comment.indexOf(dependency.depProject.split('/').slice(-1)[0]) > -1).length > 0) {
    console.log(dependency.depProject, 'already installed!');
    return;
  }

  const products = parsedDependency
    .pbxGroupByName('Products')
    .children
    .map(c => c.comment)
    .filter(c => c.indexOf('.a') > -1);

  var file = new pbxFile(dependency.depProject);
  file.uuid = parsedTarget.generateUuid();
  file.fileRef = parsedTarget.generateUuid();
  parsedTarget.addToPbxFileReferenceSection(file);    // PBXFileReference
  pbxGroup.children.push(pbxGroupChild(file));

  console.log('Libraries:', parsedTarget.pbxGroupByName('Libraries'))

  products.forEach(p => parsedTarget.addStaticLibrary(p));

  console.log('Build phases:', parsedTarget.pbxFrameworksBuildPhaseObj());

  fs.writeFileSync(targetProjectPath, parsedTarget.writeSync());
}

module.exports.removeDependency = function(dependency/*: DependencyOptions*/)/*: void*/  {
  console.log('remove', dependency.depProject, 'from', dependency.targetProject);
  const targetProjectPath = dependency.targetProject + '/project.pbxproj';
  const parsedTarget = xcode.project(targetProjectPath).parseSync();
  const refSection = parsedTarget.pbxFileReferenceSection();
  console.log(refSection)
  const fileKey = Object.keys(refSection)
    .filter(k => refSection[k].path = dependency.depProject)[0]//parsedTarget.pbxFrameworksBuildPhaseObj().files[0];
  if (!fileKey) {
    return;
  }
  const file = refSection[fileKey];
  file.basename = path.basename(file.path);
  console.log('remove fileReference', file);

  // remove PBXFileReference & static
  parsedTarget.removeFromPbxFileReferenceSection(file);
  // parsedTarget.removeFromPbxBuildFileSection(file);        // PBXBuildFile
  // parsedTarget.removeFromPbxFrameworksBuildPhase(file);    // PBXFrameworksBuildPhase
  // parsedTarget.removeFromLibrarySearchPaths(file);

  console.log('Build phases:', parsedTarget.pbxFrameworksBuildPhaseObj());
  fs.writeFileSync(targetProjectPath, parsedTarget.writeSync());
}

function pbxGroupChild(file) {
    const obj = Object.create(null);
    obj.value = file.fileRef;
    obj.comment = file.basename;
    return obj;
}

function removeStaticLibrary(xcode/*: any*/, file/*:PbxFile */, opt/*:any */) {
    opt = opt || {};

    xcode.removeFromPbxFileReferenceSection(file);
    xcode.removeFromPbxBuildFileSection(file);        // PBXBuildFile
    xcode.removeFromPbxFrameworksBuildPhase(file);    // PBXFrameworksBuildPhase
    xcode.removeFromLibrarySearchPaths(file);

    return file;
}
