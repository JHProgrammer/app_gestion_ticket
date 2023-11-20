// MainView.controller.js

sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "app/gestionticket/controller/BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    "sap/m/ColumnListItem",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "../model/models",
    "../service/service",
    "../constantes",
    "../estructuras/enviarDatos",
    "../estructuras/recibirDatos",
  ],
  function (
    Controller,
    BaseController,
    MessageBox,
    MessageToast,
    Fragment,
    exportLibrary,
    Spreadsheet,
    ColumnListItem,
    FilterOperator,
    Filter,
    models,
    service,
    constantes,
    enviarDatos,
    recibirDatos
  ) {
    "use strict";
    const EdmType = exportLibrary.EdmType;

    return BaseController.extend("app.gestionticket.controller.NotFound", {
      onInit: function () {
        var oRouter, oTarget;

        oRouter = this.getRouter();
        oTarget = oRouter.getTarget("TargetNotFound");
        oTarget.attachDisplay(function (oEvent) {
          this._oData = oEvent.getParameter("data"); // store the data
        }, this);
      },
      onAfterRendering: function () {},
    });
  }
);
