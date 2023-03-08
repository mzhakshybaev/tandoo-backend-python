import {Form, Field} from 'mobx-react-form';
import validatorjs from 'validatorjs';
import {observable} from 'mobx';
import authStore from 'stores/AuthStore';


class MyField extends Field {
  onChange = (e) => {
    let conf = e.target.value;

    this.set(conf);

    switch (this.name) {
      case 'password_confirmation':
        let password = form.$('password').value;

        if (conf && password && conf.length === password.length) {
          form.validate();
        }
        break;
    }

  };
}

const customAsyncRules = {
  checkPassword: (password, attr, key, passes) => {
    authStore.checkData({password, command: 'register'})
      .then(r => passes(true))
      .catch(e => passes(false, e.message))
  },
};

// TODO: reset on unmount
class MyForm extends Form {
  @observable isComplete = false;

  plugins() {
    return {
      dvr: {
        package: validatorjs,
        extend: $validator => {
          Object.keys(customAsyncRules).forEach(key =>
            $validator.registerAsyncRule(key, customAsyncRules[key])
          );
        }
      }
    };
  }

  setup() {
    return {
      fields: {
        password: {
          type: 'password',
          rules: 'required|min:6|checkPassword|confirmed'
        },
        password_confirmation: {
          type: 'password',
          rules: 'required|min:6'
        }
      }
    }
  }

  hooks() {
    return {

      onSuccess(form) {
        let params = form.values();

        authStore.register(params).then(r => {
          // -> /home
          this.isComplete = true;
        });

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
    this.isComplete = false;
    this.reset();
    this.showErrors(false);
  }

  canSubmit() {
    return !this.validating && this.isValid;
  }
}

const form = new MyForm();

export default form;
