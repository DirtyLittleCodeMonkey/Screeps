Creep.prototype.upgr = function(controller){
  let result = this.upgradeController(controller);
  if (result == ERR_NOT_IN_RANGE){
    this.moveTo(controller);
  }
  else if (result !== 0 && result !== ERR_BUSY){
    return result;
  }
};
