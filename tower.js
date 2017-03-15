module.exports = {

  run: function(tower, targets){

    let nearest = tower.pos.findClosestByRange(targets);
    tower.attack(nearest);

  }

};
