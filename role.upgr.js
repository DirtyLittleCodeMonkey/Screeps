module.exports = {

  run: function(creep){

    this.setMemoryState(creep);


    if (creep.memory.delivering == true){

      // Fix roads
      this.repairRoads(creep);

      // Upgrade Controller
      let controller = creep.room.controller;
      if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE){
        creep.moveTo(controller)
      }
      return
    }

    // Get Energy
    this.getEnergy(creep)

  },

  getEnergy: function(creep){
    let base = Memory.Empire.bases[creep.memory.base];
    // If there is no storage in the base, grab from spawns
    if (base.structures.storage.length == 0){
      let spawns = _.filter(getObjectList(base.structures.spawn), s => s.energy == s.energyAvailable);
      // If none of the spawns have full energy, get out of the way
      if (spawns.length == 0){
        if (creep.pos.isNearTo(creep.room.controller) == false){
          creep.moveTo(creep.room.controller);
        }
        return
      }
      let nearest = creep.pos.findClosestByRange(spawns);
      if (creep.withdraw(nearest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
        creep.moveTo(nearest)
      }
      return
    }

    let storage = Game.getObjectById(base.structures.storage[0]);
    // If storage has no energy, get out of the way
    if (storage.store.energy == 0){
      if (creep.pos.isNearTo(creep.room.controller) == false){
        creep.moveTo(creep.room.controller);
      }
      return
    }
    // Get energy from storage
    if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
      creep.moveTo(storage);
    }
  },

  setMemoryState: function(creep){
    if (creep.memory.delivering == undefined){
      creep.memory.delivering = false;
    }
    if (_.sum(creep.carry) == 0){
      creep.memory.delivering = false;
    }
    if (_.sum(creep.carry) == creep.carryCapacity){
      creep.memory.delivering = true;
    }
  },



  repairRoads: function(creep){
    let road = _.find(creep.pos.lookFor(LOOK_STRUCTURES), struct => struct.structureType == STRUCTURE_ROAD)
    if (road == undefined){
      road = _.find(creep.pos.lookFor(LOOK_CONSTRUCTION_SITES), struct => struct.structureType == STRUCTURE_ROAD)
      if (road != undefined){
        creep.build(road);
        return true;
      }
      return false;
    }
    if (road.hits < road.hitsMax){
      creep.repair(road);
      return false;
    }
  },

};
