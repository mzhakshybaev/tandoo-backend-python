import React, {Fragment} from "react"
import AppTable from "components/AppTable";
import AppButton from "components/AppButton";
import {translate} from "react-i18next";



export default translate(['common', 'settings', ''])(props => {
  const {t} = props;
  return (
    <Fragment>
      <h5>{t('Уведомления от администрации')}</h5>
      <AppTable data={props.data}
                columns={[
                  {Header: t('Кому'), accessor: "recipient"},
                  {Header: t('Тема уведомления'), accessor: "title"},
                  {Header: t('Дата отправки'), accessor: "_created"},
                ]}
                showRowNumbers={true}
                onClick={props.onNotificationClick}/>
      <AppButton className={"mt-2"} onClick={props.onCreateClick}>{t('Создать')}</AppButton>
    </Fragment>)
});
