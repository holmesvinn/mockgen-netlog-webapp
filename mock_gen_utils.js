
const { getInterceptorTemplate } = require('./mock_template');
const fs = require('fs');
/**
 * file creation based on variables
 */
function createMockFromSwitchCases(
  switchCasesJS,
  switchCasesTS,
  priorityEntries,
  outpath
) {
  switchCasesJS += `}; return false;`;
  switchCasesTS += `
  };`;
  const mockResponses = `const mockResponses = ${JSON.stringify(
    priorityEntries
  )};`;
  const mockRequests = `const mockRequests = (req,res)=>{${switchCasesJS}};`;
  const mockJS = `${mockResponses} ${mockRequests} module.exports=mockRequests`;
  fs.writeFile(`${outpath}\\mock_middleware.js`, mockJS, (err) => {
    if (err)
      console.error(
        'Please ensure the outdir is correct, If error still persists try giving path without \\  at end'
      );
    else console.log('success fully generated mock middleware for node js');
  });
  fs.writeFile(
    `${outpath}\\mockData.json`,
    JSON.stringify(priorityEntries),
    (err) => {
      if (err)
        console.error(
          'Please ensure the outdir is correct, If error still persists try giving path without \\  at end'
        );
      else console.log('success fully mock json data');
    }
  );
  const interceptorTemplate = getInterceptorTemplate(switchCasesTS);
  fs.writeFile(`${outpath}\\MockInterceptor.ts`, interceptorTemplate, (err) => {
    if (err)
      console.error(
        'Please ensure the outdir is correct, If error still persists try giving path without \\  at end'
      );
    else console.log('success fully generated mock Interceptor for angular');
  });
}
module.exports = { createMockFromSwitchCases };
