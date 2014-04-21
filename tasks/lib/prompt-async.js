var Promise = require('bluebird');
var inquirer = require('inquirer');

module.exports = function(questions) {
  return new Promise(function(resolve, reject) {
    inquirer.prompt(questions, resolve);
  });
};
