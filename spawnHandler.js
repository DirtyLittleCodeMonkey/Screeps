module.exports = {
  run: function(base){
    const bodies = require('bodies');
    //Select the first availible spawn in the base (Magic?)
    let spawnId = _.first(_.filter(base.structures.spawns, s => Game.getObjectById(s).structureType == STRUCTURE_SPAWN && !Game.getObjectById(s).spawning));
    if (spawnId == undefined){
      return;
    }
    let spawn = Game.getObjectById(spawnId);
    //end magic


    if (base.creeps.harvs.length == 0){
      this.spawnHarv();
      return;
    }


  },

  spawnHarv: function(){
    harvBody = bodies.harvBase;
    harvAddition = base.harvAddition;
    counter = 0;
    while (calcBodyCost(harvBody) + calcBodyCost(harvAddition) < spawn.room.energyAvailable){
      counter ++;
      if (counter > 3){
        break;
      }
      harvBody.concat(harvAddition);
    }
    spawn.createCreep(harvBody, undefined, {role: 'harv', baseNum: base.baseNum});
  },

};
