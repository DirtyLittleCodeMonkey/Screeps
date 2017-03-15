RoomVisual.drawPath = function(path) {
    let outvis = {}
    for (let nameRoom in path) {
        let p = RoomPosition.deserializePos(path[nameRoom]).roomName
        if (!outvis[p]) {
            outvis[p] = new RoomVisual(p)
        }
    }
    for (let position in path) {
        if (position < path.length-1) {
            let newPos = RoomPosition.deserializePos(path[position])
            let nextPos = RoomPosition.deserializePos(path[Number(position)+1])
            if (newPos.roomName == nextPos.roomName) {
                outvis[newPos.roomName].line(newPos, nextPos, {width: 0.15, color: '#000000', opacity: 0.25})
            }
        }
    }
}
