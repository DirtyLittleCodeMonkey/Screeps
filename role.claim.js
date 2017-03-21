
module.exports = {
  run: function(creep){

    // Go to given room
    if (creep.pos.roomName != creep.memory.room){
      creep.moveTo(Game.flags[creep.memory.room]);
      return
    }

    // Get controller object and reserve it
    let controller = Game.rooms[creep.memory.room].controller;
    if (creep.reserveController(controller) == ERR_NOT_IN_RANGE){
      creep.moveTo(controller);
    }

  }

};
