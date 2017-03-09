function addRoom(roomName){
  Memory.Empire.rooms[roomName] = {id:roomName, scouted:false};
}

function resetMemory(){
  Memory.Empire = {};
  Memory.Empire.rooms = {};
  Memory.Empire.bases = {};
}
