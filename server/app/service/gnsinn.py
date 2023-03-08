# -*- coding: utf-8 -*-
import requests

request = u"""
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xro="http://x- road.eu/xsd/xroad.xsd" xmlns:iden="http://x-road.eu/xsd/identifiers" xmlns:prod="http://gns-security-server.x- road.fi/producer">
    <soapenv:Header>
        <xro:protocolVersion>4.0</xro:protocolVersion>
        <xro:issue>Основание запроса</xro:issue>
        <xro:id>GUIID</xro:id>
        <xro:userId>Пользователь, действие которого инициировало запрос</xro:userId>
        <xro:service iden:objectType="SERVICE">
            <iden:xRoadInstance>central-server</iden:xRoadInstance>
            <iden:memberClass>GOV</iden:memberClass>
            <iden:memberCode>70000002</iden:memberCode>
            <!--Optional:-->
            <iden:subsystemCode>gns-service</iden:subsystemCode>
            <iden:serviceCode>tpDataByINNforBusinessActivity</iden:serviceCode>
            <!--Optional:-->
            <iden:serviceVersion>v1</iden:serviceVersion>
        </xro:service>
        <xro:client iden:objectType="SUBSYSTEM">
            <iden:xRoadInstance>central-service</iden:xRoadInstance>
            <iden:memberClass>КЛАСС ЛИЕНТА</iden:memberClass>
            <iden:memberCode>КОД КЛИЕНТА</iden:memberCode>
            <!--Optional:-->
            <iden:subsystemCode>КОД ПОДСИСТЕМЫ</iden:subsystemCode>
        </xro:client>
    </soapenv:Header>
    <soapenv:Body>
        <prod: tpDataByINNforBusinessActivity >
            <prod:request>
                <prod:inn>00000000000000</prod:inn>
            </prod:request>
        </prod:tpDataByINNforBusinessActivity>
    </soapenv:Body>
</soapenv:Envelope>
""".format('Jake_Sully',
           'super_secret_pandora_password',
           'TYSGW-Wwhw',
           'something_cool',
           'SalaryPayment',
           'Pandora_title',
           )

encoded_request = request.encode('utf-8')

headers = {"Host": "http://SOME_URL",
           "Content-Type": "application/soap+xml; charset=UTF-8",
           "Content-Length": str(len(encoded_request)),
           "SOAPAction": "http://SOME_OTHER_URL"}

response = requests.post(url="http://SOME_OTHER_URL",
                         headers=headers,
                         data=encoded_request,
                         verify=False,
                         timeout=60)

print response.content  # print response.text
