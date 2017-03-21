module.exports = {

  placeSites: function(base){
    let room = Game.rooms[base.mainRoom];
    for (let i in base.building.structureLocation){
      let bestSpot = base.building.structureLocation;
      for (let y in this.blueprints.MODULAR_EXTENSIONS){
        for (let x in this.blueprints.MODULAR_EXTENSIONS[y]){
          let struct = this.blueprints.MODULAR_EXTENSIONS[y][x]
          if (struct != false){
            room.createConstructionSite(bestSpot[0]+parseInt(x), bestSpot[1]+parseInt(y), struct);
          }
        }
      }
    }
    // build Extractor
    if (base.level > 5 && base.structures.extractor.length == 0){
      let mainRoom = Game.rooms[base.mainRoom]
      let mineral = mainRoom.find(FIND_MINERALS)[0];
      mainRoom.createConstructionSite(mineral.pos, STRUCTURE_EXTRACTOR);
    }
  },

  getRoomMap: function(base){
    room = Game.rooms[base.mainRoom];
    let roomMap = []
    x = 0;
    while (x < 50){
      yArray = [];
      y = 0;
      while (y < 50){
        let stuff = room.lookAt(x, y);
        valid = false;
        for (let i in stuff){
          if (stuff[i].type == 'terrain' && stuff[i].terrain != 'wall'){
            valid = true;
          }
          if (stuff[i].type == 'structure' && stuff[i].structure.structureType != STRUCTURE_ROAD){
            valid = false;
            break;
          }
        }
        yArray.push(valid);
        y ++;
      }
      roomMap.push(yArray);
      x ++;
    }
    return roomMap;
  },

  findValidSpots: function(roomMap, dimX, dimY){
    let validSpots = [];
    for (let x in roomMap){
      if (parseInt(x) + dimX >= roomMap.length){
        break;
      }
      for (let y in roomMap[x]){
        if (parseInt(y) + dimY >= roomMap[x].length){
          break;
        }
        let xCount = 0
        let valid = true
        while (xCount < dimX){
          let yCount = 0
          while (yCount < dimY){
            if (roomMap[parseInt(x)+xCount][parseInt(y)+yCount] == false){
              valid = false;
              break;
            }
            yCount ++;
          }
          if (valid == false){
            break;
          }
          xCount ++;
        }
        if (valid == true){
          validSpots.push([parseInt(x), parseInt(y)]);
        }
      }
    }
    return validSpots;
  },

  findBestSpot: function(validSpots){
    let bestSpot = validSpots[0];
    let bestDistToCenter = Math.abs(bestSpot[0] - 24) + Math.abs(bestSpot[1] - 24);
    for (let i in validSpots){
      let spot = validSpots[i];
      let distToCenter = Math.abs(spot[0] - 24) + Math.abs(spot[1] - 24);
      if (distToCenter < bestDistToCenter){
        bestSpot = spot;
        bestDistToCenter = distToCenter;
      }
    }
    return bestSpot;
  },

  render: function(base){
    //Draw potential spots
    for (let x in base.building.validSpots){
      let spot = base.building.validSpots[x];
      new RoomVisual(base.mainRoom).circle(spot[0], spot[1]);
    }

    for (let i in base.building.structureLocation){
      //Draw best spot outline
      let bestSpot = base.building.structureLocation;
      new RoomVisual(base.mainRoom).circle(bestSpot[0], bestSpot[1], {fill: 'green'})
      new RoomVisual(base.mainRoom).rect(bestSpot[0], bestSpot[1], 6, 6, {fill: 'green'})
      new RoomVisual(base.mainRoom).circle(24, 24, {fill: 'red'})

      //Draw best spot layout
      for (let y in this.blueprints.MODULAR_EXTENSIONS){
        for (let x in this.blueprints.MODULAR_EXTENSIONS[y]){
          let struct = this.blueprints.MODULAR_EXTENSIONS[y][x]
          if (struct == false){
            continue
          }
          else if (struct == 'extension'){
            new RoomVisual(base.mainRoom).circle(bestSpot[0]+parseInt(x), bestSpot[1]+parseInt(y), {fill:'blue'})
          }
          else if (struct == 'tower'){
            new RoomVisual(base.mainRoom).circle(bestSpot[0]+parseInt(x), bestSpot[1]+parseInt(y), {fill:'black'})
          }
          else if (struct == 'link'){
            new RoomVisual(base.mainRoom).circle(bestSpot[0]+parseInt(x), bestSpot[1]+parseInt(y), {fill:'purple'})
          }
        }
      }
    }
  },

  makeRoads: function(base){
    // Init path memory
    if (base.building.paths == undefined){
      base.building.paths = [];
    }
    // Recalc paths every 50 ticks
    if (Game.time % 50 == 0){
      base.building.paths = [];
      let spawn = Game.getObjectById(base.structures.spawn[0]);
      let storage = Game.getObjectById(base.structures.storage[0]);
      let controller = spawn.room.controller;

      // Sources
      for (let i in base.sources){
        let source = Game.getObjectById(base.sources[i].id)
        if (source == undefined){
          continue;
        }

        let path = {};
        if (storage == undefined){
          path = findPath(spawn.pos, source.pos);
        }
        else{
          path = findPath(storage.pos, source.pos);
        }
        base.building.paths.push(path);
      }
      // Controller
      let controllerPath = findPath(spawn.pos, controller.pos)
      base.building.paths.push(controllerPath);
    }

    // Check paths for each road
    for (let i in base.building.paths){
      RoomPosition.checkPath(base.building.paths[i])
      //RoomVisual.drawPath(base.building.paths)[i];
    }
  },

  blueprints: {
    MODULAR_EXTENSIONS: [
      [false, 'extension', 'extension', false, 'extension', 'extension', 'extension'],
      ['extension', false, 'extension', 'extension', 'extension', false, 'extension'],
      ['extension', 'extension', false, 'link', false, 'extension', 'extension'],
      [false, 'extension', 'tower', false, 'tower', 'extension', false],
      ['extension', 'extension', false, 'extension', false, 'extension', 'extension'],
      ['extension', false, 'extension', 'extension', 'extension', false, 'extension'],
      [false, 'extension', 'extension', false, 'extension', 'extension', false]
    ],
  },
};
