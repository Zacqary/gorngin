#!/bin/bash

if [ -d "./states/$1" ]; then
  echo "State '$1' already exists."
  exit 1
fi

cp ./assets/yarn/template.json ./assets/yarn/$1.json
cp -r ./src/states/template ./src/states/$1
mv ./src/states/$1/template.js ./src/states/$1/$1.js

find ./states/$1 -type f -print0 | xargs -0 sed -i '' "s/{{name}}/$1/g"
sed -i '' $"s/'states\/boot\/boot',/'states\/boot\/boot','states\/$1\/$1',/g" "./init.js"
sed -i '' $"s/boot,/boot,$1,/g" "./init.js"
sed -i '' $"s/game.state.start('boot')/game.state.add('$1', $1);game.state.start('boot')/g" "./init.js"
