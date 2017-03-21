module.exports = {

  run: function(base){

    if (Memory.market == undefined || Memory.market.allOrders == undefined || Memory.market.tick != Game.time){
      Memory.market = {};
      Memory.market.allOrders = Game.market.getAllOrders();
      Memory.market.tick = Game.time;
    }

    let allMarketOrders = Memory.market.allOrders;
    let terminal = Game.getObjectById(base.structures.terminal);
    let storage = Game.getObjectById(base.structures.storage);

    //The amount of minerals we want to sell at a time
    let requested_amount = 1000;
    if (terminal == undefined || storage == undefined){
      return
    }

    //If the storage has less than 100k energy, do not sell (to preserve energy)
    else if (storage.store[RESOURCE_ENERGY] < 100000){
      return
    }
    else if (terminal.store.energy < 5000){
      return
    }

    //Find all the mineral types that we have in the terminal
    let storedResources = [];
    for (let j in terminal.store){
      if (terminal.store[j] > requested_amount){
        storedResources.push(j);
      }
    }
    //Remove energy from the list of resources we have
    let energyIndex = storedResources.indexOf(RESOURCE_ENERGY);
    storedResources.splice(energyIndex, 1);
    //If there are no more resources in the list, move on to the next base
    if (storedResources.length == 0){
      return
    }

    let sellableMinerals = BASIC_MINERALS;

    // If the minerals in the termianl are not sellable, return
    let containsSellable = false;
    for (let j in storedResources){
      if (sellableMinerals.indexOf(storedResources[j]) > 0){
        containsSellable = true;
      }
    }
    if (containsSellable == false){
      return
    }

    //Set the mineral type that we are selling to the first entry
    let mineral_type = storedResources[0];
    //Get a list of all the orders of this mineral type with amounts greater than the requested sell amount
    let list = _.filter(allMarketOrders, o => o.resourceType == mineral_type && o.type == ORDER_BUY && o.amount > requested_amount);
    //Find the best price within the list
    let bestPrice = _.max(list, o => o.price).price;
    //Find the orders that are at this best price
    let orders = _.filter(list, o => o.price == bestPrice && o.amount > 0);
    //Find the order with the lowest transaction cost
    let bestOrder = _.sortBy(orders, o => Game.market.calcTransactionCost(requested_amount, terminal.room.name, o.roomName))[0];

    //Execute the order
    console.log('Selling ' + requested_amount + ' of \'' + mineral_type + '\' at ' + bestOrder.price + ' per unit for a total profit of ' + bestOrder.price * requested_amount + ' credits in room ' +linkRoom(base.mainRoom));
    let result = Game.market.deal(bestOrder.id, requested_amount, terminal.room.name);
    if (result == -6){
      console.log('Sell failed: Not Enough Resources');
    }



  }

};
