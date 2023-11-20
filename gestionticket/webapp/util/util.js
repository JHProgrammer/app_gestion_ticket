sap.ui.define(
  ['./utilUI', './utilController', './utilPopUps', './utilHttp', './utilResponse'],
  function (utilUI, utilController, utilPopUps, utilHttp, utilResponse) {
    'use strict';
    return {
      utilUI: utilUI,
      utilController: utilController,
      utilPopUps: utilPopUps,
      utilHttp: utilHttp,
      utilResponse: utilResponse,
    };
  }
);
