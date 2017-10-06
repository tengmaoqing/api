/*
* @Author: TMQ
* @Date:   2017-10-05 20:43:13
* @Last Modified by:   TMQ
* @Last Modified time: 2017-10-05 21:41:25
*/

const util = require('util');

const Queue = function (maxCount = 10) {
  this.maxCount = maxCount;
  this.list = [];
};

Queue.prototype.addTask = function (fn) {
  this.list.push(fn);
};

Queue.prototype.clear = function () {
  this.list = [];
};

Queue.prototype.next = function () {
  if (this.list.lenght) {
    this.run();
  }
};

Queue.prototype.run = function () {
  var that = this;
  (async () => {
    try {
      const task = this.list.shift();

      if (task && util.isFunction(task)) {
        const result = await task();
        this.next();
      }
    } catch (err) {
      console.log(err);
      this.next();
    }
  })();
};

module.exports = Queue;
