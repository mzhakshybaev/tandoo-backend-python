import {capitalize} from 'lodash-es';
import mainStore from '../../stores/MainStore';
import converter from 'number-to-words';

const TRIPLET_NAMES = [
    undefined,
    ['тысяча', 'тысячи', 'тысяч'],
    ['миллион', 'миллиона', 'миллионов'],
    ['миллиард', 'миллиарда', 'миллиардов'],
    ['триллион', 'триллиона', 'триллионов'],
    ['квадрилион', 'квадрилиона', 'квадрилионов'],
  ],
  ZERO_NAME = 'ноль',
  ONE_THOUSAND_NAME = 'одна',
  TWO_THOUSAND_NAME = 'две',
  HUNDRED_NAMES = [
    undefined, 'сто', 'двести', 'триста', 'четыреста',
    'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот',
  ],
  TEN_NAMES = [
    undefined, undefined, 'двадцать', 'тридцать', 'сорок',
    'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто',
  ],
  UNIT_NAMES = [
    ZERO_NAME, 'один', 'два', 'три', 'четыре',
    'пять', 'шесть', 'семь', 'восемь', 'девять',
  ],
  TEN_UNIT_NAMES = [
    'десять', 'одиннадцать', 'двенадцать', 'тринадцать',
    'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать',
    'восемнадцать', 'девятнадцать',
  ];

const BIRDIKTER = [undefined,'бир', 'эки', 'үч', 'төрт', 'беш', 'алты', 'жети', 'сегиз', 'тогуз'],
  ONDUKTAR = [undefined, 'он', 'жыйырма', 'отуз', 'кырк', 'элүү', 'алтымыш', 'жетимиш', 'сексен', 'токсон'],
  ZHUZDUK = 'жуз',
  MINDIK = 'миң',
  MILLION = 'миллион',
  MILLRD = 'миллиард',
  TRILLION = 'триллион';


function pluralEnding(number, variants) {
  let one = variants[0],
    two = variants[1],
    five = variants[2];

  number = Math.abs(number);
  number %= 100;

  if (number >= 5 && number <= 20) {
    return five;
  }

  number %= 10;

  if (number === 1) {
    return one;
  }

  if (number >= 2 && number <= 4) {
    return two;
  }

  return five;
}

export function moneyToWords(number, options = {}) {
  // defaults
  let som = 'сом',
    tyiyn = 'тыйын';
  switch (mainStore.language.code) {
    case 'en':
      som = 'som';
      tyiyn = 'tyiyn';
      break
  }
  options.capitalize = options.capitalize || true;
  options.showCurrency = options.showCurrency || true;
  options.currency = options.currency || true;

  let [int, dec] = number.toFixed(2).split('.').map(i => parseInt(i));

  return [numberToWords(int, options), som, dec, tyiyn].join(' ');
}

export function numberToWords(int, options = {}) {
  switch (mainStore.language.code) {
    case 'ru':
      return numberToWordsRu(int, options)
    case 'en':
      return converter.toWords(int)
    case 'kg':
      return numberToWordsKg(int,options)
    default:
      return numberToWordsRu(int, options)
  }
}

export function numberToWordsRu(number, options = {}) {
  let numberInWords = [],
    i,
    pos,
    length,
    tripletNames,
    tripletIndex,
    digitPosition,
    prevDigitValue;

  let int = number.toString();

  length = int.length;

  for (i = 0; i < length; i += 1) {
    pos = length - 1 - i;
    tripletIndex = Math.floor(pos / 3);
    digitPosition = pos % 3;
    let digitValue = parseInt(int[i]);

    if (digitPosition === 2) {
      if (digitValue) {
        numberInWords.push(HUNDRED_NAMES[digitValue]);
      }
      continue;
    }

    if (digitPosition === 1) {
      if (digitValue === 1) {
        numberInWords.push(TEN_UNIT_NAMES[parseInt(int[i + 1])])
      } else if (digitValue) {
        numberInWords.push(TEN_NAMES[digitValue])
      }
      continue;
    }

    if (digitPosition === 0) {
      prevDigitValue = (i > 0) ? parseInt(int[i - 1]) : undefined;

      if (digitValue === 0) {
        if (length === 1) {
          numberInWords.push(ZERO_NAME);
        }
      } else if (prevDigitValue && prevDigitValue !== 1 || !prevDigitValue) {
        numberInWords.push(
          (tripletIndex === 1 && digitValue === 1) ? ONE_THOUSAND_NAME :
            (tripletIndex === 1 && digitValue === 2) ? TWO_THOUSAND_NAME :
              UNIT_NAMES[digitValue]
        )
      }

      tripletNames = TRIPLET_NAMES[tripletIndex];
      if (tripletNames) {

        if (prevDigitValue === 1) {
          numberInWords.push(
            pluralEnding(10 + digitValue, tripletNames));
        } else {
          numberInWords.push(
            pluralEnding(digitValue, tripletNames));
        }
      }
    }

  }

  let res = numberInWords.join(' ');

  if (options.capitalize) {
    return capitalize(res);
  } else {
    return res;
  }
}


export function numberToWordsKg(number, options = {}) {
  let numberInWords = [],
    i,
    pos,
    length,
    tripletIndex,
    digitPosition;

  let int = number.toString();

  length = int.length;

  for (i = 0; i < length; i += 1) {
    pos = length - 1 - i;
    tripletIndex = Math.floor(pos / 3);
    digitPosition = pos % 3;
    let digitValue = parseInt(int[i]);
    if (digitPosition === 2) {
      if (digitValue) {
        numberInWords.push(BIRDIKTER[digitValue]+' ' + ZHUZDUK);
      }
      continue;
    }

    if (digitPosition === 1) {
      if (digitValue) {
        numberInWords.push(ONDUKTAR[digitValue])
      }
      continue;
    }

    if (digitPosition === 0) {
      if (digitValue === 0) {
        if (length === 1) {
          numberInWords.push(ZERO_NAME);
        }
      } else if (tripletIndex === 0) {
        numberInWords.push(
              BIRDIKTER[digitValue]
        )
      }
      else if(tripletIndex === 1){
        numberInWords.push(
          BIRDIKTER[digitValue] + " " + MINDIK
        )
      }
      else if(tripletIndex === 2){
        numberInWords.push(
          BIRDIKTER[digitValue] + " " + MILLION
        )
      }else if(tripletIndex === 3){
        numberInWords.push(
          BIRDIKTER[digitValue] + " " + MILLRD
        )
      }else if(tripletIndex === 4){
        numberInWords.push(
          BIRDIKTER[digitValue] + " " + TRILLION
        )
      }
    }

  }

  let res = numberInWords.join(' ');

  if (options.capitalize) {
    return capitalize(res);
  } else {
    return res;
  }
}
