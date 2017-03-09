Creep.prototype.harv = function (source) {
  let result = this.harvest(source);
  if (result == ERR_NOT_IN_RANGE){
    this.moveTo(source);
  }
  else if (result !== 0 && result !== ERR_BUSY){
    return result;
  }
};


Creep.prototype.upgr = function(controller){
  let result = this.upgradeController()(source);
  if (result == ERR_NOT_IN_RANGE){
    this.moveTo(source);
  }
  else if (result !== 0 && result !== ERR_BUSY){
    return result;
  }
};
