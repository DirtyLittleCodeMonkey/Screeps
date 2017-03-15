module.exports = {

  run: function(creep){

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

    let base = Memory.Empire.bases[creep.memory.base];

    if (creep.memory.delivering == false){
      let source = Game.getObjectById(creep.memory.source)
      if (source == undefined){
        for (let i in base.sources){
          if (base.sources[i].id == creep.memory.source){
            creep.findPath(base.sources[i].roomName);
            return
          }
        }
      }

      if (creep.pos.roomName == source.pos.roomName && isOnExit(creep.pos)){
        creep.getOffExit();
        return
      }

      let container = {};
      for (let i in base.sources){
        if (base.sources[i].id == creep.memory.source){
          container = Game.getObjectById(base.sources[i].container);
        }
      }
      if (container != undefined && container.store.energy > 0){
        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
          creep.moveTo(container);
          return
        }
      }

      if (creep.harvest(source) == ERR_NOT_IN_RANGE){
        creep.moveTo(source);
      }
      return
    }

    let building = false;
    if (creep.memory.target == undefined || Game.getObjectById(creep.memory.target).energy == Game.getObjectById(creep.memory.target).energyCapacity){
      // Find all spawns and extensions that need energy
      let extensions = _.filter(getObjectList(base.structures.extension).concat(getObjectList(base.structures.spawn)), function(ext){return ext.energy < ext.energyCapacity});
      if (extensions.length == 0){
        building = true;
      }
      else if (creep.pos.roomName != extensions[0].pos.roomName){
        creep.moveTo(extensions[0]);
        return
      }
      else{
        let nearest = creep.pos.findClosestByRange(extensions);
        creep.memory.target = nearest.id;
      }
    }

    let road = _.filter(creep.room.lookForAt(LOOK_STRUCTURES, creep.pos), function(struct){return struct.structureType == STRUCTURE_ROAD})[0];
    if (road !== undefined && road.hits < road.hitsMax){
      creep.repair(road);
    }

    if (building == false){

      let target = Game.getObjectById(creep.memory.target);
      if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
        creep.moveTo(target);
        return
      }
    }

    if (building == true){
      let sites = _.filter(getObjectList(base.structures.constructionSites), function(site){return site.roomName == creep.roomName && site.structureType != STRUCTURE_ROAD});
      if (sites.length == 0){
        creep.moveTo(Game.getObjectById(base.structures.constructionSites[0]));
      }
      else{
        let nearest = creep.pos.findClosestByRange(sites);
        if (creep.build(nearest) == ERR_NOT_IN_RANGE){
          creep.moveTo(nearest);
        }
      }
    }

  }

};
