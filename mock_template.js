const getInterceptorTemplate = (switchCasesTS) => {
    return `
    import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
    import { Observable, of } from 'rxjs';
    import * as mockData from './mockData.json';
    export class MockInterceptor implements HttpInterceptor {
      mockResponses = mockData;
        
        intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
          let result = null
            ${switchCasesTS}
            if(result){
             return result
            } else {
              return next.handle(req)
            }
        }
    }`;
  };
  const InitSwitchCaseJSAndTS = (key, interceptor, localhost) => {
    return `
    let payload = '';
        try {
      if (req?.body) {
        let handlerURL = req.body?.${key};
        let postbody = req.body?.payload;
        let paramss = req.body?.params;
        if (typeof handlerURL === 'object') handlerURL = JSON.stringify(handlerURL);
        if (typeof postbody === 'object') postbody = JSON.stringify(postbody);
        if (typeof paramss === 'object') paramss = JSON.stringify(paramss);
        payload =
          (handlerURL && handlerURL != 'undefined' ? handlerURL + '-' : '') +
          (postbody && postbody != 'undefined' ? postbody + '-' : '') +
          (paramss && paramss != undefined ? paramss + '-' : '');
      }
    } catch (err) {
      console.log("error parsing payload");
    }
    ${
      interceptor
        ? `switch('['+req.method+']'+ (req.urlWithParams.indexOf('localhost') > -1 ? req.urlWithParams.split('${localhost}')[1] : req.urlWithParams) +
        (payload != 'undefined' && payload ? payload : '') ) {`
        : `switch('['+req.method+']'+ req.url +   (payload != 'undefined' && payload
              ? payload
              : '')) {`
    }
    `;
  };
  const InitSwitchCaseTS = (localhost) => {
    return ``;
  };
  const singleCaseJS = (path, url) => {
    return `case '${path}':{const mock = mockResponses['${path}']; res.status(mock.status).send(mock.payload.text); res.end(); console.log("served from mock for '${url}'"); return true; };`;
  };
  const singleCaseTS = (path) => {
    return `
      case '${path}':{
          console.log("served from mock - ", req.urlWithParams);
          result = of(new HttpResponse({ status: this.mockResponses['${path}'].status,  body: this.mockResponses['${path}'].payload.mimeType == "application/json" ? JSON.parse(this.mockResponses['${path}'].payload.text) : this.mockResponses['${path}'].payload.text }));
          break;
      };
      `;
  };
  module.exports = {
    getInterceptorTemplate,
    InitSwitchCaseJSAndTS,
    singleCaseJS,
    singleCaseTS,
  };
  