(function () {

    /**
    * The Container family of components is designed to enable developers to 
    * create different kinds of content-containing modules on the web. Module 
    * and Overlay are the most basic containers, and they can be used directly 
    * or extended to build custom containers. Also part of the Container family 
    * are four UI controls that extend Module and Overlay: Tooltip, Panel, 
    * Dialog, and SimpleDialog.
    * @module container
    * @title Container
    * @requires yahoo,dom,event,dragdrop,animation
    */
    
    /**
    * Module is a JavaScript representation of the Standard Module Format. 
    * Standard Module Format is a simple standard for markup containers where 
    * child nodes representing the header, body, and footer of the content are 
    * denoted using the CSS classes "hd", "bd", and "ft" respectively. 
    * Module is the base class for all other classes in the YUI 
    * Container package.
    * @namespace YAHOO.widget
    * @class Module
    * @constructor
    * @param {String} el The element ID representing the Module <em>OR</em>
    * @param {HTMLElement} el The element representing the Module
    * @param {Object} userConfig The configuration Object literal containing 
    * the configuration that should be set for this module. See configuration 
    * documentation for more details.
    */
    YAHOO.widget.Module = function (el, userConfig) {
    
        if (el) {
    
            this.init(el, userConfig);
    
        } else {
    
            YAHOO.log("No element or element ID specified" + 
                " for Module instantiation", "error");
    
        }
    
    };


    var Dom = YAHOO.util.Dom,
        Config = YAHOO.util.Config,
        Event = YAHOO.util.Event,
        CustomEvent = YAHOO.util.CustomEvent,
        Module = YAHOO.widget.Module,

        /**
        * Constant representing the name of the Module's events
        * @property EVENT_TYPES
        * @private
        * @final
        * @type Object
        */
        EVENT_TYPES = {
        
            "BEFORE_INIT": "beforeInit",
            "INIT": "init",
            "APPEND": "append",
            "BEFORE_RENDER": "beforeRender",
            "RENDER": "render",
            "CHANGE_HEADER": "changeHeader",
            "CHANGE_BODY": "changeBody",
            "CHANGE_FOOTER": "changeFooter",
            "CHANGE_CONTENT": "changeContent",
            "DESTORY": "destroy",
            "BEFORE_SHOW": "beforeShow",
            "SHOW": "show",
            "BEFORE_HIDE": "beforeHide",
            "HIDE": "hide"
        
        },
            
        /**
        * Constant representing the Module's configuration properties
        * @property DEFAULT_CONFIG
        * @private
        * @final
        * @type Object
        */
        DEFAULT_CONFIG = {
        
            "VISIBLE": { 
                key: "visible", 
                value: true, 
                validator: YAHOO.lang.isBoolean 
            },
        
            "EFFECT": { 
                key: "effect", 
                suppressEvent: true, 
                supercedes: ["visible"] 
            },
        
            "MONITOR_RESIZE": { 
                key: "monitorresize", 
                value: true  
            }
        
        };

    
    /**
    * Constant representing the prefix path to use for non-secure images
    * @property Module.IMG_ROOT
    * @static
    * @final
    * @type String
    */
    Module.IMG_ROOT = null;
    
    /**
    * Constant representing the prefix path to use for securely served images
    * @property Module.IMG_ROOT_SSL
    * @static
    * @final
    * @type String
    */
    Module.IMG_ROOT_SSL = null;
    
    /**
    * Constant for the default CSS class name that represents a Module
    * @property Module.CSS_MODULE
    * @static
    * @final
    * @type String
    */
    Module.CSS_MODULE = "yui-module";
    
    /**
    * Constant representing the module header
    * @property Module.CSS_HEADER
    * @static
    * @final
    * @type String
    */
    Module.CSS_HEADER = "hd";
    
    /**
    * Constant representing the module body
    * @property Module.CSS_BODY
    * @static
    * @final
    * @type String
    */
    Module.CSS_BODY = "bd";
    
    /**
    * Constant representing the module footer
    * @property Module.CSS_FOOTER
    * @static
    * @final
    * @type String
    */
    Module.CSS_FOOTER = "ft";
    
    /**
    * Constant representing the url for the "src" attribute of the iframe 
    * used to monitor changes to the browser's base font size
    * @property Module.RESIZE_MONITOR_SECURE_URL
    * @static
    * @final
    * @type String
    */
    Module.RESIZE_MONITOR_SECURE_URL = "javascript:false;";
    
    /**
    * Singleton CustomEvent fired when the font size is changed in the browser.
    * Opera's "zoom" functionality currently does not support text 
    * size detection.
    * @event Module.textResizeEvent
    */
    Module.textResizeEvent = new CustomEvent("textResize");
    
    Module.prototype = {
    
        /**
        * The class's constructor function
        * @property contructor
        * @type Function
        */
        constructor: Module,
        
        /**
        * The main module element that contains the header, body, and footer
        * @property element
        * @type HTMLElement
        */
        element: null,
        
        /**
        * The header element, denoted with CSS class "hd"
        * @property header
        * @type HTMLElement
        */
        header: null,
        
        /**
        * The body element, denoted with CSS class "bd"
        * @property body
        * @type HTMLElement
        */
        body: null,
        
        /**
        * The footer element, denoted with CSS class "ft"
        * @property footer
        * @type HTMLElement
        */
        footer: null,
        
        /**
        * The id of the element
        * @property id
        * @type String
        */
        id: null,
        
        /**
        * The String representing the image root
        * @property imageRoot
        * @type String
        */
        imageRoot: Module.IMG_ROOT,
    
        /**
        * Initializes the custom events for Module which are fired 
        * automatically at appropriate times by the Module class.
        * @method initEvents
        */
        initEvents: function () {
        
            var SIGNATURE = CustomEvent.LIST;
        
            /**
            * CustomEvent fired prior to class initalization.
            * @event beforeInitEvent
            * @param {class} classRef class reference of the initializing 
            * class, such as this.beforeInitEvent.fire(Module)
            */
            this.beforeInitEvent = this.createEvent(EVENT_TYPES.BEFORE_INIT);
            this.beforeInitEvent.signature = SIGNATURE;
        
            /**
            * CustomEvent fired after class initalization.
            * @event initEvent
            * @param {class} classRef class reference of the initializing 
            * class, such as this.beforeInitEvent.fire(Module)
            */  
            this.initEvent = this.createEvent(EVENT_TYPES.INIT);
            this.initEvent.signature = SIGNATURE;
        
            /**
            * CustomEvent fired when the Module is appended to the DOM
            * @event appendEvent
            */
            this.appendEvent = this.createEvent(EVENT_TYPES.APPEND);
            this.appendEvent.signature = SIGNATURE;
        
            /**
            * CustomEvent fired before the Module is rendered
            * @event beforeRenderEvent
            */
            this.beforeRenderEvent = 
                this.createEvent(EVENT_TYPES.BEFORE_RENDER);
            this.beforeRenderEvent.signature = SIGNATURE;
        
            /**
            * CustomEvent fired after the Module is rendered
            * @event renderEvent
            */
            this.renderEvent = this.createEvent(EVENT_TYPES.RENDER);
            this.renderEvent.signature = SIGNATURE;
        
            /**
            * CustomEvent fired when the header content of the Module 
            * is modified
            * @event changeHeaderEvent
            * @param {String/HTMLElement} content String/element representing 
            * the new header content
            */
            this.changeHeaderEvent = 
                this.createEvent(EVENT_TYPES.CHANGE_HEADER);
            this.changeHeaderEvent.signature = SIGNATURE;
            
            /**
            * CustomEvent fired when the body content of the Module is modified
            * @event changeBodyEvent
            * @param {String/HTMLElement} content String/element representing 
            * the new body content
            */  
            this.changeBodyEvent = this.createEvent(EVENT_TYPES.CHANGE_BODY);
            this.changeBodyEvent.signature = SIGNATURE;
            
            /**
            * CustomEvent fired when the footer content of the Module 
            * is modified
            * @event changeFooterEvent
            * @param {String/HTMLElement} content String/element representing 
            * the new footer content
            */
            this.changeFooterEvent = 
                this.createEvent(EVENT_TYPES.CHANGE_FOOTER);
            this.changeFooterEvent.signature = SIGNATURE;
        
            /**
            * CustomEvent fired when the content of the Module is modified
            * @event changeContentEvent
            */
            this.changeContentEvent = 
                this.createEvent(EVENT_TYPES.CHANGE_CONTENT);
            this.changeContentEvent.signature = SIGNATURE;
        
            /**
            * CustomEvent fired when the Module is destroyed
            * @event destroyEvent
            */
            this.destroyEvent = this.createEvent(EVENT_TYPES.DESTORY);
            this.destroyEvent.signature = SIGNATURE;
            
            /**
            * CustomEvent fired before the Module is shown
            * @event beforeShowEvent
            */
            this.beforeShowEvent = this.createEvent(EVENT_TYPES.BEFORE_SHOW);
            this.beforeShowEvent.signature = SIGNATURE;
        
            /**
            * CustomEvent fired after the Module is shown
            * @event showEvent
            */
            this.showEvent = this.createEvent(EVENT_TYPES.SHOW);
            this.showEvent.signature = SIGNATURE;
        
            /**
            * CustomEvent fired before the Module is hidden
            * @event beforeHideEvent
            */
            this.beforeHideEvent = this.createEvent(EVENT_TYPES.BEFORE_HIDE);
            this.beforeHideEvent.signature = SIGNATURE;
        
            /**
            * CustomEvent fired after the Module is hidden
            * @event hideEvent
            */
            this.hideEvent = this.createEvent(EVENT_TYPES.HIDE);
            this.hideEvent.signature = SIGNATURE;
        }, 
        
        /**
        * String representing the current user-agent platform
        * @property platform
        * @type String
        */
        platform: function () {
        
            var ua = navigator.userAgent.toLowerCase();
        
            if (ua.indexOf("windows") != -1 || ua.indexOf("win32") != -1) {
        
                return "windows";
        
            } else if (ua.indexOf("macintosh") != -1) {
        
                return "mac";
        
            } else {
        
                return false;
        
            }
        
        }(),
        
        /**
        * String representing the user-agent of the browser
        * @deprecated Use YAHOO.env.ua
        * @property browser
        * @type String
        */
        browser: function () {
        
            var ua = navigator.userAgent.toLowerCase();
            
            /*
                 Check Opera first in case of spoof and check Safari before
                 Gecko since Safari's user agent string includes "like Gecko"
            */

            if (ua.indexOf('opera') != -1) { 
            
                return 'opera';
            
            } else if (ua.indexOf('msie 7') != -1) {
            
                return 'ie7';
            
            } else if (ua.indexOf('msie') != -1) {
            
                return 'ie';
            
            } else if (ua.indexOf('safari') != -1) { 
            
                return 'safari';
            
            } else if (ua.indexOf('gecko') != -1) {
            
                return 'gecko';
            
            } else {
            
                return false;
            
            }
        
        }(),
        
        /**
        * Boolean representing whether or not the current browsing context is 
        * secure (https)
        * @property isSecure
        * @type Boolean
        */
        isSecure: function () {
        
            if (window.location.href.toLowerCase().indexOf("https") === 0) {
        
                return true;
        
            } else {
        
                return false;
        
            }
        
        }(),
        
        /**
        * Initializes the custom events for Module which are fired 
        * automatically at appropriate times by the Module class.
        */
        initDefaultConfig: function () {
    
            // Add properties //
        
            /**
            * Specifies whether the Module is visible on the page.
            * @config visible
            * @type Boolean
            * @default true
            */
            this.cfg.addProperty(DEFAULT_CONFIG.VISIBLE.key, {
                handler: this.configVisible, 
                value: DEFAULT_CONFIG.VISIBLE.value, 
                validator: DEFAULT_CONFIG.VISIBLE.validator
            });
            
            /**
            * Object or array of objects representing the ContainerEffect 
            * classes that are active for animating the container.
            * @config effect
            * @type Object
            * @default null
            */
            this.cfg.addProperty(DEFAULT_CONFIG.EFFECT.key, {
                suppressEvent: DEFAULT_CONFIG.EFFECT.suppressEvent, 
                supercedes: DEFAULT_CONFIG.EFFECT.supercedes
            });
            
            /**
            * Specifies whether to create a special proxy iframe to monitor 
            * for user font resizing in the document
            * @config monitorresize
            * @type Boolean
            * @default true
            */
            this.cfg.addProperty(DEFAULT_CONFIG.MONITOR_RESIZE.key, {
                handler: this.configMonitorResize,
                value: DEFAULT_CONFIG.MONITOR_RESIZE.value
            });
            
        },
        
        /**
        * The Module class's initialization method, which is executed for
        * Module and all of its subclasses. This method is automatically 
        * called by the constructor, and  sets up all DOM references for 
        * pre-existing markup, and creates required markup if it is not 
        * already present.
        * @method init
        * @param {String} el The element ID representing the Module <em>OR</em>
        * @param {HTMLElement} el The element representing the Module
        * @param {Object} userConfig The configuration Object literal 
        * containing the configuration that should be set for this module. 
        * See configuration documentation for more details.
        */
        init: function (el, userConfig) {
        
            var elId, i, child;
        
            this.initEvents();
        
            this.beforeInitEvent.fire(Module);
        
            /**
            * The Module's Config object used for monitoring 
            * configuration properties.
            * @property cfg
            * @type Config
            */
            this.cfg = new Config(this);
        
            if (this.isSecure) {
                this.imageRoot = Module.IMG_ROOT_SSL;
            }
        
            if (typeof el == "string") {
                elId = el;
        
                el = document.getElementById(el);
                if (! el) {
                    el = document.createElement("div");
                    el.id = elId;
                }
            }
        
            this.element = el;
        
            if (el.id) {
                this.id = el.id;
            }
        
            child = this.element.firstChild;
            
            if (child) {

                do {

                    switch (child.className) {
    
                    case Module.CSS_HEADER:
    
                        this.header = child;
    
                        break;
    
                    case Module.CSS_BODY:
    
                        this.body = child;
    
                        break;
    
                    case Module.CSS_FOOTER:
    
                        this.footer = child;
    
                        break;
    
                    }
                    
                } while ((child = child.nextSibling));
            
            }

        
            this.initDefaultConfig();
        
            Dom.addClass(this.element, Module.CSS_MODULE);
        
            if (userConfig) {
                this.cfg.applyConfig(userConfig, true);
            }
        
            /*
                Subscribe to the fireQueue() method of Config so that any 
                queued configuration changes are excecuted upon render of 
                the Module
            */ 
            
            if (!Config.alreadySubscribed(this.renderEvent, 
                this.cfg.fireQueue, this.cfg)) {

                this.renderEvent.subscribe(this.cfg.fireQueue, this.cfg, true);

            }
        
            this.initEvent.fire(Module);
        },
        
        /**
        * Initialized an empty IFRAME that is placed out of the visible area 
        * that can be used to detect text resize.
        * @method initResizeMonitor
        */
        initResizeMonitor: function () {
        
            var bIE, nLeft, nTop, doc, resizeMonitor;
        
            function fireTextResize() {
        
                Module.textResizeEvent.fire();
        
            }
        
            if (!YAHOO.env.ua.opera) {
        
                resizeMonitor = document.getElementById("_yuiResizeMonitor");
        
                if (! resizeMonitor) {
        
                    resizeMonitor = document.createElement("iframe");
        
                    bIE = YAHOO.env.ua.ie;
        
                    if (this.isSecure && 
                            Module.RESIZE_MONITOR_SECURE_URL && bIE) {
    
                        resizeMonitor.src = 
                            Module.RESIZE_MONITOR_SECURE_URL;
    
                    }
        
                    resizeMonitor.id = "_yuiResizeMonitor";
                    resizeMonitor.style.visibility = "hidden";
        
                    document.body.appendChild(resizeMonitor);
        
                    resizeMonitor.style.width = "10em";
                    resizeMonitor.style.height = "10em";
                    resizeMonitor.style.position = "absolute";
        
                    nLeft = -1 * resizeMonitor.offsetWidth;
                    nTop = -1 * resizeMonitor.offsetHeight;
        
                    resizeMonitor.style.top = nTop + "px";
                    resizeMonitor.style.left = nLeft + "px";
                    resizeMonitor.style.borderStyle = "none";
                    resizeMonitor.style.borderWidth = "0";
                    Dom.setStyle(resizeMonitor, "opacity", "0");
        
                    resizeMonitor.style.visibility = "visible";
        
                    if (!bIE) {
        
                        doc = resizeMonitor.contentWindow.document;
        
                        doc.open();
                        doc.close();
        
                    }
                }
        
        
        
                if (resizeMonitor && resizeMonitor.contentWindow) {
                    this.resizeMonitor = resizeMonitor;
        
                    Module.textResizeEvent.subscribe(
                        this.onDomResize, this, true);
        
                    if (!Module.textResizeInitialized) {

                        if (!Event.on(this.resizeMonitor.contentWindow, 
                            "resize", fireTextResize)) {

                            /*
                                 This will fail in IE if document.domain has 
                                 changed, so we must change the listener to 
                                 use the resizeMonitor element instead
                            */

                            Event.on(this.resizeMonitor, "resize", 
                                fireTextResize);

                        }

                        Module.textResizeInitialized = true;
                    }
                }
        
            }
        
        },
        
        /**
        * Event handler fired when the resize monitor element is resized.
        * @method onDomResize
        * @param {DOMEvent} e The DOM resize event
        * @param {Object} obj The scope object passed to the handler
        */
        onDomResize: function (e, obj) {
        
            var nLeft = -1 * this.resizeMonitor.offsetWidth,
                nTop = -1 * this.resizeMonitor.offsetHeight;
        
            this.resizeMonitor.style.top = nTop + "px";
            this.resizeMonitor.style.left =  nLeft + "px";
        
        },
        
        /**
        * Sets the Module's header content to the HTML specified, or appends 
        * the passed element to the header. If no header is present, one will 
        * be automatically created.
        * @method setHeader
        * @param {String} headerContent The HTML used to set the header 
        * <em>OR</em>
        * @param {HTMLElement} headerContent The HTMLElement to append to 
        * the header
        */
        setHeader: function (headerContent) {
            if (! this.header) {
                this.header = document.createElement("div");
                this.header.className = Module.CSS_HEADER;
            }
        
            if (typeof headerContent == "string") {
                this.header.innerHTML = headerContent;
            } else {
                this.header.innerHTML = "";
                this.header.appendChild(headerContent);
            }
        
            this.changeHeaderEvent.fire(headerContent);
            this.changeContentEvent.fire();
        },
        
        /**
        * Appends the passed element to the header. If no header is present, 
        * one will be automatically created.
        * @method appendToHeader
        * @param {HTMLElement} element The element to append to the header
        */
        appendToHeader: function (element) {
            if (! this.header) {
                this.header = document.createElement("div");
                this.header.className = Module.CSS_HEADER;
            }
        
            this.header.appendChild(element);
            this.changeHeaderEvent.fire(element);
            this.changeContentEvent.fire();
        },
        
        /**
        * Sets the Module's body content to the HTML specified, or appends the
        * passed element to the body. If no body is present, one will be 
        * automatically created.
        * @method setBody
        * @param {String} bodyContent The HTML used to set the body <em>OR</em>
        * @param {HTMLElement} bodyContent The HTMLElement to append to the body
        */
        setBody: function (bodyContent) {
            if (! this.body) {
                this.body = document.createElement("div");
                this.body.className = Module.CSS_BODY;
            }
        
            if (typeof bodyContent == "string")
            {
                this.body.innerHTML = bodyContent;
            } else {
                this.body.innerHTML = "";
                this.body.appendChild(bodyContent);
            }
        
            this.changeBodyEvent.fire(bodyContent);
            this.changeContentEvent.fire();
        },
        
        /**
        * Appends the passed element to the body. If no body is present, one 
        * will be automatically created.
        * @method appendToBody
        * @param {HTMLElement} element The element to append to the body
        */
        appendToBody: function (element) {
            if (! this.body) {
                this.body = document.createElement("div");
                this.body.className = Module.CSS_BODY;
            }
        
            this.body.appendChild(element);
            this.changeBodyEvent.fire(element);
            this.changeContentEvent.fire();
        },
        
        /**
        * Sets the Module's footer content to the HTML specified, or appends 
        * the passed element to the footer. If no footer is present, one will 
        * be automatically created.
        * @method setFooter
        * @param {String} footerContent The HTML used to set the footer 
        * <em>OR</em>
        * @param {HTMLElement} footerContent The HTMLElement to append to 
        * the footer
        */
        setFooter: function (footerContent) {
            if (! this.footer) {
                this.footer = document.createElement("div");
                this.footer.className = Module.CSS_FOOTER;
            }
        
            if (typeof footerContent == "string") {
                this.footer.innerHTML = footerContent;
            } else {
                this.footer.innerHTML = "";
                this.footer.appendChild(footerContent);
            }
        
            this.changeFooterEvent.fire(footerContent);
            this.changeContentEvent.fire();
        },
        
        /**
        * Appends the passed element to the footer. If no footer is present, 
        * one will be automatically created.
        * @method appendToFooter
        * @param {HTMLElement} element The element to append to the footer
        */
        appendToFooter: function (element) {
            if (! this.footer) {
                this.footer = document.createElement("div");
                this.footer.className = Module.CSS_FOOTER;
            }
        
            this.footer.appendChild(element);
            this.changeFooterEvent.fire(element);
            this.changeContentEvent.fire();
        },
        
        /**
        * Renders the Module by inserting the elements that are not already 
        * in the main Module into their correct places. Optionally appends 
        * the Module to the specified node prior to the render's execution. 
        * NOTE: For Modules without existing markup, the appendToNode argument 
        * is REQUIRED. If this argument is ommitted and the current element is 
        * not present in the document, the function will return false, 
        * indicating that the render was a failure.
        * @method render
        * @param {String} appendToNode The element id to which the Module 
        * should be appended to prior to rendering <em>OR</em>
        * @param {HTMLElement} appendToNode The element to which the Module 
        * should be appended to prior to rendering
        * @param {HTMLElement} moduleElement OPTIONAL. The element that 
        * represents the actual Standard Module container.
        * @return {Boolean} Success or failure of the render
        */
        render: function (appendToNode, moduleElement) {
        
            var me = this,
                firstChild;
        
            function appendTo(element) {
                if (typeof element == "string") {
                    element = document.getElementById(element);
                }
        
                if (element) {
                    element.appendChild(me.element);
                    me.appendEvent.fire();
                }
            }
        
            this.beforeRenderEvent.fire();
        
            if (! moduleElement) {
                moduleElement = this.element;
            }
        
            if (appendToNode) {

                appendTo(appendToNode);

            } else { 

                /*
                     No node was passed in. If the element is not already in 
                     the Dom, this fails
                */

                if (! Dom.inDocument(this.element)) {

                    YAHOO.log("Render failed. Must specify appendTo node if " + 
                        " Module isn't already in the DOM.", "error");

                    return false;

                }

            }
        
            // Need to get everything into the DOM if it isn't already
        
            if (this.header && ! Dom.inDocument(this.header)) {

                /*
                    There is a header, but it's not in the DOM yet... 
                    need to add it
                */

                firstChild = moduleElement.firstChild;

                if (firstChild) { // Insert before first child if exists

                    moduleElement.insertBefore(this.header, firstChild);

                } else { // Append to empty body because there are no children

                    moduleElement.appendChild(this.header);

                }

            }
        
            if (this.body && ! Dom.inDocument(this.body)) {

                /*
                     There is a body, but it's not in the DOM yet... 
                     need to add it
                */


                // Insert before footer if exists in DOM

                if (this.footer && Dom.isAncestor(
                    this.moduleElement, this.footer)) { 

                    moduleElement.insertBefore(this.body, this.footer);

                } else { // Append to element because there is no footer

                    moduleElement.appendChild(this.body);

                }

            }
        
            if (this.footer && ! Dom.inDocument(this.footer)) {

                /*
                     There is a footer, but it's not in the DOM yet... 
                     need to add it
                */

                moduleElement.appendChild(this.footer);

            }
        
            this.renderEvent.fire();
            return true;
        },
        
        /**
        * Removes the Module element from the DOM and sets all child elements 
        * to null.
        * @method destroy
        */
        destroy: function () {
        
            var parent,
                e;
        
            if (this.element) {
                Event.purgeElement(this.element, true);
                parent = this.element.parentNode;
            }
            if (parent) {
                parent.removeChild(this.element);
            }
        
            this.element = null;
            this.header = null;
            this.body = null;
            this.footer = null;
        
            for (e in this) {
                if (e instanceof CustomEvent) {
                    e.unsubscribeAll();
                }
            }
        
            Module.textResizeEvent.unsubscribe(
                this.onDomResize, this);
        
            this.destroyEvent.fire();
        },
        
        /**
        * Shows the Module element by setting the visible configuration 
        * property to true. Also fires two events: beforeShowEvent prior to 
        * the visibility change, and showEvent after.
        * @method show
        */
        show: function () {
            this.cfg.setProperty("visible", true);
        },
        
        /**
        * Hides the Module element by setting the visible configuration 
        * property to false. Also fires two events: beforeHideEvent prior to 
        * the visibility change, and hideEvent after.
        * @method hide
        */
        hide: function () {
            this.cfg.setProperty("visible", false);
        },
        
        // BUILT-IN EVENT HANDLERS FOR MODULE //
        
        /**
        * Default event handler for changing the visibility property of a 
        * Module. By default, this is achieved by switching the "display" style 
        * between "block" and "none".
        * This method is responsible for firing showEvent and hideEvent.
        * @param {String} type The CustomEvent type (usually the property name)
        * @param {Object[]} args The CustomEvent arguments. For configuration 
        * handlers, args[0] will equal the newly applied value for the property.
        * @param {Object} obj The scope object. For configuration handlers, 
        * this will usually equal the owner.
        * @method configVisible
        */
        configVisible: function (type, args, obj) {
            var visible = args[0];
            if (visible) {
                this.beforeShowEvent.fire();
                Dom.setStyle(this.element, "display", "block");
                this.showEvent.fire();
            } else {
                this.beforeHideEvent.fire();
                Dom.setStyle(this.element, "display", "none");
                this.hideEvent.fire();
            }
        },
        
        /**
        * Default event handler for the "monitorresize" configuration property
        * @param {String} type The CustomEvent type (usually the property name)
        * @param {Object[]} args The CustomEvent arguments. For configuration 
        * handlers, args[0] will equal the newly applied value for the property.
        * @param {Object} obj The scope object. For configuration handlers, 
        * this will usually equal the owner.
        * @method configMonitorResize
        */
        configMonitorResize: function (type, args, obj) {

            var monitor = args[0];

            if (monitor) {

                this.initResizeMonitor();

            } else {

                Module.textResizeEvent.unsubscribe(
                    this.onDomResize, this, true);

                this.resizeMonitor = null;
            }

        },
        
        /**
        * Returns a String representation of the Object.
        * @method toString
        * @return {String} The string representation of the Module
        */
        toString: function () {
            return "Module " + this.id;
        }
        
    };
    
    YAHOO.lang.augmentProto(Module, YAHOO.util.EventProvider);

}());