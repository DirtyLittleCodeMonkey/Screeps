

module.exports = {

  run: function(creep){
    let base = Memory.Empire.bases[creep.memory.base];

    this.setMemoryState(creep);

    // Delivering
    if (creep.memory.delivering == true){

      // Reapir and build roads
      if (creep.carry.energy > 0){
        if (this.repairRoads(creep) == true){
          return
        }
      }

      // Deliver to target
      this.deliverResources(creep);
      return
    }


    this.getResources(creep);


  },

  getResources: function(creep){
    // Get the container
    let container = Game.getObjectById(creep.memory.container);
    if (container == undefined){
      this.getContainer(creep);
      container = Game.getObjectById(creep.memory.container);
    }

    // If the container DNE or is empty, do nothing
    if (container == undefined || _.sum(container.store) == 0){
      return
    }


    if (creep.withdraw(container, _.max(_.keys(container.store), s => container.store[s])) == ERR_NOT_IN_RANGE){
      creep.moveTo(container);
    }

  },

  getContainer: function(creep){
    let base = Memory.Empire.bases[creep.memory.base];
    creep.memory.container = undefined;
    for (let i in base.sources){
      let source = base.sources[i];
      if (source.id == creep.memory.source){
        creep.memory.container = source.container;
        return
      }
    }
  },

  deliverResources: function(creep){
    let base = Memory.Empire.bases[creep.memory.base];

    // If storage exists, deliver to it
    if (base.structures.storage.length > 0){
      let storage = Game.getObjectById(base.structures.storage[0]);
      if (creep.transfer(storage, _.max(_.keys(creep.carry), s => creep.carry[s])) == ERR_NOT_IN_RANGE){
        creep.moveTo(storage);
      }
      return
    }

    // If storage DNE and the creep is only carrying minerals, return
    if (creep.carry.energy == 0){
      return
    }

    // If creep is not in main room, go there
    if (creep.pos.roomName != base.mainRoom){
      creep.moveTo(Game.flags[base.mainRoom]);
      return
    }

    let deliverTarget = Game.getObjectById(creep.memory.deliverTarget);
    if (deliverTarget == undefined || deliverTarget.energy == deliverTarget.energyCapacity){
      this.findDeliveryTarget(creep);
      deliverTarget = Game.getObjectById(creep.memory.deliverTarget)
    }

    if (deliverTarget != undefined){
      if (creep.transfer(deliverTarget, _.max(_.keys(creep.carry), s => creep.carry[s])) == ERR_NOT_IN_RANGE){
        creep.moveTo(deliverTarget);
      }
      return
    }


  },

  findDeliveryTarget: function(creep){
    let base = Memory.Empire.bases[creep.memory.base];
    if (base.structures.extensionsNeedEnergy.length == 0){
      creep.memory.deliverTarget = undefined
      return
    }
    let deliverTargets = getObjectList(base.structures.extensionsNeedEnergy);
    let nearest = creep.pos.findClosestByRange(deliverTargets);
    if (nearest != undefined){
      creep.memory.deliverTarget = nearest.id;
    }
    else{
      creep.memory.deliverTarget = deliverTargets[0].id;
    }
  },

  setMemoryState: function(creep){
    if (creep.memory.delivering == undefined){
      creep.memory.delivering = false;
    }
    else if (_.sum(creep.carry) == 0){
      creep.memory.delivering = false;
    }
    else if (_.sum(creep.carry) == creep.carryCapacity){
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



  // _.max(_.keys(target.store), s => target.store[s])
  // _.max(_.keys(creep.carry), s => creep.carry[s])
};
