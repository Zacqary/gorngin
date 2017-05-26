define(['gorngin/dialogue/config',
        'gorngin/spriteClasses',
        'gorngin/combatsystem/combatDialogueSvc',
        'gorngin/combatsystem/turnSvc',
        'gorngin/combatsystem/combatVisualSvc',
        'gorngin/combatsystem/partySvc',
        'gorngin/combatsystem/config',
        'gorngin/audioSvc'
       ],
function(dialogueConfig, spriteClasses, combatDialogueSvc, turnSvc,
         combatVisualSvc, partySvc, combatConfig, audioSvc){
  var svc = {};

  app.enemyGroup = game.add.group();

  svc.initCombat = function() {
    var participant;

    if (!combatConfig.active) {
      app.stateManager.events[app.stateManager.currentState].endbattle = function() {
        svc.endCombat();
      };
      audioSvc.crossfadetrack('battle', 900);
      combatVisualSvc.createCombatBackground();
    }
    turnSvc.incrementActiveParticipant();
    participant = turnSvc.getActiveParticipant();
    combatConfig.set('active', true);
    svc.initCombatDialogue(participant);
  };

  svc.initCombatDialogue = function(participant) {
    var enemy = (turnSvc.getStats(participant).type === 'enemy');
    var initEl = enemy ? 'init' : 'options';
    var dialogue = combatDialogueSvc.getCombatDialogue(participant);
    app.dialogueSvc.initializeDialogue(dialogue, 'options', function() {
      if (combatConfig.victory) {
        svc.endCombat();
        combatConfig.set('victory', false);
        app.dialogueSvc.initializeDialogue(app.previousDialogue['elements'],
        null, app.previousDialogueCallback);
      } else if (enemy) {
        combatDialogueSvc.endEnemyAttack(participant, svc.initCombat);
      } else if (combatConfig.active) {
        svc.initCombat();
      }
    });
  };

  svc.endCombat = function() {
    audioSvc.crossfadetrack(audioSvc.previousTrack, 900);
    combatVisualSvc.addCombatBackgroundEffect('hide');
    if (combatDialogueSvc.combatMenuOpen) {
      combatDialogueSvc.closeCombatMenu();
    }
    turnSvc.setParticipantIndex(0);
    combatConfig.set('active', false);
  };

  return svc;
});
