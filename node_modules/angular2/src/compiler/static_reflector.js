'use strict';var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var metadata_1 = require('angular2/src/core/metadata');
/**
 * A token representing the a reference to a static type.
 *
 * This token is unique for a moduleId and name and can be used as a hash table key.
 */
var StaticType = (function () {
    function StaticType(moduleId, name) {
        this.moduleId = moduleId;
        this.name = name;
    }
    return StaticType;
})();
exports.StaticType = StaticType;
/**
 * A static reflector implements enough of the Reflector API that is necessary to compile
 * templates statically.
 */
var StaticReflector = (function () {
    function StaticReflector(host) {
        this.host = host;
        this.typeCache = new Map();
        this.annotationCache = new Map();
        this.propertyCache = new Map();
        this.parameterCache = new Map();
        this.metadataCache = new Map();
        this.conversionMap = new Map();
        this.initializeConversionMap();
    }
    /**
     * getStatictype produces a Type whose metadata is known but whose implementation is not loaded.
     * All types passed to the StaticResolver should be pseudo-types returned by this method.
     *
     * @param moduleId the module identifier as would be passed to an import statement.
     * @param name the name of the type.
     */
    StaticReflector.prototype.getStaticType = function (moduleId, name) {
        var key = "\"" + moduleId + "\"." + name;
        var result = this.typeCache.get(key);
        if (!lang_1.isPresent(result)) {
            result = new StaticType(moduleId, name);
            this.typeCache.set(key, result);
        }
        return result;
    };
    StaticReflector.prototype.annotations = function (type) {
        var _this = this;
        var annotations = this.annotationCache.get(type);
        if (!lang_1.isPresent(annotations)) {
            var classMetadata = this.getTypeMetadata(type);
            if (lang_1.isPresent(classMetadata['decorators'])) {
                annotations = classMetadata['decorators']
                    .map(function (decorator) { return _this.convertKnownDecorator(type.moduleId, decorator); })
                    .filter(function (decorator) { return lang_1.isPresent(decorator); });
            }
            this.annotationCache.set(type, annotations);
        }
        return annotations;
    };
    StaticReflector.prototype.propMetadata = function (type) {
        var propMetadata = this.propertyCache.get(type);
        if (!lang_1.isPresent(propMetadata)) {
            var classMetadata = this.getTypeMetadata(type);
            propMetadata = this.getPropertyMetadata(type.moduleId, classMetadata['members']);
            this.propertyCache.set(type, propMetadata);
        }
        return propMetadata;
    };
    StaticReflector.prototype.parameters = function (type) {
        var parameters = this.parameterCache.get(type);
        if (!lang_1.isPresent(parameters)) {
            var classMetadata = this.getTypeMetadata(type);
            var ctorData = classMetadata['members']['__ctor__'];
            if (lang_1.isPresent(ctorData)) {
                var ctor = ctorData.find(function (a) { return a['__symbolic'] === 'constructor'; });
                parameters = this.simplify(type.moduleId, ctor['parameters']);
                this.parameterCache.set(type, parameters);
            }
        }
        return parameters;
    };
    StaticReflector.prototype.initializeConversionMap = function () {
        var _this = this;
        var core_metadata = 'angular2/src/core/metadata';
        var conversionMap = this.conversionMap;
        conversionMap.set(this.getStaticType(core_metadata, 'Directive'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            if (!lang_1.isPresent(p0)) {
                p0 = {};
            }
            return new metadata_1.DirectiveMetadata({
                selector: p0['selector'],
                inputs: p0['inputs'],
                outputs: p0['outputs'],
                events: p0['events'],
                host: p0['host'],
                bindings: p0['bindings'],
                providers: p0['providers'],
                exportAs: p0['exportAs'],
                queries: p0['queries'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Component'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            if (!lang_1.isPresent(p0)) {
                p0 = {};
            }
            return new metadata_1.ComponentMetadata({
                selector: p0['selector'],
                inputs: p0['inputs'],
                outputs: p0['outputs'],
                properties: p0['properties'],
                events: p0['events'],
                host: p0['host'],
                exportAs: p0['exportAs'],
                moduleId: p0['moduleId'],
                bindings: p0['bindings'],
                providers: p0['providers'],
                viewBindings: p0['viewBindings'],
                viewProviders: p0['viewProviders'],
                changeDetection: p0['changeDetection'],
                queries: p0['queries'],
                templateUrl: p0['templateUrl'],
                template: p0['template'],
                styleUrls: p0['styleUrls'],
                styles: p0['styles'],
                directives: p0['directives'],
                pipes: p0['pipes'],
                encapsulation: p0['encapsulation']
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Input'), function (moduleContext, expression) { return new metadata_1.InputMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'Output'), function (moduleContext, expression) { return new metadata_1.OutputMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'View'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            if (!lang_1.isPresent(p0)) {
                p0 = {};
            }
            return new metadata_1.ViewMetadata({
                templateUrl: p0['templateUrl'],
                template: p0['template'],
                directives: p0['directives'],
                pipes: p0['pipes'],
                encapsulation: p0['encapsulation'],
                styles: p0['styles'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Attribute'), function (moduleContext, expression) { return new metadata_1.AttributeMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'Query'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            var p1 = _this.getDecoratorParameter(moduleContext, expression, 1);
            if (!lang_1.isPresent(p1)) {
                p1 = {};
            }
            return new metadata_1.QueryMetadata(p0, { descendants: p1.descendants, first: p1.first });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'ContentChildren'), function (moduleContext, expression) { return new metadata_1.ContentChildrenMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'ContentChild'), function (moduleContext, expression) { return new metadata_1.ContentChildMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'ViewChildren'), function (moduleContext, expression) { return new metadata_1.ViewChildrenMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'ViewChild'), function (moduleContext, expression) { return new metadata_1.ViewChildMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'ViewQuery'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            var p1 = _this.getDecoratorParameter(moduleContext, expression, 1);
            if (!lang_1.isPresent(p1)) {
                p1 = {};
            }
            return new metadata_1.ViewQueryMetadata(p0, {
                descendants: p1['descendants'],
                first: p1['first'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Pipe'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            if (!lang_1.isPresent(p0)) {
                p0 = {};
            }
            return new metadata_1.PipeMetadata({
                name: p0['name'],
                pure: p0['pure'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'HostBinding'), function (moduleContext, expression) { return new metadata_1.HostBindingMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'HostListener'), function (moduleContext, expression) { return new metadata_1.HostListenerMetadata(_this.getDecoratorParameter(moduleContext, expression, 0), _this.getDecoratorParameter(moduleContext, expression, 1)); });
    };
    StaticReflector.prototype.convertKnownDecorator = function (moduleContext, expression) {
        var converter = this.conversionMap.get(this.getDecoratorType(moduleContext, expression));
        if (lang_1.isPresent(converter))
            return converter(moduleContext, expression);
        return null;
    };
    StaticReflector.prototype.getDecoratorType = function (moduleContext, expression) {
        if (isMetadataSymbolicCallExpression(expression)) {
            var target = expression['expression'];
            if (isMetadataSymbolicReferenceExpression(target)) {
                var moduleId = this.normalizeModuleName(moduleContext, target['module']);
                return this.getStaticType(moduleId, target['name']);
            }
        }
        return null;
    };
    StaticReflector.prototype.getDecoratorParameter = function (moduleContext, expression, index) {
        if (isMetadataSymbolicCallExpression(expression) && lang_1.isPresent(expression['arguments']) &&
            expression['arguments'].length <= index + 1) {
            return this.simplify(moduleContext, expression['arguments'][index]);
        }
        return null;
    };
    StaticReflector.prototype.getPropertyMetadata = function (moduleContext, value) {
        var _this = this;
        if (lang_1.isPresent(value)) {
            var result = {};
            collection_1.StringMapWrapper.forEach(value, function (value, name) {
                var data = _this.getMemberData(moduleContext, value);
                if (lang_1.isPresent(data)) {
                    var propertyData = data.filter(function (d) { return d['kind'] == "property"; })
                        .map(function (d) { return d['directives']; })
                        .reduce(function (p, c) { return p.concat(c); }, []);
                    if (propertyData.length != 0) {
                        collection_1.StringMapWrapper.set(result, name, propertyData);
                    }
                }
            });
            return result;
        }
        return null;
    };
    // clang-format off
    StaticReflector.prototype.getMemberData = function (moduleContext, member) {
        var _this = this;
        // clang-format on
        var result = [];
        if (lang_1.isPresent(member)) {
            for (var _i = 0; _i < member.length; _i++) {
                var item = member[_i];
                result.push({
                    kind: item['__symbolic'],
                    directives: lang_1.isPresent(item['decorators']) ?
                        item['decorators']
                            .map(function (decorator) { return _this.convertKnownDecorator(moduleContext, decorator); })
                            .filter(function (d) { return lang_1.isPresent(d); }) :
                        null
                });
            }
        }
        return result;
    };
    /** @internal */
    StaticReflector.prototype.simplify = function (moduleContext, value) {
        var _this = this;
        function simplify(expression) {
            if (lang_1.isPrimitive(expression)) {
                return expression;
            }
            if (lang_1.isArray(expression)) {
                var result = [];
                for (var _i = 0, _a = expression; _i < _a.length; _i++) {
                    var item = _a[_i];
                    result.push(simplify(item));
                }
                return result;
            }
            if (lang_1.isPresent(expression)) {
                if (lang_1.isPresent(expression['__symbolic'])) {
                    switch (expression['__symbolic']) {
                        case "binop":
                            var left = simplify(expression['left']);
                            var right = simplify(expression['right']);
                            switch (expression['operator']) {
                                case '&&':
                                    return left && right;
                                case '||':
                                    return left || right;
                                case '|':
                                    return left | right;
                                case '^':
                                    return left ^ right;
                                case '&':
                                    return left & right;
                                case '==':
                                    return left == right;
                                case '!=':
                                    return left != right;
                                case '===':
                                    return left === right;
                                case '!==':
                                    return left !== right;
                                case '<':
                                    return left < right;
                                case '>':
                                    return left > right;
                                case '<=':
                                    return left <= right;
                                case '>=':
                                    return left >= right;
                                case '<<':
                                    return left << right;
                                case '>>':
                                    return left >> right;
                                case '+':
                                    return left + right;
                                case '-':
                                    return left - right;
                                case '*':
                                    return left * right;
                                case '/':
                                    return left / right;
                                case '%':
                                    return left % right;
                            }
                            return null;
                        case "pre":
                            var operand = simplify(expression['operand']);
                            switch (expression['operator']) {
                                case '+':
                                    return operand;
                                case '-':
                                    return -operand;
                                case '!':
                                    return !operand;
                                case '~':
                                    return ~operand;
                            }
                            return null;
                        case "index":
                            var indexTarget = simplify(expression['expression']);
                            var index = simplify(expression['index']);
                            if (lang_1.isPresent(indexTarget) && lang_1.isPrimitive(index))
                                return indexTarget[index];
                            return null;
                        case "select":
                            var selectTarget = simplify(expression['expression']);
                            var member = simplify(expression['member']);
                            if (lang_1.isPresent(selectTarget) && lang_1.isPrimitive(member))
                                return selectTarget[member];
                            return null;
                        case "reference":
                            var referenceModuleName = _this.normalizeModuleName(moduleContext, expression['module']);
                            var referenceModule = _this.getModuleMetadata(referenceModuleName);
                            var referenceValue = referenceModule['metadata'][expression['name']];
                            if (isClassMetadata(referenceValue)) {
                                // Convert to a pseudo type
                                return _this.getStaticType(referenceModuleName, expression['name']);
                            }
                            return _this.simplify(referenceModuleName, referenceValue);
                        case "call":
                            return null;
                    }
                    return null;
                }
                var result = {};
                collection_1.StringMapWrapper.forEach(expression, function (value, name) { result[name] = simplify(value); });
                return result;
            }
            return null;
        }
        return simplify(value);
    };
    StaticReflector.prototype.getModuleMetadata = function (module) {
        var moduleMetadata = this.metadataCache.get(module);
        if (!lang_1.isPresent(moduleMetadata)) {
            moduleMetadata = this.host.getMetadataFor(module);
            if (!lang_1.isPresent(moduleMetadata)) {
                moduleMetadata = { __symbolic: "module", module: module, metadata: {} };
            }
            this.metadataCache.set(module, moduleMetadata);
        }
        return moduleMetadata;
    };
    StaticReflector.prototype.getTypeMetadata = function (type) {
        var moduleMetadata = this.getModuleMetadata(type.moduleId);
        var result = moduleMetadata['metadata'][type.name];
        if (!lang_1.isPresent(result)) {
            result = { __symbolic: "class" };
        }
        return result;
    };
    StaticReflector.prototype.normalizeModuleName = function (from, to) {
        if (to.startsWith('.')) {
            return pathTo(from, to);
        }
        return to;
    };
    return StaticReflector;
})();
exports.StaticReflector = StaticReflector;
function isMetadataSymbolicCallExpression(expression) {
    return !lang_1.isPrimitive(expression) && !lang_1.isArray(expression) && expression['__symbolic'] == 'call';
}
function isMetadataSymbolicReferenceExpression(expression) {
    return !lang_1.isPrimitive(expression) && !lang_1.isArray(expression) &&
        expression['__symbolic'] == 'reference';
}
function isClassMetadata(expression) {
    return !lang_1.isPrimitive(expression) && !lang_1.isArray(expression) && expression['__symbolic'] == 'class';
}
function splitPath(path) {
    return path.split(/\/|\\/g);
}
function resolvePath(pathParts) {
    var result = [];
    collection_1.ListWrapper.forEachWithIndex(pathParts, function (part, index) {
        switch (part) {
            case '':
            case '.':
                if (index > 0)
                    return;
                break;
            case '..':
                if (index > 0 && result.length != 0)
                    result.pop();
                return;
        }
        result.push(part);
    });
    return result.join('/');
}
function pathTo(from, to) {
    var result = to;
    if (to.startsWith('.')) {
        var fromParts = splitPath(from);
        fromParts.pop(); // remove the file name.
        var toParts = splitPath(to);
        result = resolvePath(fromParts.concat(toParts));
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX3JlZmxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9zdGF0aWNfcmVmbGVjdG9yLnRzIl0sIm5hbWVzIjpbIlN0YXRpY1R5cGUiLCJTdGF0aWNUeXBlLmNvbnN0cnVjdG9yIiwiU3RhdGljUmVmbGVjdG9yIiwiU3RhdGljUmVmbGVjdG9yLmNvbnN0cnVjdG9yIiwiU3RhdGljUmVmbGVjdG9yLmdldFN0YXRpY1R5cGUiLCJTdGF0aWNSZWZsZWN0b3IuYW5ub3RhdGlvbnMiLCJTdGF0aWNSZWZsZWN0b3IucHJvcE1ldGFkYXRhIiwiU3RhdGljUmVmbGVjdG9yLnBhcmFtZXRlcnMiLCJTdGF0aWNSZWZsZWN0b3IuaW5pdGlhbGl6ZUNvbnZlcnNpb25NYXAiLCJTdGF0aWNSZWZsZWN0b3IuY29udmVydEtub3duRGVjb3JhdG9yIiwiU3RhdGljUmVmbGVjdG9yLmdldERlY29yYXRvclR5cGUiLCJTdGF0aWNSZWZsZWN0b3IuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyIiwiU3RhdGljUmVmbGVjdG9yLmdldFByb3BlcnR5TWV0YWRhdGEiLCJTdGF0aWNSZWZsZWN0b3IuZ2V0TWVtYmVyRGF0YSIsIlN0YXRpY1JlZmxlY3Rvci5zaW1wbGlmeSIsIlN0YXRpY1JlZmxlY3Rvci5zaW1wbGlmeS5zaW1wbGlmeSIsIlN0YXRpY1JlZmxlY3Rvci5nZXRNb2R1bGVNZXRhZGF0YSIsIlN0YXRpY1JlZmxlY3Rvci5nZXRUeXBlTWV0YWRhdGEiLCJTdGF0aWNSZWZsZWN0b3Iubm9ybWFsaXplTW9kdWxlTmFtZSIsImlzTWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uIiwiaXNNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbiIsImlzQ2xhc3NNZXRhZGF0YSIsInNwbGl0UGF0aCIsInJlc29sdmVQYXRoIiwicGF0aFRvIl0sIm1hcHBpbmdzIjoiQUFBQSwyQkFBNEMsZ0NBQWdDLENBQUMsQ0FBQTtB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RUEsRUFBRUEsRUFBQ0EsV0FBV0EsRUFBRUEsRUFBRUEsQ0FBQ0EsV0FBV0EsRUFBRUEsS0FBS0EsRUFBRUEsRUFBRUEsQ0FBQ0EsS0FBS0EsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDL0VBLENBQUNBLENBQUNBLENBQUNBO1FBQ0hBLGFBQWFBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLGFBQWFBLEVBQUVBLGlCQUFpQkEsQ0FBQ0EsRUFDcERBLFVBQUNBLGFBQWFBLEVBQUVBLFVBQVVBLElBQUtBLE9BQUFBLElBQUlBLGtDQUF1QkEsQ0FDdERBLEtBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsYUFBYUEsRUFBRUEsVUFBVUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFEOUJBLENBQzhCQSxDQUFDQSxDQUFDQTtRQUNqRkEsYUFBYUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsYUFBYUEsRUFBRUEsY0FBY0EsQ0FBQ0EsRUFDakRBLFVBQUNBLGFBQWFBLEVBQUVBLFVBQVVBLElBQUtBLE9BQUFBLElBQUlBLCtCQUFvQkEsQ0FDbkRBLEtBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsYUFBYUEsRUFBRUEsVUFBVUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFEOUJBLENBQzhCQSxDQUFDQSxDQUFDQTtRQUNqRkEsYUFBYUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsYUFBYUEsRUFBRUEsY0FBY0EsQ0FBQ0EsRUFDakRBLFVBQUNBLGFBQWFBLEVBQUVBLFVBQVVBLElBQUtBLE9BQUFBLElBQUlBLCtCQUFvQkEsQ0FDbkRBLEtBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsYUFBYUEsRUFBRUEsVUFBVUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFEOUJBLENBQzhCQSxDQUFDQSxDQUFDQTtRQUNqRkEsYUFBYUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsYUFBYUEsRUFB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LEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDMUJBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDeENBLE1BQU1BLENBQUNBLENBQUNBLFVBQVVBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO3dCQUNqQ0EsS0FBS0EsT0FBT0E7NEJBQ1ZBLElBQUlBLElBQUlBLEdBQUdBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBOzRCQUN4Q0EsSUFBSUEsS0FBS0EsR0FBR0EsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBQzFDQSxNQUFNQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQ0FDL0JBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLEtBQUtBO29DQUNSQSxNQUFNQSxDQUFDQSxJQUFJQSxLQUFLQSxLQUFLQSxDQUFDQTtnQ0FDeEJBLEtBQUtBLEtBQUtBO29DQUNSQSxNQUFNQSxDQUFDQSxJQUFJQSxLQUFLQSxLQUFLQSxDQUFDQTtnQ0FDeEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTs0QkFDeEJBLENBQUNBOzRCQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTt3QkFDZEEsS0FBS0EsS0FBS0E7NEJBQ1JBLElBQUlBLE9BQU9BLEdBQUdB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QUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtBQUMxQkEsQ0FBQ0E7QUFFRCxnQkFBZ0IsSUFBWSxFQUFFLEVBQVU7SUFDdENDLElBQUlBLE1BQU1BLEdBQUdBLEVBQUVBLENBQUNBO0lBQ2hCQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxVQUFVQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN2QkEsSUFBSUEsU0FBU0EsR0FBR0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDaENBLFNBQVNBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBLENBQUVBLHdCQUF3QkE7UUFDMUNBLElBQUlBLE9BQU9BLEdBQUdBLFNBQVNBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO1FBQzVCQSxNQUFNQSxHQUFHQSxXQUFXQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNsREEsQ0FBQ0E7SUFDREEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7QUFDaEJBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7XG4gIGlzQXJyYXksXG4gIGlzQmxhbmssXG4gIGlzTnVtYmVyLFxuICBpc1ByZXNlbnQsXG4gIGlzUHJpbWl0aXZlLFxuICBpc1N0cmluZyxcbiAgVHlwZVxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtcbiAgQXR0cmlidXRlTWV0YWRhdGEsXG4gIERpcmVjdGl2ZU1ldGFkYXRhLFxuICBDb21wb25lbnRNZXRhZGF0YSxcbiAgQ29udGVudENoaWxkcmVuTWV0YWRhdGEsXG4gIENvbnRlbnRDaGlsZE1ldGFkYXRhLFxuICBJbnB1dE1ldGFkYXRhLFxuICBIb3N0QmluZGluZ01ldGFkYXRhLFxuICBIb3N0TGlzdGVuZXJNZXRhZGF0YSxcbiAgT3V0cHV0TWV0YWRhdGEsXG4gIFBpcGVNZXRhZGF0YSxcbiAgVmlld01ldGFkYXRhLFxuICBWaWV3Q2hpbGRNZXRhZGF0YSxcbiAgVmlld0NoaWxkcmVuTWV0YWRhdGEsXG4gIFZpZXdRdWVyeU1ldGFkYXRhLFxuICBRdWVyeU1ldGFkYXRhLFxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YSc7XG5cbi8qKlxuICogVGhlIGhvc3Qgb2YgdGhlIHN0YXRpYyByZXNvbHZlciBpcyBleHBlY3RlZCB0byBiZSBhYmxlIHRvIHByb3ZpZGUgbW9kdWxlIG1ldGFkYXRhIGluIHRoZSBmb3JtIG9mXG4gKiBNb2R1bGVNZXRhZGF0YS4gQW5ndWxhciAyIENMSSB3aWxsIHByb2R1Y2UgdGhpcyBtZXRhZGF0YSBmb3IgYSBtb2R1bGUgd2hlbmV2ZXIgYSAuZC50cyBmaWxlcyBpc1xuICogcHJvZHVjZWQgYW5kIHRoZSBtb2R1bGUgaGFzIGV4cG9ydGVkIHZhcmlhYmxlcyBvciBjbGFzc2VzIHdpdGggZGVjb3JhdG9ycy4gTW9kdWxlIG1ldGFkYXRhIGNhblxuICogYWxzbyBiZSBwcm9kdWNlZCBkaXJlY3RseSBmcm9tIFR5cGVTY3JpcHQgc291cmNlcyBieSB1c2luZyBNZXRhZGF0YUNvbGxlY3RvciBpbiB0b29scy9tZXRhZGF0YS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdGF0aWNSZWZsZWN0b3JIb3N0IHtcbiAgLyoqXG4gICAqICBSZXR1cm4gYSBNb2R1bGVNZXRhZGF0YSBmb3IgdGhlIGdpdmUgbW9kdWxlLlxuICAgKlxuICAgKiBAcGFyYW0gbW9kdWxlSWQgaXMgYSBzdHJpbmcgaWRlbnRpZmllciBmb3IgYSBtb2R1bGUgaW4gdGhlIGZvcm0gdGhhdCB3b3VsZCBleHBlY3RlZCBpbiBhXG4gICAqICAgICAgICAgICAgICAgICBtb2R1bGUgaW1wb3J0IG9mIGFuIGltcG9ydCBzdGF0ZW1lbnQuXG4gICAqIEByZXR1cm5zIHRoZSBtZXRhZGF0YSBmb3IgdGhlIGdpdmVuIG1vZHVsZS5cbiAgICovXG4gIGdldE1ldGFkYXRhRm9yKG1vZHVsZUlkOiBzdHJpbmcpOiB7W2tleTogc3RyaW5nXTogYW55fTtcbn1cblxuLyoqXG4gKiBBIHRva2VuIHJlcHJlc2VudGluZyB0aGUgYSByZWZlcmVuY2UgdG8gYSBzdGF0aWMgdHlwZS5cbiAqXG4gKiBUaGlzIHRva2VuIGlzIHVuaXF1ZSBmb3IgYSBtb2R1bGVJZCBhbmQgbmFtZSBhbmQgY2FuIGJlIHVzZWQgYXMgYSBoYXNoIHRhYmxlIGtleS5cbiAqL1xuZXhwb3J0IGNsYXNzIFN0YXRpY1R5cGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbW9kdWxlSWQ6IHN0cmluZywgcHVibGljIG5hbWU6IHN0cmluZykge31cbn1cblxuLyoqXG4gKiBBIHN0YXRpYyByZWZsZWN0b3IgaW1wbGVtZW50cyBlbm91Z2ggb2YgdGhlIFJlZmxlY3RvciBBUEkgdGhhdCBpcyBuZWNlc3NhcnkgdG8gY29tcGlsZVxuICogdGVtcGxhdGVzIHN0YXRpY2FsbHkuXG4gKi9cbmV4cG9ydCBjbGFzcyBTdGF0aWNSZWZsZWN0b3Ige1xuICBwcml2YXRlIHR5cGVDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBTdGF0aWNUeXBlPigpO1xuICBwcml2YXRlIGFubm90YXRpb25DYWNoZSA9IG5ldyBNYXA8U3RhdGljVHlwZSwgYW55W10+KCk7XG4gIHByaXZhdGUgcHJvcGVydHlDYWNoZSA9IG5ldyBNYXA8U3RhdGljVHlwZSwge1trZXk6IHN0cmluZ106IGFueX0+KCk7XG4gIHByaXZhdGUgcGFyYW1ldGVyQ2FjaGUgPSBuZXcgTWFwPFN0YXRpY1R5cGUsIGFueVtdPigpO1xuICBwcml2YXRlIG1ldGFkYXRhQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywge1trZXk6IHN0cmluZ106IGFueX0+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBob3N0OiBTdGF0aWNSZWZsZWN0b3JIb3N0KSB7IHRoaXMuaW5pdGlhbGl6ZUNvbnZlcnNpb25NYXAoKTsgfVxuXG4gIC8qKlxuICAgKiBnZXRTdGF0aWN0eXBlIHByb2R1Y2VzIGEgVHlwZSB3aG9zZSBtZXRhZGF0YSBpcyBrbm93biBidXQgd2hvc2UgaW1wbGVtZW50YXRpb24gaXMgbm90IGxvYWRlZC5cbiAgICogQWxsIHR5cGVzIHBhc3NlZCB0byB0aGUgU3RhdGljUmVzb2x2ZXIgc2hvdWxkIGJlIHBzZXVkby10eXBlcyByZXR1cm5lZCBieSB0aGlzIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIG1vZHVsZUlkIHRoZSBtb2R1bGUgaWRlbnRpZmllciBhcyB3b3VsZCBiZSBwYXNzZWQgdG8gYW4gaW1wb3J0IHN0YXRlbWVudC5cbiAgICogQHBhcmFtIG5hbWUgdGhlIG5hbWUgb2YgdGhlIHR5cGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0U3RhdGljVHlwZShtb2R1bGVJZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcpOiBTdGF0aWNUeXBlIHtcbiAgICBsZXQga2V5ID0gYFwiJHttb2R1bGVJZH1cIi4ke25hbWV9YDtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy50eXBlQ2FjaGUuZ2V0KGtleSk7XG4gICAgaWYgKCFpc1ByZXNlbnQocmVzdWx0KSkge1xuICAgICAgcmVzdWx0ID0gbmV3IFN0YXRpY1R5cGUobW9kdWxlSWQsIG5hbWUpO1xuICAgICAgdGhpcy50eXBlQ2FjaGUuc2V0KGtleSwgcmVzdWx0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHB1YmxpYyBhbm5vdGF0aW9ucyh0eXBlOiBTdGF0aWNUeXBlKTogYW55W10ge1xuICAgIGxldCBhbm5vdGF0aW9ucyA9IHRoaXMuYW5ub3RhdGlvbkNhY2hlLmdldCh0eXBlKTtcbiAgICBpZiAoIWlzUHJlc2VudChhbm5vdGF0aW9ucykpIHtcbiAgICAgIGxldCBjbGFzc01ldGFkYXRhID0gdGhpcy5nZXRUeXBlTWV0YWRhdGEodHlwZSk7XG4gICAgICBpZiAoaXNQcmVzZW50KGNsYXNzTWV0YWRhdGFbJ2RlY29yYXRvcnMnXSkpIHtcbiAgICAgICAgYW5ub3RhdGlvbnMgPSAoPGFueVtdPmNsYXNzTWV0YWRhdGFbJ2RlY29yYXRvcnMnXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChkZWNvcmF0b3IgPT4gdGhpcy5jb252ZXJ0S25vd25EZWNvcmF0b3IodHlwZS5tb2R1bGVJZCwgZGVjb3JhdG9yKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihkZWNvcmF0b3IgPT4gaXNQcmVzZW50KGRlY29yYXRvcikpO1xuICAgICAgfVxuICAgICAgdGhpcy5hbm5vdGF0aW9uQ2FjaGUuc2V0KHR5cGUsIGFubm90YXRpb25zKTtcbiAgICB9XG4gICAgcmV0dXJuIGFubm90YXRpb25zO1xuICB9XG5cbiAgcHVibGljIHByb3BNZXRhZGF0YSh0eXBlOiBTdGF0aWNUeXBlKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIGxldCBwcm9wTWV0YWRhdGEgPSB0aGlzLnByb3BlcnR5Q2FjaGUuZ2V0KHR5cGUpO1xuICAgIGlmICghaXNQcmVzZW50KHByb3BNZXRhZGF0YSkpIHtcbiAgICAgIGxldCBjbGFzc01ldGFkYXRhID0gdGhpcy5nZXRUeXBlTWV0YWRhdGEodHlwZSk7XG4gICAgICBwcm9wTWV0YWRhdGEgPSB0aGlzLmdldFByb3BlcnR5TWV0YWRhdGEodHlwZS5tb2R1bGVJZCwgY2xhc3NNZXRhZGF0YVsnbWVtYmVycyddKTtcbiAgICAgIHRoaXMucHJvcGVydHlDYWNoZS5zZXQodHlwZSwgcHJvcE1ldGFkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb3BNZXRhZGF0YTtcbiAgfVxuXG4gIHB1YmxpYyBwYXJhbWV0ZXJzKHR5cGU6IFN0YXRpY1R5cGUpOiBhbnlbXSB7XG4gICAgbGV0IHBhcmFtZXRlcnMgPSB0aGlzLnBhcmFtZXRlckNhY2hlLmdldCh0eXBlKTtcbiAgICBpZiAoIWlzUHJlc2VudChwYXJhbWV0ZXJzKSkge1xuICAgICAgbGV0IGNsYXNzTWV0YWRhdGEgPSB0aGlzLmdldFR5cGVNZXRhZGF0YSh0eXBlKTtcbiAgICAgIGxldCBjdG9yRGF0YSA9IGNsYXNzTWV0YWRhdGFbJ21lbWJlcnMnXVsnX19jdG9yX18nXTtcbiAgICAgIGlmIChpc1ByZXNlbnQoY3RvckRhdGEpKSB7XG4gICAgICAgIGxldCBjdG9yID0gKDxhbnlbXT5jdG9yRGF0YSkuZmluZChhID0+IGFbJ19fc3ltYm9saWMnXSA9PT0gJ2NvbnN0cnVjdG9yJyk7XG4gICAgICAgIHBhcmFtZXRlcnMgPSB0aGlzLnNpbXBsaWZ5KHR5cGUubW9kdWxlSWQsIGN0b3JbJ3BhcmFtZXRlcnMnXSk7XG4gICAgICAgIHRoaXMucGFyYW1ldGVyQ2FjaGUuc2V0KHR5cGUsIHBhcmFtZXRlcnMpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgfVxuXG4gIHByaXZhdGUgY29udmVyc2lvbk1hcCA9IG5ldyBNYXA8U3RhdGljVHlwZSwgKG1vZHVsZUNvbnRleHQ6IHN0cmluZywgZXhwcmVzc2lvbjogYW55KSA9PiBhbnk+KCk7XG4gIHByaXZhdGUgaW5pdGlhbGl6ZUNvbnZlcnNpb25NYXAoKSB7XG4gICAgbGV0IGNvcmVfbWV0YWRhdGEgPSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEnO1xuICAgIGxldCBjb252ZXJzaW9uTWFwID0gdGhpcy5jb252ZXJzaW9uTWFwO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnRGlyZWN0aXZlJyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwMCA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1ByZXNlbnQocDApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHAwID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERpcmVjdGl2ZU1ldGFkYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IHAwWydzZWxlY3RvciddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHAwWydpbnB1dHMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0czogcDBbJ291dHB1dHMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzOiBwMFsnZXZlbnRzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGhvc3Q6IHAwWydob3N0J10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRpbmdzOiBwMFsnYmluZGluZ3MnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzOiBwMFsncHJvdmlkZXJzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydEFzOiBwMFsnZXhwb3J0QXMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcmllczogcDBbJ3F1ZXJpZXMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnQ29tcG9uZW50JyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwMCA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1ByZXNlbnQocDApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHAwID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IENvbXBvbmVudE1ldGFkYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IHAwWydzZWxlY3RvciddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHAwWydpbnB1dHMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0czogcDBbJ291dHB1dHMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogcDBbJ3Byb3BlcnRpZXMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzOiBwMFsnZXZlbnRzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGhvc3Q6IHAwWydob3N0J10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydEFzOiBwMFsnZXhwb3J0QXMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlSWQ6IHAwWydtb2R1bGVJZCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBiaW5kaW5nczogcDBbJ2JpbmRpbmdzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyczogcDBbJ3Byb3ZpZGVycyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3QmluZGluZ3M6IHAwWyd2aWV3QmluZGluZ3MnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmlld1Byb3ZpZGVyczogcDBbJ3ZpZXdQcm92aWRlcnMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBwMFsnY2hhbmdlRGV0ZWN0aW9uJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJpZXM6IHAwWydxdWVyaWVzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBwMFsndGVtcGxhdGVVcmwnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHAwWyd0ZW1wbGF0ZSddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZVVybHM6IHAwWydzdHlsZVVybHMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVzOiBwMFsnc3R5bGVzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGl2ZXM6IHAwWydkaXJlY3RpdmVzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBpcGVzOiBwMFsncGlwZXMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZW5jYXBzdWxhdGlvbjogcDBbJ2VuY2Fwc3VsYXRpb24nXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdJbnB1dCcpLFxuICAgICAgICAgICAgICAgICAgICAgIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiBuZXcgSW5wdXRNZXRhZGF0YShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ091dHB1dCcpLFxuICAgICAgICAgICAgICAgICAgICAgIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiBuZXcgT3V0cHV0TWV0YWRhdGEoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApKSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdWaWV3JyksIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiB7XG4gICAgICBsZXQgcDAgPSB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKTtcbiAgICAgIGlmICghaXNQcmVzZW50KHAwKSkge1xuICAgICAgICBwMCA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBWaWV3TWV0YWRhdGEoe1xuICAgICAgICB0ZW1wbGF0ZVVybDogcDBbJ3RlbXBsYXRlVXJsJ10sXG4gICAgICAgIHRlbXBsYXRlOiBwMFsndGVtcGxhdGUnXSxcbiAgICAgICAgZGlyZWN0aXZlczogcDBbJ2RpcmVjdGl2ZXMnXSxcbiAgICAgICAgcGlwZXM6IHAwWydwaXBlcyddLFxuICAgICAgICBlbmNhcHN1bGF0aW9uOiBwMFsnZW5jYXBzdWxhdGlvbiddLFxuICAgICAgICBzdHlsZXM6IHAwWydzdHlsZXMnXSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnQXR0cmlidXRlJyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IG5ldyBBdHRyaWJ1dGVNZXRhZGF0YShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ1F1ZXJ5JyksIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiB7XG4gICAgICBsZXQgcDAgPSB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKTtcbiAgICAgIGxldCBwMSA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDEpO1xuICAgICAgaWYgKCFpc1ByZXNlbnQocDEpKSB7XG4gICAgICAgIHAxID0ge307XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFF1ZXJ5TWV0YWRhdGEocDAsIHtkZXNjZW5kYW50czogcDEuZGVzY2VuZGFudHMsIGZpcnN0OiBwMS5maXJzdH0pO1xuICAgIH0pO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnQ29udGVudENoaWxkcmVuJyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IG5ldyBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ0NvbnRlbnRDaGlsZCcpLFxuICAgICAgICAgICAgICAgICAgICAgIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiBuZXcgQ29udGVudENoaWxkTWV0YWRhdGEoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApKSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdWaWV3Q2hpbGRyZW4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT4gbmV3IFZpZXdDaGlsZHJlbk1ldGFkYXRhKFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSkpO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnVmlld0NoaWxkJyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IG5ldyBWaWV3Q2hpbGRNZXRhZGF0YShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ1ZpZXdRdWVyeScpLFxuICAgICAgICAgICAgICAgICAgICAgIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcDAgPSB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwMSA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1ByZXNlbnQocDEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHAxID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFZpZXdRdWVyeU1ldGFkYXRhKHAwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NlbmRhbnRzOiBwMVsnZGVzY2VuZGFudHMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3Q6IHAxWydmaXJzdCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdQaXBlJyksIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiB7XG4gICAgICBsZXQgcDAgPSB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKTtcbiAgICAgIGlmICghaXNQcmVzZW50KHAwKSkge1xuICAgICAgICBwMCA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBQaXBlTWV0YWRhdGEoe1xuICAgICAgICBuYW1lOiBwMFsnbmFtZSddLFxuICAgICAgICBwdXJlOiBwMFsncHVyZSddLFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdIb3N0QmluZGluZycpLFxuICAgICAgICAgICAgICAgICAgICAgIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiBuZXcgSG9zdEJpbmRpbmdNZXRhZGF0YShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ0hvc3RMaXN0ZW5lcicpLFxuICAgICAgICAgICAgICAgICAgICAgIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiBuZXcgSG9zdExpc3RlbmVyTWV0YWRhdGEoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAxKSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0S25vd25EZWNvcmF0b3IobW9kdWxlQ29udGV4dDogc3RyaW5nLCBleHByZXNzaW9uOiB7W2tleTogc3RyaW5nXTogYW55fSk6IGFueSB7XG4gICAgbGV0IGNvbnZlcnRlciA9IHRoaXMuY29udmVyc2lvbk1hcC5nZXQodGhpcy5nZXREZWNvcmF0b3JUeXBlKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pKTtcbiAgICBpZiAoaXNQcmVzZW50KGNvbnZlcnRlcikpIHJldHVybiBjb252ZXJ0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIGdldERlY29yYXRvclR5cGUobW9kdWxlQ29udGV4dDogc3RyaW5nLCBleHByZXNzaW9uOiB7W2tleTogc3RyaW5nXTogYW55fSk6IFN0YXRpY1R5cGUge1xuICAgIGlmIChpc01ldGFkYXRhU3ltYm9saWNDYWxsRXhwcmVzc2lvbihleHByZXNzaW9uKSkge1xuICAgICAgbGV0IHRhcmdldCA9IGV4cHJlc3Npb25bJ2V4cHJlc3Npb24nXTtcbiAgICAgIGlmIChpc01ldGFkYXRhU3ltYm9saWNSZWZlcmVuY2VFeHByZXNzaW9uKHRhcmdldCkpIHtcbiAgICAgICAgbGV0IG1vZHVsZUlkID0gdGhpcy5ub3JtYWxpemVNb2R1bGVOYW1lKG1vZHVsZUNvbnRleHQsIHRhcmdldFsnbW9kdWxlJ10pO1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTdGF0aWNUeXBlKG1vZHVsZUlkLCB0YXJnZXRbJ25hbWUnXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dDogc3RyaW5nLCBleHByZXNzaW9uOiB7W2tleTogc3RyaW5nXTogYW55fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXg6IG51bWJlcik6IGFueSB7XG4gICAgaWYgKGlzTWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uKGV4cHJlc3Npb24pICYmIGlzUHJlc2VudChleHByZXNzaW9uWydhcmd1bWVudHMnXSkgJiZcbiAgICAgICAgKDxhbnlbXT5leHByZXNzaW9uWydhcmd1bWVudHMnXSkubGVuZ3RoIDw9IGluZGV4ICsgMSkge1xuICAgICAgcmV0dXJuIHRoaXMuc2ltcGxpZnkobW9kdWxlQ29udGV4dCwgKDxhbnlbXT5leHByZXNzaW9uWydhcmd1bWVudHMnXSlbaW5kZXhdKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIGdldFByb3BlcnR5TWV0YWRhdGEobW9kdWxlQ29udGV4dDogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtba2V5OiBzdHJpbmddOiBhbnl9KToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIGlmIChpc1ByZXNlbnQodmFsdWUpKSB7XG4gICAgICBsZXQgcmVzdWx0ID0ge307XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2godmFsdWUsICh2YWx1ZSwgbmFtZSkgPT4ge1xuICAgICAgICBsZXQgZGF0YSA9IHRoaXMuZ2V0TWVtYmVyRGF0YShtb2R1bGVDb250ZXh0LCB2YWx1ZSk7XG4gICAgICAgIGlmIChpc1ByZXNlbnQoZGF0YSkpIHtcbiAgICAgICAgICBsZXQgcHJvcGVydHlEYXRhID0gZGF0YS5maWx0ZXIoZCA9PiBkWydraW5kJ10gPT0gXCJwcm9wZXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChkID0+IGRbJ2RpcmVjdGl2ZXMnXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZWR1Y2UoKHAsIGMpID0+ICg8YW55W10+cCkuY29uY2F0KDxhbnlbXT5jKSwgW10pO1xuICAgICAgICAgIGlmIChwcm9wZXJ0eURhdGEubGVuZ3RoICE9IDApIHtcbiAgICAgICAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJlc3VsdCwgbmFtZSwgcHJvcGVydHlEYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBjbGFuZy1mb3JtYXQgb2ZmXG4gIHByaXZhdGUgZ2V0TWVtYmVyRGF0YShtb2R1bGVDb250ZXh0OiBzdHJpbmcsIG1lbWJlcjogeyBba2V5OiBzdHJpbmddOiBhbnkgfVtdKTogeyBba2V5OiBzdHJpbmddOiBhbnkgfVtdIHtcbiAgICAvLyBjbGFuZy1mb3JtYXQgb25cbiAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgaWYgKGlzUHJlc2VudChtZW1iZXIpKSB7XG4gICAgICBmb3IgKGxldCBpdGVtIG9mIG1lbWJlcikge1xuICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAga2luZDogaXRlbVsnX19zeW1ib2xpYyddLFxuICAgICAgICAgIGRpcmVjdGl2ZXM6XG4gICAgICAgICAgICAgIGlzUHJlc2VudChpdGVtWydkZWNvcmF0b3JzJ10pID9cbiAgICAgICAgICAgICAgICAgICg8YW55W10+aXRlbVsnZGVjb3JhdG9ycyddKVxuICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZGVjb3JhdG9yID0+IHRoaXMuY29udmVydEtub3duRGVjb3JhdG9yKG1vZHVsZUNvbnRleHQsIGRlY29yYXRvcikpXG4gICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihkID0+IGlzUHJlc2VudChkKSkgOlxuICAgICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIHNpbXBsaWZ5KG1vZHVsZUNvbnRleHQ6IHN0cmluZywgdmFsdWU6IGFueSk6IGFueSB7XG4gICAgbGV0IF90aGlzID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIHNpbXBsaWZ5KGV4cHJlc3Npb246IGFueSk6IGFueSB7XG4gICAgICBpZiAoaXNQcmltaXRpdmUoZXhwcmVzc2lvbikpIHtcbiAgICAgICAgcmV0dXJuIGV4cHJlc3Npb247XG4gICAgICB9XG4gICAgICBpZiAoaXNBcnJheShleHByZXNzaW9uKSkge1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IGl0ZW0gb2YoPGFueT5leHByZXNzaW9uKSkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHNpbXBsaWZ5KGl0ZW0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudChleHByZXNzaW9uKSkge1xuICAgICAgICBpZiAoaXNQcmVzZW50KGV4cHJlc3Npb25bJ19fc3ltYm9saWMnXSkpIHtcbiAgICAgICAgICBzd2l0Y2ggKGV4cHJlc3Npb25bJ19fc3ltYm9saWMnXSkge1xuICAgICAgICAgICAgY2FzZSBcImJpbm9wXCI6XG4gICAgICAgICAgICAgIGxldCBsZWZ0ID0gc2ltcGxpZnkoZXhwcmVzc2lvblsnbGVmdCddKTtcbiAgICAgICAgICAgICAgbGV0IHJpZ2h0ID0gc2ltcGxpZnkoZXhwcmVzc2lvblsncmlnaHQnXSk7XG4gICAgICAgICAgICAgIHN3aXRjaCAoZXhwcmVzc2lvblsnb3BlcmF0b3InXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJyYmJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICYmIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJ3x8JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IHx8IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJ3wnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgfCByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICdeJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IF4gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAmIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJz09JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ID09IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJyE9JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICE9IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJz09PSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnIT09JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICE9PSByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IDwgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA+IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJzw9JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IDw9IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJz49JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ID49IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJzw8JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IDw8IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJz4+JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ID4+IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJysnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgKyByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IC0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnKic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAqIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJy8nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgLyByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICclJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICUgcmlnaHQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjYXNlIFwicHJlXCI6XG4gICAgICAgICAgICAgIGxldCBvcGVyYW5kID0gc2ltcGxpZnkoZXhwcmVzc2lvblsnb3BlcmFuZCddKTtcbiAgICAgICAgICAgICAgc3dpdGNoIChleHByZXNzaW9uWydvcGVyYXRvciddKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnKyc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gb3BlcmFuZDtcbiAgICAgICAgICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiAtb3BlcmFuZDtcbiAgICAgICAgICAgICAgICBjYXNlICchJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiAhb3BlcmFuZDtcbiAgICAgICAgICAgICAgICBjYXNlICd+JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiB+b3BlcmFuZDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNhc2UgXCJpbmRleFwiOlxuICAgICAgICAgICAgICBsZXQgaW5kZXhUYXJnZXQgPSBzaW1wbGlmeShleHByZXNzaW9uWydleHByZXNzaW9uJ10pO1xuICAgICAgICAgICAgICBsZXQgaW5kZXggPSBzaW1wbGlmeShleHByZXNzaW9uWydpbmRleCddKTtcbiAgICAgICAgICAgICAgaWYgKGlzUHJlc2VudChpbmRleFRhcmdldCkgJiYgaXNQcmltaXRpdmUoaW5kZXgpKSByZXR1cm4gaW5kZXhUYXJnZXRbaW5kZXhdO1xuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNhc2UgXCJzZWxlY3RcIjpcbiAgICAgICAgICAgICAgbGV0IHNlbGVjdFRhcmdldCA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ2V4cHJlc3Npb24nXSk7XG4gICAgICAgICAgICAgIGxldCBtZW1iZXIgPSBzaW1wbGlmeShleHByZXNzaW9uWydtZW1iZXInXSk7XG4gICAgICAgICAgICAgIGlmIChpc1ByZXNlbnQoc2VsZWN0VGFyZ2V0KSAmJiBpc1ByaW1pdGl2ZShtZW1iZXIpKSByZXR1cm4gc2VsZWN0VGFyZ2V0W21lbWJlcl07XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY2FzZSBcInJlZmVyZW5jZVwiOlxuICAgICAgICAgICAgICBsZXQgcmVmZXJlbmNlTW9kdWxlTmFtZSA9XG4gICAgICAgICAgICAgICAgICBfdGhpcy5ub3JtYWxpemVNb2R1bGVOYW1lKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb25bJ21vZHVsZSddKTtcbiAgICAgICAgICAgICAgbGV0IHJlZmVyZW5jZU1vZHVsZSA9IF90aGlzLmdldE1vZHVsZU1ldGFkYXRhKHJlZmVyZW5jZU1vZHVsZU5hbWUpO1xuICAgICAgICAgICAgICBsZXQgcmVmZXJlbmNlVmFsdWUgPSByZWZlcmVuY2VNb2R1bGVbJ21ldGFkYXRhJ11bZXhwcmVzc2lvblsnbmFtZSddXTtcbiAgICAgICAgICAgICAgaWYgKGlzQ2xhc3NNZXRhZGF0YShyZWZlcmVuY2VWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRvIGEgcHNldWRvIHR5cGVcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZ2V0U3RhdGljVHlwZShyZWZlcmVuY2VNb2R1bGVOYW1lLCBleHByZXNzaW9uWyduYW1lJ10pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBfdGhpcy5zaW1wbGlmeShyZWZlcmVuY2VNb2R1bGVOYW1lLCByZWZlcmVuY2VWYWx1ZSk7XG4gICAgICAgICAgICBjYXNlIFwiY2FsbFwiOlxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJlc3VsdCA9IHt9O1xuICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goZXhwcmVzc2lvbiwgKHZhbHVlLCBuYW1lKSA9PiB7IHJlc3VsdFtuYW1lXSA9IHNpbXBsaWZ5KHZhbHVlKTsgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gc2ltcGxpZnkodmFsdWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRNb2R1bGVNZXRhZGF0YShtb2R1bGU6IHN0cmluZyk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBsZXQgbW9kdWxlTWV0YWRhdGEgPSB0aGlzLm1ldGFkYXRhQ2FjaGUuZ2V0KG1vZHVsZSk7XG4gICAgaWYgKCFpc1ByZXNlbnQobW9kdWxlTWV0YWRhdGEpKSB7XG4gICAgICBtb2R1bGVNZXRhZGF0YSA9IHRoaXMuaG9zdC5nZXRNZXRhZGF0YUZvcihtb2R1bGUpO1xuICAgICAgaWYgKCFpc1ByZXNlbnQobW9kdWxlTWV0YWRhdGEpKSB7XG4gICAgICAgIG1vZHVsZU1ldGFkYXRhID0ge19fc3ltYm9saWM6IFwibW9kdWxlXCIsIG1vZHVsZTogbW9kdWxlLCBtZXRhZGF0YToge319O1xuICAgICAgfVxuICAgICAgdGhpcy5tZXRhZGF0YUNhY2hlLnNldChtb2R1bGUsIG1vZHVsZU1ldGFkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIG1vZHVsZU1ldGFkYXRhO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRUeXBlTWV0YWRhdGEodHlwZTogU3RhdGljVHlwZSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBsZXQgbW9kdWxlTWV0YWRhdGEgPSB0aGlzLmdldE1vZHVsZU1ldGFkYXRhKHR5cGUubW9kdWxlSWQpO1xuICAgIGxldCByZXN1bHQgPSBtb2R1bGVNZXRhZGF0YVsnbWV0YWRhdGEnXVt0eXBlLm5hbWVdO1xuICAgIGlmICghaXNQcmVzZW50KHJlc3VsdCkpIHtcbiAgICAgIHJlc3VsdCA9IHtfX3N5bWJvbGljOiBcImNsYXNzXCJ9O1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBub3JtYWxpemVNb2R1bGVOYW1lKGZyb206IHN0cmluZywgdG86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHRvLnN0YXJ0c1dpdGgoJy4nKSkge1xuICAgICAgcmV0dXJuIHBhdGhUbyhmcm9tLCB0byk7XG4gICAgfVxuICAgIHJldHVybiB0bztcbiAgfVxufVxuXG5mdW5jdGlvbiBpc01ldGFkYXRhU3ltYm9saWNDYWxsRXhwcmVzc2lvbihleHByZXNzaW9uOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuICFpc1ByaW1pdGl2ZShleHByZXNzaW9uKSAmJiAhaXNBcnJheShleHByZXNzaW9uKSAmJiBleHByZXNzaW9uWydfX3N5bWJvbGljJ10gPT0gJ2NhbGwnO1xufVxuXG5mdW5jdGlvbiBpc01ldGFkYXRhU3ltYm9saWNSZWZlcmVuY2VFeHByZXNzaW9uKGV4cHJlc3Npb246IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gIWlzUHJpbWl0aXZlKGV4cHJlc3Npb24pICYmICFpc0FycmF5KGV4cHJlc3Npb24pICYmXG4gICAgICAgICBleHByZXNzaW9uWydfX3N5bWJvbGljJ10gPT0gJ3JlZmVyZW5jZSc7XG59XG5cbmZ1bmN0aW9uIGlzQ2xhc3NNZXRhZGF0YShleHByZXNzaW9uOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuICFpc1ByaW1pdGl2ZShleHByZXNzaW9uKSAmJiAhaXNBcnJheShleHByZXNzaW9uKSAmJiBleHByZXNzaW9uWydfX3N5bWJvbGljJ10gPT0gJ2NsYXNzJztcbn1cblxuZnVuY3Rpb24gc3BsaXRQYXRoKHBhdGg6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIHBhdGguc3BsaXQoL1xcL3xcXFxcL2cpO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlUGF0aChwYXRoUGFydHM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgbGV0IHJlc3VsdCA9IFtdO1xuICBMaXN0V3JhcHBlci5mb3JFYWNoV2l0aEluZGV4KHBhdGhQYXJ0cywgKHBhcnQsIGluZGV4KSA9PiB7XG4gICAgc3dpdGNoIChwYXJ0KSB7XG4gICAgICBjYXNlICcnOlxuICAgICAgY2FzZSAnLic6XG4gICAgICAgIGlmIChpbmRleCA+IDApIHJldHVybjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICcuLic6XG4gICAgICAgIGlmIChpbmRleCA+IDAgJiYgcmVzdWx0Lmxlbmd0aCAhPSAwKSByZXN1bHQucG9wKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmVzdWx0LnB1c2gocGFydCk7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0LmpvaW4oJy8nKTtcbn1cblxuZnVuY3Rpb24gcGF0aFRvKGZyb206IHN0cmluZywgdG86IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCByZXN1bHQgPSB0bztcbiAgaWYgKHRvLnN0YXJ0c1dpdGgoJy4nKSkge1xuICAgIGxldCBmcm9tUGFydHMgPSBzcGxpdFBhdGgoZnJvbSk7XG4gICAgZnJvbVBhcnRzLnBvcCgpOyAgLy8gcmVtb3ZlIHRoZSBmaWxlIG5hbWUuXG4gICAgbGV0IHRvUGFydHMgPSBzcGxpdFBhdGgodG8pO1xuICAgIHJlc3VsdCA9IHJlc29sdmVQYXRoKGZyb21QYXJ0cy5jb25jYXQodG9QYXJ0cykpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG4iXX0=