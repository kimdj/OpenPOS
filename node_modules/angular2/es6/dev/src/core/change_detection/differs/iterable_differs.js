var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isBlank, isPresent, CONST, getTypeNameForDebugging } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper } from 'angular2/src/facade/collection';
import { Provider, SkipSelfMetadata, OptionalMetadata } from 'angular2/src/core/di';
/**
 * A repository of different iterable diffing strategies used by NgFor, NgClass, and others.
 */
export let IterableDiffers = class {
    constructor(factories) {
        this.factories = factories;
    }
    static create(factories, parent) {
        if (isPresent(parent)) {
            var copied = ListWrapper.clone(parent.factories);
            factories = factories.concat(copied);
            return new IterableDiffers(factories);
        }
        else {
            return new IterableDiffers(factories);
        }
    }
    /**
     * Takes an array of {@link IterableDifferFactory} and returns a provider used to extend the
     * inherited {@link IterableDiffers} instance with the provided factories and return a new
     * {@link IterableDiffers} instance.
     *
     * The following example shows how to extend an existing list of factories,
           * which will only be applied to the injector for this component and its children.
           * This step is all that's required to make a new {@link IterableDiffer} available.
     *
     * ### Example
     *
     * ```
     * @Component({
     *   viewProviders: [
     *     IterableDiffers.extend([new ImmutableListDiffer()])
     *   ]
     * })
     * ```
     */
    static extend(factories) {
        return new Provider(IterableDiffers, {
            useFactory: (parent) => {
                if (isBlank(parent)) {
                    // Typically would occur when calling IterableDiffers.extend inside of dependencies passed
                    // to
                    // bootstrap(), which would override default pipes instead of extending them.
                    throw new BaseException('Cannot extend IterableDiffers without a parent injector');
                }
                return IterableDiffers.create(factories, parent);
            },
            // Dependency technically isn't optional, but we can provide a better error message this way.
            deps: [[IterableDiffers, new SkipSelfMetadata(), new OptionalMetadata()]]
        });
    }
    find(iterable) {
        var factory = this.factories.find(f => f.supports(iterable));
        if (isPresent(factory)) {
            return factory;
        }
        else {
            throw new BaseException(`Cannot find a differ supporting object '${iterable}' of type '${getTypeNameForDebugging(iterable)}'`);
        }
    }
};
IterableDiffers = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Array])
], IterableDiffers);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXRlcmFibGVfZGlmZmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vZGlmZmVycy9pdGVyYWJsZV9kaWZmZXJzLnRzIl0sIm5hbWVzIjpbIkl0ZXJhYmxlRGlmZmVycyIsIkl0ZXJhYmxlRGlmZmVycy5jb25zdHJ1Y3RvciIsIkl0ZXJhYmxlRGlmZmVycy5jcmVhdGUiLCJJdGVyYWJsZURpZmZlcnMuZXh0ZW5kIiwiSXRlcmFibGVEaWZmZXJzLmZpbmQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsdUJBQXVCLEVBQUMsTUFBTSwwQkFBMEI7T0FDcEYsRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDckQsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQ0FBZ0M7T0FFbkQsRUFBQyxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQWEsTUFBTSxzQkFBc0I7QUEwQjdGOztHQUVHO0FBQ0g7SUFFRUEsWUFBbUJBLFNBQWtDQTtRQUFsQ0MsY0FBU0EsR0FBVEEsU0FBU0EsQ0FBeUJBO0lBQUdBLENBQUNBO0lBRXpERCxPQUFPQSxNQUFNQSxDQUFDQSxTQUFrQ0EsRUFBRUEsTUFBd0JBO1FBQ3hFRSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0QkEsSUFBSUEsTUFBTUEsR0FBR0EsV0FBV0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7WUFDakRBLFNBQVNBLEdBQUdBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBQ3JDQSxNQUFNQSxDQUFDQSxJQUFJQSxlQUFlQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUN4Q0EsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsTUFBTUEsQ0FBQ0EsSUFBSUEsZUFBZUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDeENBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FrQkdBO0lBQ0hBLE9BQU9BLE1BQU1BLENBQUNBLFNBQWtDQTtRQUM5Q0csTUFBTUEsQ0FBQ0EsSUFBSUEsUUFBUUEsQ0FBQ0EsZUFBZUEsRUFBRUE7WUFDbkNBLFVBQVVBLEVBQUVBLENBQUNBLE1BQXVCQTtnQkFDbENBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUNwQkEsMEZBQTBGQTtvQkFDMUZBLEtBQUtBO29CQUNMQSw2RUFBNkVBO29CQUM3RUEsTUFBTUEsSUFBSUEsYUFBYUEsQ0FBQ0EseURBQXlEQSxDQUFDQSxDQUFDQTtnQkFDckZBLENBQUNBO2dCQUNEQSxNQUFNQSxDQUFDQSxlQUFlQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0E7WUFDREEsNkZBQTZGQTtZQUM3RkEsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZUFBZUEsRUFBRUEsSUFBSUEsZ0JBQWdCQSxFQUFFQSxFQUFFQSxJQUFJQSxnQkFBZ0JBLEVBQUVBLENBQUNBLENBQUNBO1NBQzFFQSxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtJQUVESCxJQUFJQSxDQUFDQSxRQUFhQTtRQUNoQkksSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZCQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQTtRQUNqQkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsTUFBTUEsSUFBSUEsYUFBYUEsQ0FDbkJBLDJDQUEyQ0EsUUFBUUEsY0FBY0EsdUJBQXVCQSxDQUFDQSxRQUFRQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUM3R0EsQ0FBQ0E7SUFDSEEsQ0FBQ0E7QUFDSEosQ0FBQ0E7QUExREQ7SUFBQyxLQUFLLEVBQUU7O29CQTBEUDtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc0JsYW5rLCBpc1ByZXNlbnQsIENPTlNULCBnZXRUeXBlTmFtZUZvckRlYnVnZ2luZ30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmfSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0b3JfcmVmJztcbmltcG9ydCB7UHJvdmlkZXIsIFNraXBTZWxmTWV0YWRhdGEsIE9wdGlvbmFsTWV0YWRhdGEsIEluamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcblxuLyoqXG4gKiBBIHN0cmF0ZWd5IGZvciB0cmFja2luZyBjaGFuZ2VzIG92ZXIgdGltZSB0byBhbiBpdGVyYWJsZS4gVXNlZCBmb3Ige0BsaW5rIE5nRm9yfSB0b1xuICogcmVzcG9uZCB0byBjaGFuZ2VzIGluIGFuIGl0ZXJhYmxlIGJ5IGVmZmVjdGluZyBlcXVpdmFsZW50IGNoYW5nZXMgaW4gdGhlIERPTS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJdGVyYWJsZURpZmZlciB7XG4gIGRpZmYob2JqZWN0OiBhbnkpOiBhbnk7XG4gIG9uRGVzdHJveSgpO1xufVxuXG4vKipcbiAgKiBBbiBvcHRpb25hbCBmdW5jdGlvbiBwYXNzZWQgaW50byB7QGxpbmsgTmdGb3J9IHRoYXQgZGVmaW5lcyBob3cgdG8gdHJhY2tcbiAgKiBpdGVtcyBpbiBhbiBpdGVyYWJsZSAoZS5nLiBieSBpbmRleCBvciBpZClcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUcmFja0J5Rm4geyAoaW5kZXg6IG51bWJlciwgaXRlbTogYW55KTogYW55OyB9XG5cblxuLyoqXG4gKiBQcm92aWRlcyBhIGZhY3RvcnkgZm9yIHtAbGluayBJdGVyYWJsZURpZmZlcn0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmFibGVEaWZmZXJGYWN0b3J5IHtcbiAgc3VwcG9ydHMob2JqZWN0czogYW55KTogYm9vbGVhbjtcbiAgY3JlYXRlKGNkUmVmOiBDaGFuZ2VEZXRlY3RvclJlZiwgdHJhY2tCeUZuPzogVHJhY2tCeUZuKTogSXRlcmFibGVEaWZmZXI7XG59XG5cbi8qKlxuICogQSByZXBvc2l0b3J5IG9mIGRpZmZlcmVudCBpdGVyYWJsZSBkaWZmaW5nIHN0cmF0ZWdpZXMgdXNlZCBieSBOZ0ZvciwgTmdDbGFzcywgYW5kIG90aGVycy5cbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBJdGVyYWJsZURpZmZlcnMge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZmFjdG9yaWVzOiBJdGVyYWJsZURpZmZlckZhY3RvcnlbXSkge31cblxuICBzdGF0aWMgY3JlYXRlKGZhY3RvcmllczogSXRlcmFibGVEaWZmZXJGYWN0b3J5W10sIHBhcmVudD86IEl0ZXJhYmxlRGlmZmVycyk6IEl0ZXJhYmxlRGlmZmVycyB7XG4gICAgaWYgKGlzUHJlc2VudChwYXJlbnQpKSB7XG4gICAgICB2YXIgY29waWVkID0gTGlzdFdyYXBwZXIuY2xvbmUocGFyZW50LmZhY3Rvcmllcyk7XG4gICAgICBmYWN0b3JpZXMgPSBmYWN0b3JpZXMuY29uY2F0KGNvcGllZCk7XG4gICAgICByZXR1cm4gbmV3IEl0ZXJhYmxlRGlmZmVycyhmYWN0b3JpZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IEl0ZXJhYmxlRGlmZmVycyhmYWN0b3JpZXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhbiBhcnJheSBvZiB7QGxpbmsgSXRlcmFibGVEaWZmZXJGYWN0b3J5fSBhbmQgcmV0dXJucyBhIHByb3ZpZGVyIHVzZWQgdG8gZXh0ZW5kIHRoZVxuICAgKiBpbmhlcml0ZWQge0BsaW5rIEl0ZXJhYmxlRGlmZmVyc30gaW5zdGFuY2Ugd2l0aCB0aGUgcHJvdmlkZWQgZmFjdG9yaWVzIGFuZCByZXR1cm4gYSBuZXdcbiAgICoge0BsaW5rIEl0ZXJhYmxlRGlmZmVyc30gaW5zdGFuY2UuXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgdG8gZXh0ZW5kIGFuIGV4aXN0aW5nIGxpc3Qgb2YgZmFjdG9yaWVzLFxuICAgICAgICAgKiB3aGljaCB3aWxsIG9ubHkgYmUgYXBwbGllZCB0byB0aGUgaW5qZWN0b3IgZm9yIHRoaXMgY29tcG9uZW50IGFuZCBpdHMgY2hpbGRyZW4uXG4gICAgICAgICAqIFRoaXMgc3RlcCBpcyBhbGwgdGhhdCdzIHJlcXVpcmVkIHRvIG1ha2UgYSBuZXcge0BsaW5rIEl0ZXJhYmxlRGlmZmVyfSBhdmFpbGFibGUuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICB2aWV3UHJvdmlkZXJzOiBbXG4gICAqICAgICBJdGVyYWJsZURpZmZlcnMuZXh0ZW5kKFtuZXcgSW1tdXRhYmxlTGlzdERpZmZlcigpXSlcbiAgICogICBdXG4gICAqIH0pXG4gICAqIGBgYFxuICAgKi9cbiAgc3RhdGljIGV4dGVuZChmYWN0b3JpZXM6IEl0ZXJhYmxlRGlmZmVyRmFjdG9yeVtdKTogUHJvdmlkZXIge1xuICAgIHJldHVybiBuZXcgUHJvdmlkZXIoSXRlcmFibGVEaWZmZXJzLCB7XG4gICAgICB1c2VGYWN0b3J5OiAocGFyZW50OiBJdGVyYWJsZURpZmZlcnMpID0+IHtcbiAgICAgICAgaWYgKGlzQmxhbmsocGFyZW50KSkge1xuICAgICAgICAgIC8vIFR5cGljYWxseSB3b3VsZCBvY2N1ciB3aGVuIGNhbGxpbmcgSXRlcmFibGVEaWZmZXJzLmV4dGVuZCBpbnNpZGUgb2YgZGVwZW5kZW5jaWVzIHBhc3NlZFxuICAgICAgICAgIC8vIHRvXG4gICAgICAgICAgLy8gYm9vdHN0cmFwKCksIHdoaWNoIHdvdWxkIG92ZXJyaWRlIGRlZmF1bHQgcGlwZXMgaW5zdGVhZCBvZiBleHRlbmRpbmcgdGhlbS5cbiAgICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignQ2Fubm90IGV4dGVuZCBJdGVyYWJsZURpZmZlcnMgd2l0aG91dCBhIHBhcmVudCBpbmplY3RvcicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBJdGVyYWJsZURpZmZlcnMuY3JlYXRlKGZhY3RvcmllcywgcGFyZW50KTtcbiAgICAgIH0sXG4gICAgICAvLyBEZXBlbmRlbmN5IHRlY2huaWNhbGx5IGlzbid0IG9wdGlvbmFsLCBidXQgd2UgY2FuIHByb3ZpZGUgYSBiZXR0ZXIgZXJyb3IgbWVzc2FnZSB0aGlzIHdheS5cbiAgICAgIGRlcHM6IFtbSXRlcmFibGVEaWZmZXJzLCBuZXcgU2tpcFNlbGZNZXRhZGF0YSgpLCBuZXcgT3B0aW9uYWxNZXRhZGF0YSgpXV1cbiAgICB9KTtcbiAgfVxuXG4gIGZpbmQoaXRlcmFibGU6IGFueSk6IEl0ZXJhYmxlRGlmZmVyRmFjdG9yeSB7XG4gICAgdmFyIGZhY3RvcnkgPSB0aGlzLmZhY3Rvcmllcy5maW5kKGYgPT4gZi5zdXBwb3J0cyhpdGVyYWJsZSkpO1xuICAgIGlmIChpc1ByZXNlbnQoZmFjdG9yeSkpIHtcbiAgICAgIHJldHVybiBmYWN0b3J5O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgQ2Fubm90IGZpbmQgYSBkaWZmZXIgc3VwcG9ydGluZyBvYmplY3QgJyR7aXRlcmFibGV9JyBvZiB0eXBlICcke2dldFR5cGVOYW1lRm9yRGVidWdnaW5nKGl0ZXJhYmxlKX0nYCk7XG4gICAgfVxuICB9XG59XG4iXX0=