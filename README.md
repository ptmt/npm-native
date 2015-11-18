# npm-native
Parse and modify `xcodeproj` files on-the-fly. Do `npm install react-native-yourplugin` and answer Y when it promted.
If something goes wrong, `xcodeproj` state would be rollback.

[![Build Status](https://travis-ci.org/ptmt/npm-native.svg)](https://travis-ci.org/ptmt/npm-native)

## Usage

`package.json`:

```
{ "scripts" :
  {
    "postinstall" : "npm-native install --path_to_lib.xpbproj",
    "uninstall" : "npm-native uninstall --path_to_lib.xpbproj"
  }
}
```
--path_to_lib - where your XCode project is placed.



## Plugins with support npm-native

There is no such.
