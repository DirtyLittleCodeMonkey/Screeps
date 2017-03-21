module.exports = {

  run: function(creep){

    let base = Memory.Empire.bases[creep.memory.base];

    // Set the state of the creep (delivering, building, etc)
    this.setMemoryState(creep);

    // Get energy
    if (creep.memory.delivering == false){
      this.getEnergy(creep)
      return
    }

    // Reapir and build roads
    if (creep.carry.energy > 0){
      if (this.repairRoads(creep) == true){
        return
      }
    }

    // Get to the main room
    if (creep.pos.roomName != base.mainRoom){
      creep.moveTo(Game.flags[base.mainRoom]);
      return
    }

    let target = Game.getObjectById(creep.memory.target);
    // Find new target if DNE
    if (target == undefined || target.energy == target.energyCapacity){
      this.findDeliveryTarget(creep);
      target = Game.getObjectById(creep.memory.target);
    }

    // If target has been found, deliver energy to it
    if (target != undefined){
      if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
        creep.moveTo(target);
      }
      return
    }

    // If there are no extensions that need energy, build sites
    if (base.structures.constructionSites.length > 0){
      let sites = _.filter(getObjectList(base.structures.constructionSites), function(site){return site.roomName == creep.roomName && site.structureType == STRUCTURE_ROAD});
      if (sites.length == 0){
        creep.moveTo(Game.getObjectById(base.structures.constructionSites[0]));
        return
      }
      else{
        let nearest = creep.pos.findClosestByRange(sites);
        if (creep.build(nearest) == ERR_NOT_IN_RANGE){
          creep.moveTo(nearest);
        }
        return
      }
    }

  },

  findDeliveryTarget: function(creep){
    let base = Memory.Empire.bases[creep.memory.base]
    // Set empty target
    creep.memory.target = undefined
    if (base.structures.extensionsNeedEnergy.length == 0){
      return
    }

    // Find closest delivery target
    let extensions = getObjectList(base.structures.extensionsNeedEnergy)
    let nearest = creep.pos.findClosestByRange(extensions);
    creep.memory.target = nearest.id
  },

  // Set the memory state of the creep
  setMemoryState: function(creep){
    if (creep.memory.delivering == undefined){
      creep.memory.delivering = false;
    }
    else if (creep.carry.energy == 0){
      creep.memory.delivering = false;
      creep.memory.target = undefined;
    }
    else if (creep.carry.energy == creep.carryCapacity){
      creep.memory.delivering = true;
    }
  },

  // Find Energy
  getEnergy: function(creep){
    let base = Memory.Empire.bases[creep.memory.base];
    let source = Game.getObjectById(creep.memory.source)
    // If there is no vision on the source, look up the room it is in and move to the flag
    if (source == undefined){
      // if the creep does not know what room the source is in, find the room
      if (creep.memory.sourceRoom == undefined){
        for (let i in base.sources){
          if (base.sources[i].id == creep.memory.source){
            creep.memory.sourceRoom = base.sources[i].roomName
            break
          }
        }
      }
      // Move to source room's flag
      creep.moveTo(Game.flags[creep.memory.sourceRoom])
      return
    }

    let container = Game.getObjectById(creep.memory.container);
    // If the creep does not have the container id, find it in the source
    if (container == undefined){
      for (let i in base.sources){
        if (base.sources[i].id == creep.memory.source){
          creep.memory.container = base.sources[i].container;
          break
        }
      }
      container = Game.getObjectById(creep.memory.container);
    }

    // If the container exists and has energy, get energy from the container
    if (container != undefined && container.store.energy > 0){
      if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
        creep.moveTo(container);
      }
      return
    }

    // If there is no container, harvest from the source
    if (creep.harvest(source) == ERR_NOT_IN_RANGE){
      creep.moveTo(source);
    }
    return
  },

  // Build and repair roads the creep is on
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
