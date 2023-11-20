const fs = require("fs");
const execSh = require("exec-sh");

const Handlebars = require("handlebars");

var cliApps = function (command, options) {
    return new Promise(function (resolve, reject) {
        execSh(command, options, function (err, stdout) {
            if (err) {
                reject(err);
            } else {
                if (command.indexOf("cf env") > -1) {
                    //Obtenemos el VCAPSERVICES
                    var varEnv = stdout.substring(stdout.indexOf("VCAP_SERVICES:"), stdout.indexOf("VCAP_APPLICATION:")).replace('VCAP_SERVICES', '"VCAP_SERVICES"');
                    var jsonEnv = JSON.parse(`{ ${varEnv} }`);
                    resolve(jsonEnv);
                } else {
                    resolve();
                }

            }
        });
    });
};

var generate = async function (user_cf, pass_cf, configFile, codSociedad, firstDeploy) {

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

    // obtenemos las constantes
    var constantes = require("./config/" + configFile + ".json");

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
    
    //validamos si existe la carpeta cfg
    // if (constantes.pathCfg) {
    //     try {
    //         console.log("pathCfg", fs.existsSync(constantes.pathCfg));
    //         if (!fs.existsSync(constantes.pathCfg)) {
    //             //file exists
    //             fs.mkdirSync(constantes.pathCfg, { recursive: true });
    //         }
    //     } catch (err) {
    //         console.error(err);
    //     }

    // }

    //validamos si existe la carpeta urlservicio
    // if (constantes.path_urlservicio) {
    //     try {
    //         if (!fs.existsSync(constantes.path_urlservicio)) {
    //             //file exists
    //             fs.mkdirSync(constantes.path_urlservicio, { recursive: true });
    //         }
    //     } catch (err) {
    //         console.error(err);
    //     }

    // }

    //INICIO generamos los archivos base de FileBase
    var arrayFiles = Object.keys(constantes.file_replace);

    constantes.codSociedad = codSociedad;
    // constantes.host = constantes.host.replace("{{codSociedad}}", codSociedad);

    for (let i = 0; i < arrayFiles.length; i++) {

        var source = arrayFiles[i];
        var destination = constantes.file_replace[source];

        console.log("Convirtiendo " + source + " a " + destination);

        var content = fs.readFileSync(source).toString("utf-8");
        const template = Handlebars.compile(content);
        content = template(constantes);
        fs.writeFileSync(destination, content);

        console.log("content", content);
        console.log("--------------------------------\n\n\n");
    }
    //FIN generamos los archivos base de FileBase

    console.log("-----GENERATE: PROCESO FINALIZADO ---");
};

module.exports = generate;
require('make-runnable');