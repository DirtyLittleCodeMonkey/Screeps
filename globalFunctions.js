
// Makes memory functions global
require('memoryStruct')

// List of all structure types
global.STRUCTURES_ALL = _.reduce( global, ( a, v, k, c ) => { if ( k.startsWith( 'STRUCTURE_' ) ) { a.push( v ); } return a; }, [] );

// List of room energy totals that correspond to room levels
global.ROOM_LEVELS = [300, 550, 800, 1300, 1800, 2300, 3100, 10900],

// Hard reset of memory, flags, and creeps. For testing purposes
hardReset = function(){
  for (let i in Memory){
    if (i != 'creeps' && i != 'flags'){
      delete(Memory[i]);
    }
  }
  for (let i in Game.flags){
    Game.flags[i].remove();
  }
  for (let i in Game.creeps){
    Game.creeps[i].suicide();
  }
}

memoryReset = function(){
  for (let i in Memory){
    if (i != 'creeps' && i != 'flags'){
      delete(Memory[i]);
    }
  }
}

resetCpuAverage = function(){
  Memory.cpu = undefined;
}

isOnExit = function(position){
  if (position.x == 0 || position. x == 49 || position.y == 0 || position.y == 49){
    return true;
  }
  return false;
}

// Convert list of creep names to creep objects
getCreepList = function(creepNameArray){
  creepArray = [];
  for (let i in creepNameArray){
    let creep = Game.creeps[creepNameArray[i]];
    if (creep != undefined){
      creepArray.push(creep);
    }
  }
  return creepArray;
}

// Get a list of objects from a list of ids
getObjectList = function(idArray){
  let objectArray = [];
  for (let i in idArray){
    let obj = Game.getObjectById(idArray[i]);
    if (obj != null){
      objectArray.push(obj);
    }
  }
  return objectArray;
}

// Convert list of objects to a list of IDs
getIdList = function(objList){
  let idList = [];
  for (let i in objList){
    idList.push(objList[i].id);
  }
  return idList
}

// Get the cost of a body
getBodyCost = function(body){
  return _.sum(body, p => BODYPART_COST[p])
}

// Mark a room for claiming
settleRoom = function(baseRoom, targetRoom){
  Memory.Empire.bases[baseRoom].settleRoom = targetRoom;
  Memory.Empire.bases[baseRoom].helpRoom = targetRoom;
}
