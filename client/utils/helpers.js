import {every, filter, find, findIndex, isEmpty, iteratee, reject, some, without, flatten} from "lodash-es";
import moment from "moment";
import numeral from "numeral";
import {FORMAT_DATE, FORMAT_DATE_TIME, FORMAT_MONEY, FORMAT_MONEY_CURRENCY} from "../utils/common";
import {observable} from 'mobx';
import i18next from 'i18next';


// Array
Object.defineProperties(Array.prototype, {
  find: {
    value: function (predicate) {
      return find(this, predicate);
    }
  },
  findById: {
    value: function (_id) {
      return this.find({_id});
    }
  },
  findIndex: {
    value: function (predicate) {
      return findIndex(this, predicate);
    }
  },
  findIndexById: {
    value: function (_id) {
      return this.findIndex({_id});
    }
  },
  filter: {
    value: function (predicate) {
      return filter(this, predicate);
    }
  },
  every: {
    value: function (predicate) {
      return every(this, predicate)
    }
  },
  some: {
    value: function (predicate) {
      return some(this, predicate)
    }
  },
  withoutArr: {
    value: function (values) {
      return without(this, ...values)
    }
  },
});

// ObservableArray
const OA = observable.array().constructor;
const OA_find = OA.prototype.find;
const OA_findIndex = OA.prototype.findIndex;
const OA_filter = OA.prototype.filter;
const OA_every = OA.prototype.every;
const OA_some = OA.prototype.some;

Object.defineProperties(OA.prototype, {
  find: {
    value: function (predicate) {
      return OA_find.call(this, iteratee(predicate))
    }
  },
  findIndex: {
    value: function (predicate) {
      return OA_findIndex.call(this, iteratee(predicate))
    }
  },
  filter: {
    value: function (predicate) {
      return OA_filter.call(this, iteratee(predicate))
    }
  },
  every: {
    value: function (predicate) {
      return OA_every.call(this, iteratee(predicate))
    }
  },
  some: {
    value: function (predicate) {
      return OA_some.call(this, iteratee(predicate))
    }
  },
});

// Object
Object.defineProperties(Object.prototype, {
  // search in array or args
  in_: {
    value: function (...arr) {
      return flatten(arr).includes(this)
    }
  }
});

// // test
// let a = [{_id: 1}, {_id: 2}];
// let a1 = a.find({_id: 2});
// let a2 = a.findById(2);
// let a3 = a.findIndex({_id: 2});
// let a4 = a.findIndexById(2);
// let a5 = a.every({_id: 1});
// let a6 = a.some({_id: 1});
//
// let b = observable.array(a);
// let b1 = b.find({_id: 2});
// let b2 = b.findById(2);
// let b3 = b.findIndex({_id: 2});
// let b4 = b.findIndexById(2);
// let b5 = b.every({_id: 1});
// let b6 = b.some({_id: 1});
//
// debugger;

// TODO: filter, pick, pickBy, forEach?, etc.
// TODO: fix mobx: ObservableArray.prototype.findIndex, find, pick, etc.

// TODO:
// // Create custom iteratee shorthands.
// _.iteratee = _.wrap(_.iteratee, function(iteratee, func) {
//   return !_.isRegExp(func) ? iteratee(func) : function(string) {
//     return func.test(string);
//   };
// });
//
// _.filter(['abc', 'def'], /ef/);
// // => ['def']


export function addressToString(address) {
  let {coate, street, house, apt} = address;
  return reject([coate && coate.name, street, house, apt], isEmpty).join(', ');
}

export function getStatusTr(type, status, options = {}) {
  let {long} = options;
  let prefix = '';

  switch (type) {
    case 'announce':
      prefix = 'Ann';
      break;

    case 'contract':
      prefix = 'Cnt';
      break;

    case 'con':
      prefix = 'Con';
      break;

    case 'inv':
      prefix = 'Inv';
      break;

    case 'company':
      prefix = 'Company';
      break;
  }

  let str = long ? 'StatusLong' : 'Status';
  let res = prefix + str + status;

  try {
    return i18next.t(res);
  } catch (e) {
    console.warn(e);
    return res;
  }
}

export function getPayTypeTr(type) {
  try {
    return i18next.t('PayType_' + type)
  } catch (e) {
    return 'PayType_' + type;
  }
}

// FORMAT FUNCTIONS

export const formatDate = (date, format = FORMAT_DATE) => {
  return moment(date).format(format);
};

export const formatDateTime = (date, format = FORMAT_DATE_TIME) => {
  return moment(date).format(format);
};

export const formatMoney = (amount, options = {}) => {
  let format;

  if (amount === '' || amount === undefined || amount === null)
    return 'N/A';

  amount = parseFloat(amount);

  if (!isFinite(amount)) // NaN, Infinity, -Infinity
    return 'N/A';

  if (options.format)
    format = options.format;
  else if (options.currency || options.currency === undefined) // ON by default
    format = FORMAT_MONEY_CURRENCY;
  else
    format = FORMAT_MONEY;

  return numeral(amount).format(format, Math.round);
};

// parse

export function parseNumber(str) {
  if (typeof str === 'number') {
    if (str && isFinite(str) && str) {
      return str
    }
  } else {
    str = str.replace(/,/g, '.');
    let price = parseFloat(str);
    if (price && isFinite(price)) {
      return price;
    }
  }
}

// News

export const draftHtmlToText = html => {
  let text = "";
  if (html && html.blocks) {
    for (let i = 0; i < html.blocks.length; i++) {
      let b = html.blocks[i];
      text += b.text;
    }
  }
  return text;
};

// Reg

export const normalizePhone = phone => phone.replace('(', '').replace(')', '').replace(/ /g, '');

// Supplier

/*
in:
  [
    {dirdocument_name: "Справка УГНС", 'date_start', 'date_end', ...}
    {dirdocument_name: "Справка СФ", 'date_start', 'date_end', ...}
  ]

dirdocument:
  9adbd2db-6b6b-469a-bce7-6481c84781cf
  20a1f7b5-102b-47c8-b4ac-deb9f7bc769e

 */
export const checkCompanyDocs = docs => {
  if (!docs || !docs.length) {
    return t('Вы не загрузили справки организации. Перейдите в профиль организации и загрузите их.')
  }

  return docs.every(doc => {
    return doc && doc.date_end && !isExpired(doc.date_end)
  })
};

// Checkers

export const isExpired = date => {
  return moment().diff(date) > 0
};

export const isEmail = email => {
  const re = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
  return re.test(email);
};
