const bodies = require('bodies');

module.exports = {
  ERRORS: [-1, -3, -4, -6, -10, -14],

  run: function(base){
    if (base.counter == undefined){
      base.counter = 0;
    }

    let report = false;


    //Select the first availible spawn in the base (Magic?)
    let spawnId = _.first(_.filter(base.structures.spawn, s => Game.getObjectById(s).spawning == undefined));
    let spawn = Game.getObjectById(spawnId);
    if (spawn == undefined){
      return
    }
    //end magic


    // Guards
    if (base.level > 1){
      for (let i in base.rooms){
        if (base.rooms[i].underAttack == true && base.creeps.guard.length < 3){
          this.spawnGuard(base, spawn, i);
          if (report){console.log(base.mainRoom + ' ' + spawn.name + ' Guard');}
          return
        }
      }
    }

    // Bootstrappers
    if (base.level == 1 || (base.creeps.harv.length == 0 && base.creeps.boot.length < 2*base.sources.length) || base.creeps.haul.length == 0){
      for (let i in base.sources){
        let source = base.sources[i];
        if (source.isMineral == true){
          continue
        }
        for (let j in source.boots){
          if (Game.creeps[source.boots[j]] == undefined){
            source.boots.splice(j,1);
          }
        }
        if (source.boots.length < 2){
          let result = this.spawnBoot(base, spawn, base.sources[i].id)
          if (result != undefined){
            source.boots.push(result);
          }
          if (report){console.log(base.mainRoom + ' ' + spawn.name + ' Boot');}
          return
        }
      }
    }

    // Helpers to construct new bases
    if (base.helpRoom != undefined){
      let helpBase = Memory.Empire.bases[base.helpRoom];
      if (helpBase != undefined && helpBase.structures.spawn.length == 0){
        for (let i in helpBase.sources){
          let source = helpBase.sources[i];
          for (let j in source.boots){
            if (Game.creeps[source.boots[j]] == undefined){
              source.boots.splice(j,1);
            }
          }
          if (source.boots.length < 2){
            let result = this.spawnBoot(helpBase, spawn, helpBase.sources[i].id)
            if (result != undefined){
              source.boots.push(result);
            }
            if (report){console.log(base.mainRoom + ' ' + spawn.name + ' Helper');}
            return
          }
        }
      }
    }

    // Harvesters
    if (base.level > 1 && base.creeps.harv.length < base.sources.length){
      for (let i in base.sources){
        let source = base.sources[i];
        if (Game.getObjectById(source.id) == undefined || Game.getObjectById(source.id).ticksToRegeneration > 0){
          continue
        }
        if (Game.creeps[source.harv] == undefined){
          let result = this.spawnHarv(base, spawn, base.sources[i].id);
          if (result != undefined){
            source.harv = result;
          }
          if (report){console.log(base.mainRoom + ' ' + spawn.name + ' Harv');}
          return
        }
      }
    }

    // Haulers
    if (base.level > 1){
      for (let i in base.sources){
        let source = base.sources[i];
        if (Game.getObjectById(base.sources[i].container) == undefined){
          continue;
        }
        let hauls = getCreepList(source.hauls);
        let totalCARRY = 0;
        for (let j in hauls){
          for (let k in hauls[j].body){
            if (hauls[j].body[k].type == CARRY){
              totalCARRY += 1;
            }
          }
        }
        if (totalCARRY < source.neededCARRY){
          let carryDeficite = source.neededCARRY - totalCARRY;
          let result = this.spawnHaul(base, spawn, source, carryDeficite);
          if (result != undefined){
            source.hauls.push(result);
          }
          if (report){console.log(base.mainRoom + ' ' + spawn.name + ' Haul');}
          return
        }
      }
    }

    // Gophers
    if (base.structures.storage.length > 0 && base.creeps.gopher.length < 2){
      this.spawnGopher(base, spawn);
      if (report){console.log(base.mainRoom + ' ' + spawn.name + ' Gopher');}
      return
    }

    //Scouts
    for (let i in base.rooms){
      if (base.rooms[i].scouted == false){
        let hasCreep = false;
        for (let j in base.creeps.scout){
          let scout = Game.creeps[base.creeps.scout[j]]
          if (scout.memory.room == i){
            hasCreep = true;
            break;
          }
        }
        if (hasCreep == false){
          this.spawnScout(base, spawn, i);
          if (report){console.log(base.mainRoom + ' ' + spawn.name + ' Scout');}
          return
        }
      }
    }

    // Claimers
    if (base.level >= 3){
      let claimers = getCreepList(base.creeps.claim);
      for (let i in base.rooms){
        if (i == base.mainRoom){
          continue
        }
        let hasClaimer = false;
        for (let j in claimers){
          if (claimers[j].memory.room == i){
            hasClaimer = true;
            break
          }
        }
        if (hasClaimer == false){
          this.spawnClaimer(base, spawn, i);
          if (report){console.log(base.mainRoom + ' ' + spawn.name + ' Claimer');}
          return
        }
      }
    }

    // Settlers
    if (base.level >= 3 && base.settleRoom != undefined){
      this.spawnSettler(base, spawn, base.settleRoom);
      if (report){console.log(base.mainRoom + ' ' + spawn.name + ' Settler');}
      return
    }


    //Upgraders
    if (base.creeps.upgr.length < 2){
      this.spawnUpgr(base, spawn);
      if (report){console.log(base.mainRoom + ' ' + spawn.name + ' Upgrader');}
      return
    }

    // Builders
    if ((base.structures.constructionSites.length > 0 || base.structures.repairTargets.length > 0) && base.creeps.build.length < 2){
      this.spawnBuild(base, spawn);
      if (report){console.log(base.mainRoom + ' ' + spawn.name + ' Builder');}
      return
    }

    // Lab Rats
    if (base.structures.terminal.length > 0 && base.creeps.rat.length == 0){
      this.spawnRat(base, spawn);
      if (report){console.log(base.mainRoom + ' ' + spawn.name + ' Rat');}
      return
    }



  },

  spawnBoot: function(base, spawn, sourceId){
    let result = spawn.createCreep(bodies.boot, 'Boot ' + base.mainRoom + ' ' + base.counter, {role: 'boot', base: base.mainRoom, source: sourceId});
    if (!this.ERRORS.includes(result)){
      base.counter ++;
      base.creeps.boot.push(result);
      return result;
    }
    else if (result == -10){
      console.log('ERROR SPAWNING ' + base.mainRoom + ' ' + spawn.name + ' Boot');
    }
  },

  spawnHarv: function(base, spawn, sourceId){
    let harvBody = bodies.harv;
    let harvAddition = bodies.harvAddition;
    // If the base has enough energy, spawn a larger version of the harvester
    if (getBodyCost(harvBody.concat(harvAddition)) <= spawn.room.energyCapacityAvailable){
      harvBody = harvBody.concat(harvAddition);
    }
    let result = spawn.createCreep(harvBody, 'Harv ' + base.mainRoom + ' ' + base.counter, {role: 'harv', base: base.mainRoom, source: sourceId});
    if (!this.ERRORS.includes(result)){
      base.counter ++;
      base.creeps.harv.push(result);
      return result;
    }
    else if (result == -10){
      console.log('ERROR SPAWNING ' + base.mainRoom + ' ' + spawn.name + ' Harv');
    }
  },

  spawnHaul: function(base, spawn, source, carryDeficite){
    let haulBody = bodies.haulBase;
    let haulAddition = bodies.haulAddition;
    let totalCARRY = 0
    for (let i in haulBody){
      if (haulBody[i] == CARRY){
        totalCARRY ++;
      }
    }
    while (getBodyCost(haulBody.concat(haulAddition)) <= spawn.room.energyAvailable && carryDeficite > totalCARRY && haulBody.concat(haulAddition).length <= 50){
      haulBody = haulBody.concat(haulAddition);
      totalCARRY = 0;
      for (let i in haulBody){
        if (haulBody[i] == CARRY){
          totalCARRY ++;
        }
      }
    }
    let result = spawn.createCreep(haulBody, 'Haul ' + base.mainRoom + ' ' + base.counter, {role: 'haul', base: base.mainRoom, source: source.id});
    if (!this.ERRORS.includes(result)){
      base.counter ++;
      base.creeps.haul.push(result);
      return result;
    }
    else if (result == -10){
      console.log('ERROR SPAWNING ' + base.mainRoom + ' ' + spawn.name + ' Haul');
    }
  },

  spawnUpgr: function(base, spawn){
    let upgrBody = bodies.upgrBase;
    let upgrAddition = bodies.upgrAddition;
    while (getBodyCost(upgrBody.concat(upgrAddition)) <= spawn.room.energyAvailable && upgrBody.concat(upgrAddition).length <= 50){
      upgrBody = upgrBody.concat(upgrAddition);
    }
    let result = spawn.createCreep(upgrBody, 'Upgr ' + base.mainRoom + ' ' + base.counter, {role: 'upgr', base: base.mainRoom});
    if (!this.ERRORS.includes(result)){
      base.counter ++;
      base.creeps.upgr.push(result);
      return result;
    }
    else if (result == -10){
      console.log('ERROR SPAWNING ' + base.mainRoom + ' ' + spawn.name + ' Upgr');
    }
  },

  spawnScout: function(base, spawn, roomName){
    let result = spawn.createCreep(bodies.scout, 'Scout ' + base.mainRoom + ' ' + base.counter, {role: 'scout', base: base.mainRoom, room: roomName});
    if (!this.ERRORS.includes(result)){
      base.counter ++;
      base.creeps.scout.push(result);
      return result;
    }
    else if (result == -10){
      console.log('ERROR SPAWNING ' + base.mainRoom + ' ' + spawn.name + ' Scout');
    }
  },

  spawnBuild: function(base, spawn){
    let buildBody = bodies.buildBase;
    let buildAddition = bodies.buildAddition;
    while (getBodyCost(buildBody.concat(buildAddition)) <= spawn.room.energyAvailable && buildBody.concat(buildAddition).length <= 50){
      buildBody = buildBody.concat(buildAddition);
    }
    let result = spawn.createCreep(buildBody, 'Build ' + base.mainRoom + ' ' + base.counter, {role: 'build', base: base.mainRoom});
    if (!this.ERRORS.includes(result)){
      base.counter ++;
      base.creeps.build.push(result);
      return result;
    }
    else if (result == -10){
      console.log('ERROR SPAWNING ' + base.mainRoom + ' ' + spawn.name + ' Build');
    }
  },

  spawnGuard: function(base, spawn, targetRoom){
    let guardBase = bodies.guardBase;
    let guardAddition = bodies.guardAddition;
    let containsHeal = false;
    if (getBodyCost(guardBase.concat([HEAL, MOVE])) <= spawn.room.energyAvailable){
      guardBase.push(HEAL);
      containsHeal = true;
    }
    while (getBodyCost(guardBase.concat(guardAddition)) < spawn.room.energyAvailable && guardBase.concat(guardAddition).length <= 50){
      guardBase = guardBase.concat(guardAddition);
    }
    if (containsHeal == true){
      guardBase.splice(guardBase.indexOf(HEAL), 1);
      guardBase.push(HEAL);
    }
    let result = spawn.createCreep(guardBase, 'Guard ' + base.mainRoom + ' ' + base.counter, {role: 'guard', base: base.mainRoom, target: targetRoom});
    if (!this.ERRORS.includes(result)){
      base.counter ++;
      base.creeps.guard.push(result);
      return result;
    }
    else if (result == -10){
      console.log('ERROR SPAWNING ' + base.mainRoom + ' ' + spawn.name + ' Guard');
    }
  },

  spawnClaimer: function(base, spawn, room){
    let claimerBody = [MOVE, CLAIM];
    if (getBodyCost(claimerBody.concat([MOVE, CLAIM])) <= spawn.room.energyAvailable){
      claimerBody = claimerBody.concat([MOVE, CLAIM]);
    }
    let result = spawn.createCreep(claimerBody, 'Claim ' + base.mainRoom + ' ' + base.counter, {role: 'claim', base: base.mainRoom, room: room});
    if (!this.ERRORS.includes(result)){
      base.counter ++;
      base.creeps.claim.push(result);
      return result;
    }
    else if (result == -10){
      console.log('ERROR SPAWNING ' + base.mainRoom + ' ' + spawn.name + ' Claim');
    }
  },

  spawnSettler: function(base, spawn, room){
    let result = spawn.createCreep([MOVE, CLAIM], 'Settler ' + base.mainRoom + ' ' + base.counter, {role: 'settler', base: base.mainRoom, room: room});
    if (!this.ERRORS.includes(result)){
      base.counter ++;
      base.creeps.settler.push(result);
      base.settleRoom = undefined
      return result;
    }
    else if (result == -10){
      console.log('ERROR SPAWNING ' + base.mainRoom + ' ' + spawn.name + ' Settler');
    }
  },

  spawnGopher: function(base, spawn){
    let gopherBody = bodies.gopherBase;
    let addition = bodies.gopherAddition;
    while (getBodyCost(gopherBody) + getBodyCost(addition) <= spawn.room.energyAvailable && gopherBody.concat(addition).length <= 50){
      gopherBody = gopherBody.concat(addition);
    }
    let result = spawn.createCreep(gopherBody, 'Gopher ' + base.mainRoom + ' ' + base.counter, {role: 'gopher', base: base.mainRoom});
    if (!this.ERRORS.includes(result)){
      base.counter ++;
      base.creeps.gopher.push(result);
      return result;
    }
    else if (result == -10){
      console.log('ERROR SPAWNING ' + base.mainRoom + ' ' + spawn.name + ' Gopher');
    }
  },

  spawnRat: function(base, spawn){
    let ratBody = bodies.gopherBase;
    let addition = bodies.gopherAddition;
    while (getBodyCost(ratBody.concat(addition)) <= spawn.room.energyAvailable && ratBody.concat(addition).length <= 50){
      ratBody = ratBody.concat(addition);
    }
    let result = spawn.createCreep(ratBody, 'Rat ' + base.mainRoom + ' ' + base.counter, {role: 'rat', base: base.mainRoom});
    if (!this.ERRORS.includes(result)){
      base.counter ++;
      base.creeps.rat.push(result);
      return result;
    }
    else if (result == -10){
      console.log('ERROR SPAWNING ' + base.mainRoom + ' ' + spawn.name + ' Rat');
    }
  }

};
