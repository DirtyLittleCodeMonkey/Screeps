
// Creates the geometry of the memory
initMemory = function(){
  Memory.Empire = {};
  Memory.Empire.bases = {};
}

// Add source to a base
addSource = function(baseName, sourceId){
  let base = Memory.Empire.bases[baseName];
  let source = Game.getObjectById(sourceId);
  let target = Game.getObjectById(base.structures.storage[0])
  if (base.structures.storage.length == 0){
    target = Game.getObjectById(base.structures.spawn[0]);
  }
  let dist = 0;
  if (target != undefined){
    let dist = PathFinder.search(source.pos, {pos: target.pos, range: 1}).path.length;
  }
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
  // Create memory object containing basic fields
  Memory.Empire.bases[roomName] = {
    mainRoom: roomName,
    rooms: {},
    structures: {},
    sources: [],
    creeps: {},
  }
  let base = Memory.Empire.bases[roomName];
  // Fill structures and creeps categories with all needed fields
  for (let i in STRUCTURES_ALL){
  base.structures[STRUCTURES_ALL[i]] = [];
  }
  const roles = require('roles');
  for (let i in roles){
    base.creeps[i] = [];
  }
  // Add the main room to the base
  addRoom(roomName, roomName);
  // Mark the main room scouted and add sources to the list
  base.rooms[roomName].scouted = true;
  let controller = Game.rooms[roomName].controller;
  newSources = controller.room.find(FIND_SOURCES);
  for (let i in newSources){
    let exists = false
    for (let j in base.sources){
      if (base.sources[j].id == newSources[i].id){
        exists = true;
      }
    }
    if (exists == false){
      addSource(roomName, newSources[i].id);
    }
  }

}

// Helper functions and classes for memory objects
addBaseHelpers = {

  Source: class{
    constructor(roomName, id, dist, neededCARRY){
      this.id = id;
      this.roomName = roomName;
      this.harv = '';
      this.boots = [];
      this.hauls = [];
      this.distance = 0;
      this.neededCARRY = neededCARRY;
      this.isMineral = false;
    }
  }
}
