module.exports = {

  run: function(creep){
    let source = Game.getObjectById(creep.memory.source);
    let base = Memory.Empire.bases[creep.memory.base];

    // Move to the source
    if (source == undefined || creep.pos.isNearTo(source.pos) == false){
      this.gotoSource(creep);
      return
    }

    // Find the container next to the source
    let container = Game.getObjectById(creep.memory.container);
    while (container == undefined){
      this.getContainer(creep)
      container = Game.getObjectById(creep.memory.container);
    }

    // Get energy
    if (creep.carry.energy < creep.carryCapacity){
      creep.harvest(source);
      return
    }

    // Build container
    if (container instanceof ConstructionSite){
      creep.build(container);
      return
    }

    // Repair container
    if (container.hits < container.hitsMax){
      if (creep.repair(container) == ERR_NOT_IN_RANGE){
        creep.moveTo(container);
        return
      }
    }

    // Get on container
    if (creep.pos.isEqualTo(container.pos) == false){
      creep.moveTo(container);
    }

    // Put energy in container
    if (creep.transfer(container, _.max(_.keys(creep.carry), s => creep.carry[s])) == ERR_NOT_IN_RANGE){
      creep.moveTo(container);
    }

  },

  gotoSource: function(creep){
    let base = Memory.Empire.bases[creep.memory.base]
    let source = Game.getObjectById(creep.memory.source);
    // If there is no vision on the source, move to the flag in the room of the source
    if (source == undefined){
      for (let i in base.sources){
        if (creep.memory.source == base.sources[i].id){
          creep.moveTo(Game.flags[base.sources[i].roomName])
          return
        }
      }
    }
    creep.moveTo(source);
  },

  getContainer: function(creep){
    let base = Memory.Empire.bases[creep.memory.base]
    let source = Game.getObjectById(creep.memory.source);
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
  },


};
