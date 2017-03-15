
// Creates the geometry of the memory
initMemory = function(){
  Memory.Empire = {};
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

// Add source to a base
addSource = function(baseName, sourceId){
  let base = Memory.Empire.bases[baseName];
  let source = Game.getObjectById(sourceId);
  let target = Game.getObjectById(base.structures.storage[0])
  if (base.structures.storage.length == 0){
    target = Game.getObjectById(base.structures.spawn[0]);
  }
  let dist = PathFinder.search(source.pos, {pos: target.pos, range: 1}).path.length;
  let newSource = new addBaseHelpers.Source(source.pos.roomName, sourceId, (dist*2)/5);
  base.sources.push(newSource);
}

// Adds a room to a base
addRoom = function(baseName, roomName){
  let base = Memory.Empire.bases[baseName];
  base.rooms[roomName] = {};
  base.rooms[roomName].scouted = false;
  base.rooms[roomName].underAttack = false;
}

// Adds a base entry to memory
addBase = function(roomName){
  Memory.Empire.bases[roomName] = {
    mainRoom: roomName,
    rooms: {},
    structures: {},
    sources: [],
    creeps: {},
  }
  for (let i in STRUCTURES_ALL){
    Memory.Empire.bases[roomName].structures[STRUCTURES_ALL[i]] = [];
  }
  const roles = require('roles');
  for (let i in roles){
    Memory.Empire.bases[roomName].creeps[i] = [];
  }
  addRoom(roomName, roomName);
  Memory.Empire.bases[roomName].rooms[roomName].scouted = false;
}

// Helper functions and classes for memory objects
addBaseHelpers = {

  Source: class{
    constructor(room, id, neededCARRY){
      this.id = id;
      this.roomName = room;
      this.harv = '';
      this.boots = [];
      this.hauls = [];
      this.distance = 0;
      this.neededCARRY = neededCARRY;
      this.roadBuilt = false;
    }
  }
}
