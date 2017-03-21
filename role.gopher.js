module.exports = {

  run: function(creep){

    let base = Memory.Empire.bases[creep.memory.base]

    this.setMemoryState(creep);

    // Deliver energy
    if (creep.memory.delivering == true){
      this.deliverEnergy(creep);
      return
    }

    // Get energy
    let storage = Game.getObjectById(base.structures.storage[0])
    if (storage.store.energy == 0){
      return
    }
    if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
      creep.moveTo(storage)
    }

  },

  // Deliver energy to extensions and spawns
  deliverEnergy: function(creep){
    let deliveryTarget = Game.getObjectById(creep.memory.deliveryTarget);
    // Find new delivery target
    if (deliveryTarget == undefined || deliveryTarget.energy == deliveryTarget.energyCapacity){
      this.findDeliveryTarget(creep);
      deliveryTarget = Game.getObjectById(creep.memory.deliveryTarget);
    }

    if (deliveryTarget != undefined){
      if (creep.transfer(deliveryTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
        creep.moveTo(deliveryTarget);
      }
      else{
        if (this.findNewDeliveryTarget(creep) != false){
          deliveryTarget = Game.getObjectById(creep.memory.deliveryTarget);
          if (deliveryTarget != undefined){
            creep.moveTo(deliveryTarget);
          }
        }
      }
      return
    }
  },

  // Find a new target that is not the same ID as the last target
  findNewDeliveryTarget: function(creep){
    let base = Memory.Empire.bases[creep.memory.base];
    let extensions = getObjectList(_.filter(base.structures.extensionsNeedEnergy, function(structId){return structId != creep.memory.deliveryTarget}))
    let nearest = creep.pos.findClosestByRange(extensions);
    if (nearest == undefined){
      return false
    }
    creep.memory.deliveryTarget = nearest.id;
  },

  // Find an extension or spawn that needs energy
  findDeliveryTarget: function(creep){

    let base = Memory.Empire.bases[creep.memory.base];
    creep.memory.deliveryTarget = undefined;
    // If no targets exist, return
    if (base.structures.extensionsNeedEnergy.length == 0){
      return
    }

    let extensions = getObjectList(base.structures.extensionsNeedEnergy);
    let nearest = creep.pos.findClosestByRange(extensions);
    creep.memory.deliveryTarget = nearest.id;
  },

  setMemoryState: function(creep){
    if (creep.memory.delivering == undefined || creep.carry.energy == 0){
      creep.memory.delivering = false;
    }
    else if (creep.carry.energy > 0){
      creep.memory.delivering = true;
    }
  },


};
