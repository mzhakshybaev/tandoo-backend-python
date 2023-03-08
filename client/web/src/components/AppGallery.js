import React from 'react';
import {EMPTY_PDF, getApi, IMAGES_URL} from "utils/common";
import Gallery from 'react-grid-gallery';
// import {Image} from 'components';

export default class AppGallery extends React.Component {
  images;
  gallery;
  imageTypes = ['png', 'jpg', 'jpeg', 'gif'];

  render() {
    if (!this.images) {
      let {images} = this.props;
      if (!images)
        return null;

      this.images = images.map(img => {
        let [_, ext] = img.match(/\.(.*)$/);

        return {
          img,
          ext,
          src: this.imageTypes.includes(ext) ? (IMAGES_URL + img) : EMPTY_PDF,
          thumbnail: this.imageTypes.includes(ext) ? (IMAGES_URL + img) : EMPTY_PDF,
          thumbnailWidth: 128,
          thumbnailHeight: 159,
        }
      })
    }

    return (
      <div>
        <Gallery images={this.images} backdropClosesModal ref={g => this.gallery = g}
                 onClickThumbnail={this.onClickThumb} enableImageSelection={false}
                 /*thumbnailImageComponent={Image}*/
        />
      </div>
    )
  }

  onClickThumb = (i, e) => {
    let {ext, img} = this.images[i];

    if (this.imageTypes.includes(ext)) {
      this.gallery.openLightbox(i, e)
    } else {
      window.open(getApi() + "download/" + img)
    }
  };
}
