sap.ui.define([], function () {
  'use strict';
  var Formatter = {
    formatFecha: function (fecha) {
      if (fecha) {
        //console.log("fecha ", fecha);
        //var ts = fecha.split("T")[0];
        //console.log("ts ", ts);
        return moment(new Date(fecha)).format('DD/MM/YYYY');
      }
    },

    formatIconEstado: function (estado) {
      if (estado == 1) {
        return 'sap-icon://message-success';
      } else {
        return 'sap-icon://message-error';
      }
    },
    formatStateEstado: function (estado) {
      if (estado == 1) {
        return 'Success';
      } else {
        return 'Error';
      }
    },
    formatTextEstado: function (estado) {
      if (estado == 1) {
        return 'Activo';
      } else {
        return 'Inactivo';
      }
    },
    formatTextEmisor: function (emisor) {
      if (emisor == 'E') {
        return 'Electrónico';
      } else {
        return 'Fisico';
      }
    },
  };

  return Formatter;
});
