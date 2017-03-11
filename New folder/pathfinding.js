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