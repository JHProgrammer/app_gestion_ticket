sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../constantes",
    "../util/utilResponse",
    "../util/utilPopUps",
  ],
  function (Controller, JSONModel, constantes, utilResponse, utilPopUps) {
    "use strict";
    return {
      obtenerFechaIso: function () {
        const d = new Date();
        const fechaIso = d.toISOString();
        return fechaIso.toString();
      },
      generarIdTransaccion: function () {
        var fecha = new Date();
        var fechaIso = fecha.toISOString();
        var fechaString = fechaIso
          .toString()
          .replace(/:/g, "")
          .replace(/-/g, "")
          .replace(".", "")
          .replace("Z", "")
          .replace("T", "");
        var randon = Math.floor(Math.random() * 1000000 + 1);
        var idTransaccion = fechaString + "" + randon;
        return idTransaccion;
      },
      generarIdTransaccionFecha: function () {
        var fecha = new Date();
        var fechaIso = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ"); //fecha.toISOString();
        var fechaString = fechaIso
          .toString()
          .replace(/:/g, "")
          .replace(/-/g, "")
          .replace(".", "")
          .replace("Z", "")
          .replace("T", "");
        var randon = Math.floor(Math.random() * 1000000 + 1);
        var idTransaccion = fechaString + "" + randon;
        return { idTransaccion: idTransaccion, fechatransaccion: fechaIso };
      },

      validarRespuestaServicio: function (oAuditResponse, mensaje2, callback) {
        if (oAuditResponse.code === 1) {
          utilPopUps.onMessageSuccessDialogPress(
            oAuditResponse.idtransaccion,
            mensaje2,
            callback
          );
        } else if (oAuditResponse.code === 200) {
          utilPopUps.onMessageWarningDialogPressExit(
            oAuditResponse.idtransaccion,
            mensaje2
          );
        } else if (oAuditResponse.code > 1) {
          var mensaje = oAuditResponse.message;
          utilPopUps.onMessageWarningDialogPress2(
            oAuditResponse.idtransaccion,
            mensaje
          );
        } else if (oAuditResponse.code === 0) {
          utilPopUps.onMessageErrorDialogPress(oAuditResponse.idtransaccion);
        } else {
          utilPopUps.onMessageErrorDialogPress(oAuditResponse.idtransaccion);
        }
      },
      generarHeaders: function (self) {
        let sToken = "";
        let token = constantes.isLocal
          ? constantes.token
          : self.getView().getModel("localModel").getProperty("/token");
        let request = {};
        debugger;
        const generarIdTransaccionFecha = this.generarIdTransaccionFecha();
        request.idtransaccion = generarIdTransaccionFecha.idTransaccion;
        request.aplicacion = constantes.idProyecto;
        request.gestionticket = "USUARIO"; //this.parseJwt(token).USUARIO;
        request.fechatransaccion = generarIdTransaccionFecha.fechatransaccion;
        request.token = token;
        request["Content-Type"] = "application/json";
        request["Access-Control-Allow-Origin"] = "*";
        return request;
      },

      generarHeadersSeguridad: function (self) {
        let request = {};
        const generarIdTransaccionFecha = this.generarIdTransaccionFecha();
        request.idtransaccion = generarIdTransaccionFecha.idTransaccion;
        request.aplicacion = constantes.idProyecto;
        request.fechatransaccion = generarIdTransaccionFecha.fechatransaccion;
        request["Content-Type"] = "application/json";
        request["Access-Control-Allow-Origin"] = "*";
        return request;
      },

      httpPost: async function (path, data, context) {
        sap.ui.core.BusyIndicator.show(0);
        const oHeader = this.generarHeaders(context);
        const self = this;
        try {
          path = constantes.destApiGateway + path;
          if (constantes.isLocal) {
            path = path.replace(
              "./GestionTicket_SRV/",
              constantes.urlApiGatewayLocal
            );
          }
          const rawResponse = await fetch(path, {
            method: "POST",
            headers: oHeader,
            mode: "cors",
            body: JSON.stringify(data),
          });

          const content = await rawResponse.json();

          return self.success(content, null);
        } catch (error) {
          return self.error(error, oHeader, null);
        } finally {
          sap.ui.core.BusyIndicator.hide();
        }
      },

      parseJwt: function (token) {
        var base64Url = token.split(".")[1];
        var base64 = decodeURIComponent(
          atob(base64Url)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );

        return JSON.parse(base64);
      },

      httpDelete: async function (path, data, context) {
        const oHeader = this.generarHeaders(context);
        try {
          //if (constantes.ActivarLocal) {
          path = path.replace(
            "./GestionTicket_SRV/",
            constantes.urlApiGatewayLocal
          );
          //}
          const rawResponse = await fetch(path, {
            method: "DELETE",
            headers: oHeader,
            body: JSON.stringify(data),
          });
          const content = await rawResponse.json();
          return content;
        } catch (error) {
          sap.ui.core.BusyIndicator.hide();
          return {
            oAuditResponse: {
              idtransaccion: oHeader.idtransaccion,
              code: -1000,
              sMensaje:
                "Error al consultar el servicio (" +
                error.status +
                "), vuelva a intentarlo o comuníquese con el área de soporte.",
            },
          };
        }
      },
      httpPut: async function (path, data, context) {
        try {
          const oHeader = this.generarHeaders(context);
          //if (constantes.ActivarLocal) {
          path = path.replace(
            "./GestionTicket_SRV/",
            constantes.urlApiGatewayLocal
          );
          //}
          const rawResponse = await fetch(path, {
            method: "PUT",
            headers: oHeader,
            body: JSON.stringify(data),
          });
          const content = await rawResponse.json();
          return content;
        } catch (error) {
          sap.ui.core.BusyIndicator.hide();
          return {
            oAuditResponse: {
              idtransaccion: oHeader.idtransaccion,
              code: -1000,
              sMensaje:
                "Error al consultar el servicio (" +
                error.status +
                "), vuelva a intentarlo o comuníquese con el área de soporte.",
            },
          };
        }
      },
      httpGet: async function (path, context) {
        sap.ui.core.BusyIndicator.show(0);
        const oHeader = this.generarHeaders(context);
        const self = this;
        try {
          path = constantes.destApiGateway + path;
          if (constantes.isLocal) {
            path = path.replace(
              "./GestionTicket_SRV/",
              constantes.urlApiGatewayLocal
            );
          }
          const rawResponse = await fetch(path, {
            method: "GET",
            headers: oHeader,
            mode: "cors",
          });

          const content = await rawResponse.json();

          return self.success(content, null);
        } catch (error) {
          sap.ui.core.BusyIndicator.hide();
          return self.error(error, oHeader, null);
        } finally {
          sap.ui.core.BusyIndicator.hide();
        }
      },
      httpGetSeguridad: async function (path, context) {
        sap.ui.core.BusyIndicator.show(0);

        const oHeader = this.generarHeadersSeguridad(context);
        const self = this;
        try {
          path = constantes.destApiSeguridad + path;

          const rawResponse = await fetch(path, {
            method: "GET",
            headers: oHeader,
            mode: "cors",
          });

          const content = await rawResponse.json();

          return self.success(content, null);
        } catch (error) {
          sap.ui.core.BusyIndicator.hide();
          return self.error(error, oHeader, null);
        } finally {
          sap.ui.core.BusyIndicator.hide();
        }
      },
      parseJwt: function (token) {
        let base64Url = token.split(".")[1];
        let base64 = decodeURIComponent(
          atob(base64Url)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );

        return JSON.parse(base64);
      },

      success: function (result, mockData) {
        var self = this;
        var modResult;
        var oAuditResponse = result.oAuditResponse;
        if (!constantes.ActivarMockData) {
          mockData = null;
        }
        if (mockData) {
          modResult = utilResponse.success(
            "17682783782383",
            "Se consultó correctamente.",
            mockData
          );
        } else {
          if (oAuditResponse.code === 1) {
            modResult = utilResponse.success(
              oAuditResponse.idtransaccion,
              oAuditResponse.message,
              result.oDataResponse
            );
          } else if (oAuditResponse.code > 1) {
            modResult = utilResponse.warn(
              oAuditResponse.idtransaccion,
              oAuditResponse.message,
              result.oDataResponse
            );
          } else if (oAuditResponse.code < 0 && oAuditResponse.code !== -1000) {
            modResult = utilResponse.error(
              oAuditResponse.idtransaccion,
              oAuditResponse.message,
              result.oDataResponse
            );
            //utilPopUps.onMessageErrorDialogPress(modResult.idtransaccion);
          } else if (oAuditResponse.code === -1000) {
            modResult = utilResponse.exception(
              oAuditResponse.idtransaccion,
              oAuditResponse.message
            );
          }
        }
        return modResult;
      },
      error: function (error, oHeader, mockData) {
        var modResult;
        if (!constantes.ActivarMockData) {
          mockData = null;
        }
        if (mockData) {
          modResult = utilResponse.success(
            "17682783782383",
            "Se consultó correctamente.",
            mockData
          );
        } else {
          modResult = utilResponse.errorServicio(error, oHeader);
        }
        return modResult;
      },
    };
  }
);
