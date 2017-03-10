const spawnHandler = require('spawnHandler');
const roles = require('roles');

module.exports.run = function(base){

  //Run spawn handler for base
  spawnHandler.run(base);

  //Run the path generator for sources and the controller

  // Run creep roles for each creep type
  for (let creepType in base.creeps){
    // Remove all 'dead' creeps from the list
    base.creeps[creepType] = base.creeps[creepType].filter(function( obj ) {
      return obj !== 'dead';
    });
    for (let i in base.creeps[creepType]){
      let creep = Game.getObjectById(creepType[i]);
      if (creep == undefined){
        base.creeps[creepType][i] = 'dead';
        continue
      }
      roles[creep.memory.role].run(creep);
    }
  },

  drawPaths = function(){

  }


};
