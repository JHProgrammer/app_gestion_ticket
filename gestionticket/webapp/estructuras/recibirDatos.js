sap.ui.define(["app/gestionticket/model/formatter"], function (formatter) {
  "use strict";
  return {
    obtenerRoles: function (data) {
      let modData = [];
      if (data) {
        data.forEach(function (item, index) {
          //;
          let obj = {
            ...item,
          };
          modData.push(obj);
        });
      }

      return modData;
    },
    obtenerPep: function (data) {
      let modData = [];
      if (data) {
        data.forEach(function (item, index) {
          //;
          let obj = {
            ...item,
          };
          modData.push(obj);
        });
      }

      return modData;
    },
    obtenerConsultores: function (data) {
      let modData = [];
      if (data) {
        data.forEach(function (item, index) {
          //;
          let obj = {
            ...item,
          };
          modData.push(obj);
        });
      }

      return modData;
    },

    obtenerPepSel: function (data) {
      let modData = [];
      if (data) {
        modData.push({
          ID: "0",
          NOMBRE: "--Seleccione--",
        });
        data.forEach(function (item, index) {
          //;
          let obj = {
            ...item,
          };
          modData.push(obj);
        });
      }

      return modData;
    },
    obtenerConsultoresSel: function (data) {
      let modData = [];
      if (data) {
        modData.push({
          ID: "0",
          NOMBRE: "--Seleccione--",
        });
        data.forEach(function (item, index) {
          //;
          let obj = {
            ...item,
          };
          modData.push(obj);
        });
      }
      debugger;
      return modData;
    },

    obtenerListaGestionticket: function (data) {
      let modData = [];
      if (data) {
        data.forEach(function (item, index) {
          //;
          let obj = {
            idGestionticket: item.ID,
            nombres: item.NOMBRE,
            apellidos: item.APELLIDO,
            correo: item.CORREO,
            tipoDeEmisor: item.CODIGO_TIPO_EMISOR,
            tipoDeEmisorDesc: item.TIPO_EMISOR, //formatter.formatTextEmisor(item.TIPO_EMISOR),
            listaCodRolesDescripcion: item.LISTA_ROLES,
            listaRolesDescripcion: item.LISTA_ROLES_DESCRIPCION,
            razonSocial: item.RAZON_SOCIAL,
            gestionticket: item.USUARIO,
            ruc: item.USUARIO,
            fechaDeCreacion: item.CREATED_AT,
            estado: item.ID_ESTADO,
            estadoDesc: formatter.formatTextEstado(item.ID_ESTADO),

            //idGestionticket: index + 1,
          };
          modData.push(obj);
        });
      }

      return modData;
    },
    obtenerDatosMaestrosSelect: function (data) {
      let modData = [];
      if (data) {
        if (data.length > 0) {
          modData.push({ key: "0", text: "--Seleccione--" });
        }
        data.forEach(function (item, index) {
          //;
          let obj = {
            key: item.CODIGO_MAESTRO_DETALLE,
            text: item.CAMPO,
            //idGestionticket: index + 1,
          };
          modData.push(obj);
        });
      }
      return modData;
    },
    obtenerDatosMaestrosMultiple: function (data) {
      let modData = [];
      if (data) {
        data.forEach(function (item, index) {
          //;
          let obj = {
            key: item.CODIGO_MAESTRO_DETALLE,
            text: item.CAMPO,
            //idGestionticket: index + 1,
          };
          modData.push(obj);
        });
      }
      return modData;
    },
    obtenerDatoSociedad: function (data) {
      let modData = [];
      if (data) {
        data.forEach(function (item) {
          let obj = {
            codigo: item.CODIGO_MAESTRO_DETALLE,
            descripcion: item.DESCRIPCION,
            ruc: item.VALOR,
            sociedad: item.CAMPO,
          };
          modData.push(obj);
        });
      }
      return modData;
    },

    obtenerDatosMaestrosSimpleSeleccion: function (data) {
      let modData = [];
      if (data) {
        modData.push({ key: "0", text: "---Seleccione---" });
        data.forEach(function (item, index) {
          //;
          let obj = {
            key: item.CODIGO_MAESTRO_DETALLE,
            text: item.CAMPO,
            //idGestionticket: index + 1,
          };
          modData.push(obj);
        });
      }
      return modData;
    },
    obtenerRolesXGestionticket: function (data) {
      let modData = [];
      if (data) {
        data.forEach(function (item) {
          let obj = {
            codigo: item.CODIGO_MAESTRO_DETALLE,
            rol: item.NOMBRE_ROL,
          };
          modData.push(obj);
        });
      }
      return modData;
    },
    obtenerKeysRolesXGestionticket: function (data) {
      let modData = [];
      if (data) {
        data.forEach(function (item) {
          modData.push(item.CODIGO_MAESTRO_DETALLE);
        });
      }
      return modData;
    },
  };
});
