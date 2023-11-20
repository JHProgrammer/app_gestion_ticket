sap.ui.define(
  ["../constantes", "../util/utilHttp", "../util/utilResponse"],
  function (constantes, utilHttp, utilResponse) {
    return {
      servicePost: async function (url, oParam, context) {
        return await utilHttp.httpPost(url, oParam, context);
      },
      servicePut: async function (url, oParam, context) {
        return await utilHttp.httpPut(
          url.replace("{0}", oParam.iId),
          oParam,
          context
        );
      },
      serviceDelete: async function (url, oParam, context) {
        return await utilHttp.httpDelete(url, oParam, context);
      },
      serviceGet: async function (url, oParam, context) {
        let modUrl = oParam.length > 0 ? url + "?" + oParam[0] : url;
        return await utilHttp.httpGet(modUrl, context);
      },
      serviceGetSeguridad: async function (url, oParam, context) {
        let modUrl = oParam.length > 0 ? url + "?" + oParam[0] : url;
        return await utilHttp.httpGetSeguridad(modUrl, context);
      },
      serviceGetOdata: async function (url, oParam, context) {
        let modUrl = oParam.length > 0 ? url + "?$filter=" + oParam[0] : url;
        return await utilHttp.httpGet(modUrl, context);
      },
    };
  }
);
