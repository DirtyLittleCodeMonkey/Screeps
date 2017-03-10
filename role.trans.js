module.exports = {

  run = function(creep){

    if (creep.memory.delivering == undefined){
      creep.memory.delivering = false;
    }

    if (_.sum(creep.carry) == creep.carryCapacity){
      creep.memory.delivering = true;
    }
    if (_.sum(creep.carry) == 0){
      creep.memory.delivering = false;
    }


    if (creep.memory.delivering == false ){
      let target = Game.getObjectById(creep.memory.target);
      if (target == undefined){
        //Look for sources on the ground
        groundRescources = findOnGround(creep);
        if (groundRescources.length > 0){
          creep.memory.target = _.sortBy(groundRescources, function(groundRescources){return groundRescources.ammount})[0].id;
        }
      }
      if (creep.pickup(target) == ERR_NOT_IN_RANGE){
        creep.moveTo(target);
      }
    }


  },

  findOnGround = function(creep){
    let base = Memory.Empire.bases[creep.memory.baseNum];
    groundRescources = [];
    for (let i in base.rooms){
      let room = Game.rooms[base.rooms[i]];
      if (room == undefined){
        continue;
      }
      groundEnergy.concat(room.find(FIND_DROPPED_RESOURCES));
    }
    return groundRescources;
  },

  getFromGround = function(creep, target){
    if (creep.pickup(target) == ERR_NOT_IN_RANGE){
      creep.moveTo(target);
    }
  },

  getFromContainer = function(creep, target){
    if (creep.withdraw(target, ))
  }
};
