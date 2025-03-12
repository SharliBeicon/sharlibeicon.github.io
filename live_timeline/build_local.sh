#!/bin/zsh

if [ $# -lt 1 ]; then
  echo "Usage: $0 [OPTION]"
  echo "Options: "
  echo "  - web: Compile to wasm and place the output files into Lume assets folder"
  echo "  - desktop: Compile desktop app to the current target"
  echo "  - run: Run app"
  exit 1
fi

if [[ "${1:u}" == "WEB" ]]; then
  zig build -Dtarget=wasm32-emscripten --sysroot ~/Developer/sources/emsdk/upstream/emscripten
  rm zig-out/htmlout/index.html
  mv zig-out/htmlout/* ../src/assets/static
elif [[ "${1:u}" == "DESKTOP" ]]; then
  zig build install
elif [[ "${1:u}" == "RUN" ]]; then
  zig build run
else
  echo "Command unknown"
fi

