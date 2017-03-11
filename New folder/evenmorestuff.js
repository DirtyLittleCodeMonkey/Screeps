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