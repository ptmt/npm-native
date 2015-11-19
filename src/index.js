/* @flow */

const xcode = require('xcode');
const pbxFile = require('xcode/lib/pbxFile');
const fs = require('fs');
const path = require('path');

/*::
  type XCodeProjectPath = string;
  type DependencyOptions = {
    targetProject: XCodeProjectPath,
    dependencyProject: XCodeProjectPath
  }

  type PbxFile = any;

*/

/*
 *  Firstly we should find xcode project.
 *  Should we do it recursively?
 *  What if there are more than one instance?
 */
module.exports.findTargetProject = function(startPath/*:string*/)/*: Array<XCodeProjectPath>*/ {
  const search = dir => {
    var results = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        const relative = file.replace(startPath, '');
        if (stat && stat.isDirectory()
        && relative.indexOf('node_modules') === -1
        && relative.indexOf('.git') === -1) {
          results = results.concat(search(file));
        } else {
          if (file.indexOf('.pbxproj') > -1) {
              results.push(dir);
          }
        }
    });
    return results;
  }
  return search(startPath); // TODO: more stable way
}

function getRelativeDepPath(dependency/*: DependencyOptions*/) {
  return path.relative(dependency.targetProject, dependency.depProject).slice(3); // remove ../
}

function getProducts(parsedProject)/*: Array<any> */ {
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
module.exports.addDependency = function(dependency/*: DependencyOptions*/)/*: boolean*/ {
  const targetProjectPath = dependency.targetProject + '/project.pbxproj';
  const parsedTarget = xcode.project(targetProjectPath).parseSync();
  const parsedDependency = xcode.project(dependency.depProject + '/project.pbxproj').parseSync();
  const pbxGroup = parsedTarget.pbxGroupByName('Libraries');

  if (pbxGroup.children.filter(c => c.comment.indexOf(dependency.depProject.split('/').slice(-1)[0]) > -1).length > 0) {
    return false;
  }

  fs.writeFileSync(targetProjectPath + '.backup', parsedTarget.writeSync());

  const products = getProducts(parsedDependency);

  var file = new pbxFile(getRelativeDepPath(dependency));
  file.uuid = parsedTarget.generateUuid();
  file.fileRef = parsedTarget.generateUuid();
  parsedTarget.addToPbxFileReferenceSection(file);    // PBXFileReference
  pbxGroup.children.push(pbxGroupChild(file));
  products.forEach(p => parsedTarget.addStaticLibrary(p));
  products.forEach(p => parsedTarget.addToPbxBuildFileSection(new pbxFile(p))); // why add this
  fs.writeFileSync(targetProjectPath, parsedTarget.writeSync());
  return true;
}

module.exports.removeDependency = function(dependency/*: DependencyOptions*/)/*: boolean*/  {
  const targetProjectPath = dependency.targetProject + '/project.pbxproj';
  const parsedTarget = xcode.project(targetProjectPath).parseSync();
  const parsedDependency = xcode.project(dependency.depProject + '/project.pbxproj').parseSync();
  const refSection = parsedTarget.pbxFileReferenceSection();
  const pbxGroup = parsedTarget.pbxGroupByName('Libraries');
  const relativePath = getRelativeDepPath(dependency);

  const fileKey = Object.keys(refSection)
    .filter(k => refSection[k].path && refSection[k].path.indexOf(relativePath) > -1);

  if (!fileKey || fileKey.length === 0) {
    return false;
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
  pbxGroup.children = pbxGroup.children.filter(c => c.comment.indexOf(relativePath.split('/').slice(-1)[0]) === -1);

  fs.writeFileSync(targetProjectPath, parsedTarget.writeSync());
  return true;
}

function pbxGroupChild(file) {
    const obj = Object.create(null);
    obj.value = file.fileRef;
    obj.comment = file.basename;
    return obj;
}
