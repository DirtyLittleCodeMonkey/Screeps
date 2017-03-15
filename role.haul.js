

module.exports = {

  run: function(creep){
    if (creep.memory.delivering == undefined){
      creep.memory.delivering = false;
    }
    else if (_.sum(creep.carry) == 0){
      creep.memory.delivering = false;
    }
    else if (_.sum(creep.carry) == creep.carryCapacity){
      creep.memory.delivering = true;
    }

    let base = Memory.Empire.bases[creep.memory.base];

    // Delivering
    if (creep.memory.delivering == true){

      let road = _.filter(creep.room.lookForAt(LOOK_STRUCTURES, creep.pos), function(struct){return struct.structureType == STRUCTURE_ROAD})[0];
      if (road !== undefined && road.hits < road.hitsMax){
        creep.repair(road);
      }
      
      let memSource = undefined;
      for (let i in base.sources){
        if (base.sources[i].id == creep.memory.source){
          memSource = base.sources[i];
        }
      }

      if (memSource != undefined && memSource.roadBuilt == false){
        let sites = _.filter(getObjectList(base.structures.constructionSites), function(site){return site.pos.roomName == creep.pos.roomName && site.structureType == STRUCTURE_ROAD});
        if (sites.length > 0){
          let nearest = creep.pos.findClosestByRange(sites);
          if (creep.build(nearest) == ERR_NOT_IN_RANGE){
            creep.moveTo(nearest);
            return
          }
          creep.moveTo(Game.getObjectById(base.structures.constructionSites[0]));
          return
        }
      }

      // If the base has storage, it is a gophers job to move stuff to exts
      let storage = Game.getObjectById(base.structures.storage);
      if (storage == undefined){
        let extensions = _.filter(getObjectList(base.structures.extension).concat(getObjectList(base.structures.spawn).concat(getObjectList(base.structures.tower))), function(struct){return struct.energy < struct.energyCapacity});
        if (extensions.length == 0){
          return;
        }
        if (creep.pos.roomName != extensions[0].pos.roomName){
          creep.moveTo(extensions[0]);
          return
        }
        let nearest = creep.pos.findClosestByRange(extensions);
        if (creep.transfer(nearest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
          creep.moveTo(nearest);
          return
        }
        return
      }

      if (creep.transfer(storage, _.max(_.keys(creep.carry), s => creep.carry[s])) == ERR_NOT_IN_RANGE){
        creep.moveTo(storage);
        return
      }

      return
    }

    // Finding energy
    let container = Game.getObjectById(creep.memory.container);
    if (container == undefined){
      for (let i in base.sources){
        if (base.sources[i].id == creep.memory.source){
          creep.memory.container = base.sources[i].container;
          if (creep.pos.roomName != base.sources[i].roomName){
            creep.findPath(base.sources[i].roomName);
            return
          }
          return;
        }
      }
    }

    if (_.sum(container.store) == 0){
      creep.moveTo(creep.room.controller)
      return
    }

    if (creep.withdraw(container, _.max(_.keys(container.store), s => container.store[s])) == ERR_NOT_IN_RANGE){
      creep.moveTo(container);
      return
    }



  }

  // _.max(_.keys(target.store), s => target.store[s])
  // _.max(_.keys(creep.carry), s => creep.carry[s])
};
