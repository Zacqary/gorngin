define([
    'gorngin/dialogue/config',
    'gorngin/combatsystem/combatVisualSvc',
    'gorngin/combatsystem/config',
    'gorngin/combatsystem/enemySvc',
    'gorngin/combatsystem/partySvc',
    'gorngin/combatsystem/weaponSvc',
    'gorngin/combatsystem/turnSvc',
    'gorngin/spriteClasses'
],
function (dialogueConfig, combatVisualSvc, combatConfig, enemySvc,
         partySvc, weaponSvc, turnSvc, spriteClasses){

  var svc = {};
  svc.combatMenuOpen = false;

  svc.config = {
    borderLeft: game.width - 130,
    borderTop: dialogueConfig.borderTop + 10
  };

  svc.getCombatDialogue = function(id) {
    if (turnSvc.allEnemiesDead()) {
      return svc.getVictoryDialogue();
    } else if (turnSvc.getStats(id).type === 'enemy') {
      return svc.getEnemyAttackDialogue(id);
    } else {
      return svc.getPartyDialogue(id);
    }
  };

  svc.getVictoryDialogue = function() {
    combatConfig.set('victory', true);
    var objectArray = [
      {
        "title": "init",
        "tags": '',
        "body": 'All enemies have been defeated.'
      }
    ];
    return objectArray;
  };

  svc.getEnemyAttackDialogue = function(id) {
    combatConfig.set('active', 'enemy');
    var attackerWeapon = turnSvc.getStats(id).weapon;
    var attackerName = turnSvc.getStats(id).name;
    var sound = weaponSvc.getWeapon(attackerWeapon).sound;
    var soundTag = sound ? 'sound-' + sound : '';
    var victimName = turnSvc.dice.roll() > 3 ? 'you' : 'Million';
    var victimId = turnSvc.dice.roll() > 3 ? 'you' : 'million';
    var attackValue = turnSvc.getAttackValue(id, victimId);
    var attackerIndex = enemySvc.getEnemyIndex(id);
    app.enemyGroup.getChildAt(attackerIndex).play('attack');
    turnSvc.attack(id, victimId);

    combatVisualSvc.addCombatBackgroundEffect('flashwhite');
    var objectArray = [
      {
        "title": "init",
        "tags": soundTag,
        "body": attackerName + ' attacked ' + victimName + ' for ' + attackValue + ' HP.'
      }
    ];
    return objectArray;
  };

  svc.endEnemyAttack = function(id, cb) {
    var attackerIndex = enemySvc.getEnemyIndex(id);
    app.enemyGroup.getChildAt(attackerIndex).play('default');
    cb();
  };

  svc.getPartyDialogue = function(id) {
    var portrait = turnSvc.getStats(id).portrait;
    var portraitTag = portrait ? 'p-' + portrait : '';
    var openMenuTag = 'event-open_stats_menu_for_' + id;
    app.stateManager.events[app.stateManager.currentState]['open_stats_menu_for_' + id] = function() {
      svc.createCombatMenu(id);
    };
    var dialogue = [{
        "title": "options",
        "tags": portraitTag + ',' + openMenuTag,
        "body": "[[Attack|attack]]\n\n[[Run|run]]"
      },
      {
        "title": "run",
        "tags": "event-endbattle",
        "body": "You successfully flee the battle."
      }
    ];
    var attackObjArray = svc.getAttackDialogueObjectArray(id);
    var dialogueConcat = dialogue.concat(attackObjArray);
    return dialogueConcat;
  };

  svc.getCharacterCombatStatStr = function(id) {
    var stats = turnSvc.getStats(id);
    var name = stats.name;
    var hp = stats.hp;
    var maxHP = stats.maxHP;
    var text = name + '\nHP: ' + hp + '/' + maxHP + '\n';
    text += stats.weapon ? 'Weapon: ' + stats.weapon : '';
    return text;
  };

  svc.getAttackDialogueOptions = function() {
    var options = '';
    if (app.enemyGroup) {
      for (var i = 0; i < app.enemyGroup.children.length; i ++) {
        var include = app.enemyGroup.getChildAt(i).statevars.include;
        var name = app.enemyGroup.getChildAt(i).statevars.name;
        if (include) {
          var id = app.enemyGroup.getChildAt(i).statevars.id = 'enemy_' + i;
          options += '[[' + name + '|' + id + ']]\n\n';
        }
      }
    }
    return options;
  };

  svc.getAttackDialogueObjectArray = function(id) {
    var attackerWeapon = turnSvc.getStats(id).weapon;
    var attackerName = turnSvc.getStats(id).name;
    var sound = weaponSvc.getWeapon(attackerWeapon).sound;
    var soundTag = sound ? 'sound-' + sound : '';
    var objectArray = [
      {
        "title": "attack",
        "tags": "",
        "body": svc.getAttackDialogueOptions(id)
      }
    ];
    if (app.enemyGroup) {
      for (var i = 0; i < app.enemyGroup.children.length; i ++) {
        var victimName = app.enemyGroup.getChildAt(i).statevars.name;
        var enemyId = app.enemyGroup.getChildAt(i).statevars.id;
        var eventId = 'attack_' + enemyId;
        var attackValue = turnSvc.getAttackValue(id, enemyId);
        var newHp = turnSvc.getVictimNewHp(enemyId, attackValue);
        var bodyText = attackerName + ' attacked ' + victimName + ' for ' +
                       attackValue + ' HP';
        if (newHp === 0) {
          bodyText += ' and vanquished ' + victimName + '.';
        } else {
          bodyText += '.';
        }
        app.stateManager.events[app.stateManager.currentState][eventId] = function() {
          turnSvc.attack(id, enemyId, attackValue);
          combatVisualSvc.addCombatBackgroundEffect('flashwhite');
          console.log(eventId);
        };
        objectArray.push({
          "title": enemyId,
          "tags": 'event-' + eventId + ',' + soundTag,
          "body": bodyText
        });
      }
    }
    return objectArray;
  };

  svc.closeCombatMenu = function(cb) {
    svc.combatMenuOpen = false;
    for (var i = 0; i < app.combatGroup.children.length; i ++) {
      if (app.combatGroup.getChildAt(i).key !== 'hpmenu') {
        app.combatGroup.getChildAt(i).kill();
        app.combatGroup.getChildAt(i).destroy();
      }
    }
    svc.hpmenu.play('close');
    svc.hpmenu.animations.currentAnim.onComplete.add(function() {
      app.combatGroup.callAll('kill');
      app.combatGroup.callAll('destroy');
      if (cb) {
        cb();
      }
    });
  };

  svc.createCombatMenu = function(participant) {
    var statText = '';
    app.combatGroup = game.add.group();
    svc.hpmenu = new spriteClasses.Sprite({
      x: 0,
      y: 0,
      img: 'hpmenu',
      animation: [
        {
          name: 'open',
          sequence: [0,1,2,3,4,5,6],
          speed: 20,
          play: false,
          loop: false
        },
        {
          name: 'close',
          sequence: [6,5,4,3,2,1,0],
          speed: 20,
          play: false,
          loop: false
        }
      ],
      disableAnimationForMobile: true,
      fixedToCamera: true,
      physics: 'ARCADE',
      collideWorldBounds: true,
      inputEnabled: false,
    });

    var _displayStatText = function() {
      svc.combatMenuOpen = true;
      statText += svc.getCharacterCombatStatStr(participant);

      app.combatGroup.add(game.add.text(svc.config.borderLeft, svc.config.borderTop, statText,
                        app.dialogueSvc.getStyle('stats')));
    };
    svc.hpmenu.play('open');
    svc.hpmenu.animations.currentAnim.onComplete.add(_displayStatText);

    app.combatGroup.add(svc.hpmenu);
  };

  return svc;

});
