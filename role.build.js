
module.exports = {

  run: function(creep){

    if (creep.memory.building == undefined){
      creep.memory.building = false;
    }
    else if (creep.carry.energy == creep.carryCapacity){
      creep.memory.building = true;
    }
    else if (creep.carry.energy == 0){
      creep.memory.building = false;
    }

    let base = Memory.Empire.bases[creep.memory.base];

    // Get energy
    if (creep.memory.building == false){
      let storage = Game.getObjectById(base.structures.storage[0]);
      // If storage DNE, get energy from spawn
      if (storage == undefined){
        let containers = _.filter(getObjectList(base.structures.container), function(struct){return struct.store.energy > struct.storeCapacity/2 && struct.pos.roomName == creep.pos.roomName});
        if (containers > 0){
          let nearest = creep.pos.findClosestByRange(containers);
          if (creep.withdraw(nearest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
            creep.moveTo(nearest);
            return
          }
        }
        let spawn = Game.getObjectById(base.structures.spawn);
        if (spawn.energy != spawn.energyCapacity){
          return
        }
        if (creep.withdraw(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
          creep.moveTo(spawn);
          return
        }
      }

      if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
        creep.moveTo(storage);
        return
      }
    }

    // Repair

    if (base.structures.repairTargets.length > 0){
      let targets = getObjectList(base.structures.repairTargets);
      let nearest = creep.pos.findClosestByRange(targets);
      if (creep.repair(nearest) == ERR_NOT_IN_RANGE){
        creep.moveTo(nearest);
      }
      return
    }

    // Build
    let target = Game.getObjectById(creep.memory.target);
    if (target == undefined){
      creep.memory.target = base.structures.constructionSites[0];
      target = Game.getObjectById(creep.memory.target);
    }

    if (creep.build(target) == ERR_NOT_IN_RANGE){
      creep.moveTo(target);
    }


  }

};
