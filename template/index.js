
exports.init = function(host){
  this.host=host;
};

exports.load =function(module){
    return require(module);
};
