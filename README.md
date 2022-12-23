# Mockgenerator for you webapp in oneshot - For Rapid Local development

<br>

## **Problem**:
>  Consider having a webapp running in Local, whenever you make a change, you need to refresh the browser manually or your webpack might do it, but everytime the api calls made by the browser is going to take some time, Its annoying to see the spinner loading 

<br>

## **Solution**:
> We can mock all the api calls made by the browser either in component layer, Service layer or through Interceptor. But All three are tedious, since we need to generate mock for each api manually and update the code 

<br>

## **What does the tool do**:
> This tool uses network log har file from the browser and user's input configuration to generate a series or switch cases, each case being an api mock.

<br>

## **How to use the tool**:

 1. create a config.json with below template

 1.  ``{
    "localHost": "https://localhost:4200",
    "harPaths": ["./networklog.har"],
    "resourceTypes": ["xhr"],
    "priorities": ["High"],
    "neglectSubstring": [
      "/collect?",
      "recording?",
      "b2c",
      "cwslogin",
      "maps",
      ".json",
      "track",
      ".js",
      ".css"
    ],
    "origin": "https://localhost:4200",
    "postDataUrlKey": "handlerURL"
  } 
  `` 

 1.  __localhost__ -  url of localhost with port number (ex: https://localhost:4200)

 1. __harPaths__ - Array list of har cascade files downloaded from browser network log

 1. __resourceTypes__ - type of resources inside your network log for which we need to generate mock. (ex: ['xhr', 'script'])

 1. __neglectSubstring__ - Array list of strings - if the any of the given string is part of the url, it will be omitted inside the switch case, This is added to remove the analytics or tracking related urls.

 1. __origin__ - Host from which the network log is downloaded, (for example: if you download the har file from google.com's network tab, then origin is https://google.com)

 1. __postDataUrlKey__ - if you're using WAF policies in your webapp, then you might send get calls as post call, while mentioning the actual url in post data with a key. 

 <br>

# Installation
> ``npm install -g mockgen-netlog-webapp``

<br>

 # Command
 > ``mockgen --config="YOUR CONFIG JSON FILE PATH" --out="YOUR OUTPUT FOLDER"``

 <br>

 # How to use generated mock

 1. say, mock is generated as __**mock.js**__

 1. place the **__mock.js__** in the same folder as your node server

 1. now import the mock.js in to you node server 

 1. > `` const mock = require('./mock.js');``

 1. Add this line into your common middleware, where all your apis has will be bypassed

1. >  ``if(mock(req,res)) return;``

<br>

> **Note: From express, req and res can be sent to custom middleware having req and res access, this mock to be hooked before calling next()**

