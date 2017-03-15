module.exports = {

  run: function(creep){

    if (creep.pos.roomName != creep.memory.target){
      creep.findPath(creep.memory.target);
      return
    }
    if (isOnExit(creep.pos) == true){
      creep.getOffExit();
      return
    }
    let base = Memory.Empire.bases[creep.memory.base];

    let targets = creep.room.find(FIND_HOSTILE_CREEPS);
    if (targets.length == 0){
      base.rooms[creep.memory.target].underAttack = false;
      return
    }

    let nearest = creep.pos.findClosestByRange(targets);
    creep.moveTo(nearest)
    if (creep.attack(nearest) == ERR_NOT_IN_RANGE){
      creep.heal(creep);
    }

  }

};
