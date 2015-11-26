`npm install react-native-plugin` coming back to React Native.

[![Build Status](https://travis-ci.org/ptmt/npm-native.svg)](https://travis-ci.org/ptmt/npm-native)
[![npm version](https://badge.fury.io/js/npm-native.svg)](https://badge.fury.io/js/npm-native)

**This is Obsolete** See https://github.com/rnpm/rnpm


## Usage

Add `npm-native` and two simple hooks to plugin's `package.json`:

```
{
  "scripts" :
  {
    "postinstall" : "npm-native --install path_to_lib.xcodeproj",
    "uninstall" : "npm-native --uninstall path_to_lib.xcodeproj"
  },
  dependencies: {
    "npm-native": "0.1.x"
  }
}
```
`--path_to_lib` — where your XCode project is placed.
E.g. `npm-native --install RNGL.xcodeproj` for `gl-react-native`.

## TODO

- [x] Backup before modify .pbxproj;

- [ ] Validate the final .pbxproj file and if it fails rollback it to the previous state;

- [ ] Allow to copy resources like font files;

- [ ] Android projects support;

## Plugins includes npm-native

Nothing here yet :(
