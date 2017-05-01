var fs = require('fs');
var files = fs.readdirSync('assets/yarn/');
var dialogueSet = {};
var fileCount = 0;

for (var i = 0; i < files.length; i ++) {
  var name = files[i].split('.json')[0];
  if (name !== 'complete') {
    _read(name, i);
  }
}

function _read(name, i) {
  fs.readFile('assets/yarn/' + name + '.json', 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    dialogueSet[name] = JSON.parse(data);
    fileCount ++;
    if (fileCount === files.length) {
      _write();
    }
  });
}

function _write() {
  var module = 'define([], function (){ var dialogue = ' +
               JSON.stringify(dialogueSet) + '; return dialogue; });';
  fs.writeFile('src/services/dialogue/completeDialogueSet.js', module, _fin);
  function _fin(err) {
      if(err) {
          return console.log(err);
      }
      console.log("All dialogues have been compiled to the completeDialogueSet service.");
  }
}
