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
    var testDir = "./test/dirs/plugit";
    var host = {
        blah:"blah",
        results:[]
    };
    describe("init", function () {



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
        it("should load plugins root module", function () {

            expect(plugit.pluginsRoot.load).to.be.a('function');

        });
        it("should save host reference", function () {

            expect(plugit.host.blah).to.be.blah;

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
            var plugins = [
                path.join(process.cwd(), "test/mkdirp"),
                path.join(process.cwd(), "test/test-plugins/aa"),
                path.join(process.cwd(), "test/test-plugins/bb")
                ];
            plugit.install(plugins,done);
        });

        it("should install modules under plugins directory", function (done) {

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

            expect(plugins.length).to.be.equal(3);



        });

        it("should list plugins by name", function () {

            expect(plugins.indexOf("mkdirp")).to.be.greaterThan(-1);
            expect(plugins.indexOf("aa")).to.be.greaterThan(-1);
            expect(plugins.indexOf("bb")).to.be.greaterThan(-1);


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
                    expect(results.length).to.be.equal(2);
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

    describe("loadAll", function () {
        before(function (done) {

            plugit.loadAll(function(){
                done();

            });
        });

        it("should load every plugin", function () {

            expect(_.keys(plugit.plugins).length).to.be.equal(2);


        });

        it("should save plugin modules", function () {

            expect(plugit.plugins.aa).to.be.equal("exports aa");
            expect(plugit.plugins.bb).to.be.equal("exports bb");


        });

        it("plugins modules executed", function () {

            expect(host.results.length).to.be.equal(2);



        });

        it("plugins could depend one each other", function () {

            expect(host.results[0]).to.be.equal("aa here");
            expect(host.results[1]).to.be.equal("bb here");



        });
    });
});