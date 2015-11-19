# npm-native
Just do `npm install react-native-yourplugin`.

[![Build Status](https://travis-ci.org/ptmt/npm-native.svg)](https://travis-ci.org/ptmt/npm-native)

## Usage

`package.json`:

```
{
  "scripts" :
  {
    "postinstall" : "npm-native --install path_to_lib.xcodeproj",
    "uninstall" : "npm-native --uninstall path_to_lib.xcodeproj"
  }
}
```
`--path_to_lib` - where your XCode project is placed.

## TODO

-[] Validate the final xcodeproj file and if it fails rollback it to the previous state;
-[] Allow to copy resources like font files;
-[] Android support;

## Plugins includes npm-native

Nothing here.
