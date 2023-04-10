/**
 * Conector directo a la API
 */
(async () => {
    let response = await fetch('https://prod-50.westus.logic.azure.com:443/workflows/91509b4bd01a4d1d88ae0b7ac736d4e5/triggers/manual/paths/invoke?&api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lMdn35cjlamM2iapYa-Cgut-ygoFKU8m-lrSK5OSWjo',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'consulta_proyecto',
                params: [
                    {
                        //name : 'macroproyecto',
                        //value: 'a0E4W00000P4ebNUAR'
                        name : 'proyecto',
                        value: 'a0G4W00000uyAYCUA2'
                    }
                ]
            })
        });
    let result = await response.json();

    console.log(result)
})()