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

function getProducts(parsedProject) {
  return parsedProject
    .pbxGroupByName('Products')
    .children
    .map(c => c.comment)
    .filter(c => c.indexOf('.a') > -1);
}

/*
 *  Then we should do something like a transaction:
 *  If one operation fails, all operations should be rollback
*/
module.exports.addDependency = function(dependency/*: DependencyOptions*/)/*: void*/ {

  console.log('add', dependency.depProject, 'to', dependency.targetProject);
  const targetProjectPath = dependency.targetProject + '/project.pbxproj';
  const parsedTarget = xcode.project(targetProjectPath).parseSync();
  const parsedDependency = xcode.project(getDepPath(dependency)).parseSync();
  const pbxGroup = parsedTarget.pbxGroupByName('Libraries');

  if (pbxGroup.children.filter(c => c.comment.indexOf(dependency.depProject.split('/').slice(-1)[0]) > -1).length > 0) {
    console.log(dependency.depProject, 'already installed!');
    return;
  }

  const products = getProducts(parsedDependency);

  var file = new pbxFile(dependency.depProject);
  file.uuid = parsedTarget.generateUuid();
  file.fileRef = parsedTarget.generateUuid();
  parsedTarget.addToPbxFileReferenceSection(file);    // PBXFileReference
  pbxGroup.children.push(pbxGroupChild(file));

  products.forEach(p => parsedTarget.addStaticLibrary(p));
  fs.writeFileSync(targetProjectPath, parsedTarget.writeSync());
}

module.exports.removeDependency = function(dependency/*: DependencyOptions*/)/*: void*/  {
  console.log('remove', dependency.depProject, 'from', dependency.targetProject);
  const targetProjectPath = dependency.targetProject + '/project.pbxproj';
  const parsedTarget = xcode.project(targetProjectPath).parseSync();
  const parsedDependency = xcode.project(getDepPath(dependency)).parseSync();
  const refSection = parsedTarget.pbxFileReferenceSection();
  const pbxGroup = parsedTarget.pbxGroupByName('Libraries');
  //console.log(refSection)

  const fileKey = Object.keys(refSection)
    .filter(k => refSection[k].path && refSection[k].path.indexOf(dependency.depProject) > -1);

  if (!fileKey || fileKey.length === 0) {
    console.log('Nothing to remove');
    return;
  }

  const file = refSection[fileKey[0]];
  file.basename = path.basename(file.path);

  // remove PBXFileReference & static refs
  parsedTarget.removeFromPbxFileReferenceSection(file);
  const products = getProducts(parsedDependency);
  products.forEach(p => parsedTarget.removeFromPbxFileReferenceSection(new pbxFile(p)));
  products.forEach(p => parsedTarget.removeFromPbxFrameworksBuildPhase(new pbxFile(p)));
  products.forEach(p => parsedTarget.removeFromPbxBuildFileSection(new pbxFile(p)));

  // remove from Libraries pbxGroup
  pbxGroup.children = pbxGroup.children.filter(c => c.comment.indexOf(dependency.depProject.split('/').slice(-1)[0]) === -1);

  fs.writeFileSync(targetProjectPath, parsedTarget.writeSync());
}

function pbxGroupChild(file) {
    const obj = Object.create(null);
    obj.value = file.fileRef;
    obj.comment = file.basename;
    return obj;
}

function removeContainerItem(project) {
  console.log(project.hash.project.objects['PBXContainerItemProxy']);
}
