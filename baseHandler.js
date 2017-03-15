const spawnHandler = require('spawnHandler');
const baseBuilding = require('baseBuilding');
const tower = require('tower');

module.exports = {

  run: function(base){

    //Refresh the objects in memory periodically, or if it has not yet been executed
    if (Game.time % 100 == 0){
      this.refreshMemory(base);
    }
    this.ticklyRefresh(base)

    // Plan and build structures
    this.planBase(base);

    // Clear memory of dead creeps
    for (let i in base.creeps){
      for (let j in base.creeps[i]){
        if (Game.getObjectById(base.creeps[i][j]) == undefined){
          base.creeps[i].splice(j, 1);
        }
      }
    }

    //Run spawn handler for base
    spawnHandler.run(base);

    // Run towers
    if (base.structures.tower.length > 0){
      let towerTargets = _.filter(Game.rooms[base.mainRoom].find(FIND_HOSTILE_CREEPS), function(hc){return isOnExit(hc.pos) == false})
      if (towerTargets > 0){
        for (let i in base.structures.tower){
          tower.run(Game.getObjectById(base.structures.tower[i]), towerTargets);
        }
      }
    }

    // Draw room HUD
    this.drawHUD(base);

  },

  drawHUD: function(base){
    // Spawn text
    let spawns = getObjectList(base.structures.spawn);
    for (let i in spawns){
      if (spawns[i].spawning != undefined){
        new RoomVisual(spawns[i].pos.roomName).text('Spawning ' + spawns[i].spawning.name, spawns[i].pos.x, spawns[i].pos.y-1)
      }
    }
    // Controller progress
    let controller = Game.getObjectById(base.structures.controller[0]);
    let controlPrecent = _.round((controller.progress / controller.progressTotal) * 100, 2)
    new RoomVisual(base.mainRoom).text('Controller Progress: ' + controlPrecent + '%', 4, 0)
    // Storage
    let storage = Game.getObjectById(base.structures.storage[0]);
    let precentFull =  ''
    if (storage != undefined){
        precentFull = _.round((_.sum(storage.store) / storage.storeCapacity) * 100, 2) + '%'
    }
    else{
      precentFull = 'DNE'
    }
    new RoomVisual(base.mainRoom).text('Storage Capacity: ' + precentFull, 4, 1)

    //Under attack notification
    for (let i in base.rooms){
      if (base.rooms[i].underAttack == true){
        new RoomVisual(base.mainRoom).text('UNDER ATTACK', 4, 2, {color: 'red'})
        break
      }
    }

  },

  // Create a map of the room and find a location to build the base structures
  planBase: function(base){
    if (base.structures.spawn.length == 0){
      return
    }
    // Break up the generation of the map and location finding over several ticks
    let mapGenerated = false;
    if (base.building == undefined){
      base.building = {};
      base.building.roomMap = baseBuilding.getRoomMap(base);
      mapGenerated = true;
    }
    if (mapGenerated == false && base.building.structureLocation == undefined){
      base.building.validSpots = baseBuilding.findValidSpots(base.building.roomMap, 7, 7);
      base.building.structureLocation = baseBuilding.findBestSpot(base.building.validSpots);
    }
    if (base.building.structureLocation != undefined && Game.time % 50 == 0){
      baseBuilding.placeSites(base);
    }
    baseBuilding.makeRoads(base);
    //baseBuilding.render(base);
  },

  // Refresh memory for the base every tick
  ticklyRefresh: function(base){

    base.structures.constructionSites = [];
    for (let i in base.rooms){
      let room = Game.rooms[i];
      if (room == undefined){
        continue;
      }
      constructionSites = room.find(FIND_CONSTRUCTION_SITES);
      for (let i in constructionSites){
        base.structures.constructionSites.push(constructionSites[i].id);
      }
    }

    // Find walls and ramparts that need repairing
    base.structures.repairTargets = [];
    for (let i in base.structures.constructedWall){
      let wall = Game.getObjectById(base.structures.constructedWall[i]);
      if (wall == undefined){
        continue
      }
      if (wall.hits < RAMPART_HITS_MAX[base.level]){
        base.structures.repairTargets.push(base.structures.constructedWall[i]);
      }
    }
    for (let i in base.structures.rampart){
      let rampart = Game.getObjectById(base.structures.rampart[i]);
      if (rampart == undefined){
        continue
      }
      if (rampart.hits < RAMPART_HITS_MAX[base.level]){
        base.structures.repairTargets.push(base.structures.rampart[i]);
      }
    }

  },

  // Refresh all of the bases memory
  refreshMemory: function(base){

    console.log('<font color="green">Memory Refresh ' + base.mainRoom + '</font color>');

    // Reset memory structure
    base.structures = {};
    for (let i in STRUCTURES_ALL){
      base.structures[STRUCTURES_ALL[i]] = [];
    }

    // Get base level
    base.level = 0;
    let energyCap = Game.rooms[base.mainRoom].energyCapacityAvailable;
    for (let i in ROOM_LEVELS){
      if (energyCap >= ROOM_LEVELS[i]){
        base.level += 1;
      }
      else{
        break;
      }
    }

    // Refresh memory of structures
    for (let i in base.rooms){
      let room = Game.rooms[i];
      // If we do not have vision of the room, skip it
      if (room == undefined){
        continue;
      }
      let stuff = room.find(FIND_STRUCTURES);
      for (let j in STRUCTURES_ALL){
        let structType = STRUCTURES_ALL[j];
        let filteredStructs = _.filter(stuff, function(struct){return struct.structureType == structType});
        for (let k in filteredStructs){
          base.structures[structType].push(filteredStructs[k].id);
        }
      }
    }

    // Make sure all sources have updated info
    if (base.structures.spawn.length != 0){
      for (let i in base.sources){
        if (base.sources[i].distance == 0){
          let source = Game.getObjectById(base.sources[i].id);
          let target = Game.getObjectById(base.structures.storage[0])
          if (base.structures.storage.length == 0){
            target = Game.getObjectById(base.structures.spawn[0]);
          }
          let dist = PathFinder.search(source.pos, {pos: target.pos, range: 1}).path.length;
          base.sources[i].distance = dist;
        }
      }
    }

    // Check if the helper room needs help anymore
    if (base.helpRoom != undefined){
      let helpBase = Memory.Empire.bases[base.helpRoom];
      if (helpBase.structures.spawn.length > 0){
        base.helpRoom = undefined;
      }
    }

  },


};
