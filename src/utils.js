'use strict';

var Snapshot = require('./snapshot');
var _        = require('lodash');

exports.makeRefSnap = function makeRefSnap(ref) {
  return new Snapshot(ref, ref.getData(), ref.priority);
};

exports.mergePaths = function mergePaths (base, add) {
  return base.replace(/\/$/, '')+'/'+add.replace(/^\//, '');
};

exports.processData = function processData(data, getServerTime) {
  var newData = _.clone(data);
  if(_.isObject(newData)) {
    _.each(newData, function(v, k) {
      v = processData(v, getServerTime);
      if (v === null) {
        delete newData[k];
      } else {
        newData[k] = v;
      }
    });

    var hasData = false;

    _.each(newData, function(v, k) {
      hasData = hasData || !(/^\./.test(k));
    });

    if (!hasData) {
      if (isServerTimestamp(newData)) {
        return getServerTime();
      }
      if (_.has(newData, '.priority')) {
        if (!_.has(newData, '.value')) {
          return null;
        }
      } else {
        return _.has(newData, '.value') ? newData['.value'] : null;
      }
    }
  }
  return newData;
};

/*
exports.cleanData = function cleanData(data) {
  data = _.clone(data);
  if(_.isObject(data)) {
    if (_.has(data, '.value')) {
      return cleanData(data['.value']);
    }
    _.each(data, function (v, k) {
      v = cleanData(v);
      if (v === null || /^\./.test(k)) {
        delete data[k];
      }
    });
    if (_.isEmpty(data)) {
      return null;
    }
  }
  return data;
};*/

exports.getMeta = function getMeta (data, key, defaultVal) {
  var val = defaultVal;
  var metaKey = '.' + key;
  if (_.isObject(data) && _.has(data, metaKey)) {
    val = data[metaKey];
    delete data[metaKey];
  }
  return val;
};

exports.mergePriority = function mergePriority(data, priority) {
  data = _.clone(data);
  if(_.isObject(data)) {
    data['.priority'] = priority;
  } else {
    data = {
      '.value': data,
      '.priority': priority
    };
  }
  if (priority === null) {
    if(_.has(data, '.value')) {
      return data['.value'];
    }
    delete data['.priority'];
  }
  return data;
};

exports.assertKey = function assertKey (method, key, argNum) {
  if (!argNum) argNum = 'first';
  if (typeof(key) !== 'string' || key.match(/[.#$\/\[\]]/)) {
    throw new Error(method + ' failed: '+ argNum+' was an invalid key "'+(key+'')+'. Firebase keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]"');
  }
};

exports.priAndKeyComparator = function priAndKeyComparator (testPri, testKey, valPri, valKey) {
  var x = 0;
  if (!_.isUndefined(testPri)) {
    x = exports.priorityComparator(testPri, valPri);
  }
  if (x === 0 && !_.isUndefined(testKey) && testKey !== valKey) {
    x = testKey < valKey? -1 : 1;
  }
  return x;
};

exports.priorityComparator = function priorityComparator (a, b) {
  if (a !== b) {
    if (a === null || b === null) {
      return a === null? -1 : 1;
    }
    if (typeof a !== typeof b) {
      return typeof a === 'number' ? -1 : 1;
    } else {
      return a > b ? 1 : -1;
    }
  }
  return 0;
};

exports.isServerTimestamp = isServerTimestamp;

function isServerTimestamp (data) {
  return _.isObject(data) && data['.sv'] === 'timestamp';
}
