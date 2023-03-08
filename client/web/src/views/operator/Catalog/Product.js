import React from "react";
import Img from "components/Image";
import {IMAGES_URL} from "utils/common";
import Button from "components/AppButton";
import {Col} from "reactstrap";
import {translate} from "react-i18next";

export default translate(['common', 'settings', ''])(props => {
  const {t} = props;
  let {product: p, isSupplier, onAddProduct} = props;
  return (
    <Col key={p._id} xs={6} sm={4} md={3} xl={2}>
      <div className="product cat">

        <div className="img ">
          <Img src={IMAGES_URL + p.image}/>
        </div>

        <p>{t('Код')} {p.code}</p>
        <span>{p["Товарные знаки(марка, бренд)"]}</span>

        {isSupplier() &&
        <div className='mt-1'>
          {p.exist ?
            <p style={{color: 'red'}}>{t('Уже добавлен')}</p>
            :
            <Button size='sm' outline color="success" onClick={() => onAddProduct(p)}>
              {t('Добавить товар')}</Button>
          }
        </div>
        }
      </div>
    </Col>
  )
})
