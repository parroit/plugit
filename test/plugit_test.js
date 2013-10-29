'use strict';

var plugit = require('../lib/plugit');
var fs = require("fs");
var path = require("path");


var expect = require('chai').expect;
var rmdir = require('rmdir');
var _ = require('lodash');
require('chai').should();


describe('plugit', function () {
    describe("module", function () {
        it("should load", function () {
            expect(plugit).to.be.a('object');
        });
    });
    var testDirRoot = "test/dirs/";
    var testDir = "test/dirs/test-plugins-dir";
    describe("init", function () {

        var host = {};

        before(function (done) {
            function init(){
                plugit.init(host,testDir,done);
            }
            fs.exists(testDirRoot, function (exists) {
                if (exists) {
                    rmdir(testDirRoot, function (err) {
                        if (err) throw err;
                        init();
                    })
                } else {
                    init();
                }
            });
        });

        it("should create an empty npm project if doesn't exists", function (done) {

            fs.exists(testDir, function (result) {
                expect(result).to.be.true;
                done();
            });

        });

        it("should save plugins dir", function () {


            expect(plugit.pluginsDir).to.be.equal(testDir);

        });

        it("should create a package json file", function (done) {

            fs.exists(path.join(testDir,"package.json"), function (result) {
                expect(result).to.be.true;
                done();
            });

        });

        it("should create an index.js file", function (done) {

            fs.exists(path.join(testDir,"index.js"), function (result) {
                expect(result).to.be.true;
                done();
            });

        });


        it("should succeed if npm project plugins already exists", function (done) {

            plugit.init(host,testDir,done);

        });
    });

    describe("install", function () {

        var cwd = process.cwd();
        before(function (done) {
            plugit.install(path.join(process.cwd(),"test/mkdirp"),done);
        });

        it("should install module under plugins directory", function (done) {

            fs.exists(path.join(testDir,"node_modules/mkdirp"), function (result) {
                expect(result).to.be.true;
                done();
            });

        });

        it("should restore cwd", function () {


             expect(process.cwd()).to.be.equal(cwd);

        });
    });

    describe("list", function () {
        var plugins;
        before(function (done) {

            plugit.list(function(results){
                plugins=results;
                done()
            });
        });

        it("should list all installed plugins", function () {

            expect(plugins.length).to.be.equal(1);


        });

        it("should list plugins by name", function () {

            expect(plugins[0]).to.be.equal("mkdirp");


        });
    });

    describe("remove", function () {

        var cwd = process.cwd();

        before(function (done) {

            plugit.remove("mkdirp",function(){
                done();

            });
        });

        it("should remove plugin from list", function (done) {

                plugit.list(function(results){
                    expect(results.length).to.be.equal(0);
                    done()
                });




        });

        it("should remove plugin directory", function (done) {

            fs.exists(path.join(testDir,"node_modules/mkdirp"), function (result) {
                expect(result).to.be.false;
                done();
            });

        });

        it("should restore cwd", function () {


            expect(process.cwd()).to.be.equal(cwd);

        });
    });
});