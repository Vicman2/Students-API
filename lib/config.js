// Configuring our application 

var enviro = {};

enviro.staging = {
    "port": 7000,
    "envName": "staging"
};

enviro.production = {
    "port" : 9000,
    "envName": "production"
}

var currentEnviro = typeof(process.env.NODE_ENV) == 'string'?
 process.env.NODE_ENV.toLowerCase():"";

 var environmentToExport = typeof(enviro[currentEnviro]) == 'object'?
 enviro[currentEnviro]: enviro.staging;
 module.exports = environmentToExport;