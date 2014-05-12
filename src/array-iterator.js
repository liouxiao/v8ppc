// Copyright 2013 the V8 project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
//       copyright notice, this list of conditions and the following
//       disclaimer in the documentation and/or other materials provided
//       with the distribution.
//     * Neither the name of Google Inc. nor the names of its
//       contributors may be used to endorse or promote products derived
//       from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// 'AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

'use strict';


// This file relies on the fact that the following declaration has been made
// in runtime.js:
// var $Array = global.Array;


var arrayIteratorObjectSymbol = GLOBAL_PRIVATE("ArrayIterator#object");
var arrayIteratorNextIndexSymbol = GLOBAL_PRIVATE("ArrayIterator#next");
var arrayIterationKindSymbol = GLOBAL_PRIVATE("ArrayIterator#kind");


function ArrayIterator() {}


// 15.4.5.1 CreateArrayIterator Abstract Operation
function CreateArrayIterator(array, kind) {
  var object = ToObject(array);
  var iterator = new ArrayIterator;
  SET_PRIVATE(iterator, arrayIteratorObjectSymbol, object);
  SET_PRIVATE(iterator, arrayIteratorNextIndexSymbol, 0);
  SET_PRIVATE(iterator, arrayIterationKindSymbol, kind);
  return iterator;
}


// 15.19.4.3.4 CreateItrResultObject
function CreateIteratorResultObject(value, done) {
  return {value: value, done: done};
}


// 15.4.5.2.2 ArrayIterator.prototype.next( )
function ArrayIteratorNext() {
  var iterator = ToObject(this);
  var array = GET_PRIVATE(iterator, arrayIteratorObjectSymbol);
  if (!array) {
    throw MakeTypeError('incompatible_method_receiver',
                        ['Array Iterator.prototype.next']);
  }

  var index = GET_PRIVATE(iterator, arrayIteratorNextIndexSymbol);
  var itemKind = GET_PRIVATE(iterator, arrayIterationKindSymbol);
  var length = TO_UINT32(array.length);

  // "sparse" is never used.

  if (index >= length) {
    SET_PRIVATE(iterator, arrayIteratorNextIndexSymbol, INFINITY);
    return CreateIteratorResultObject(UNDEFINED, true);
  }

  SET_PRIVATE(iterator, arrayIteratorNextIndexSymbol, index + 1);

  if (itemKind == ITERATOR_KIND_VALUES)
    return CreateIteratorResultObject(array[index], false);

  if (itemKind == ITERATOR_KIND_ENTRIES)
    return CreateIteratorResultObject([index, array[index]], false);

  return CreateIteratorResultObject(index, false);
}


function ArrayEntries() {
  return CreateArrayIterator(this, ITERATOR_KIND_ENTRIES);
}


function ArrayValues() {
  return CreateArrayIterator(this, ITERATOR_KIND_VALUES);
}


function ArrayKeys() {
  return CreateArrayIterator(this, ITERATOR_KIND_KEYS);
}


function SetUpArrayIterator() {
  %CheckIsBootstrapping();

  %FunctionSetPrototype(ArrayIterator, new $Object());
  %FunctionSetInstanceClassName(ArrayIterator, 'Array Iterator');

  InstallFunctions(ArrayIterator.prototype, DONT_ENUM, $Array(
    'next', ArrayIteratorNext
  ));
}
SetUpArrayIterator();


function ExtendArrayPrototype() {
  %CheckIsBootstrapping();

  InstallFunctions($Array.prototype, DONT_ENUM, $Array(
    'entries', ArrayEntries,
    'values', ArrayValues,
    'keys', ArrayKeys
  ));
}
ExtendArrayPrototype();
