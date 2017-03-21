
module.exports = {

  run: function(creep){

    let base = Memory.Empire.bases[creep.memory.base];

    // Set memory state
    this.setMemoryState(creep);

    // Get energy
    if (creep.memory.building == false){
      let pickupTarget = Game.getObjectById(creep.memory.pickupTarget);

      // If target DNE, get new one
      if (pickupTarget == undefined){
        this.getPickupTarget(creep);
        pickupTarget = Game.getObjectById(creep.memory.pickupTarget);
        // If target still DNE, break out
        if (pickupTarget == undefined){
          console.log('BUILDER HAS NO REOSURCE PICKUP TARGETS ' + creep.name + ' ' + linkRoom(base.mainRoom));
          return
        }
      }

      // Get energy from target
      if (creep.withdraw(pickupTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
        creep.moveTo(pickupTarget);
      }
      return
    }

    // Repair stuff
    if (base.structures.buildRoads.length == 0){
      let repairTarget = Game.getObjectById(creep.memory.repairTarget);
      // Find new target
      if (repairTarget == undefined || repairTarget.hits >= RAMPART_HITS_MAX[base.level]/10){
        this.findRepairTarget(creep);
        repairTarget = Game.getObjectById(creep.memory.repairTarget);
      }

      // If target exists, repair it
      if (repairTarget != undefined){
        if (creep.repair(repairTarget) == ERR_NOT_IN_RANGE){
          creep.moveTo(repairTarget);
        }
        return
      }
    }

    // Build
    let buildTarget = Game.getObjectById(creep.memory.buildTarget);
    if (buildTarget == undefined){
      this.findBuildTarget(creep);
      buildTarget = Game.getObjectById(creep.memory.buildTarget);
    }

    if (buildTarget != undefined){
      if (creep.build(buildTarget) == ERR_NOT_IN_RANGE){
        creep.moveTo(buildTarget);
      }
      return
    }

  },

  // Update creep memory state
  setMemoryState: function(creep){
    if (creep.memory.building == undefined){
      creep.memory.building = false;
    }
    else if (creep.carry.energy == creep.carryCapacity){
      creep.memory.building = true;
    }
    else if (creep.carry.energy == 0){
      creep.memory.building = false;
    }
  },

  // Find target to get energy from
  getPickupTarget: function(creep){
    let base = Memory.Empire.bases[creep.memory.base];
    creep.memory.pickupTarget = undefined;

    // If storage exists, set it as target
    if (base.structures.storage.length > 0){
      creep.memory.pickupTarget = base.structures.storage[0]
      return
    }

    creep.memory.pickupTarget = base.structures.spawn[0];
  },

  // Find structure that needs repairs
  findRepairTarget: function(creep){
    let base = Memory.Empire.bases[creep.memory.base];
    creep.memory.repairTarget = undefined;
    // If no targets exist, return
    if (base.structures.repairTargets.length == 0){
      return
    }
    creep.memory.repairTarget = base.structures.repairTargets[0];
  },

  findBuildTarget: function(creep){
    let base = Memory.Empire.bases[creep.memory.base];
    creep.memory.buildTarget = undefined;
    // If no targets exist, return
    if (base.structures.constructionSites.length == 0){
      return
    }
    if (base.structures.buildRoads.length > 0){
      creep.memory.buildTarget = base.structures.buildRoads[0];
      return
    }
    creep.memory.buildTarget = base.structures.constructionSites[0];
  },

};
