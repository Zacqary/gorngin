define([
  'services/combatsystem/config',
  'services/combatsystem/enemySvc',
  'services/combatsystem/partySvc'
],
function(config, enemySvc, partySvc){
  var svc = {};

  svc.participantIndex = 0;

  svc.incrementParticipantIndex = function() {
    if (svc.participantIndex === svc.getCombatParticipants().length - 1) {
      svc.participantIndex = 0;
    } else {
      svc.participantIndex ++;
    }
    console.log('PARTICIPANT INDEX: ', svc.participantIndex);
  };

  svc.setParticipantIndex = function(i) {
    svc.participantIndex = i;
  };

  svc.dice = {
    sides: 6,
    roll: function () {
      var randomNumber = Math.floor(Math.random() * this.sides) + 1;
      return randomNumber;
    }
  };

  svc.getCombatParticipants = function() {
    return [].concat(app.enemyGroup.children).concat(partySvc.party);
  };

  svc.incrementActiveParticipant = function() {
    var participants = svc.sortCombatParticipantsBySpeed();
    console.log('SET ACTIVE PARTICIPANT', participants[svc.participantIndex].statevars.id);
    config.set('activeParticipant',
               (participants[svc.participantIndex].statevars.id));
    svc.incrementParticipantIndex();
  };

  svc.getActiveParticipant = function() {
    return config.activeParticipant;
  };

  svc.sortCombatParticipantsBySpeed = function() {
    var participants = svc.getCombatParticipants();
    console.log(participants);
    return participants.sort(function(a, b) {
      return (a.statevars.speed) + parseFloat(b.statevars.speed);
    });
  };

  svc.setStat = function(id, stat, value) {
    var participants = svc.getCombatParticipants();
    for (var i = 0; i < participants.length; i ++) {
      if (participants[i].statevars.id === id) {
        if (participants[i].statevars.type == 'party') {
          partySvc.setStat(id, stat, value);
        } else {
          svc.setEnemyStat(id, stat, value);
        }
      }
    }
  };

  svc.setEnemyStat = function(id, stat, value) {
    console.log('CALL SET ENEMY STAT');
    for (var i = 0; i < app.enemyGroup.children.length; i ++) {
      if (app.enemyGroup.children[i].statevars && app.enemyGroup.children[i].statevars.id === id) {
        app.enemyGroup.children[i].statevars[stat] = value;
      }
    }
  };

  svc.getAttackValue = function(attackerId, victimId) {
    var numerator = 70/svc.dice.roll();
    var attacker = svc.getStats(attackerId);
    var victim = svc.getStats(victimId);
    var attackValue = Math.round((attacker.strength * victim.defense)/numerator);
    return attackValue;
  };

  svc.getVictimNewHp = function(victimId, attackValue) {
    var victim = svc.getStats(victimId);
    var newHp = victim.hp - attackValue <= 0 ? 0 : victim.hp - attackValue;
    return newHp;
  };

  svc.attack = function(attackerId, victimId, attackValue) {
    var attackValueNew = attackValue ? attackValue : svc.getAttackValue(attackerId, victimId);
    var victim = svc.getStats(victimId);
    var newHp = victim.hp - attackValueNew <= 0 ? 0 : victim.hp - attackValueNew;
    svc.setStat(victimId, 'hp', newHp);
    if (newHp === 0) {
      svc.kill(victimId);
      return 'killed';
    }
  };

  svc.kill = function(id) {
    if (svc.getStats(id).type === 'enemy') {
      var i = enemySvc.getEnemyIndex(id);
      game.add.tween(app.enemyGroup.getChildAt(i)).to({alpha: 0}, 700,
                                  Phaser.Easing.Linear.None, true);
      svc.setStat(id, 'alive', false);
    }
  };

  svc.allEnemiesDead = function() {
    for (var k = 0; k < app.enemyGroup.children.length; k ++) {
      console.log(app.enemyGroup.children[k].statevars.id, ': ',
                  app.enemyGroup.children[k].statevars.alive);
      if (app.enemyGroup.children[k].statevars.alive) {
        return false;
      }
    }
    return true;
  };

  svc.getStats = function(id) {
    if (partySvc.getStats(id)) {
      return partySvc.getStats(id).statevars;
    }

    for (var k = 0; k < app.enemyGroup.children.length; k ++) {
      if (app.enemyGroup.children[k].statevars && app.enemyGroup.children[k].statevars.id === id) {
        return app.enemyGroup.children[k].statevars;
      }
    }
  };

  return svc;

});
