global.STRUCTURES_ALL = _.reduce( global, ( a, v, k, c ) => { if ( k.startsWith( 'STRUCTURE_' ) ) { a.push( v ); } return a; }, [] );

resetMemory = function(){
  Memory.Empire = {};
  Memory.Empire.rooms = {};
  Memory.Empire.bases = {};
  // Make base entries for each room under our control
  controlledRooms = [];
  for (let i in Game.spawns){
    let room = Game.spawns[i].pos.roomName;
    if (controlledRooms.indexOf(room) < 0){
      controlledRooms.push(room);
    }
  }
  for (i in controlledRooms){
    addBase(controlledRooms[i]);
  }
}

addBase = function(roomName){
  let newBase = {
    mainRoom: roomName,
    rooms: [roomName],
    structures: addBaseHelpers.makeStructures(),
    creeps: {},
    sources: [],
  }
  Memory.Empire.bases[roomName] = newBase;
}

addBaseHelpers = {
  makeStructures: function(){
    structures = {};
    for (i in STRUCTURES_ALL){
      structures[STRUCTURES_ALL[i]] = [];
    }

    return structures;
  },
}


calcBodyCost = function(body){
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
