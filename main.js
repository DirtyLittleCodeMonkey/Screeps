const baseHandler = require('baseHandler');
const roles = require('roles');
// Global require
require('require');

//Profiler stuff
// Game.profiler.profile(ticks, [functionFilter]);
// Game.profiler.stream(ticks, [functionFilter]);
// Game.profiler.email(ticks, [functionFilter]);
// Game.profiler.background([functionFilter]);
// // Output current profile data.
// Game.profiler.output([lineCount]);
// // Reset the profiler, disabling any profiling in the process.
// Game.profiler.reset();
// Game.profiler.restart();

const profiler = require('screeps-profiler');
profiler.enable();

module.exports.loop = function(){
  profiler.wrap(function() {
      if (Memory.cpu == undefined){
        Memory.cpu = {average: 0, total: 0, ticks: 0,};
      }
      console.log('Tick ' + Game.time + ' | CPU average ' + Memory.cpu.average);
      //Dead Creep Memory Cleanup
      for(let i in Memory.creeps) {
        if(!Game.creeps[i]) {
          delete Memory.creeps[i];
        }
      }

      // If memory structure does not exist, reset with strucutre present
      if (Memory.Empire == undefined){
        initMemory();
      }

      // Run creep roles
      for (let i in Game.creeps){
        try{
          let creep = Game.creeps[i];
          let base = Memory.Empire.bases[creep.memory.base];

          // Check if the creep is under attack
          if (creep.memory.hitsLastTick == undefined){
            creep.memory.hitsLastTick = creep.hits;
          }
          else if (creep.memory.hitsLastTick > creep.hits){
            if (base.rooms[creep.pos.roomName] != undefined){
              base.rooms[creep.pos.roomName].underAttack = true;
            }
          }

          // Execute creep role
          roles[creep.memory.role].run(creep);
          if (base.creeps[creep.memory.role] == undefined){
            base.creeps[creep.memory.role] = [];
          }
          base.creeps[creep.memory.role].push(creep.name);
        }
        catch (e){
          console.log('ERROR IN CREEP ROLE ' + i + '\n' + e + '\n' + e.stack);
        }
      }

      // Run the base handler for each base
      for (let i in Memory.Empire.bases){
        try{
          baseHandler.run(Memory.Empire.bases[i]);
        }
        catch(e){
          console.log('ERROR IN BASE ' + i + '\n' + e + '\n' + e.stack);
        }
      }

      // Update CPU average info
      Memory.cpu.total += Game.cpu.getUsed();
      Memory.cpu.ticks += 1;
      Memory.cpu.average = Memory.cpu.total / Memory.cpu.ticks;
  });
};


// TODO:
// Make turrets target creep with lowest HEAL value around it
