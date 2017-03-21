const roles = require('roles');

module.exports = {

  run: function(){

    Memory.cpu.creeps = [];

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

        // CPU monitoring
        if (Memory.cpu.creeps[creep.memory.role] == undefined){
          Memory.cpu.creeps[creep.memory.role] = {max: 0, min: Infinity, total: 0, count: 0};
        }


        if (creep.memory.role == undefined){
          creep.suicide()
          console.log('ERROR CREEEP HAS RO ROLE ' + creep.name + ' ' + creep.room);
          continue
        }

        // Execute creep role
        let preCPU = Game.cpu.getUsed()
        roles[creep.memory.role].run(creep);
        let cpuUsed = Game.cpu.getUsed() - preCPU;
        Memory.cpu.creeps[creep.memory.role].total += cpuUsed;
        Memory.cpu.creeps[creep.memory.role].count += 1
        if (cpuUsed > Memory.cpu.creeps[creep.memory.role].max){
          Memory.cpu.creeps[creep.memory.role].max = cpuUsed;
        }
        else if (cpuUsed < Memory.cpu.creeps[creep.memory.role].min){
          Memory.cpu.creeps[creep.memory.role].min = cpuUsed;
        }

        if (base.creeps[creep.memory.role] == undefined){
          base.creeps[creep.memory.role] = [];
        }
        if (base.creeps[creep.memory.role].indexOf(creep.name) < 0){
          base.creeps[creep.memory.role].push(creep.name);
        }

      }
      catch (e){
        console.log('ERROR IN CREEP ROLE ' + i + '\n' + e + '\n' + e.stack);
      }
    }

    for (let i in Memory.cpu.creeps){
      let mem = Memory.cpu.creeps[i]
      console.log(i+'\tCount: '+mem.count+'\tMax: '+_.round(mem.max, 4)+'\tMin: '+_.round(mem.min,4)+'\tAverage: '+_.round((mem.total / mem.count), 4)+'\t\tTotal: '+_.round(((mem.total / mem.count) * mem.count),4));
    }


  }
};
