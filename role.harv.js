module.exports = {

  run: function(creep){
    let source = Game.getObjectById(creep.memory.source);
    // If source does not exist, throw error in console and break
    if (source == undefined){
      console.log('<style clolor="red">HARV HAS NO SOURCE!</style> '+creep.name+' <a hfref="#!/room/'+creep.roomName+'">'+creep.roomName+'</a>');
      return;
    }
    // If creep is not near source, move to source
    if (!creep.isNearTo(source)){
      creep.moveTo(source);
      return;
    }
    if (Game.getObjectById(creep.memory.container) == undefined){
      creep.memory.container == undefined;
    }
    // If the creep does not have a container in memory, look around for container
    if (creep.memory.container == undefined){
      let stuff = creep.lookAtArea(creep.pos.y - 1, creep.pos.x - 1, creep.pos.y + 1, creep.pos.x + 1);
      for (let i in stuff){
        if (stuff[i] instanceof StructureContainer){
          creep.memory.container = stuff[i].id;
          creep.memory.building = false;
          return;
        }
        if (stuff[i] instanceof ConstructionSite){
          creep.memory.container = stuff[i].id;
          creep.memory.building = true;
          return;
        }
      }
      // If there is no container near the creep, drop a construction site for one.
      creep.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
    }

    let container = Game.getObjectById(creep.memory.container);
    if (creep.memory.building == true){
      if (creep.carry.energy == 0){
        creep.harvest(source);
      }
      else{
        creep.build(container);
      }
    }
    else if (creep.memory.reparing == true){
      if (creep.carry.energy == 0){
        creep.harvest(source);
      }
      else{
        creep.repair(container);
      }
    }
    else{
      creep.harvest(source);
      if (container.hits < container.hitsMax * 0.25){
        creep.memory.reparing = true;
      }
    }

  }


};
