module.exports = {

  run: function(creep){
    let source = Game.getObjectById(creep.memory.source);
    let base = Memory.Empire.bases[creep.memory.base];

    //Move to the source
    if (source == undefined){
      for (let i in base.sources){
        if (base.sources[i].id == creep.memory.source){
          creep.findPath(base.sources[i].roomName);
          return;
        }
      }
    }

    if (creep.pos.roomName == source.pos.roomName && isOnExit(creep.pos)){
      creep.getOffExit();
    }

    if (creep.pos.isNearTo(source) == false){
      creep.moveTo(source);
      return
    }

    // Find the container next to the source
    let container = Game.getObjectById(creep.memory.container);
    if (container == undefined){
      let stuff = creep.room.lookAtArea(source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true);
      for (let i in stuff){
        if (stuff[i].type == 'structure' && stuff[i].structure.structureType == STRUCTURE_CONTAINER){
          creep.memory.container = stuff[i].structure.id
          for (let j in base.sources){
            if (base.sources[j].id == creep.memory.source){
              base.sources[j].container = stuff[i].structure.id;
            }
          }
          return
        }
        if (stuff[i].type == 'constructionSite' && stuff[i].constructionSite.structureType == STRUCTURE_CONTAINER){
          creep.memory.container = stuff[i].constructionSite.id
          return
        }
      }
      creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER)
      return
    }

    if (creep.carry.energy < creep.carryCapacity){
      creep.harvest(source);
      return
    }

    // Build container
    if (container instanceof ConstructionSite){
      creep.build(container);
      return
    }

    if (container.hits < container.hitsMax){
      if (creep.repair(container) == ERR_NOT_IN_RANGE){
        creep.moveTo(container);
      }
    }

    if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
      creep.moveTo(container);
    }

  }

};
