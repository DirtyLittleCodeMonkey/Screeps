module.exports = {

  run: function(creep){

    this.setMemoryState(creep);
    let base = Memory.Empire.bases[creep.memory.base];

    // If needed structures DNE, return
    if (base.structures.storage.length == 0 || base.structures.terminal.length == 0){
      return
    }

    let terminal = Game.getObjectById(base.structures.terminal[0]);

    // Make sure terminal has enough energy
    if (terminal.store.energy < 20000){
      this.giveTerminalEnergy(creep);
      return
    }

    // Get minerals from Storage
    if (creep.memory.delivering == false){
      this.getMinerals(creep);
      return
    }

    // Put minerals into terminal
    if (creep.memory.delivering == true){
      if (creep.transfer(terminal, _.max(_.keys(creep.carry), s => creep.carry[s])) == ERR_NOT_IN_RANGE){
        creep.moveTo(terminal)
      }
    }
  },

  setMemoryState: function(creep){
    if (creep.memory.delivering == undefined){
      creep.memory.delivering = false;
    }
    if (_.sum(creep.carry) > 0){
      creep.memory.delivering = true;
    }
    else{
      creep.memory.delivering = false;
    }
  },

  getMinerals: function(creep){
    let base = Memory.Empire.bases[creep.memory.base];
    // If the storage has something other than energy, withdraw them
    let storage = Game.getObjectById(base.structures.storage[0]);
    let terminal = Game.getObjectById(base.structures.terminal[0]);
    // If storage has no minerals or terminal is full, wait at terminal
    if (_.sum(storage.store) - storage.store.energy == 0 || _.sum(terminal.store) == terminal.storeCapacity){
      let terminal = Game.getObjectById(base.structures.terminal[0]);
      if (creep.pos.isNearTo(terminal) == false){
        creep.moveTo(terminal);
      }
      return
    }
    // Get minerals
    if (_.sum(storage.store) - storage.store.energy > 0){
      let mineralType = ''
      for (let i in storage.store){
        if (BASIC_MINERALS.indexOf(i) > 0){
          mineralType = i
          break
        }
      }
      if (creep.withdraw(storage, mineralType) == ERR_NOT_IN_RANGE){
        creep.moveTo(storage);
      }
    }

  },

  giveTerminalEnergy: function(creep){
    let base = Memory.Empire.bases[creep.memory.base];
    // if the creep has something other than energy, deposite it into storage
    let storage = Game.getObjectById(base.structures.storage[0]);
    if (_.sum(creep.carry) - creep.carry.energy != 0){
      if (creep.transfer(storage, _.max(_.keys(creep.carry), s => creep.carry[s])) == ERR_NOT_IN_RANGE){
        creep.moveTo(storage);
      }
      return
    }
    // Get energy from storage
    // If storage has no energy, wait at terminal
    if (storage.store.energy == 0){
      let terminal = Game.getObjectById(base.structures.terminal[0]);
      if (creep.pos.isNearTo(terminal) == false){
        creep.moveTo(terminal);
      }
      return
    }
    // Get energy
    if (creep.carry.energy == 0){
      if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
        creep.moveTo(storage);
      }
      return
    }
    // Deliver energy to terminal
    let terminal = Game.getObjectById(base.structures.terminal[0]);
    if (creep.transfer(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
      creep.moveTo(terminal);
    }
  },

};
