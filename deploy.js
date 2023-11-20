const fs = require("fs");
const execSh = require("exec-sh");

let cliApps = function (command, options) {
    return new Promise(function (resolve, reject) {
        execSh(command, options, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

let deploy = async function (user_cf, pass_cf, configFile, codSociedad, firstDeploy) {

    if (!user_cf) {
        throw Error(`Missing "user_cf" parameter`)
    }

    if (!pass_cf) {
        throw Error(`Missing "pass_cf" parameter`)
    }

    if (!configFile) {
        throw Error(`Missing "configFile" parameter`)
    }

    if (!codSociedad) {
        throw Error(`Missing "codSociedad" parameter`)
    }

    //Obtenemos las constantes
    let constantes = require("./config/" + configFile + ".json");

    if (!constantes["bukrs"]) {
        throw Error(`Missing "bukrs" configuration`)
    }

    if (!constantes["bukrs"][codSociedad]) {
        throw Error(`Missing ${codSociedad} configuration`)
    }

    let endpoint_cf = constantes["bukrs"][codSociedad]["endpoint_cf"];
    let org_cf = constantes["bukrs"][codSociedad]["org_cf"];
    let space_cf = constantes["bukrs"][codSociedad]["space_cf"];

    //Ejecutamos el comando para loguearnos al ambiente
    await cliApps(`cf login -u ${user_cf} -p ${pass_cf} -a ${endpoint_cf} -o ${org_cf} -s ${space_cf}`, {});

    //Despliegue del MTA
    await cliApps("npm run deploy", {});

    //Se Borra los archivos base para que no se versionen
    deleteBase(configFile, firstDeploy);
};

let deleteBase = function (configFile, firstDeploy) {
    // mta.yaml
    let constantes = require("./config/" + configFile + ".json");
    let arrayFiles = Object.keys(constantes.file_replace);

    for (let i = 0; i < arrayFiles.length; i++) {

        let source = arrayFiles[i];
        let destination = constantes.file_replace[source];

        if (!fs.existsSync(destination)) continue;

        console.log("Eliminando archivo de ruta " + destination);

        fs.unlinkSync(destination)
        console.log("--------------------------------\n\n\n");
    }
    
    // if (constantes.path_db && firstDeploy !== 'true') {
    //     if (fs.existsSync(`${constantes.path_db}/package.json`)) {
    //         fs.unlinkSync(`${constantes.path_db}/package.json`);
    //     }
    //     if (fs.existsSync(`${constantes.path_db}/default-env.json`)) {
    //         fs.unlinkSync(`${constantes.path_db}/default-env.json`);
    //     }
    // }
    // if (constantes.path_api && firstDeploy !== 'true') {
    //     if (fs.existsSync(`${constantes.path_api}/default-env.json`)) {
    //         fs.unlinkSync(`${constantes.path_api}/default-env.json`);
    //     }
    // }

    console.log("-----DESPLIEGUE: PROCESO FINALIZADO ---");
};

module.exports = deploy;
require('make-runnable');
