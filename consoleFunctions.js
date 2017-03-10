function addRoom(roomName){
  Memory.Empire.rooms[roomName] = {id:roomName, scouted:false, sources: []};
}

function resetMemory(){
  Memory.Empire = {};
  Memory.Empire.rooms = {};
  Memory.Empire.bases = {};
  Memory.Empire.bases.creeps = {};
}


function calcBodyCost(body){
  //_.sum(body, p => BODYPART_COST[p])
  const costs = {
    MOVE: 50,
    WORK: 100,
    CARRY: 50,
    ATTACK: 80,
    RANGED_ATTACK: 150,
    HEAL: 250,
    CLAIM: 600,
    TOUGH: 10
  }
  totalCost = 0;
  for (let i in body){
    totalCost += costs[body[i]];
  }
  return totalCost;
}
