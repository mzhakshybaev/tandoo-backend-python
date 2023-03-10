import React, {Component} from 'react'
import {FGI, Required} from "components/AppInput";
import Select from "components/Select";
import {inject, observer} from 'mobx-react'
import Hoc from 'components/Hoc'
import Button from "components/AppButton";
import {Col, FormGroup, Input, Label} from "reactstrap";
import TelInput from "components/TelInput";
import {showError, showSuccess} from "utils/messages";
import {translate} from "react-i18next";
import {MaskedInput} from "components/MaskedInput";
import CoateSelect from "../../../components/CoateSelect";
import {clone} from "lodash-es";
import FileUploader from "components/FileUploader";
import Loading from "components/Loading";

@translate(['common', 'settings', ''])
@inject('dictStore', "adminStore", "supplierStore", "authStore", "mainStore") @observer
class CompanyGeneralInfo extends Component {
  state = {
    /* Dicts */
    ownerships: [],
    ea_types: [], ea_type: null,
    coates: [],
    countries: [], country: '',
    /* MAIN State */
    resident_state: 'noresident',
    ownership_type: 'ip',
    ownership: null,
    inn: '',
    name: '', // name - org
    ip_fio: '', // name - ip
    short_name: '',
    main_doc_img: [], //main_doc_preview: [],main_doc_img_old: [],
    main_logo_img: null, main_logo_preview: null,
    phone: '',
    email: '',
    coate: null,
    street: '',
    house: '',
    apt: '',
    // owner
    owner_fio: '',
    owner_inn: '',
    owner_pos: '',
    owner_email: '',
    owner_phone: '',
    //
    company: null
  };

  componentDidMount() {
    this.props.dictStore.getDictData2({type: 'Typeofownership'}).then(r => {
      this.setState({ownerships: r});
    });
    this.props.dictStore.getCoateListing().then(r => {
      this.setState({coates: r});
    });
    this.props.dictStore.getDictData2({type: 'DirCountry'}).then(r => {
      this.setState({countries: r});
    });
    this.props.dictStore.getDictData2({type: 'DirTypesofeconomicactivity'}).then(r => {
      this.setState({ea_types: r});
    });

    let company = this.props.company;
    this.setState({
      company,
      ownership: company.typeofownership,
      ownership_type: company.typeofownership && company.typeofownership.data.type || '',
      resident_state: company.typeofownership && company.typeofownership.type_owner || '',
      inn: company.inn,
      name: company.name,
      ip_fio: company.name,
      short_name: company.short_name,
      main_doc_img: company.main_doc_img,
      country: company.dircountry_id,
      owner_fio: company.owner_data && company.owner_data.fio || '',
      owner_inn: company.owner_data && company.owner_data.inn || '',
      owner_pos: company.owner_data && company.owner_data.pos || '',
      owner_email: company.owner_data && company.owner_data.email || '',
      owner_phone: company.owner_data && company.owner_data.phone || '',
      phone: company.data && company.data.phone || '',
      email: company.data && company.data.email || '',
      coate: company.dircoate_id,
      street: company.data && company.data.address && company.data.address.street || '',
      house: company.data && company.data.address && company.data.address.house || '',
      apt: company.data && company.data.address && company.data.address.apt || '',
      _id: company._id && company._id && company._id || '',
      _rev: company._rev && company._rev && company._rev || '',
      roles_id: company.roles_id && company.roles_id && company.roles_id || [],
      dircoate_id: company.dircoate_id && company.dircoate_id && company.dircoate_id || [],
    })
  }

  handleFiles(imgName, previewName, file) {
    let model = {};
    model[previewName] = file.base64;
    this.setState(model);
    this.props.supplierStore.uploadImage(file.base64.split(',')[1]).then(r => {
      let model = {};
      model[imgName] = r.file;
      this.setState(model)
    })
  }

  handleMultipleFiles = (imgName, preview, files) => {
    let images = clone(this.state[imgName]);
    let previews = clone(this.state[preview]);

    files.base64.forEach((base64, i) => {
      let img = {
        file: base64.split(',')[1],
        ext: files.fileList[i]['name'].split('.')[1],
      };

      images.push(img);
      previews.push(base64);
    });

    this.setState({
      [preview]: previews,
      [imgName]: images
    });
  };

  get isIP() {
    let {resident_state: rs, ownership_type: ot} = this.state;
    return ot && (rs === 'resident') && (ot === 'ip');
  }

  get isOrg() {
    let {resident_state: rs, ownership_type: ot} = this.state;
    return ot && (rs === 'resident') && (ot === 'org');
  }

  get isResident() {
    let {resident_state: rs} = this.state;
    return rs && (rs === 'resident');
  }

  get isNoResident() {
    let {resident_state: rs} = this.state;
    return rs && (rs === 'noresident');
  }

  saveHandler = async () => {
    const state = this.state;
    let params = {
      id: state._id,
      short_name: state.short_name
    };

    try {
      await this.props.supplierStore.updateCompany(params);
      showSuccess(this.props.t('?????????????? ??????????????????!'))

    } catch (e) {
      showError(e.message || "????????????")
    }
  };

  canSendForm = () => {
    const {
      street, house, ownership, name, inn,
      country, coate, main_doc_image,
    } = this.state;
    let res = (street && house && ownership && name && inn && coate &&
      country && main_doc_image);
    return res;
  };

