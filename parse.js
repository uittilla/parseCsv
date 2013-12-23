"use strict";

/**
 * Author Mark Ibbotson
 */

var Url, Fs, Parser;

Url = require('url');
Fs  = require('fs');

/**
 *
 * Take a long list of links and reduce it to a maximim of 20 links per domain
 *
 * @type {{links: {}, init: Function, open: Function, parse: Function}}
 */
Parser = {
    /**
     *
     */
    links: {},
    filename: null,
    /**
     *
     * @returns {*}
     */
    init: function(filename) {
        this.filename = filename;
        return this;
    },
    /**
     *
     * @param filename
     */
    open: function () {
        var self = this;

        Fs.readFile(this.filename, 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }

            self.parse(data);
        });
    },
    /**
     *
     * @param data
     */
    parse: function (data) {
        var links = data.split('\n');
        var self  = this;
        var url;

        links.forEach(function(link) {
            url = Url.parse(link);
            if(!self.links.hasOwnProperty(url.hostname)) {
                //console.log(url.hostname);
                self.links[url.hostname] = [];
            };

        });

        console.log("Done, making keys ...");
        var keys = Object.keys(self.links);

        console.log("Keys Done, making lists");
        links.forEach(function(link) {
            url = Url.parse(link);
            if(self.links.hasOwnProperty(url.hostname)) {
                self.links[url.hostname].push(link);
            };
        });

        console.log("Lists done");

        this.reduce();
    },

    /**
     *
     */
    reduce: function() {
        var self = this;

        Object.keys(self.links).forEach(function(key){
            if(self.links[key].length > 50) {
                self.links[key] = self.links[key].splice(0, 50)
            }
        });

        this.save();
    },

    /**
     *
     */
    save: function() {
        var keys = Object.keys(this.links);

        var links = [];
        var stream = Fs.createWriteStream(this.filename + "_parsed.csv");

        var self = this;

        stream.once('open', function(fd) {

            keys.forEach(function(key){
                links = links.concat(self.links[key]);
            });

            links = self.shuffle(links);

            links.forEach(function(link) {
               stream.write(link + "\n");
            });

            stream.end();
        });

    },

    shuffle: function(array) {
        var m = array.length, t, i;

        // While there remain elements to shuffle…
        while (m) {

            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }

        return array;
    }
}

<<<<<<< HEAD
var parser = Parser.init(process.argv[2]);
=======
if(process.argv.length < 3) {
   console.log("Usage: node parse.js <input.csv>");
   process.exit();
}
>>>>>>> 590c049820c459c878b703cf5238d27de62299d2

var parser = Parser.init(process.argv[2]);

parser.open();
