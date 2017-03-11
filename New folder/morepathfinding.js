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