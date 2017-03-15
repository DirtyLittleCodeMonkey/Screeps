module.exports = {

  run: function(creep){
    let base = Memory.Empire.bases[creep.memory.base];
    if (creep.pos.roomName != creep.memory.room){
      creep.findPath(creep.memory.room);
      return
    }
    else{
      if (creep.memory.arrived == undefined){
        base.rooms[creep.memory.room].scouted = true;
        creep.memory.arrived = true;
        newSources = creep.room.find(FIND_SOURCES);
        for (let i in newSources){
          let exists = false
          for (let j in base.sources){
            if (base.sources[j].id == newSources[i].id){
              exists = true;
            }
          }
          if (exists == false){
            addSource(creep.memory.base, newSources[i].id);
          }
        }
      }
      creep.moveTo(creep.room.controller);
    }
    if (creep.pos.x == 0 || creep.pos.x == 49 || creep.pos.y == 0 || creep.pos.y == 49){
      creep.getOffExit();
    }
  },
};
