const fs = require('fs');
const execSh = require('exec-sh');

const Handlebars = require('handlebars');
const packageDB = {
  name: 'deploy',
  dependencies: {
    '@sap/hdi-deploy': '^4',
  },
  scripts: {
    start: 'node node_modules/@sap/hdi-deploy/deploy.js --auto-undeploy --exit',
  },
};

var cliApps = function (command, options) {
  return new Promise(function (resolve, reject) {
    execSh(command, options, function (err, stdout) {
      if (err) {
        reject(err);
      } else {
        if (command.indexOf('cf env') > -1) {
          //Obtenemos el VCAPSERVICES
          var varEnv = stdout
            .substring(stdout.indexOf('VCAP_SERVICES:'), stdout.indexOf('VCAP_APPLICATION:'))
            .replace('VCAP_SERVICES', '"VCAP_SERVICES"');
          var jsonEnv = JSON.parse(`{ ${varEnv} }`);
          resolve(jsonEnv);
        } else {
          resolve();
        }
      }
    });
  });
};

let cliAppsDeploy = function (command, options) {
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

let deleteBase = function (configFile, firstDeploy) {
  // mta.yaml
  let constantes = require('./config/' + configFile);
  let arrayFiles = Object.keys(constantes.file_replace);

  for (let i = 0; i < arrayFiles.length; i++) {
    let source = arrayFiles[i];
    let destination = constantes.file_replace[source];

    if (!fs.existsSync(destination)) continue;

    console.log('Eliminando archivo de ruta ' + destination);

    fs.unlinkSync(destination);
    console.log('--------------------------------\n\n\n');
  }

  // if (constantes.path_db && firstDeploy !== true) {
  //   if (fs.existsSync(`${constantes.path_db}/package.json`)) {
  //     fs.unlinkSync(`${constantes.path_db}/package.json`);
  //   }
  //   if (fs.existsSync(`${constantes.path_db}/default-env.json`)) {
  //     fs.unlinkSync(`${constantes.path_db}/default-env.json`);
  //   }
  // }
  // if (constantes.path_api && firstDeploy !== true) {
  //   if (fs.existsSync(`${constantes.path_api}/default-env.json`)) {
  //     fs.unlinkSync(`${constantes.path_api}/default-env.json`);
  //   }
  // }

  console.log('-----DESPLIEGUE: PROCESO FINALIZADO ---');
};

var deployAll = async function (user_cf, pass_cf) {
  if (!user_cf) {
    throw Error(`Missing "user_cf" parameter`);
  }

  if (!pass_cf) {
    throw Error(`Missing "pass_cf" parameter`);
  }

  const files = await fs.promises.readdir('./config/');
  const archivosJson = files.filter(function (item, index) {
    return item.includes('.json');
  });
  for (let indexConfig = 0; indexConfig < archivosJson.length; indexConfig++) {
    const elementConfig = archivosJson[indexConfig];

    const constantesGlobal = { ...require('./config/' + elementConfig) };
    if (!constantesGlobal.bukrs) {
      throw Error(`Missing "bukrs" parameter file ` + './config/' + elementConfig);
    }

    let listaBukrs = Object.keys(constantesGlobal.bukrs);
    for (let index = 0; index < listaBukrs.length; index++) {
      const constantes = { ...require('./config/' + elementConfig) };

      const element = listaBukrs[index];
      if (constantes.bukrs[element].deployer) {
        //   const configFile = element.configFile;
        const codSociedad = element;
        const firstDeploy = constantes.bukrs[element].first_deploy;

        if (!codSociedad) {
          throw Error(`Missing "codSociedad" parameter`);
        }

        if (firstDeploy == undefined) {
          throw Error(`Missing "first_deploy" parameter`);
        }

        if (!constantes.bukrs[element]) {
          throw Error(`Missing ${codSociedad} configuration en ` + +'./config/' + elementConfig);
        }

        if (!constantes.bukrs[element]['endpoint_cf']) {
          throw Error(
            `Missing  endpoint_cf  ${codSociedad} en el archivo ` + +'./config/' + elementConfig
          );
        }

        if (!constantes.bukrs[element]['org_cf']) {
          throw Error(
            `Missing  org_cf  ${codSociedad} en el archivo ` + +'./config/' + elementConfig
          );
        }

        if (!constantes.bukrs[element]['space_cf']) {
          throw Error(
            `Missing  space_cf  ${codSociedad} en el archivo ` + +'./config/' + elementConfig
          );
        }

        let endpoint_cf = constantes.bukrs[element]['endpoint_cf'];
        let org_cf = constantes.bukrs[element]['org_cf'];
        let space_cf = constantes.bukrs[element]['space_cf'];

        //Ejecutamos el comando para loguearnos al ambiente
        await cliApps(
          `cf login -u ${user_cf} -p ${pass_cf} -a ${endpoint_cf} -o ${org_cf} -s ${space_cf}`,
          {}
        );

        // if (firstDeploy !== true) {
        //   //Agregamos el HDI CONTAINER
        //   console.log("constantes.name_app", constantes.name_app);
        //   var jsonEnv = await cliApps("cf env " + constantes.name_app, true);
        //   console.log("inicio jsonEnv", jsonEnv);

        //   //INICIO - Generamos el default_env para la base de datos
        //   if (constantes.path_db) {
        //     jsonEnv.TARGET_CONTAINER = constantes["hdi-service"];

        //     //obtenemos si contiene HDI externo y lo agregamos al json principal
        //     if (constantes.external_hdis) {
        //       for (
        //         let index = 0;
        //         index < constantes.external_hdis.length;
        //         index++
        //       ) {
        //         constantes["hdi_service_name" + (index + 1).toString()] =
        //           constantes.external_hdis[index].hdi_service_name;
        //         // constantes = Object.assign(constantes, constantes.external_hdis[index]);
        //         //LLenamos el json para el default-env de la base de datos
        //         var name_api = constantes.external_hdis[index].name_api;
        //         console.log("constantes.name_app", name_api);
        //         var json = await cliApps("cf env " + name_api, true);
        //         jsonEnv.VCAP_SERVICES.hana.push(json.VCAP_SERVICES.hana[0]);
        //       }
        //     }

        //     console.log("jsonENV", JSON.stringify(jsonEnv));
        //     fs.writeFileSync(
        //       constantes.path_db + "/package.json",
        //       JSON.stringify(packageDB, null, 2)
        //     );
        //     fs.writeFileSync(
        //       constantes.path_db + "/default-env.json",
        //       JSON.stringify(jsonEnv, null, 2)
        //     );
        //     //Generamos el node_modules de la base de datos
        //     await cliApps("npm i ", { cwd: constantes.path_db });
        //   }

        //   if (constantes.path_api) {
        //     fs.writeFileSync(
        //       constantes.path_api + "/default-env.json",
        //       JSON.stringify(jsonEnv, null, 2)
        //     );
        //   }

        //   //END - Generamos el default_env para la base de datos
        // }

        //validamos si existe la carpeta cfg
        if (constantes.pathCfg) {
          try {
            console.log('pathCfg', fs.existsSync(constantes.pathCfg));
            if (!fs.existsSync(constantes.pathCfg)) {
              //file exists
              fs.mkdirSync(constantes.pathCfg, { recursive: true });
            }
          } catch (err) {
            console.error(err);
          }
        }

        //validamos si existe la carpeta urlservicio
        if (constantes.path_urlservicio) {
          try {
            if (!fs.existsSync(constantes.path_urlservicio)) {
              //file exists
              fs.mkdirSync(constantes.path_urlservicio, { recursive: true });
            }
          } catch (err) {
            console.error(err);
          }
        }

        //INICIO generamos los archivos base de FileBase
        var arrayFiles = Object.keys(constantes.file_replace);

        constantes.codSociedad = codSociedad;

        for (let i = 0; i < arrayFiles.length; i++) {
          var source = arrayFiles[i];
          var destination = constantes.file_replace[source];

          console.log('Convirtiendo ' + source + ' a ' + destination);

          var content = fs.readFileSync(source).toString('utf-8');
          const template = Handlebars.compile(content);
          content = template(constantes);
          fs.writeFileSync(destination, content);

          console.log('content', content);
          console.log('--------------------------------\n\n\n');
        }
        //FIN generamos los archivos base de FileBase

        console.log('-----GENERATE: PROCESO FINALIZADO ---');

        //Ejecutamos el comando para loguearnos al ambiente
        await cliAppsDeploy(
          `cf login -u ${user_cf} -p ${pass_cf} -a ${endpoint_cf} -o ${org_cf} -s ${space_cf}`,
          {}
        );

        //Despliegue del MTA

        await cliAppsDeploy('npm run deploy', {});

        //Se Borra los archivos base para que no se versionen
        deleteBase(elementConfig, firstDeploy);
      }
    }
  }
  return;
};

module.exports = deployAll;
require('make-runnable');
