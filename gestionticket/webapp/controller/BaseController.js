sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "../util/util",
    "../service/service",
    "app/gestionticket/model/formatter",
    "../constantes",
    "../estructuras/enviarDatos",
    "../estructuras/recibirDatos",
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
  ],
  function (
    Controller,
    util,
    service,
    formatter,
    constantes,
    enviarDatos,
    recibirDatos,
    UIComponent,
    MessageBox
  ) {
    "use strict";

    return Controller.extend("app.gestionticket.controller.BaseController", {
      formatter: formatter,
      getRouter: function () {
        return UIComponent.getRouterFor(this);
      },
      callApis: async function () {
        await this.cargaDataMaestra();

        debugger;
      },

      cargaDataMaestra: async function () {
        let promises = [];
        promises.push(this.obtenerRoles());
        promises.push(this.obtenerPEP());
        promises.push(this.obtenerConsultores());

        const finalAnswer = await Promise.all(promises);
        let bValid = true;
        for (let index = 0; index < finalAnswer.length; index++) {
          const element = finalAnswer[index];
          if (element) {
            if (element.code) {
              if (element.code != 1) {
                bValid = false;
                break;
              }
            } else {
              bValid = false;
              break;
            }
          } else {
            bValid = false;
            break;
          }
        }
        if (!bValid) {
          util.utilPopUps.messageBox(
            "No se cargaron correctamente la maestras.",
            "E",
            function () {}
          );
          return;
        } else {
          debugger;
          await this.obtenerGestionticketXFiltro();
        }
        debugger;
      },

      obtenerRoles: async function () {
        let self = this;
        let response = await service.serviceGet(
          constantes.services.obtenerRoles,
          {},
          self
        );
        if (response.code == 1) {
          debugger;
          let listaRol = [];
          const { listaRoles } = response.results;
          const listaRolesMapping = recibirDatos.obtenerRoles(listaRoles);

          self
            .getView()
            .getModel("localModel")
            .setProperty("/listaRoles", listaRolesMapping);
        } else {
          util.utilHttp.validarRespuestaServicio(response);
        }
        return response;
      },
      obtenerPEP: async function () {
        let self = this;
        let response = await service.serviceGet(
          constantes.services.obtenerPeps,
          {},
          self
        );
        if (response.code == 1) {
          debugger;

          const { listaPeps } = response.results;
          const listaPepsMapping = recibirDatos.obtenerPep(listaPeps);

          const listaPepsSelMapping = recibirDatos.obtenerPepSel(listaPeps);

          self
            .getView()
            .getModel("localModel")
            .setProperty("/listaPeps", listaPepsMapping);

          self
            .getView()
            .getModel("localModel")
            .setProperty("/listaPepsSel", listaPepsSelMapping);
        } else {
          util.utilHttp.validarRespuestaServicio(response);
        }
        return response;
      },
      obtenerConsultores: async function () {
        let self = this;
        let response = await service.serviceGet(
          constantes.services.obtenerConsultores,
          {},
          self
        );
        if (response.code == 1) {
          debugger;

          const { listaConsultores } = response.results;
          const listaConsultoresMapping =
            recibirDatos.obtenerPep(listaConsultores);

          const listaConsultoresSelMapping =
            recibirDatos.obtenerConsultoresSel(listaConsultores);

          self
            .getView()
            .getModel("localModel")
            .setProperty("/listaConsultores", listaConsultoresMapping);
          debugger;
          self
            .getView()
            .getModel("localModel")
            .setProperty("/listaConsultoresSel", listaConsultoresSelMapping);
        } else {
          util.utilHttp.validarRespuestaServicio(response);
        }
        return response;
      },
      onLimpiarFiltros: async function (oEvent) {
        this.getView().getModel("localModel").setProperty("/filtroRoles", []);
        this.getView()
          .getModel("localModel")
          .setProperty("/filtroConsultores", []);
        this.getView().getModel("localModel").setProperty("/filtroPeps", []);
        await this.obtenerGestionticketXFiltro({});
      },
      obtenerGestionticketXFiltro: async function (oParam) {
        debugger;
        let self = this;
        let response = await service.servicePost(
          constantes.services.obtenerGestionticketXFiltro,
          oParam ?? {},
          self
        );
        if (response.code == 1) {
          debugger;

          let { gestionticket } = response.results;

          gestionticket.startDate = new Date(gestionticket.startDate);

          if (gestionticket.people.length == 0) {
            util.utilPopUps.messageBox(
              "No se encontró información.",
              "A",
              function () {}
            );
          } else {
            for (let index = 0; index < gestionticket.people.length; index++) {
              let element = gestionticket.people[index];
              for (
                let index2 = 0;
                index2 < element.appointments.length;
                index2++
              ) {
                const element2 = element.appointments[index2];
                element2.start = new Date(element2.start);
                element2.end = new Date(element2.end);
              }
            }
          }

          debugger;
          self
            .getView()
            .getModel("localModel")
            .setProperty("/gestionticket", gestionticket);
        } else {
          util.utilHttp.validarRespuestaServicio(response);
        }
        return response;
      },

      registrarAsignacion: async function (oParam) {
        let self = this;
        let response = await service.servicePost(
          constantes.services.registrarAsignacion,
          oParam,
          self
        );
        if (response.code == 1) {
          debugger;
          util.utilHttp.validarRespuestaServicio(
            response,
            "Se ha creado correctamente la asignación."
          );
          await self.onSearch();
        } else {
          util.utilHttp.validarRespuestaServicio(response);
        }
        return response;
      },

      eliminarAsignacion: async function (oParam) {
        let self = this;
        let response = await service.servicePost(
          constantes.services.eliminarAsignacion,
          oParam,
          self
        );
        if (response.code == 1) {
          debugger;
          util.utilHttp.validarRespuestaServicio(
            response,
            "Se ha eliminado correctamente la asignación."
          );
          debugger;
          self
            .getView()
            .getModel("localModel")
            .getProperty("/oAppointmentRow")
            .setSelected(false);
          await self.onSearch();
        } else {
          util.utilHttp.validarRespuestaServicio(response);
        }
        return response;
      },
    });
  }
);