  render() {
    if (!this.state.company)
      return <Loading/>;

    const {t} = this.props;
    const {mainStore} = this.props;
    const {language} = mainStore;
    let label = 'name';
    if (language && language.code !== 'ru') {
      label = [label, language.code].join('_')
    }
    let {state, isIP, isOrg, isResident, isNoResident} = this;

    return (
      <Hoc>
        <h2 className="text-center">{t('???????????????? ????????????')}</h2>
        <Col md={12} className="mt-3">
          {isResident &&
          <FGI l={t('?????????? ??????????????????????????')} lf={4} ls={8} className="mt-2">
            <Select options={state.ownerships} placeholder={t('????????????????')}
                    valueKey="_id" labelKey={label} value={state.ownership}
                    onChange={ownership => this.setState({ownership})}/>
          </FGI>}
          {isNoResident &&
          <FGI l={t('????????????')} lf={4} ls={8} className="mt-2" required>
            <Select options={this.state.countries} placeholder={t('????????????????')}
                    valueKey="_id" labelKey="name" value={state.country}
                    onChange={country => this.setState({country})}/>
          </FGI>}

          {(isIP || isNoResident) &&
          <FGI l={t('??????')} lf={4} ls={8} className="mt-2" required>
            <Input type="text" value={state.ip_fio}
                   onChange={e => this.setState({ip_fio: e.target.value})}/>
          </FGI>
          }

          <FGI l={t('?????? ??????????????????????')} lf={4} ls={8} className="mt-2" key={0}>
            <MaskedInput mask="99999999999999" value={state.inn}/>
          </FGI>
          <FGI l={t('???????????????????????? ??????????????????????')} lf={4} ls={8} className="mt-2" key={1}>
            <Input type="text" value={state.name}/>
          </FGI>

          <FGI l={t('?????????????????????? ????????????????????????')} lf={4} ls={8} className="mt-2" required>
            <Input type="text" value={state.short_name}
                   onChange={e => this.setState({short_name: e.target.value})}/>
          </FGI>

          <FGI l={t('???????????????? ???????????????????????? ?????????????????????? ???????????? ?? ?????????? ??????????????????????')} lf={4} ls={3} required>
            <FileUploader files={state.main_doc_img} path={'companydocs'}
                          onChange={files => this.setState({main_doc_img: files})}/>
          </FGI>

          {isOrg &&
          <FGI l={t("??????????")} lf={7} ls={5} required>
            <FileUploader files={state.main_doc_regulations} path={'companydocs'}
                          onChange={files => this.setState({main_doc_regulations: files})}/>
          </FGI>
          }

          <FGI l={t('Email')} lf={4} ls={6} className="mt-2">
            <Input type="email" value={state.owner_email}/>
          </FGI>
          <FGI l={t('?????????? ??????. ????????????????')} lf={4} ls={6} className="mt-2">
            <Input type="email" value={state.owner_phone}/>
          </FGI>
          <FGI l={t('???????????????????? ??????????')} lf={4} ls={8} className="mt-2" required>
            <CoateSelect placeholder={t('????????????????')}
                         valueKey="_id" value={state.coate}
                         onChange={coate => this.setState({coate})}/>
          </FGI>

          <FormGroup row className="mt-2">
            <Label sm={2}>
              {t('??????????')}
              <Required/>
            </Label>
            <Col sm={2}>
              <Input type="text" value={state.street}
                     onChange={e => this.setState({street: e.target.value})}/>
              {/*<FormFeedback>{f}</FormFeedback>*/}
            </Col>

            <Label sm={2}>
              {t('??? ????????')}
              <Required/>
            </Label>
            <Col sm={2}>
              <Input type="text" value={state.house}
                     onChange={e => this.setState({house: e.target.value})}/>
              {/*<FormFeedback>{f}</FormFeedback>*/}
            </Col>

            <Label sm={2}>
              {t('????????????????')}
            </Label>
            <Col sm={2}>
              <Input type="text" value={state.apt}
                     onChange={e => this.setState({apt: e.target.value})}/>
              {/*<FormFeedback>{f}</FormFeedback>*/}
            </Col>
          </FormGroup>
        </Col>

        {(isOrg || isNoResident) &&
        <Col md={12} className="mt-3">
          <h2>{t('???????????????? ?? ????????????????????????')}</h2>
          <FGI l={t('??????')} lf={4} ls={6} className="mt-2" required>
            <MaskedInput mask="99999999999999" value={state.owner_inn}
                         onChange={e => this.setState({owner_inn: e.target.value})}/>
          </FGI>

          <FGI l={t('??????')} lf={4} ls={6} className="mt-2" required>
            <Input type="text" value={state.owner_fio}
                   onChange={e => this.setState({owner_fio: e.target.value})}/>
          </FGI>

          <FGI l={t('??????????????????')} lf={4} ls={6} className="mt-2" required>
            <Input type="text" value={state.owner_pos}
                   onChange={e => this.setState({owner_pos: e.target.value})}/>
          </FGI>

        </Col>
        }
        {isNoResident &&
        <Col md={12}>
          <FGI l={t('?????? ?????????????????????????? ????????????????????????')} lf={4} ls={6} className="mt-2" required>
            <Select options={state.ea_types} placeholder={t('????????????????')}
                    labelKey="name" valueKey="_id" value={state.ea_type}
                    onChange={ea_type => this.setState({ea_type})}
            />
          </FGI>
        </Col>
        }
        <Col md={2} xs={12} className=" mt-2">
          <Button className="primary" title={t('??????????????????')}
            //disabled={!this.canSendForm()}
                  onClick={this.saveHandler}>
            {t('?????????????????? ??????????????????')}
          </Button>
        </Col>
      </Hoc>
    )
  }

}

export default CompanyGeneralInfo
