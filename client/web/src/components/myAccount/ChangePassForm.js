import {Form, Field} from 'mobx-react-form';
import validatorjs from 'validatorjs';
import {observable} from 'mobx';
import authStore from 'stores/AuthStore';
import {showSuccess} from "utils/messages";
import Swal from "sweetalert2";


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
        // case 'current_password':
        //   let current_password = form.$('current_password').value;
        //
        //   if (conf && password && conf.length === password.length) {
        //     form.validate();
        //   }
        break;
    }

  };
}


// TODO: reset on unmount
class MyForm extends Form {
  @observable isComplete = false;

  plugins() {
    return {
      dvr: {
        package: validatorjs
      }
    }
  }

  setup() {
    return {
      fields: {
        current_password: {
          type: 'password',
          rules: 'required|min:6'
        },
        password: {
          type: 'password',
          rules: 'required|min:6|confirmed'
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

      onSuccess: async (form) => {
        let res = await Swal({
          title: 'Вы действительно хотите поменять пароль?',
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Да',
          cancelButtonText: 'Отмена'
        });

        if (!res.value) {
          return
        }

        let params = {}
        params.newpswd = form.$('password').value;
        params.password = form.$('current_password').value;

        authStore.changePassword(params).then(r => {
          // -> /home
          showSuccess('Успешно сохранено!')
          this.unmount()
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
