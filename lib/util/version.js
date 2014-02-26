var versionRegExp = /^([0-9]+)(?:\.([0-9]+)(?:\.([0-9]+))?)?(?:-([^\.]*))?(?:.([0-9]+))?$/;

function ParsedVersion(version) {
    function makeInt(version) {
        if (version != null) {
            return parseInt(version, 10);
        }
    }

    this.valid = false;
    if (version) {
        var parts = versionRegExp.exec(version);

        if (parts) {
            this._major = makeInt(parts[1]);
            this._minor = makeInt(parts[2]);
            this._patch = makeInt(parts[3]);
            this.label = parts[4];
            this.build = makeInt(parts[5]);
            this.valid = true;
        }
    }
}

ParsedVersion.prototype = {
    clone: function() {
        var clone = new ParsedVersion();
        require('raptor').extend(clone, this);
        return clone;
    },

    incMajor: function() {
        this.major++;
        if (this.minor != null) {
            this.minor = 0;    
        }
        
        if (this.patch != null) {
            this.patch = 0;
        }
        
        this.build = null;
    },

    incMinor: function() {
        this.minor++;

        if (this.patch != null) {
            this.patch = 0;
        }
        
        this.build = null;
    },

    incPatch: function() {
        this.patch++;

        this.build = null;
    },

    incBuild: function() {
        this.build++;
    },

    toString: function() {
        return this.version;
    }
};

Object.defineProperty(ParsedVersion.prototype, 'major', {
    set: function(val) { 
        this._major = val;
    },

    get: function() {
        return this._major;
    }
});

Object.defineProperty(ParsedVersion.prototype, 'minor', {
    set: function(val) { 
        if (val != null) {
            if (this._major == null) {
                this._major = 0;
            }    
        }
        
        this._minor = val;
    },

    get: function() {
        return this._minor;
    }
});

Object.defineProperty(ParsedVersion.prototype, 'patch', {
    set: function(val) { 
        if (val != null) {
            if (this._major == null) {
                this._major = 0;
            }

            if (this._minor == null) {
                this._minor = 0;
            }
        }

        this._patch = val;
    },

    get: function() {
        return this._patch;
    }
});

Object.defineProperty(ParsedVersion.prototype, 'version', {
    get: function() { 
        var parts = [];
        if (this.major != null) {
            parts.push(this.major);

            if (this.minor != null) {
                parts.push(this.minor);

                if (this.patch != null) {
                    parts.push(this.patch);
                }
            }
        }

        var version = parts.join('.');
        if (this.label) {
            version += '-' + this.label;
            if (this.build) {
                version += '.' + this.build;
            }
        }

        return version;
    }
});

exports.parse = function(version) {
    return new ParsedVersion(version);
};