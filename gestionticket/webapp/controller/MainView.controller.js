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
    "../util/util",
    "sap/ui/core/format/DateFormat",
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
    recibirDatos,
    util,
    DateFormat
  ) {
    "use strict";
    const EdmType = exportLibrary.EdmType;

    return BaseController.extend("app.gestionticket.controller.MainView", {
      onAfterRendering: async function () {
        await this.callApis();
        // if (!constantes.isLocal) {
        //   await this.consultarUserApi();
        // } else {
        //   this.getView()
        //     .getModel("localModel")
        //     .setProperty("/token", constantes.token);
        //   this.getView()
        //     .getModel("localModel")
        //     .setProperty("/infoGestionticket", constantes.infoGestionticket);
        //   await this.callApis();
        // }
      },
      onSearch: async function (oEvent) {
        const { filtroRoles, filtroPeps, filtroConsultores } = this.getView()
          .getModel("localModel")
          .getData();

        await this.obtenerGestionticketXFiltro({
          filtroRoles,
          filtroPeps,
          filtroConsultores,
        });
      },

      _setDetailsDialogContent: function (oAppointment, oDetailsPopover) {
        oDetailsPopover.setBindingContext(oAppointment.getBindingContext());
        oDetailsPopover.openBy(oAppointment);
      },

      handleAppointmentSelect: function (oEvent) {
        debugger;
        var asignacionSeleccionada = oEvent
          .getParameters()
          .appointment.getBindingContext("localModel")
          .getObject();
        const oAppointment = oEvent.getParameter("appointment");

        if (oAppointment) {
          this.getView()
            .getModel("localModel")
            .setProperty("/asignacionSeleccionada", asignacionSeleccionada);

          this.getView()
            .getModel("localModel")
            .setProperty("/oAppointmentRow", oAppointment);
          this._handleSingleAppointment(oAppointment);
        } else {
          this._handleGroupAppointments(oEvent);
        }
      },
      formatDate: function (oDate) {
        debugger;
        if (oDate) {
          var iHours = oDate.getHours(),
            iMinutes = oDate.getMinutes(),
            iSeconds = oDate.getSeconds();

          if (iHours !== 0 || iMinutes !== 0 || iSeconds !== 0) {
            return DateFormat.getDateTimeInstance({ style: "medium" }).format(
              oDate
            );
          } else {
            return DateFormat.getDateInstance({ style: "medium" }).format(
              oDate
            );
          }
        }
      },

      handleCloseDetailAppointment: function () {
        const self = this;
        self
          .getView()
          .getModel("localModel")
          .getProperty("/oAppointmentRow")
          .setSelected(false);
        var oDetailsPopover = this.byId("detailsPopover");

        oDetailsPopover.close();
      },

      _handleSingleAppointment: function (oAppointment) {
        var oView = this.getView();
        if (oAppointment === undefined) {
          return;
        }

        if (!oAppointment.getSelected() && this._pDetailsPopover) {
          this._pDetailsPopover.then(function (oDetailsPopover) {
            oDetailsPopover.close();
          });
          return;
        }

        if (!this._pDetailsPopover) {
          this._pDetailsPopover = Fragment.load({
            id: oView.getId(),
            name: "app.gestionticket.view.fragment.Details",
            controller: this,
          }).then(function (oDetailsPopover) {
            oView.addDependent(oDetailsPopover);
            debugger;
            return oDetailsPopover;
          });
        }

        this._pDetailsPopover.then(
          function (oDetailsPopover) {
            this._setDetailsDialogContent(oAppointment, oDetailsPopover);
          }.bind(this)
        );
      },

      onFiltrarTabla: async function (buscar, roles) {
        let self = this;

        try {
          let oParam = enviarDatos.onFiltrarTabla(buscar, roles);
          let response = await service.servicePost(
            constantes.services.onFiltrarTabla,
            oParam,
            self
          );
          if (response.code == 1) {
            // util.utilHttp.validarRespuestaServicio(
            //   response,
            //   "Se consultado correctamente."
            // );
            const { gestiontickets } = response.results;
            const listaGestionticket =
              recibirDatos.obtenerListaGestionticket(gestiontickets);
            self
              .getView()
              .getModel("localModel")
              .setProperty("/listaGestionticket", listaGestionticket);
          } else {
            util.utilHttp.validarRespuestaServicio(response);
          }
        } catch (error) {}
      },
      onPaginateMaestroCabeceraPaginado: function () {
        let paginaActualObtenerCabecera = this.getView()
          .getModel("localModel")
          .getProperty("/paginaActualObtenerCabecera");
        paginaActualObtenerCabecera = paginaActualObtenerCabecera + 1;

        const { filtroRoles, filtroBuscar, filtrosTipoEmisor } = this.getView()
          .getModel("localModel")
          .getData();

        this.onObtenerGestionticketPaginado(paginaActualObtenerCabecera, [
          {
            filtroRoles: filtroRoles,
            filtroBuscar: filtroBuscar,
            filtrosTipoEmisor: filtrosTipoEmisor,
          },
        ]);
      },
      updateStartedTablePagination: function (oEvent) {
        if (oEvent.getParameters().reason == "Growing") {
          let paginaActualObtenerCabecera = this.getView()
            .getModel("localModel")
            .getProperty("/paginaActualObtenerCabecera");
          paginaActualObtenerCabecera = paginaActualObtenerCabecera + 1;

          const { filtroRoles, filtroBuscar, filtrosTipoEmisor } =
            this.getView().getModel("localModel").getData();

          this.onObtenerGestionticketPaginado(paginaActualObtenerCabecera, [
            {
              filtroRoles: filtroRoles,
              filtroBuscar: filtroBuscar,
              filtrosTipoEmisor: filtrosTipoEmisor,
            },
          ]);
        }
      },
      onDataExport: function () {
        let that = this;
        let FileName =
          "ListaGestionticket_" + new Date().toISOString().split("T")[0];
        if (!this.oMPDialogExportData) {
          this.oMPDialogExportData = this.loadFragment({
            name: "app.gestionticket.view.fragment.exportExcel",
          });
        }
        this.oMPDialogExportData.then(
          function (oDialogExportarData) {
            this.oDialogExportData = oDialogExportarData;
            this.oDialogExportData.open();
            that.getView().byId("fileNameInput").setValue(FileName);
          }.bind(this)
        );
      },
      createColumnUsers: function () {
        let aCols = [];
        aCols.push({
          label: "Nombres",
          property: ["nombres"],
          type: EdmType.String,
          template: "{0}",
        });

        aCols.push({
          label: "Apellidos",
          property: ["apellidos"],
          type: EdmType.String,
          template: "{0}",
        });
        aCols.push({
          label: "ID",
          property: ["idGestionticket"],
          type: EdmType.String,
          template: "{0}",
        });
        aCols.push({
          label: "Correo",
          property: ["correo"],
          type: EdmType.String,
          template: "{0}",
        });
        aCols.push({
          label: "Tipo de Emisor",
          property: ["tipoDeEmisorDesc"],
          type: EdmType.String,
          template: "{0}",
        });
        aCols.push({
          label: "Identificación Fiscal",
          property: ["gestionticket"],
          type: EdmType.String,
          template: "{0}",
        });

        aCols.push({
          label: "Razón Social",
          property: ["razonSocial"],
          type: EdmType.String,
          template: "{0}",
        });

        aCols.push({
          label: "Rol",
          property: ["listaRolesDescripcion"],
          type: EdmType.String,
          template: "{0}",
        });

        aCols.push({
          label: "Fecha de creación",
          property: ["fechaDeCreacion"],
          type: EdmType.Date,
          template: "{0}",
        });

        aCols.push({
          label: "Estado",
          property: ["estadoDesc"],
          type: EdmType.String,
          template: "{0}",
        });

        return aCols;
      },
      onExportarExcel: function () {
        let oInput = this.getView().byId("fileNameInput");
        let fileName = oInput.getValue();

        let aCols, oRowBinding, oSettings, oSheet, oTable;
        oTable = this.getView().byId("idGestionticketTable");
        oRowBinding = oTable.getBinding("items");
        aCols = this.createColumnUsers();

        oSettings = {
          workbook: {
            columns: aCols,
            hierarchyLevel: "Level",
          },
          dataSource: oRowBinding,
          fileName: `${fileName}.xlsx`,
          worker: false,
        };

        oSheet = new Spreadsheet(oSettings);
        oSheet.build().finally(function () {
          oSheet.destroy();
        });
        this.onCloseExportExcel();
        oInput.setValue("");
      },
      onCloseExportExcel: function () {
        this.oDialogExportData.close();
      },
      limpiarGestionticket: function (oEvent) {
        this.getView()
          .getModel("localModel")
          .setProperty("/gestionticket", models.localModel().oData.gestionticket);
      },
      onPressEditUser: async function (oEvent) {
        this.getView()
          .getModel("localModel")
          .setProperty("/aRolesXGestionticket", []);
        this.getView()
          .getModel("localModel")
          .setProperty("/gestionticket/roles", []);
        let oButton = oEvent.getSource();
        let oView = this.getView();
        this.limpiarGestionticket();
        let oProduct = oButton.getParent().getBindingContext("localModel");
        //
        let oSelectObj = oProduct.getObject();
        this.getView()
          .getModel("localModel")
          .setProperty("/gestionticket", { ...oSelectObj });
        await this.onShowRolesXGestionticket(oSelectObj.idGestionticket);
        console.log("Segundo");

        this.getView().getModel("localModel").refresh(true);
        // create popover
        if (!this.oEditUser) {
          this.oEditUser = this.loadFragment({
            name: "app.gestionticket.view.fragment.editUser",
          });
        }
        this.oEditUser.then(
          function (oDialog1) {
            this.oDialogEditUser = oDialog1;
            this.oDialogEditUser.open();
            this.onHabilitarCampos();
          }.bind(this)
        );
      },
      onHabilitarCampos: function () {
        let mcRol = this.getView().byId("mcRolEdit");
        let flagProveedor = false;
        let flagContadorSistemas = false;

        var aSelectedItems = this.getView()
          .getModel("localModel")
          .getProperty("/gestionticket/roles");

        var aSelectedKeys = aSelectedItems.map(function (oItem) {
          return oItem;
        });

        //Validar que sea solo proveedor que es unico, o puede ser contador y sistemas
        if (aSelectedKeys.length == 0) {
          flagProveedor = false;
          flagContadorSistemas = false;
        } else if (aSelectedKeys[0] == "C001" && aSelectedKeys.length == 1) {
          flagProveedor = true;
          flagContadorSistemas = false;
        } else if (aSelectedKeys[0] != "C001" && aSelectedKeys.length == 1) {
          flagProveedor = false;
          flagContadorSistemas = true;
        } else if (
          aSelectedKeys.length > 1 &&
          !aSelectedKeys.includes("C001")
        ) {
          flagProveedor = false;
          flagContadorSistemas = true;
        } else {
        }

        //if(aSelectedKeys == 'C003' || aSelectedKeys == 'C002' && aSelectedKeys!= 'C001'){
        if (flagContadorSistemas) {
          this.getView().byId("lbGestionticketEdit").setVisible(true);
          this.getView().byId("inputGestionticketEdit").setVisible(true);

          this.getView().byId("lbIdentificacionFiscalEdit").setVisible(false);
          this.getView()
            .byId("inputIdentificacionFiscalEdit")
            .setVisible(false);
          this.getView().byId("lbRazonSocialEdit").setVisible(false);
          this.getView().byId("inputRazonSocialEdit").setVisible(false);
          this.getView().byId("lbTipoEmisorEdit").setVisible(false);
          this.getView().byId("slTipoEmisorEdit").setVisible(false);
        } else if (flagProveedor) {
          this.getView().byId("lbIdentificacionFiscalEdit").setVisible(true);
          this.getView().byId("inputIdentificacionFiscalEdit").setVisible(true);
          this.getView().byId("lbRazonSocialEdit").setVisible(true);
          this.getView().byId("inputRazonSocialEdit").setVisible(true);
          this.getView().byId("lbTipoEmisorEdit").setVisible(true);
          this.getView().byId("slTipoEmisorEdit").setVisible(true);
        } else {
          this.getView().byId("inputGestionticketEdit").setValue("");
          this.getView().byId("inputIdentificacionFiscalEdit").setValue("");
          this.getView().byId("inputRazonSocialEdit").setValue("");
          this.getView().byId("slTipoEmisorEdit").setSelectedKey("0");

          this.getView().byId("lbIdentificacionFiscalEdit").setVisible(false);
          this.getView()
            .byId("inputIdentificacionFiscalEdit")
            .setVisible(false);
          this.getView().byId("lbGestionticketEdit").setVisible(false);
          this.getView().byId("inputGestionticketEdit").setVisible(false);
          this.getView().byId("lbRazonSocialEdit").setVisible(false);
          this.getView().byId("inputRazonSocialEdit").setVisible(false);
          this.getView().byId("lbTipoEmisorEdit").setVisible(false);
          this.getView().byId("slTipoEmisorEdit").setVisible(false);
        }
      },
      onEditUser_Accept: function () {
        //1.VALIDAR QUE TODOS LOS CAMPOS ESTEN LLENOS
        const { nombres, apellidos, correo, sociedad, rol, razonSocial } =
          this.getView()
            .getModel("localModel")
            .getProperty("/actualizarGestionticket");
        /*if (!(validNombres && validApellidos)) {
            MessageBox.warning('Por favor complete los campos requeridos');
            return;
          }*/

        MessageBox.confirm(
          `¿Está seguro de que desea guardar los cambios en este gestionticket?`,
          {
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.OK) {
                //let listaGestionticket = this.getView().getModel('localModel').getProperty('/listaGestionticket');
                let updateGestionticket = this.getView()
                  .getModel("localModel")
                  .getProperty("/gestionticket");

                this.actualizarGestionticket(updateGestionticket);

                //Refrescar TODO lo que esta anidado a localModel
                this.getView().getModel("localModel").refresh(true);
              }
            }.bind(this),
          }
        );
      },
      onEditUserClose: function (oEvent) {
        this.cleanFieldsEditUser();
        this.oDialogEditUser.close();
      },
      onEditUser_Reject: function (oEvent) {
        this.cleanFieldsEditUser();
        this.oDialogEditUser.close();
      },
      onCloseConfigurarColumnas: function () {
        this.oDialogConfigColumn.close();
      },

      createFilter: function (property, operator, value) {
        return new Filter(property, operator, value);
      },

      filter: function (value) {
        const oTable = this.byId("idGestionticketTable");
        const properties = [
          "nombres",
          "apellidos",
          "correo",
          "sociedad",
          "tipoDeEmisor",
          "rol",
          "razonSocial",
        ];
        const filters = properties.map((prop) =>
          this.createFilter(prop, FilterOperator.Contains, value)
        );
        const allFilters = new Filter(filters, false);
        oTable.getBinding("items").filter(allFilters);
      },

      onDeleteSelectedUser: function () {
        const oTable = this.byId("idGestionticketTable");
        const aSelectedItems = oTable.getSelectedItems();
        const aSelectedProducts = aSelectedItems.map((oItem) =>
          oItem.getBindingContext("localModel").getObject()
        );
        const iNumSelectedUsers = aSelectedItems.length;
        if (iNumSelectedUsers === 0) {
          MessageBox.warning(
            "Seleccione uno o más gestiontickets para eliminar"
          );
          return;
        }
        MessageBox.confirm(
          `¿Está seguro que desea eliminar ${iNumSelectedUsers} gestiontickets seleccionados?`,
          {
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.OK) {
                const oModel = this.getView().getModel("localModel");
                const aAllUsers = oModel.getProperty("/listaGestionticket");
                const aUsers = aAllUsers.filter((use) =>
                  aSelectedProducts.includes(use)
                );
                //oModel.setProperty('/listaGestionticket', aUsers);
                //oModel.setProperty('/totalUsers', aUsers.length);
                //oModel.updateBindings();

                //let deleteGestionticket = this.getView().getModel('localModel').getProperty('/gestionticket');

                this.eliminarGestionticket(aUsers);

                //this.getView().getModel('localModel').getProperty('/gestionticket');

                //this.getView().getModel("localModel").setProperty("/estado", "0");

                //Refrescar TODO lo que esta anidado a localModel
                this.getView().getModel("localModel").refresh(true);
                this.getView().byId("idGestionticketTable").removeSelections();
              }
            }.bind(this),
          }
        );
      },
      onOpenDialogCrearAsignacion: function () {
        if (!this.oAddGestionticket) {
          this.oAddGestionticket = this.loadFragment({
            name: "app.gestionticket.view.fragment.addAsignacion",
          });
        }

        this.oAddGestionticket.then(
          function (oDialog) {
            this.oDialogAddGestionticket = oDialog;
            this.oDialogAddGestionticket.open();
          }.bind(this)
        );

        this.getView().getModel("localModel").setProperty("/asignacion", {});
      },

      onDlgCrearAsignacion: async function () {
        debugger;
        // console.log(this.getView().getModel("localModel").getData().asignacion);
        const { asignacion } = this.getView().getModel("localModel").getData();
        await this.registrarAsignacion({ asignacion: asignacion });

        this.oDialogAddGestionticket.close();
      },

      onDlgCrearAsignacionClose: function () {
        this.oDialogAddGestionticket.close();
      },

      onAddUser: function (oEvent) {
        // create popover
        this.limpiarGestionticket();

        if (this.oAddUser !== undefined) {
          this.getView().byId("lbIdentificacionFiscal").setVisible(false);
          this.getView().byId("inputIdentificacionFiscal").setVisible(false);
          this.getView().byId("lbGestionticket").setVisible(false);
          this.getView().byId("inputGestionticket").setVisible(false);
          this.getView().byId("lbRazonSocial").setVisible(false);
          this.getView().byId("inputRazonSocial").setVisible(false);
          this.getView().byId("lbTipoEmisor").setVisible(false);
          this.getView().byId("slTipoEmisor").setVisible(false);
        }

        if (!this.oAddUser) {
          this.oAddUser = this.loadFragment({
            name: "app.gestionticket.view.fragment.addUser",
          });
        }

        this.oAddUser.then(
          function (oDialog) {
            this.oDialogAddUser = oDialog;
            this.oDialogAddUser.open();
          }.bind(this)
        );
      },
      onDeleteAsignacion: function () {
        var self = this;
        util.utilPopUps.messageBox(
          `Desea eliminar la asignación seleccionada?`,
          "C",
          async function (oEvent) {
            // do nothing...
            debugger;
            if (oEvent) {
              const { ASIGNACION_ID } = self
                .getView()
                .getModel("localModel")
                .getProperty("/asignacionSeleccionada");
              await self.eliminarAsignacion({
                ID: ASIGNACION_ID,
              });

              self.getView().getModel("localModel").refresh(true);
            }
          }
        );
      },
      onAddUser_Accept: async function (oEvent) {
        const {
          validNombres,
          validApellidos,
          validGestionticket,
          validRoles,
          // validRazonSocial,
          // validSociedad,
        } = this.getView().getModel("localModel").getProperty("/gestionticket");

        if (
          !(
            (validNombres && validApellidos && validGestionticket && validRoles)
            // validSociedad
          )
        ) {
          MessageBox.warning("Por favor complete los campos requeridos");
          return;
        }

        const { correo, roles, gestionticket, selectTipoEmisor } = this.getView()
          .getModel("localModel")
          .getProperty("/gestionticket");

        const aContador = roles.filter(function (item) {
          return item !== "C001";
        });
        if (aContador.length > 0) {
          const oParam = {
            CORREO: correo,
          };
          await this.procesoValidarCorreoXGestionticketObtIDP(oParam);
        } else {
          if (selectTipoEmisor == "E" || selectTipoEmisor == "F") {
            const oParam = {
              CORREO: correo,
              RUC: gestionticket,
              USUARIO: gestionticket,
            };

            await this.procesoValidarCorreoXRucObtIDP(oParam);
          } else {
            util.utilPopUps.messageBox(
              "Debe seleccionar el un tipo de Emisor.",
              "A",
              function () {}
            );
            return;
          }
        }
        return;

        MessageBox.confirm(
          `¿Está seguro de que desea agregar este gestionticket?`,
          {
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.OK) {
                let nuevoGestionticket = this.getView()
                  .getModel("localModel")
                  .getProperty("/gestionticket");
                this.registrarGestionticket(nuevoGestionticket);
                // this.cleanFieldsAddUser();
                // this.byId("idAddUserDialog").close();
                this.getView().getModel("localModel").refresh(true);
              }
            }.bind(this),
          }
        );

        //this.cleanFieldsAddForm();
      },
      onEditUserClose: function (oEvent) {
        this.oDialogEditUser.close();
        this.cleanFieldsEditUser();
      },
      onEditUser_Reject: function (oEvent) {
        this.oDialogEditUser.close();
        this.cleanFieldsEditUser();
      },
      cleanFieldsEditUser: function () {
        this.getView()
          .getModel("localModel")
          .setProperty("/editarGestionticket", {
            id: null,
            nombres: "",
            apellidos: "",
            correo: "",
            sociedad: 0,
            tipoDeEmisor: "",
            rol: 0,
            razonSocial: "",
            estado: "",
          });
        this.getView()
          .getModel("localModel")
          .setProperty("/editarGestionticket/selectListaRol", "0");
        this.getView()
          .getModel("localModel")
          .setProperty("/editarGestionticket/selectListaSociedad", "0");
      },
      onPressDeleteUser: function (oEvent) {
        const oButton = oEvent.getSource();
        const oView = this.getView();
        const oUser = oButton.getParent().getBindingContext("localModel");
        const oSelectObj = oUser.getObject();
        this.getView()
          .getModel("localModel")
          .setProperty("/editarGestionticket", { ...oSelectObj });
        const userList = this.getView()
          .getModel("localModel")
          .getProperty("/listaGestionticket");
        const updateList = [];
        const editarGestionticket = this.getView()
          .getModel("localModel")
          .getProperty("/editarGestionticket");
        MessageBox.confirm(
          `¿Está seguro de que desea eliminar este gestionticket?`,
          {
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.OK) {
                userList.forEach((element) => {
                  //1. Validator si en el caso el idde editarGestionticketo != element.id ahi debes pushear a la listaF

                  if (element.id != editarGestionticket.id) {
                    updateList.push({ ...element });
                  }
                  this.getView()
                    .getModel("localModel")
                    .setProperty("/listaGestionticket", updateList);
                });
                //Refrescar TODO lo que esta anidado a localModel
                this.getView().getModel("localModel").refresh(true);
                //const{listaGestionticket} =this.getView().getModel("localModel").getData()
              }
            }.bind(this),
          }
        );
      },
      // onPressDeleteUser: function (oEvent) {
      //     //
      //     let oButton = oEvent.getSource();
      //     let oView = this.getView();
      //     let oProduct = oButton.getParent().getBindingContext("localModel");
      //     let oSelectObj = oProduct.getObject();
      //     this.getView().getModel("localModel").setProperty("/editarGestionticket", { ...oSelectObj });
      //     let listaGestionticket = this.getView().getModel("localModel").getProperty("/listaGestionticket");
      //     let updateList = [];
      //     let editarGestionticket = this.getView().getModel("localModel").getProperty("/editarGestionticket");
      //     listaGestionticket.forEach(element => {
      //         //1. Validator si en el caso el idde editarGestionticketo != element.id ahi debes pushear a la listaF

      //         if (element.id != editarGestionticket.idProduct) {
      //             updateList.push({ ...element });
      //         }
      //         this.getView().getModel("localModel").setProperty("/listaGestionticket", updateList);
      //     });
      //     //Refrescar TODO lo que esta anidado a localModel
      //     this.getView().getModel("localModel").refresh(true);
      //     //const{listaGestionticket} =this.getView().getModel("localModel").getData()
      // },
      // VALIDACION NOMBRE Y APELLIDOS

      onInputChangeNombres: function (oEvent) {
        const oInput = oEvent.getSource();
        //;
        let sValue = oInput.getValue().trim();
        const regex = /^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑ\s'']+$/;
        let nuevoGestionticket = this.getView()
          .getModel("localModel")
          .getProperty("/gestionticket");
        if (!regex.test(sValue)) {
          /*
          oInput.setValueState('Error');
          sValue = sValue.replace(/[^\sa-zA-Z]/g, '');
          oInput.setValue(sValue);
          */
          nuevoGestionticket = {
            ...nuevoGestionticket,
            ...{ validNombres: false, valueStateNombres: "Error" },
          };
        } else {
          nuevoGestionticket = {
            ...nuevoGestionticket,
            ...{ validNombres: true, valueStateNombres: "Success" },
          };
        }
        this.getView()
          .getModel("localModel")
          .setProperty("/gestionticket", nuevoGestionticket);
      },

      onInputChangeApellidos: function (oEvent) {
        const oInput = oEvent.getSource();
        //;
        let sValue = oInput.getValue().trim();
        const regex = /^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑ\s'']+$/;
        let nuevoGestionticket = this.getView()
          .getModel("localModel")
          .getProperty("/gestionticket");
        if (!regex.test(sValue)) {
          nuevoGestionticket = {
            ...nuevoGestionticket,
            ...{ validApellidos: false, valueStateApellidos: "Error" },
          };
        } else {
          nuevoGestionticket = {
            ...nuevoGestionticket,
            ...{ validApellidos: true, valueStateApellidos: "Success" },
          };
        }
        this.getView()
          .getModel("localModel")
          .setProperty("/gestionticket", nuevoGestionticket);
      },

      onInputGestionticket: async function (oEvent) {
        let self = this;

        oEvent
          .getSource()
          .setValue(oEvent.getSource().getValue().toUpperCase());

        if (oEvent.getSource().getValue().length == 0) {
          self
            .getView()
            .getModel("localModel")
            .setProperty("/gestionticket/validGestionticket", false);

          self
            .getView()
            .getModel("localModel")
            .setProperty("/gestionticket/valueStateGestionticket", "Error");
        } else {
          self
            .getView()
            .getModel("localModel")
            .setProperty("/gestionticket/validGestionticket", true);

          self
            .getView()
            .getModel("localModel")
            .setProperty("/gestionticket/valueStateGestionticket", "Success");
        }
      },

      onInputIdentificacionFiscal: async function (oEvent) {
        //

        let self = this;
        let nuevoGestionticket = this.getView()
          .getModel("localModel")
          .getProperty("/gestionticket");
        const oInput = oEvent.getSource();
        let valido;
        //;
        let sValue = oInput.getValue().trim();
        const regex = /^((?!(10))[0-9]{11})$/;
        var that = this;

        if (this.isNumeric(sValue)) {
          if (this.rucValido(parseInt(sValue))) {
            // ⬅️ ⬅️ ⬅️ ⬅️ Acá se comprueba
            nuevoGestionticket = {
              ...nuevoGestionticket,
              ...{
                validGestionticket: true,
                valueStateGestionticket: "Success",
                ruc: sValue,
              },
            };

            try {
              let oParam = enviarDatos.procesoObtenerRazonSocialXRuc(sValue);
              let response = await service.servicePost(
                constantes.services.procesoObtenerRazonSocialXRuc,
                oParam,
                self
              );
              if (response.code) {
                if (response.results.obtenerRazonSocialXRuc.RETURN) {
                  const aEncontradoError =
                    response.results.obtenerRazonSocialXRuc.RETURN.filter(
                      function (item, index) {
                        return item.TYPE == "E";
                      }
                    );
                  if (aEncontradoError.length > 0) {
                    // this.getView().byId('personasRazon').setValue('');
                    this.getView()
                      .getModel("localModel")
                      .setProperty("/gestionticket/razonSocial", "");

                    util.utilPopUps.messageBox(
                      response.results.obtenerRazonSocialXRuc.RETURN[0].MESSAGE,
                      "A",
                      function () {}
                    );
                  } else {
                    self
                      .getView()
                      .getModel("localModel")
                      .setProperty(
                        "/gestionticket/razonSocial",
                        response.results.obtenerRazonSocialXRuc.DATOS[0]
                          .NAME_ORG1
                      );

                    self
                      .getView()
                      .getModel("localModel")
                      .setProperty("/gestionticket/validGestionticket", true);

                    self
                      .getView()
                      .getModel("localModel")
                      .setProperty(
                        "/gestionticket/valueStateGestionticket",
                        "Success"
                      );
                  }
                } else {
                  util.utilPopUps.messageBox(
                    "Ocurrió un error en el servicio.",
                    "E",
                    function () {}
                  );
                }
                // nuevoGestionticket.razonSocial =
                //   response.results.obtenerRazonSocialXRuc.DATOS[0].NAME_ORG1;

                console.log(response);
              } else {
                self
                  .getView()
                  .getModel("localModel")
                  .setProperty("/gestionticket/validGestionticket", false);

                self
                  .getView()
                  .getModel("localModel")
                  .setProperty("/gestionticket/valueStateGestionticket", "Error");

                util.utilHttp.validarRespuestaServicio(response);
              }
            } catch (error) {
              console.log(error);
            }

            //obtenerDatosSUNAT(sValue);
          } else {
            nuevoGestionticket = {
              ...nuevoGestionticket,
              ...{ validGestionticket: false, valueStateGestionticket: "Error" },
            };
            self
              .getView()
              .getModel("localModel")
              .setProperty("/gestionticket", nuevoGestionticket);
          }
        } else {
          self
            .getView()
            .getModel("localModel")
            .setProperty("/gestionticket/validGestionticket", false);

          self
            .getView()
            .getModel("localModel")
            .setProperty("/gestionticket/valueStateGestionticket", "Error");
        }

        /*if (!regex.test(sValue)) {
          nuevoGestionticket = {
            ...nuevoGestionticket,
            ...{ validGestionticket: false, valueStateGestionticket: 'Error' },
          };
        } else {
          nuevoGestionticket = {
            ...nuevoGestionticket,
            ...{ validGestionticket: true, valueStateGestionticket: 'Success' },
          };
        }*/
      },
      isNumeric: function (value) {
        return /^-?\d+$/.test(value);
      },

      rucValido: function (ruc) {
        const { sociedad } = this.getView()
          .getModel("localModel")
          .getProperty("/datosSociedad");
        const { rangeMaxLengthRUC } = this.getView()
          .getModel("localModel")
          .getData();
        if (sociedad === "PE") {
          //11 dígitos y empieza en 10,15,16,17 o 20
          if (
            !(
              (ruc >= 1e10 && ruc < 11e9) ||
              (ruc >= 15e9 && ruc < 18e9) ||
              (ruc >= 2e10 && ruc < 21e9)
            )
          )
            return false;
          return true;
        }
        const cantidad = ruc.toString().length;
        const aEncontrado = rangeMaxLengthRUC.filter(function (item) {
          return item === cantidad;
        });
        if (aEncontrado.length === 0) {
          return false;
        }
        return true;
      },

      onChangeSociedadAdd: function (oEvent) {
        //;
        let nuevoGestionticket = this.getView()
          .getModel("localModel")
          .getProperty("/gestionticket");
        const selectSociedad = this.getView()
          .getModel("localModel")
          .getProperty("/selectListaSociedad");
        if (selectSociedad == "0") {
          /*
          oInput.setValueState('Error');
          sValue = sValue.replace(/[^\sa-zA-Z]/g, '');
          oInput.setValue(sValue);
          */
          nuevoGestionticket = {
            ...nuevoGestionticket,
            ...{ validSociedad: false, valueStateSociedad: "Error" },
          };
        } else {
          nuevoGestionticket = {
            ...nuevoGestionticket,
            ...{ validSociedad: true, valueStateSociedad: "Success" },
          };
        }
        this.getView()
          .getModel("localModel")
          .setProperty("/gestionticket", nuevoGestionticket);
      },

      onEmailInput: function (oEvent) {
        const oInput = oEvent.getSource();
        const sValue = oInput.getValue();
        // var validEmail = /^[\wñÑ]+([\.-]?[\wñÑ]+)*@[\wñÑ]+([\.-]?[\wñÑ]+)*(\.[a-z]{2,})+$/;
        const validEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (validEmail.test(sValue)) {
          // oInput.setValueState("Success");
          this.getView()
            .getModel("localModel")
            .setProperty("/gestionticket/validCorreo", true);
          this.getView()
            .getModel("localModel")
            .setProperty("/gestionticket/valueStateCorreo", "Success");
        } else if (!validEmail.test(sValue)) {
          // oInput.setValueState("Error");
          this.getView()
            .getModel("localModel")
            .setProperty("/gestionticket/validCorreo", false);
          this.getView()
            .getModel("localModel")
            .setProperty("/gestionticket/valueStateCorreo", "Error");
        } else {
          // oInput.setValueState("None");
          this.getView()
            .getModel("localModel")
            .setProperty("/gestionticket/validCorreo", null);
          this.getView()
            .getModel("localModel")
            .setProperty("/gestionticket/valueStateCorreo", "None");
        }

        this.getView()
          .getModel("localModel")
          .setProperty("/gestionticket/gestionticket", "");
        this.getView()
          .getModel("localModel")
          .setProperty("/gestionticket/valueStateGestionticket", "None");
      },

      onNumberInput: function (oEvent) {
        const oInput = oEvent.getSource();
        const sValue = oInput.getValue();
        const edadPattern = /[^0-12]/;
        if (edadPattern.test(sValue)) {
          oInput.setValue(sValue.replace(/[^0-12]/g, ""));
        } else {
          oInput.setValueState("None");
        }
      },

      onConfigurarColumnas: function () {
        if (!this.oMPDialogConfigColumn) {
          this.oMPDialogConfigColumn = this.loadFragment({
            name: "app.gestionticket.view.fragment.selectColumns",
          });
        }
        this.oMPDialogConfigColumn.then(
          function (oDialogConfigurarColumna) {
            this.oDialogConfigColumn = oDialogConfigurarColumna;
            this.oDialogConfigColumn.open();
          }.bind(this)
        );
      },

      handleSelectionChange: function (oEvent) {
        let mcRol = this.getView().byId("mcRol");
        let flagProveedor = false;
        let flagContadorSistemas = false;

        var oMultiComboBox = oEvent.getSource();
        var aSelectedItems = oMultiComboBox.getSelectedItems();

        var aSelectedKeys = aSelectedItems.map(function (oItem) {
          return oItem.getKey();
        });

        //Validar que sea solo proveedor que es unico, o puede ser contador y sistemas
        if (aSelectedKeys.length == 0) {
          flagProveedor = false;
          flagContadorSistemas = false;
        } else if (
          oEvent.getParameter("changedItem").mProperties.key == "C001" &&
          aSelectedKeys.length == 1
        ) {
          flagProveedor = true;
          flagContadorSistemas = false;
        } else if (
          oEvent.getParameter("changedItem").mProperties.key != "C001" &&
          aSelectedKeys.length == 1
        ) {
          flagProveedor = false;
          flagContadorSistemas = true;
        } else if (
          oEvent.getParameter("changedItem").mProperties.key != "C001" &&
          aSelectedKeys.length > 1 &&
          !aSelectedKeys.includes("C001")
        ) {
          flagProveedor = false;
          flagContadorSistemas = true;
        } else if (
          oEvent.getParameter("changedItem").mProperties.key == "C001" &&
          (aSelectedKeys.includes("C002") || aSelectedKeys.includes("C003"))
        ) {
          //const index = aSelectedKeys.indexOf("C001");
          var myArray = mcRol.getSelectedKeys();
          const x = myArray.pop();
          mcRol.setSelectedKeys(myArray);
          sap.m.MessageToast.show(
            "Rol Proveedor es unico, no se puede seleccionar"
          );
          flagProveedor = false;
          flagContadorSistemas = true;
        } else if (
          oEvent.getParameter("changedItem").mProperties.key !== "C001" &&
          aSelectedKeys.includes("C001")
        ) {
          sap.m.MessageToast.show(
            "Rol Proveedor es unico, deseleccionar en caso se desee otro Rol"
          );
          mcRol.setSelectedKeys(["C001"]);

          flagProveedor = true;
          flagContadorSistemas = false;
        } else {
        }

        //if(aSelectedKeys == 'C003' || aSelectedKeys == 'C002' && aSelectedKeys!= 'C001'){
        if (flagContadorSistemas) {
          this.getView().byId("lbGestionticket").setVisible(true);
          this.getView().byId("inputGestionticket").setVisible(true);

          //} else if((aSelectedKeys == 'C003' && aSelectedKeys == 'C002') && aSelectedKeys!= 'C001'){

          //this.getView().byId("lbGestionticket").setVisible(true);
          //this.getView().byId("inputGestionticket").setVisible(true);

          //} else if(aSelectedKeys != 'C003' && aSelectedKeys != 'C002' && aSelectedKeys == 'C001'){
        } else if (flagProveedor) {
          this.getView().byId("lbIdentificacionFiscal").setVisible(true);
          this.getView().byId("inputIdentificacionFiscal").setVisible(true);
          this.getView().byId("lbRazonSocial").setVisible(true);
          this.getView().byId("inputRazonSocial").setVisible(true);
          this.getView().byId("lbTipoEmisor").setVisible(true);
          this.getView().byId("slTipoEmisor").setVisible(true);

          this.getView()
            .getModel("localModel")
            .setProperty("/gestionticket/gestionticket", "");
          this.getView()
            .getModel("localModel")
            .setProperty("/gestionticket/validGestionticket", null);
          this.getView()
            .getModel("localModel")
            .setProperty("/gestionticket/valueStateGestionticket", "None");

          this.getView()
            .getModel("localModel")
            .setProperty("/gestionticket/razonSocial", "");
          this.getView()
            .getModel("localModel")
            .setProperty("/gestionticket/validRazonSocial", null);

          this.getView()
            .getModel("localModel")
            .setProperty("/gestionticket/tipoDeEmisor", "");
          this.getView()
            .getModel("localModel")
            .setProperty("/gestionticket/selectTipoEmisor", "0");
        } else {
          this.getView().byId("inputGestionticket").setValue("");
          this.getView().byId("inputIdentificacionFiscal").setValue("");
          this.getView().byId("inputRazonSocial").setValue("");
          this.getView().byId("slTipoEmisor").setSelectedKey("0");

          this.getView().byId("lbIdentificacionFiscal").setVisible(false);
          this.getView().byId("inputIdentificacionFiscal").setVisible(false);
          this.getView().byId("lbGestionticket").setVisible(false);
          this.getView().byId("inputGestionticket").setVisible(false);
          this.getView().byId("lbRazonSocial").setVisible(false);
          this.getView().byId("inputRazonSocial").setVisible(false);
          this.getView().byId("lbTipoEmisor").setVisible(false);
          this.getView().byId("slTipoEmisor").setVisible(false);
        }
      },

      handleSelectionFinish: function (oEvent) {
        let nuevoGestionticket = this.getView()
          .getModel("localModel")
          .getProperty("/gestionticket");
        if (
          this.getView().getModel("localModel").getProperty("/gestionticket")
            .roles.length == 0
        ) {
          /*
          oInput.setValueState('Error');
          sValue = sValue.replace(/[^\sa-zA-Z]/g, '');
          oInput.setValue(sValue);
          */
          nuevoGestionticket = {
            ...nuevoGestionticket,
            ...{ validRoles: false, valueStateRoles: "Error" },
          };
        } else {
          nuevoGestionticket = {
            ...nuevoGestionticket,
            ...{ validRoles: true, valueStateRoles: "Success" },
          };
        }
        this.getView()
          .getModel("localModel")
          .setProperty("/gestionticket", nuevoGestionticket);
      },
      handleSelectionChangeEdit: function (oEvent) {
        let mcRol = this.getView().byId("mcRolEdit");
        let flagProveedor = false;
        let flagContadorSistemas = false;

        var oMultiComboBox = oEvent.getSource();
        var aSelectedItems = oMultiComboBox.getSelectedItems();

        var aSelectedKeys = aSelectedItems.map(function (oItem) {
          return oItem.getKey();
        });

        //Validar que sea solo proveedor que es unico, o puede ser contador y sistemas
        if (aSelectedKeys.length == 0) {
          flagProveedor = false;
          flagContadorSistemas = false;
        } else if (
          oEvent.getParameter("changedItem").mProperties.key == "C001" &&
          aSelectedKeys.length == 1
        ) {
          flagProveedor = true;
          flagContadorSistemas = false;
        } else if (
          oEvent.getParameter("changedItem").mProperties.key != "C001" &&
          aSelectedKeys.length == 1
        ) {
          flagProveedor = false;
          flagContadorSistemas = true;
        } else if (
          oEvent.getParameter("changedItem").mProperties.key != "C001" &&
          aSelectedKeys.length > 1 &&
          !aSelectedKeys.includes("C001")
        ) {
          flagProveedor = false;
          flagContadorSistemas = true;
        } else if (
          oEvent.getParameter("changedItem").mProperties.key == "C001" &&
          (aSelectedKeys.includes("C002") || aSelectedKeys.includes("C003"))
        ) {
          //const index = aSelectedKeys.indexOf("C001");
          var myArray = mcRol.getSelectedKeys();
          const x = myArray.pop();
          mcRol.setSelectedKeys(myArray);
          sap.m.MessageToast.show(
            "Rol Proveedor es unico, no se puede seleccionar"
          );
          flagProveedor = false;
          flagContadorSistemas = true;
        } else if (
          oEvent.getParameter("changedItem").mProperties.key !== "C001" &&
          aSelectedKeys.includes("C001")
        ) {
          sap.m.MessageToast.show(
            "Rol Proveedor es unico, deseleccionar en caso se desee otro Rol"
          );
          mcRol.setSelectedKeys(["C001"]);

          flagProveedor = true;
          flagContadorSistemas = false;
        } else {
        }

        //if(aSelectedKeys == 'C003' || aSelectedKeys == 'C002' && aSelectedKeys!= 'C001'){
        if (flagContadorSistemas) {
          this.getView().byId("lbGestionticketEdit").setVisible(true);
          this.getView().byId("inputGestionticketEdit").setVisible(true);

          //} else if((aSelectedKeys == 'C003' && aSelectedKeys == 'C002') && aSelectedKeys!= 'C001'){

          //this.getView().byId("lbGestionticket").setVisible(true);
          //this.getView().byId("inputGestionticket").setVisible(true);

          //} else if(aSelectedKeys != 'C003' && aSelectedKeys != 'C002' && aSelectedKeys == 'C001'){
        } else if (flagProveedor) {
          this.getView().byId("lbIdentificacionFiscalEdit").setVisible(true);
          this.getView().byId("inputIdentificacionFiscalEdit").setVisible(true);
          this.getView().byId("lbRazonSocialEdit").setVisible(true);
          this.getView().byId("inputRazonSocialEdit").setVisible(true);
          this.getView().byId("lbTipoEmisorEdit").setVisible(true);
          this.getView().byId("slTipoEmisorEdit").setVisible(true);
        } else {
          this.getView().byId("inputGestionticketEdit").setValue("");
          this.getView().byId("inputIdentificacionFiscalEdit").setValue("");
          this.getView().byId("inputRazonSocialEdit").setValue("");
          this.getView().byId("slTipoEmisorEdit").setSelectedKey("0");

          this.getView().byId("lbIdentificacionFiscalEdit").setVisible(false);
          this.getView()
            .byId("inputIdentificacionFiscalEdit")
            .setVisible(false);
          this.getView().byId("lbGestionticketEdit").setVisible(false);
          this.getView().byId("inputGestionticketEdit").setVisible(false);
          this.getView().byId("lbRazonSocialEdit").setVisible(false);
          this.getView().byId("inputRazonSocialEdit").setVisible(false);
          this.getView().byId("lbTipoEmisorEdit").setVisible(false);
          this.getView().byId("slTipoEmisorEdit").setVisible(false);
        }
      },

      handleSelectionFinishEdit: function (oEvent) {
        let nuevoGestionticket = this.getView()
          .getModel("localModel")
          .getProperty("/gestionticket");
        if (
          this.getView().getModel("localModel").getProperty("/gestionticket")
            .roles.length == 0
        ) {
          /*
          oInput.setValueState('Error');
          sValue = sValue.replace(/[^\sa-zA-Z]/g, '');
          oInput.setValue(sValue);
          */
          nuevoGestionticket = {
            ...nuevoGestionticket,
            ...{ validRoles: false, valueStateRoles: "Error" },
          };
        } else {
          nuevoGestionticket = {
            ...nuevoGestionticket,
            ...{ validRoles: true, valueStateRoles: "Success" },
          };
        }
        this.getView()
          .getModel("localModel")
          .setProperty("/gestionticket", nuevoGestionticket);
      },

      onAplicarConfiguracion: function () {
        const checkboxes = [
          { checkbox: "chkNombres", id: "idNombres" },
          { checkbox: "chkApellidos", id: "idApellidos" },
          { checkbox: "chkEmail", id: "idEmail" },
          //{ checkbox: 'chkSociedad', id: 'idSociedad' },
          { checkbox: "chkTipoEmisor", id: "idTipoEmisor" },
          { checkbox: "chkRUC", id: "idRUC" },
          { checkbox: "chkRazonSocial", id: "idRazonSocial" },
          { checkbox: "chkEstado", id: "idEstado" },
        ];

        checkboxes.forEach((item) => {
          const checkbox = this.getView().byId(item.checkbox);
          const control = this.getView().byId(item.id);
          control.setVisible(checkbox.getSelected());
        });

        this.onCloseConfigurarColumnas();
      },

      onResetConfiguracion: function () {
        const chkNombres = this.getView().byId("chkNombres");
        const chkApellidos = this.getView().byId("chkApellidos");
        const chkEmail = this.getView().byId("chkEmail");
        //const chkSociedad = this.getView().byId('chkSociedad');
        const chkTipoEmisor = this.getView().byId("chkTipoEmisor");
        const chkRUC = this.getView().byId("chkRUC");
        const chkRazonSocial = this.getView().byId("chkRazonSocial");
        const chkEstado = this.getView().byId("chkEstado");

        chkNombres.setSelected(true);
        chkEmail.setSelected(true);
        chkApellidos.setSelected(true);
        //chkSociedad.setSelected(true);
        chkTipoEmisor.setSelected(true);
        chkRUC.setSelected(true);
        chkRazonSocial.setSelected(true);
        chkEstado.setSelected(true);
      },

      onChangeRUCAdd: function (oEvent) {
        let text = oEvent.getSource().getSelectedItem().getProperty("text");
        this.getView()
          .getModel("localModel")
          .setProperty("/gestionticket/rol", text);
        let hola = this.getView()
          .getModel("localModel")
          .getProperty("/gestionticket/rol");
        console.log(hola);
      },
      // cleanFieldsAddUser: function () {
      //   this.getView().getModel("localModel").setProperty("/gestionticket", {
      //     id: null,
      //     nombres: "",
      //     validNombres: null,
      //     valueStateNombres: "None",
      //     apellidos: "",
      //     correo: "",
      //     sociedad: 0,
      //     tipoDeEmisor: "",
      //     gestionticket: "",
      //     validGestionticket: null,
      //     valueStateGestionticket: "None",
      //     razonSocial: "",
      //     validRazonSocial: null,
      //     estado: "",
      //     roles: [],
      //     validRoles: null,
      //     valueStateRoles: "None",
      //     validSociedad: null,
      //     valueStateSociedad: "None",
      //     selectTipoEmisor: "0",
      //   });
      //   this.getView()
      //     .getModel("localModel")
      //     .setProperty("/gestionticket/selectlistaRol", "0");
      //   this.getView()
      //     .getModel("localModel")
      //     .setProperty("/gestionticket/selectListaSociedad", "0");
      //   // this.getView().byId("lbIdentificacionFiscal").setVisible(false);
      //   // this.getView().byId("inputIdentificacionFiscal").setVisible(false);
      //   // this.getView().byId("lbGestionticket").setVisible(false);
      //   // this.getView().byId("inputGestionticket").setVisible(false);
      //   // this.getView().byId("lbRazonSocial").setVisible(false);
      //   // this.getView().byId("inputRazonSocial").setVisible(false);
      //   // this.getView().byId("lbTipoEmisor").setVisible(false);
      //   // this.getView().byId("slTipoEmisor").setVisible(false);
      // },
      onAddUser_Reject: function (oEvent) {
        this.cleanFieldsAddUser();
        this.oDialogAddUser.close();
      },
      onShowRoles: async function (oEvent) {
        this.getView()
          .getModel("localModel")
          .setProperty("/aRolesXGestionticket", []);
        this.getView()
          .getModel("localModel")
          .setProperty("/gestionticket/roles", []);
        const oButtonRoles = oEvent.getSource();
        const oRoles = oButtonRoles.getParent().getBindingContext("localModel");
        const oSelectObj = oRoles.getObject();
        this.getView()
          .getModel("localModel")
          .setProperty("/selectedRowRol", oSelectObj);
        if (!this.oPopoverRoles) {
          this.oPopoverRoles = this.loadFragment({
            name: "app.gestionticket.view.fragment.PopoverRoles",
          });
        }
        await this.onShowRolesXGestionticket(oSelectObj.idGestionticket);
        this.oPopoverRoles.then(
          function (oPop) {
            this.pPopover = oPop;
            oPop.openBy(oButtonRoles);
          }.bind(this)
        );
      },
      onShowRolesXGestionticket: async function (idGestionticket) {
        let self = this;
        try {
          const oParam = enviarDatos.obtenerRolesXGestionticket(idGestionticket);
          let response = await service.serviceGet(
            constantes.services.procesoObtenerGestionticketRolXGestionticket,
            oParam,
            self
          );
          if (response.code) {
            const roles = response.results.roles;
            console.log(roles);
            const listarRolesXGestionticket =
              recibirDatos.obtenerRolesXGestionticket(roles);
            const listarKeysRolesXGestionticket =
              recibirDatos.obtenerKeysRolesXGestionticket(roles);
            self
              .getView()
              .getModel("localModel")
              .setProperty("/aRolesXGestionticket", listarRolesXGestionticket);
            self
              .getView()
              .getModel("localModel")
              .setProperty("/gestionticket/roles", listarKeysRolesXGestionticket);
            console.log("Primero");
          } else {
            util.utilHttp.validarRespuestaServicio(response);
          }
        } catch (error) {}
      },
    });
  }
);
