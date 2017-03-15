
module.exports = {
  run: function(creep){

    if (creep.pos.roomName != creep.memory.room){
      creep.findPath(creep.memory.room);
      return
    }

    if (isOnExit(creep.pos) == true){
      creep.getOffExit();
      return
    }

    let controller = Game.rooms[creep.memory.room].controller;
    if (creep.claimController(controller) == ERR_NOT_IN_RANGE){
      creep.moveTo(controller);
      return
    }

  }

};
