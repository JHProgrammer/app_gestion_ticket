sap.ui.define([], function () {
  "use strict";
  return {
    registrarGestionticket: function (oParam) {
      let gestionticket = {};
      let roles = [];
      gestionticket.ID_ESTADO = 1;
      gestionticket.CORREO = oParam.correo;
      gestionticket.NOMBRE = oParam.nombres;
      gestionticket.APELLIDO = oParam.apellidos;
      gestionticket.RUC = oParam.ruc;
      gestionticket.USUARIO = oParam.gestionticket;
      gestionticket.RAZON_SOCIAL = oParam.razonSocial;
      gestionticket.TIPO_EMISOR = oParam.tipoDeEmisor;
      gestionticket.CODIGO_TIPO_EMISOR = oParam.selectTipoEmisor;

      gestionticket.TELEFONO = "";

      for (let i = 0; i < oParam.roles.length; i++) {
        let rolGestionticket = {};
        rolGestionticket.ID_ROL = oParam.roles[i];
        rolGestionticket.ID_ESTADO = 1;
        roles.push(rolGestionticket);
      }
      let modData = {
        gestionticketCab: gestionticket,

        registrarRoles: roles,
      };

      return modData;
    },
    actualizarGestionticket: function (oParam) {
      let gestionticket = {};
      let roles = [];

      gestionticket.ID = oParam.idGestionticket;
      gestionticket.ID_ESTADO = 1;
      gestionticket.CORREO = oParam.correo;
      gestionticket.NOMBRE = oParam.nombres;
      gestionticket.APELLIDO = oParam.apellidos;
      gestionticket.RUC = oParam.ruc;
      gestionticket.USUARIO = oParam.gestionticket;
      gestionticket.RAZON_SOCIAL = oParam.razonSocial;
      gestionticket.TIPO_EMISOR = oParam.tipoDeEmisor;
      gestionticket.CODIGO_TIPO_EMISOR = oParam.tipoDeEmisor;
      for (let i = 0; i < oParam.roles.length; i++) {
        let rolGestionticket = {};
        rolGestionticket.ID_ROL = oParam.roles[i];
        rolGestionticket.ID_ESTADO = 1;
        roles.push(rolGestionticket);
      }
      let modData = {
        gestionticketCab: gestionticket,
        registrarRoles: roles,
      };

      return modData;
    },
    eliminarGestionticket: function (oParam) {
      let deleteGestionticket = [];

      for (let i = 0; i < oParam.length; i++) {
        let gestionticket = {};

        gestionticket.ID = oParam[i].idGestionticket;
        gestionticket.CORREO = oParam[i].correo;
        gestionticket.USUARIO = oParam[i].gestionticket;

        deleteGestionticket.push(gestionticket);
      }

      let modData = {
        eliminarGestionticket: deleteGestionticket,
      };

      return modData;
    },
    obtenerRolesXGestionticket: function (idGestionticket) {
      let modData = [];
      let keyValue = "USUARIO_ID=" + idGestionticket;
      modData.push(keyValue);
      return modData;
    },
    procesoObtenerRazonSocialXRuc: function (oParam) {
      let obtenerRazonSocial = [];
      let object = {};
      let object2 = {};

      object.STCD1 = oParam;

      obtenerRazonSocial.push(object);

      object2.LT_STCD1 = obtenerRazonSocial;

      return object2;
    },
    onFiltrarTabla: function (buscar, roles) {
      return {
        listaCodigosRoles: roles,
        buscar: buscar,
      };
    },
  };
});
