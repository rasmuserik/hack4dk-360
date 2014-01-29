// Generated by CoffeeScript 1.6.3
(function() {
  var View, XHR, ajax, app, cacheFrames, currentTestId, deepCopy, defaultModel, elemAddEventListener, expect, express, extend, incrementalLoad, lastTime, legacy, log, port, syncLog, t0, testDone, testModel, testView, testcount,
    __slice = [].slice;

  if (typeof isNodeJs === "undefined" || typeof runTest === "undefined") {
    (function() {
      var root;
      root = typeof global === "undefined" ? window : global;
      if (typeof isNodeJs === "undefined") {
        root.isNodeJs = typeof window === "undefined";
      }
      if (typeof runTest === "undefined") {
        return root.runTest = true;
      }
    })();
  }

  if (runTest && !isNodeJs) {
    testcount = 6;
    currentTestId = 0;
    console.log("1.." + testcount);
    testDone = 0;
    expect = function(expected, result, description) {
      if (JSON.stringify(expected) === JSON.stringify(result)) {
        console.log("ok " + (++currentTestId) + " " + (description || ""));
        log("test ok", currentTestId, description, expected);
      } else {
        console.log(("not ok " + (++currentTestId) + " + " + (description || "")) + ("expected:" + (JSON.stringify(expected))) + ("got:" + (JSON.stringify(result))));
        log("test failed", currentTestId, description, expected, result);
      }
      ++testDone;
      if (testDone === testcount) {
        log("tests done");
        return syncLog();
      }
    };
  }

  if (!isNodeJs) {
    log = void 0;
    syncLog = void 0;
    (function() {
      var logData, logId, logSyncing, logUrl, logsBeforeSync, syncDelay;
      logId = Math.random();
      logUrl = "/api/log";
      logData = [];
      logSyncing = false;
      logsBeforeSync = 200;
      syncDelay = 400;
      syncLog = function() {
        var e, logContent;
        if (!logSyncing) {
          try {
            logContent = JSON.stringify(logData);
          } catch (_error) {
            e = _error;
            logContent = "Error stringifying log";
          }
          logSyncing = logData;
          logData = [];
          return ajax(logUrl, logContent, function(err, result) {
            setTimeout((function() {
              return logSyncing = false;
            }), syncDelay);
            if (err) {
              log("logsync error", err);
              return logData = logSyncing.concat(logData);
            } else {
              logData.push([+(new Date()), "log sync'ed", logId]);
              if (legacy && logData.length > 1) {
                return syncLog();
              }
            }
          });
        }
      };
      log = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        logData.push([+(new Date())].concat(__slice.call(args)));
        if (logData.length > logsBeforeSync || legacy) {
          return syncLog();
        }
      };
      setTimeout((function() {
        elemAddEventListener(window, "error", function() {
          return log("window.onerror", typeof err !== "undefined" && err !== null ? err.message : void 0);
        });
        return elemAddEventListener(window, "beforeunload", function() {
          var e;
          log("window.beforeunload");
          try {
            ajax(logUrl, JSON.stringify(logData));
          } catch (_error) {
            e = _error;
            void 0;
          }
          return void 0;
        });
      }), 0);
      return log("starting", logId, window.performance);
    })();
  }

  if (!isNodeJs) {
    if (Object.keys == null) {
      Object.keys = function(obj) {
        var key, _, _results;
        _results = [];
        for (key in obj) {
          _ = obj[key];
          _results.push(key);
        }
        return _results;
      };
    }
    XHR = XMLHttpRequest;
    legacy = false;
    if (typeof (new XHR).withCredentials !== "boolean") {
      legacy = true;
      XHR = XDomainRequest;
    }
    ajax = function(url, data, cb) {
      var xhr;
      xhr = new XHR();
      xhr.onerror = function(err) {
        return typeof cb === "function" ? cb(err || true) : void 0;
      };
      xhr.onload = function() {
        return typeof cb === "function" ? cb(null, xhr.responseText) : void 0;
      };
      xhr.open((data ? "POST" : "GET"), url, !!cb);
      xhr.send(data);
      if (!cb) {
        return xhr.responseText;
      }
    };
    if (runTest) {
      (function() {
        ajax("//cors-test.appspot.com/test", void 0, function(err, result) {
          return expect(result, '{"status":"ok"}', "async ajax");
        });
        return ajax("//cors-test.appspot.com/test", "foo", function(err, result) {
          return expect(result, '{"status":"ok"}', "async ajax post");
        });
      })();
    }
    extend = function(target, source) {
      var key, val;
      for (key in source) {
        val = source[key];
        target[key] = val;
      }
      return target;
    };
    if (runTest) {
      (function() {
        var a;
        a = {
          a: 1,
          b: 2
        };
        expect(extend(a, {
          b: 3,
          c: 4
        }), {
          a: 1,
          b: 3,
          c: 4
        }, "extend");
        return expect(a, {
          a: 1,
          b: 3,
          c: 4
        }, "extend");
      })();
    }
    deepCopy = function(obj) {
      var e, key, result, val, _i, _len;
      if (typeof obj === "object") {
        if (obj.constructor === Array) {
          result = [];
          for (_i = 0, _len = obj.length; _i < _len; _i++) {
            e = obj[_i];
            result.push(deepCopy(e));
          }
        } else {
          result = {};
          for (key in obj) {
            val = obj[key];
            result[key] = deepCopy(val);
          }
        }
        return result;
      } else {
        return obj;
      }
    };
    if (runTest) {
      (function() {
        var a, b;
        a = {
          a: [1, 2, 3]
        };
        b = deepCopy(a);
        b.b = "c";
        b.a[1] = 3;
        expect(a, {
          a: [1, 2, 3]
        }, "deepcopy original unmutated");
        return expect(b, {
          a: [1, 3, 3],
          b: "c"
        }, "deepcopy copy with mutations");
      })();
    }
    elemAddEventListener = function(elem, type, fn) {
      if (elem.addEventListener) {
        return elem.addEventListener(type, fn, false);
      } else {
        return elem.attachEvent("on" + type, fn);
      }
    };
  }

  if (!isNodeJs) {
    defaultModel = {
      frames: {
        current: 0,
        normal: {
          width: void 0,
          height: void 0,
          urls: []
        },
        zoom: {
          width: void 0,
          height: void 0,
          urls: []
        }
      },
      spinOnLoadFPS: 30,
      fullscreen: false,
      zoom: {
        lensSize: 200,
        enabled: false,
        x: void 0,
        y: void 0
      },
      domElem: {
        width: void 0,
        height: void 0,
        domId: void 0
      }
    };
    if (runTest) {
      testModel = deepCopy(defaultModel);
      (function() {
        var i, _i, _results;
        testModel.frames.zoom.width = 1000;
        testModel.frames.zoom.height = 447;
        testModel.width = testModel.frames.normal.width = 500;
        testModel.height = testModel.frames.normal.height = 223;
        _results = [];
        for (i = _i = 1; _i <= 52; i = _i += 1) {
          testModel.frames.normal.urls.push("/testdata/" + i + ".jpg");
          _results.push(testModel.frames.zoom.urls.push("/testdata/" + i + ".jpg"));
        }
        return _results;
      })();
    }
  }

  if (!isNodeJs) {
    View = function(model, domId) {
      var buttonStyle, domElem, elemNames, i, key, _, _i, _ref, _ref1;
      this.model = model;
      domElem = document.getElementById(domId);
      this.defaultWidth = model.width || domElem.offsetWidth;
      this.defaultHeight = model.height || domElem.offsetHeight;
      /*
      extend domElem.style,
        display: "inline-block"
        width: @defaultWidth + "px"
        height: @defaultHeight + "px"
      */

      this.style = {
        root: {
          display: "inline-block",
          cursor: "url(res/cursor_rotate.cur),move"
        },
        image: {
          width: "100%",
          height: "100%"
        },
        zoomLens: {
          display: "block",
          position: "absolute",
          overflow: "hidden",
          width: this.model.zoom.lensSize,
          height: this.model.zoom.lensSize,
          border: "0px solid black",
          cursor: "default",
          backgroundColor: !legacy ? "rgba(100,100,100,0.8)" : void 0,
          borderRadius: this.model.zoom.lensSize / 2,
          boxShadow: "0px 0px 40px 0px rgba(255,255,255,.7) inset, 4px 4px 9px 0px rgba(0,0,0,0.5)",
          backgroundRepeat: "no-repeat"
        },
        logo: {
          position: "absolute",
          opacity: "0.7",
          textShadow: "0px 0px 5px white",
          color: "#333",
          transition: "opacity 1s"
        },
        btnFull: {
          left: "90%"
        },
        btnZoom: {
          left: "5%"
        },
        spinner: {
          position: "absolute",
          top: "49%",
          left: "49%"
        }
      };
      buttonStyle = {
        position: "absolute",
        color: "#333",
        opacity: "0.7",
        textShadow: "0px 0px 5px white",
        backgroundColor: !legacy ? "rgba(255,255,255,0)" : void 0,
        top: "80%",
        fontSize: this.defaultHeight * .08,
        padding: this.defaultHeight * .02
      };
      extend(this.style.btnFull, buttonStyle);
      extend(this.style.btnZoom, buttonStyle);
      this.elems = {};
      this.elems.root = document.createElement("div");
      this.elems.root.innerHTML = '<img>' + '<div class="onetwo360-zoom-lens"></div>' + '<i class="icon-OneTwo360Logo"></i>' + '<i class="fa fa-fullscreen onetwo360-fullscreen-button"></i>' + '<i class="fa fa-search onetwo360-fullscreen-button"></i>' + '<img src="spinner.gif">';
      domElem.appendChild(this.elems.root);
      elemNames = Object.keys(this.style);
      for (i = _i = 1, _ref = elemNames.length - 1; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        this.elems[elemNames[i]] = this.elems.root.childNodes[i - 1];
      }
      this.width = void 0;
      this.height = void 0;
      this.logoFade = void 0;
      this.imgSrc = void 0;
      this.elemStyle = {};
      this.styleCache = {};
      _ref1 = this.elems;
      for (key in _ref1) {
        _ = _ref1[key];
        this.elemStyle[key] = this.elems[key].style;
        this.styleCache[key] = {};
      }
      this.update();
      return this;
    };
    View.prototype.update = function() {
      var self;
      if (this.updateReq) {
        return;
      }
      this.updateReq = true;
      self = this;
      return setTimeout((function() {
        self._update();
        return self.updateReq = false;
      }), 0);
    };
    View.prototype._update = function() {
      log("View#_update");
      this._fullscreen();
      this._root();
      this._logo();
      this._zoomLens();
      this._image();
      return this._applyStyle();
    };
    View.prototype._fullscreen = function() {
      if (this.model.fullscreen) {
        return extend(this.style.root, {
          position: "absolute",
          top: 0,
          left: 0,
          width: (this.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth),
          height: (this.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight)
        });
      } else {
        return extend(this.style.root, {
          position: "relative",
          top: 0,
          left: 0,
          width: (this.width = this.defaultWidth),
          height: (this.height = this.defaultHeight)
        });
      }
    };
    View.prototype._root = function() {
      return void 0;
    };
    View.prototype._logo = function() {
      return {
        top: this.height * .35 + "px",
        left: this.width * .25 + "px",
        fontSize: this.height * .2 + "px"
      };
    };
    View.prototype._zoomLens = function() {
      var current, imgs;
      if (this.model.zoom.enabled) {
        current = this.model.frames.current;
        imgs = this.model.frames.zoom;
        return extend(this.style.zoomLens, {
          display: "block",
          left: 123,
          top: 123,
          backgroundImage: "url(" + imgs.urls[current] + ")",
          backgroundSize: "" + imgs.width + "px " + imgs.height + "px",
          backgroundPosition: "" + 123 + "px " + 123 + "px"
        });
      } else {
        return extend(this.style.zoomLens, {
          display: "none"
        });
      }
    };
    View.prototype._image = function() {
      var imgSrc;
      imgSrc = this.model.frames.normal.urls[this.model.frames.current];
      if (imgSrc !== void 0 && imgSrc !== this.imgSrc) {
        this.elems.image.src = imgSrc;
        return this.imgSrc = imgSrc;
      }
    };
    View.prototype._applyStyle = function() {
      var css, e, elemId, key, val, _ref, _results;
      _ref = this.style;
      _results = [];
      for (elemId in _ref) {
        css = _ref[elemId];
        _results.push((function() {
          var _results1;
          _results1 = [];
          for (key in css) {
            val = css[key];
            if (this.styleCache[elemId][key] !== val) {
              if (typeof val === "number") {
                val = val + "px";
              }
              if (true || !runTest) {
                this.elemStyle[elemId][key] = val;
              } else {
                try {
                  this.elemStyle[elemId][key] = val;
                } catch (_error) {
                  e = _error;
                  log("Cannot set " + key + ":" + val + " on " + elemId);
                  throw e;
                }
              }
              _results1.push(this.styleCache[elemId][key] = val);
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };
    if (runTest) {
      testView = void 0;
      (function() {
        var t0, t1;
        t0 = +(new Date());
        testView = new View(testModel, "threesixtyproduct");
        t1 = +(new Date());
        testModel.frames.current = 0;
        testModel.fullscreen = false;
        return testView.update();
      })();
    }
  }

  if (!isNodeJs) {
    cacheFrames = function(frameset, cb) {
      var count, i, img, _i, _ref, _results;
      frameset.loaded = [];
      count = 0;
      log("caching frameset", frameset.urls[0]);
      _results = [];
      for (i = _i = 0, _ref = frameset.urls.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        img = new Image();
        img.onload = (function(i) {
          return function() {
            frameset.loaded[i] = +(new Date());
            if (++count === frameset.urls.length) {
              log("done caching frameset", frameset.urls[0]);
              return typeof cb === "function" ? cb() : void 0;
            }
          };
        })(i);
        _results.push(img.src = frameset.urls[i]);
      }
      return _results;
    };
    incrementalLoad = function(model, view, cb) {
      var allLoaded, incrementalUpdate, lastSetFrame, lastTime, loadStart;
      loadStart = +(new Date());
      lastTime = void 0;
      lastSetFrame = 0;
      allLoaded = false;
      model.frames.current = 0;
      incrementalUpdate = function() {
        var count, frameTime, loadTime, maxTime, now;
        count = 0;
        maxTime = loadStart;
        while (model.frames.normal.loaded[count]) {
          maxTime = Math.max(model.frames.normal.loaded[count], maxTime);
          ++count;
        }
        if (count > model.frames.current + 1) {
          now = +(new Date());
          if (lastTime == null) {
            lastTime = now;
          }
          loadTime = (maxTime - loadStart) / count;
          frameTime = Math.max(loadTime, 1000 / model.spinOnLoadFPS);
          if (lastTime + frameTime < now) {
            while (lastTime + frameTime < now) {
              lastSetFrame = model.frames.current = Math.min(count - 1, model.frames.current + 1);
              lastTime += frameTime;
            }
            lastTime = now;
            view.update();
          }
        }
        if ((model.frames.current === lastSetFrame) && (model.frames.current < model.frames.normal.urls.length - 1)) {
          return setTimeout(incrementalUpdate, 0);
        } else {
          return log("finished incremental load animation");
        }
      };
      if (model.spinOnLoadFPS) {
        cacheFrames(model.frames.normal);
        log("starting incremental load animation");
        return incrementalUpdate();
      } else {
        return cacheFrames(model.frames.normal(cb));
      }
    };
    t0 = +new Date();
    if (runTest) {
      incrementalLoad(testModel, testView, function() {
        return log("spinned " + (+new Date() - t0));
      });
    }
    elemAddEventListener(document, "mousemove", function(e) {
      return log("mousemove", e.clientX, e.clientY);
    });
    elemAddEventListener(document, "touchmove", function(e) {
      return log("touchmove", e.touches);
    });
  }

  if (!isNodeJs) {
    window.onetwo360 = function(cfg) {
      console.log("HERE");
      return void 0;
    };
  }

  if (isNodeJs) {
    express = require("express");
    app = express();
    app.use(function(req, res, next) {
      res.header('Cache-Control', "max-age=30, public");
      return next();
    });
    app.use(express["static"](__dirname));
    lastTime = 0;
    app.use("/api", function(req, res, next) {
      var data;
      data = "";
      req.on("data", function(d) {
        return data += d;
      });
      return req.on("end", function() {
        var e, event, _i, _len, _ref, _results;
        res.header('Access-Control-Allow-Origin', req.headers.origin || "*");
        res.header('Access-Control-Max-Age', 0);
        res.header('Access-Control-Allow-Credentials', true);
        res.header("Content-Type", "text/plain");
        res.json("{\"ok\":true}");
        res.end();
        try {
          console.log(req.originalUrl);
          _ref = JSON.parse(data);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            event = _ref[_i];
            console.log(event[0] - lastTime, event);
            lastTime = event[0];
            if (process.argv[2] === "test") {
              if (event[1] === "test failed") {
                process.exit(1);
              }
              if (event[1] === "tests done") {
                _results.push(process.exit(0));
              } else {
                _results.push(void 0);
              }
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        } catch (_error) {
          e = _error;
          return console.log(e);
        }
      });
    });
    port = 4444;
    app.listen(port);
    console.log("devserver running on port " + port);
  }

}).call(this);
