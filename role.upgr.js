module.exports = {

  run: function(creep){
    let base = Memory.Empire.bases[creep.memory.base];

    if (creep.memory.delivering == undefined){
      creep.memory.delivering = false;
    }
    if (_.sum(creep.carry) == 0){
      creep.memory.delivering = false;
    }
    if (_.sum(creep.carry) == creep.carryCapacity){
      creep.memory.delivering = true;
    }

    if (creep.memory.delivering == true){

      let road = _.filter(creep.room.lookForAt(LOOK_STRUCTURES, creep.pos), function(struct){return struct.structureType == STRUCTURE_ROAD})[0];
      if (road !== undefined && road.hits < road.hitsMax){
        creep.repair(road);
      }

      let controllers = getObjectList(base.structures.controller);
      controllers = _.filter(controllers, function(cont){return cont.my})
      let nearest = creep.pos.findClosestByRange(controllers);
      if (creep.upgradeController(nearest) == ERR_NOT_IN_RANGE){
        creep.moveTo(nearest);
      }
      return
    }

    let storage = _.filter(getObjectList(base.structures.storage), function(contain){return contain.store[RESOURCE_ENERGY] > 0});
    if (storage.length > 0){
      let nearest = creep.pos.findClosestByPath(storage);
      if (creep.withdraw(nearest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
        creep.moveTo(nearest);
      }
    }
    else{
      let containers = _.filter(getObjectList(base.structures.container), function(contain){return contain.store[RESOURCE_ENERGY] > contain.storeCapacity/2 && contain.pos.roomName == creep.pos.roomName});
      if (containers.length > 0){
        let nearest = creep.pos.findClosestByPath(containers);
        if (creep.withdraw(nearest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
          creep.moveTo(nearest);
        }
      }
      else{
        let spawns = _.filter(getObjectList(base.structures.spawn), function(contain){return contain.energy > 0});
        if (spawns.length > 0){
          let nearest = creep.pos.findClosestByPath(spawns);
          if (creep.withdraw(nearest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
            creep.moveTo(nearest);
          }
        }
        else{
          let controllers = getObjectList(base.structures.controller);
          controllers = _.filter(controllers, function(cont){return cont.my})
          creep.moveTo(controllers[0]);
        }
      }
    }

  }

};
