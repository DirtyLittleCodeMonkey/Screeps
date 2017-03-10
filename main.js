// Global require
require('require');

const baseHandler = require('baseHandler');

module.exports.loop = function(){

  //Dead Creep Memory Cleanup
  for(let i in Memory.creeps) {
    if(!Game.creeps[i]) {
      delete Memory.creeps[i];
    }
  }

  // If memory structure does not exist, reset with strucutre present
  if (Memory.Empire == undefined){
    resetMemory();
  }

  // Run the base handler for each base
  for (let i in Memory.Empire.bases){
    baseHandler(Memory.Empire.bases[i]);
  }

};
