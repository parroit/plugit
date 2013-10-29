var mkdirp = require('mkdirp');
var fs = require("fs");
var path = require("path");
var npm = require("npm");
var _ = require("lodash");

function createEmptyNodeProject(dir,done){
    function copyIndex(){
        var moduleTemplate = path.join(__dirname, "../template/index.js");
        var indexJs = path.join(dir, "index.js");
        var dest = fs.createWriteStream(indexJs);
        dest.on('finish',function(){


            var pt = path.resolve(dir , "index.js");
            var pluginsRoot = require(pt);
            done(pluginsRoot);
        });
        fs.createReadStream(moduleTemplate).pipe(dest);
    }
    function copyPackage(){
        var moduleTemplate = path.join(__dirname, "../template/package.json");
        var packageJson = path.join(dir, "package.json");
        var dest = fs.createWriteStream(packageJson);
        dest.on('finish',copyIndex);
        fs.createReadStream(moduleTemplate).pipe(dest);
    }

    copyPackage();


}

module.exports = {
    init: function(host,pluginsDir,done){
        this.host=host;
        this.pluginsDir = pluginsDir;
        var self = this;
        this.plugins={};
        fs.exists(pluginsDir,function(exists){
            if (!exists) {
                mkdirp(pluginsDir, function (err) {
                    if (err) throw err;

                    createEmptyNodeProject(pluginsDir,function(pluginsRoot){
                        self.pluginsRoot=pluginsRoot;
                        pluginsRoot.init(host);
                        done();
                    });

                });
            } else {
                done();
            }

        });


    },
    install: function(pluginNames,done){
        var cwd = process.cwd();
        process.chdir(this.pluginsDir);
        npm.load({save:true}, function (err) {
            if (err) {
                process.chdir(cwd);
                throw err;
            }
            npm.commands.install(pluginNames, function (err, data) {
                process.chdir(cwd);
                if (err) throw err;

                done();
            });

        })
    },
    list: function(done){
        var readJson = require('read-package-json');
        readJson.cache.reset();
        readJson(path.join(this.pluginsDir,"package.json"), console.error, false, function (err, data) {
            if (err) throw err;
            done(_.keys(data.dependencies));

        });
    },
    remove: function(pluginName,done){
        var cwd = process.cwd();
        process.chdir(this.pluginsDir);
        npm.load({}, function (err) {
            if (err) {
                process.chdir(cwd);
                throw err;
            }
            npm.commands.remove([pluginName], function (err, data) {
                process.chdir(cwd);
                if (err) throw err;

                done();
            });

        })
    },
    loadAll: function(done){
        var self = this;
        this.list(function(plugins){

            plugins.forEach(function(plugin){
                self.plugins[plugin] = self.pluginsRoot.load(plugin);
            });
            done();
        });

    }
};