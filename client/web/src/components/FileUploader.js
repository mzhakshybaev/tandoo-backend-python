import React from "react";
import ReactFileReader from 'react-file-reader';
import AppButton from "./AppButton";
import {FormText, Row} from "reactstrap";
import {translate} from "react-i18next";
import {EMPTY_PDF} from "../../../utils/common";
import Img from 'react-image';
import {observer} from "mobx-react";
import {observable, runInAction} from "mobx";
import fileApi from "stores/api/FileApi";
import {IMAGES_URL} from "utils/common";
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';


@translate(['common', 'settings', '']) @observer
export default class FileUploader extends React.Component {
  @observable files = [];

  constructor(props) {
    super(props);
    this.state = {show: false, photoIndex: 0};
  }

  componentDidMount() {
    let {files} = this.props;

    if (files) {
      this.files = files.map(file => ({
        preview: file,
        name: file,
        upl_name: file,
      }))
    }
  }

  toggle = (photoIndex) => {
    this.setState({show: !this.state.show, photoIndex});
  };

  render() {
    let {t, multiple = true, files} = this.props;

    const {photoIndex, show} = this.state;

    let images = [];

    if (files && files.length) {
      files.forEach(file => {
        images.push(IMAGES_URL + file)
      });
    }

    return (
      <div>
        <ReactFileReader fileTypes={[".jpg", ".png", '.jpeg', '.gif', '.pdf']}
                         base64={true} multipleFiles={multiple}
                         handleFiles={this.handleAdd}>
          <div>
            <AppButton outline block>{t('Выбрать')}</AppButton>
            <FormText color="muted">{t('Загрузить файл')}</FormText>
          </div>
        </ReactFileReader>

        {files && files.length > 0 &&
        <Row>
          {files.map((file, i) => (
            <div key={file} className="mr-1 mb-1" title={file}
                 style={{position: 'relative'}}>

              <i className="fa fa-times-circle fa-lg text-danger" title={t('Удалить')}
                 onClick={() => this.handleDelete(i)}
                 style={{
                   position: 'absolute',
                   top: -5,
                   right: -5,
                   zIndex: 1,
                   cursor: 'pointer'
                 }}/>

              <Img src={IMAGES_URL + file}
                   alt="Image preview"
                   className="file_img"
                   unloader={<img src={EMPTY_PDF} alt="Image preview"/>}
                   onClick={() => this.toggle(i)}
              />
              <br/>

              <div style={{maxWidth: 130}}>
                {file}
              </div>
            </div>
          ))}

          {show &&
          <Lightbox
            mainSrc={images[photoIndex]}
            nextSrc={images[(photoIndex + 1) % images.length]}
            prevSrc={images[(photoIndex + images.length - 1) % images.length]}
            onCloseRequest={() => this.toggle(0)}
            onMovePrevRequest={() => this.setState({photoIndex: (photoIndex + images.length - 1) % images.length,})}
            onMoveNextRequest={() => this.setState({photoIndex: (photoIndex + 1) % images.length,})}
          />
          }
        </Row>
        }
      </div>
    )
  }

  handleAdd = async files => {
    let {path, onChange, multiple = true} = this.props;
    let add_files = [];

    console.log('files', files);

    const add_file = (base64, i) => {
      let preview = base64;
      let file_data = base64.split(',')[1];
      let name = files.fileList[i]['name'];
      let ext = name.split('.')[1];

      let file = {
        file: file_data,
        preview,
        name,
        ext,
      };

      console.log(file);

      add_files.push(file);
    };

    if (multiple) {
      files.base64.forEach(add_file);

    } else {
      await this.handleDelete(0);
      add_file(files.base64, 0);
    }

    let upl_files = add_files.map(({ext, file, name}) => ({ext, file, name}));

    let names = await fileApi.upload(path, upl_files);

    names.forEach((name, i) => {
      add_files[i].upl_name = name;
    });

    console.log(add_files);
    runInAction(() => {
      this.files = this.files.concat(add_files);
      let raw_files = this.files.map(({upl_name}) => upl_name);
      onChange && onChange(raw_files)
    })
    // debugger
  };

  handleDelete = async i => {
    let {onChange} = this.props;
    let file = this.files[i];

    try {
      // TODO: make it smart
      // await await fileApi.delete(file.upl_name);
    } catch (e) {
    }

    this.files.splice(i, 1);
    let raw_files = this.files.map(({upl_name}) => upl_name);
    onChange && onChange(raw_files)
  };

  // handleMultipleFiles = (imgName, preview, files) => {
  //   debugger
  //   let images = clone(this.state[imgName]);
  //   let previews = clone(this.state[preview]);
  //
  //   files.base64.forEach((base64, i) => {
  //     let img = {
  //       file: base64.split(',')[1],
  //       preview: base64,
  //       name: files.fileList[i]['name'],
  //       ext: files.fileList[i]['name'].split('.')[1],
  //     };
  //
  //     images.push(img);
  //     previews.push(base64);
  //   });
  //
  //   this.setState({
  //     [preview]: previews,
  //     [imgName]: images
  //   });
  //
  // };
  //
  // uploadFiles = async () => {
  //   // uploadfiles
  //   // uploadfiles/default_save
  //
  //   let names = await this.props.supplierStore.uploadImages(files);
  //   return names;
  // };
  //
  // handleDeleteFile = (imgName, preview, i) => {
  //   let images = clone(this.state[imgName]);
  //   let previews = clone(this.state[preview]);
  //
  //   images.splice(i, 1);
  //   previews.splice(i, 1);
  //
  //   this.setState({
  //     [preview]: previews,
  //     [imgName]: images
  //   });
  // };


}
