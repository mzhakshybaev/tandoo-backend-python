import {Form, Field} from 'mobx-react-form';
import validatorjs from 'validatorjs';
import {observable} from 'mobx';
import {showInfo} from "utils/messages";
import authStore from 'stores/AuthStore';
import {t} from 'i18next';
import {normalizePhone} from 'utils/helpers';


class MyField extends Field {
  onChange = (e) => {
    let value = e.target.value;

    this.set(value);

    switch (this.name) {
      case 'phone':
        if (!value.includes('_')) {
          this.validate();
        }
        break;

      case 'otp':
        if (value.length === 6 && !value.includes('_')) {
          this.validate();
        }
        break;
    }

  };
}

const customRules = {
  phone: {
    function: (value) =>  {
      return normalizePhone(value).match(/^\+996\d{9}$/);
    },
    // message: 'The :attribute is not valid.',
  },
};

const customAsyncRules = {
  checkFullname: (fullname, attr, key, passes) => {
    authStore.checkData({fullname, command: 'register'})
      .then(r => passes(true))
      .catch(e => passes(false, e.message))
  },

  checkEmail: (email, attr, key, passes) => {
    authStore.checkData({email, command: 'register'})
      .then(r => passes(true))
      .catch(e => passes(false, e.message))
  },

  checkPhone: (value, attr, key, passes) => {
    let phone = normalizePhone(value);

    authStore.checkData({phone, command: 'register'})
      .then(r => passes(true))
      .catch(e => passes(false, e.message))
  },

  checkOTP: (otp, attr, key, passes) => {
    let phone = form.$('phone').value;

    if (!phone || !otp)
      return passes(false);

    authStore.validateSmsCode(phone, otp)
      .then(r => passes(true))
      .catch(e => passes(false, e.message))
  },
};

// TODO: reset on unmount
class MyForm extends Form {
  @observable isCountingDown = false;
  @observable countdownTime = 0;
  @observable isComplete = false;

  plugins() {
    return {
      dvr: {
        package: validatorjs,
        extend: $validator => {
          // here we can access the `validatorjs` instance
          Object.keys(customRules).forEach(key =>
            $validator.register(key, customRules[key].function, customRules[key].message)
          );

          Object.keys(customAsyncRules).forEach((key) =>
            $validator.registerAsyncRule(key, customAsyncRules[key])
          );

          // TODO: add custom messages for phone
          // TODO: translate fields labels
        }
      }
    };
  }

  setup() {
    return {
      fields: {
        fullname: {
          rules: 'required|checkFullname',
        },
        email: {
          type: 'email',
          rules: 'required|email|string|min:5|checkEmail',
        },
        phone: {
          rules: 'required|phone|checkPhone'
        },
        otp: {
          rules: 'required|digits:6|checkOTP'
        },
      }
    }
  }

  hooks() {
    return {

      onSuccess(form) {
        let {fullname, email, phone, otp} = form.values();

        let userData = {
          fullname,
          email,
          phone: normalizePhone(phone),
          otp,
          command: 'register',
          data: {}
        };

        authStore.setUser(userData);

        // -> /registration/supplier/password (Confirmation.js)
        this.isComplete = true;
        // TODO: После регистрации > Окошка 'Поздравляем! Вы успешно прошли регистрацию. Для продолжения работы с Каталогом пройдите по ссылке 'link''
      },

      onError(form) {
        form.invalidate('Исправьте ошибки в форме!');
      },
    };
  }

  makeField(props) {
    return new MyField(props);
  }

  // --- Custom methods ---

  unmount() {
    this.isCountingDown = false;
    this.countdownTime = 0;
    this.isComplete = false;
    this.reset();
    this.showErrors(false);
  }

  canSendSmsCode() {
    let $fullname = this.$('fullname'),
      $email = this.$('email'),
      $phone = this.$('phone');

    return !this.isCountingDown && !this.validating && $fullname.isValid && $email.isValid && $phone.isValid;
  }

  sendOTP = () => {
    if (this.isCountingDown)
      return false;

    let {email, fullname, phone} = this.values();

    let params = {
      email,
      fullname,
      phone: normalizePhone(phone),
      command: 'register'
    };

    // // debug
    // this.isCountingDown = true;
    // this.countdownTime = Date.now() + .25 * 60 * 1000;
    // return

    authStore.sendSmsCode(params).then(r => {
      showInfo(t('На Ваш мобильный телефон отправлено смс'));

      this.isCountingDown = true;
      this.countdownTime = Date.now() + 3 * 60 * 1000;
    });
  };

  canConfirmCode() {
    return this.isCountingDown && !this.validating && this.isValid;
  }

  onCountdownComplete = () => {
    this.isCountingDown = false;
  };
}

const form = new MyForm();

export default form;
