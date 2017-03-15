findPath = function(p1, p2){

  let pathSearch = PathFinder.search(p1, {pos: p2, range: 1}, {maxOps: 25000, plainCost: 2, swampCost: 10,
    roomCallback: function(rmName) {
      let rm = Game.rooms[rmName]

      if (!rm) {
        return false
      }

      let costs = new PathFinder.CostMatrix


      rm.find(FIND_STRUCTURES).forEach(function(s) {
        if (s.structureType == STRUCTURE_ROAD) {
          costs.set(s.pos.x, s.pos.y, 1)
        }
        else if (OBSTACLE_OBJECT_TYPES.includes(s.structureType)) {
          costs.set(s.pos.x, s.pos.y, 0xff)
        }
      });

      rm.find(FIND_SOURCES).forEach(function(s) {
        s.pos.getAdjacent().forEach(function(r) {
          costs.set(r.x, r.y, 3)
        })
      });

      rm.find(FIND_MINERALS).forEach(function(s) {
        s.pos.getAdjacent().forEach(function(r) {
          costs.set(r.x, r.y, 3)
        })
      })

      return costs
    }
  })

  let filteredPath = _.filter(pathSearch.path, s => !(s.x == 0 || s.x == 49 || s.y == 0 || s.y == 49))

  let path = RoomPosition.serializePathFind(filteredPath)
  return path;
}

global.DIRECTIONS = {
  1: [0, -1],
  2: [1, -1],
  3: [1, 0],
  4: [1, 1],
  5: [0, 1],
  6: [-1, 1],
  7: [-1, 0],
  8: [-1, -1]
}

RoomPosition.serializePathFind = function(path) {
  let newPath = []
  for (let p in path) {
    if (!(p.x == 49 || p.y == 49 || p.x == 0 || p.y == 0)) {
      let newPos = RoomPosition.serializePos(new RoomPosition(path[p].x, path[p].y, path[p].roomName))
      newPath.push(newPos)
    }
  }

  return newPath.reverse()
}

RoomPosition.prototype.getAdjacent = function() {
  let posArray = []
  for (let i = 1; i<8; i++) {
    let newPos = this.fromDirection(i)
    if (Game.map.getTerrainAt(newPos) != 'wall') {
      posArray.push(newPos)
    }
  }
  return posArray
}

RoomPosition.prototype.fromDirection = function(direction) {		// returns a RoomPosition given a RoomPosition and a direction
  return new RoomPosition(this.x+DIRECTIONS[direction][0], this.y + DIRECTIONS[direction][1], this.roomName)
}

RoomPosition.serializePos = function(p) {
  return "(" + p.x + ", " + p.y + ") " + "[" + p.roomName + "]"
}

RoomPosition.deserializePos = function(p) {
  let reg1 = /\w+/g
  let x = p.match(reg1)[0]
  let y = p.match(reg1)[1]
  let n = p.match(reg1)[2]
  return new RoomPosition(x, y, n)
}

RoomPosition.checkPath = function(path) {
  // Needs to return construction site ID
  for (let pth of path) {
    let newPos = RoomPosition.deserializePos(pth)
    let stuff = newPos.look()
    if (_.indexOf(path, pth) != 0) {
      if (_.some(stuff, s => s.type == 'constructionSite' && s.constructionSite.structureType == STRUCTURE_ROAD)) {
        return false
      }
      else if (!_.some(stuff, s => s.type == 'structure' && s.structure.structureType == STRUCTURE_ROAD)) {
        newPos.createConstructionSite(STRUCTURE_ROAD)
        return true
      }
    }
  }
}

Creep.prototype.getOffExit = function() {

  let directionsFromExit = {    // Legal directions from a given exit
    x: {
      49: [7, 8, 6],
      0: [3, 4, 2]
    },
    y: {
      49: [1, 8, 2],
      0: [5, 6, 4]
    }
  }

  if (directionsFromExit.x[this.pos.x]) {
    var allowedDirections = directionsFromExit['x'][this.pos.x]
  }
  if (directionsFromExit.y[this.pos.y]) {
    var allowedDirections = directionsFromExit['y'][this.pos.y]
  }

  if (!allowedDirections) {
    this.say('D:')
    return false
  }

  for (let direction of allowedDirections) {
    let stuff = this.pos.fromDirection(direction).look()
    if (_.findIndex(stuff, p => p.type == 'creep' || (p.structure && OBSTACLE_OBJECT_TYPES[p.structures.structureType]) || p.terrain == 'wall') == -1) {        // If an obstacle doesn't exist,
    this.move(direction)
    break
  }
}
}

//Pathfinding for multiple rooms
Creep.prototype.findPath = function(roomName2){
  //Rooms to avoid pathing through
  const HOSTILE_ROOMS = []
  let HR = HOSTILE_ROOMS;
  let route = Game.map.findRoute(this.room, roomName2, {
    routeCallback(rmName, fromRoomName) {
      if (HR.indexOf(rmName) > -1 && rmName != roomName2) {
        return Infinity;
      }
      return 1;
    }
  })
  let p = this.pos.findClosestByRange(this.room.find(_.first(route).exit))
  let result = this.moveTo(p, {reusePath: 25})
}
