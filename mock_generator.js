#!/usr/bin/env node

const fs = require('fs');
const {
  InitSwitchCaseJSAndTS,
  singleCaseJS,
  singleCaseTS,
} = require('./mock_template');
const { createMockFromSwitchCases } = require('./mock_gen_utils');
try {
  const args = process.argv.splice(2);
  let configPath = '';
  let outDir = './';

  args.forEach((item) => {
    switch (item.split('=')[0]) {
      case '--config':
      case '-c':
        configPath = item.split('=')[1];
        break;
      case '--out':
      case '-o':
      case '--outdir':
        outDir = item.split('=')[1];
    }
  });
  
  if(!configPath){
    console.log("configuration file is required for preceeding")
    console.log("use the following command: mockgen --config='YOUR_CONFIG_JSON_FILE_PATH'")
    console.log("For More Info checkout -> https://www.npmjs.com/package/mockgen-netlog-webapp")
    return
  }
  console.log('outdirectory: ', outDir);
  console.log('configPath: ', configPath);

  try {
    config = JSON.parse(fs.readFileSync(configPath)); //reading the configuration file
  } catch (err) {
    console.log('error Reading config file path');
    console.log('generating with default config');
  }
  const localhost = config.localHost; // to split the full url to get the endpoint for switch cases
  const harPaths = config.harPaths; // list of har cascades
  const postDataURlKey = config.postDataUrlKey; // list of substrings to which url must match to be present in the switch case
  const resourceTypes = config.resourceTypes || ['xhr'];
  const priorities = config.priorities || ['High'];
  const neglectSubstring = config.neglectSubstring;
  const origin = config.origin;
  const priorityEntries = {};
  if (!localhost || !harPaths?.length)
    throw new Error('Localhost url and Har Paths are necessary');
  // javsctipt and typescript switchcases for node js middleware
  let switchCasesJS = InitSwitchCaseJSAndTS(postDataURlKey, false, localhost);
  let switchCasesTS = InitSwitchCaseJSAndTS(postDataURlKey, true, localhost);
  harPaths.forEach((harPath) => {
    const fileData = fs.readFileSync(harPath, { encoding: 'utf-8' });
    const fileDataAsJSON = JSON.parse(fileData);
    const entries = fileDataAsJSON.log.entries;
    entries.forEach((entry) => {
      const request = entry.request;
      const response = entry.response;
      const host = origin ? origin : new URL(request.url).origin;
      const url = request.url.split(host)[1]; // request url
      if (
        !url ||
        neglectSubstring.filter((item) => url.indexOf(item) > -1).length != 0
      )
        return;
      const status = response.status;
      const method = request.method;
      const statusText = response.statusText;
      const content = response.content;
      let payload = '';
      try {
        if (request?.postData?.text) {
          let handlerURL = postDataURlKey
            ? JSON.parse(request.postData.text)?.[postDataURlKey]
            : null;
          let postbody = JSON.parse(request.postData.text)?.payload;
          let paramss = JSON.parse(request.postData.text)?.params;
          if (typeof handlerURL === 'object')
            handlerURL = JSON.stringify(handlerURL);
          if (typeof postbody === 'object') postbody = JSON.stringify(postbody);
          if (typeof paramss === 'object') paramss = JSON.stringify(paramss);
          payload =
            (handlerURL && handlerURL != 'undefined' ? handlerURL + '-' : '') +
            (postbody && postbody != 'undefined' ? postbody + '-' : '') +
            (paramss && paramss != undefined ? paramss + '-' : '');
        }
      } catch (err) {
        console.log('error in parsing a post payload');
      }
      const isXHRAndHighPriority =
        resourceTypes.includes(entry._resourceType) &&
        priorities.includes(entry._priority);
      if (url && isXHRAndHighPriority && content.text) {
        console.log('payload', payload);
        const path = `[${method}]${url}${
          payload != 'undefined' && payload ? payload : ''
        }`;
        console.log(path);
        priorityEntries[path] = {
          method: method,
          url: url,
          status: status,
          statusText: statusText,
          payload: content,
        };
        switchCasesJS += singleCaseJS(path, url);
        switchCasesTS += singleCaseTS(path);
      }
    });
  });
  createMockFromSwitchCases(
    switchCasesJS,
    switchCasesTS,
    priorityEntries,
    outDir
  );
} catch (e) {
  console.error(e);
}
