let table = base.getTable("Tablename");
let query = await table.selectRecordsAsync({ fields: table.fields });

for (let i = 0; i < query.records.length; i++) {
    if (query.records[i].getCellValue("Status") == "Nobarcode") {

        let recordurl = query.records[i].getCellValue("Url")
        let urlBase = 'https://quickchart.io/qr?text=';
        let dynamicPart = recordurl;
        // let darkColor = 'f00';
        // let lightColor = '0ff';
        // let ecLevel = 'Q';
        let format = 'base64';

        let panelcode = query.records[i].getCellValue("Name")
        let url_panel = `https://api.imgbun.com/png?key=INSERTYOURKEYHERE&text=${panelcode}&color=000000&size=40&background=FFFFFF`;
        let response_panel = await fetch(url_panel);

        let direktolink = '';

        if (response_panel.ok) {
        let data = await response_panel.json();
        let directLink = data.direct_link;
        direktolink = directLink;
        console.log(directLink);
        } else {
        console.error("Failed to fetch the data");
        }


        let fullUrl = `${urlBase}${encodeURIComponent(dynamicPart)}&format=${format}&size=400&centerImageUrl=${direktolink}`;

        let response_one = await fetch(fullUrl);

        if (response_one.ok) {
            let qrCodeBase64 = await response_one.text();

            let url = 'https://api.imgbb.com/1/upload?expiration=600&key=INSERTYOURKEYHERE';

            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `image=${encodeURIComponent(qrCodeBase64)}`,
            });

            if (response.ok) {
                let responseBody = await response.json();
                await table.updateRecordAsync(query.records[i], {
                    "QR Code": [
                        {
                            "url": responseBody.data.url
                        }
                    ],
                    "Status": "Barcodeadded"
                });
            } else {
                console.error("Error:", response.status, response.statusText);
            }

        } else {
            console.error("Error:", response_one.status, response_one.statusText);
        }
    
    }
}
