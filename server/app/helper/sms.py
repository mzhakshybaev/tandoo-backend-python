import requests


def send(phone, msg, sms_id):
    xml_str = '''<?xml version="1.0" encoding="UTF-8"?>
<message>
    <login>{0}</login>
    <pwd>{1}</pwd>
    <id>{2}</id>
    <sender>{3}</sender>
    <text>{4}</text>
    <phones>
        <phone>{5}</phone>
    </phones>
    <test>{6}</test>
</message>
        '''

    headers = {'Content-Type': 'text/xml', 'User-Agent': 'Mozilla/5.0'}
    phone = phone.replace('+', '')
    sender = 'e-market.kg'
    login = 'emarket'
    pwd = 'NsK4dVTg'

    # is_test = 1  # for test
    is_test = 0  # for prod
    msg = msg.encode('utf-8')
    data = xml_str.format(login, pwd, sms_id, sender, msg, phone, is_test)

    try:
        res = requests.post("https://smspro.nikita.kg/api/message", data=data, headers=headers, verify=False, timeout=60)
        print(res.content)
        pass
    except Exception as inst:
        print(type(inst))
