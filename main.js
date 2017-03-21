const baseHandler = require('baseHandler');
const creepHandler = require('creepHandler');
const screepsplus = require('screepsplus');
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
      console.log('Tick ' + Game.time + ' | CPU average ' + Memory.cpu.average + ' | Bucket ' + Game.cpu.bucket);
      //Dead Creep Memory Cleanup
      for(let i in Memory.creeps) {
        if(!Game.creeps[i]) {
          delete Memory.creeps[i];
        }
      }

      let statCpu = Game.cpu.getUsed()
      // Collect stats for Graphana
      screepsplus.collect_stats();
      console.log('Stat collcetion CPU: ' + (Game.cpu.getUsed() - statCpu));

      // If memory structure does not exist, reset with strucutre present
      if (Memory.Empire == undefined){
        initMemory();
      }


      // Check if all owned rooms have a base
      for (let i in Game.rooms){
        if (Game.rooms[i].controller.my == true){
          let hasBase = false
          for (let j in Memory.Empire.bases){
            if (i == j){
              hasBase = true;
            }
          }
          if (hasBase == false){
            addBase(i);
          }
        }
      }


      // Creep roles
      let preCPU = Game.cpu.getUsed()
      creepHandler.run();
      let postCPU = Game.cpu.getUsed()
      console.log('Total Creep CPU: ' + (postCPU - preCPU));

      // Run the base handler for each base

      preCPU = postCPU
      for (let i in Memory.Empire.bases){
        if (Game.cpu.bucket < 8000){
          break
        }
        try{
          baseHandler.run(Memory.Empire.bases[i]);
        }
        catch(e){
          console.log('ERROR IN BASE ' + i + '\n' + e + '\n' + e.stack);
        }
      }
      postCPU = Game.cpu.getUsed()
      console.log('Total Base CPU: ' + (postCPU - preCPU));

      // Update CPU average info
      if (Game.time % 1000 == 0){
        resetCpuAverage()
      }
      Memory.cpu.total += Game.cpu.getUsed();
      Memory.cpu.ticks += 1;
      Memory.cpu.average = Memory.cpu.total / Memory.cpu.ticks;
      console.log('Total CPU Used: ' + Game.cpu.getUsed());
  });
};


// TODO:
// Make turrets target creep with lowest HEAL value around it
