function ObjectBuilder() {
  this.handler = {
    ref: this,
    add: function (value) { this.ref.value = value; return value; },
  };
}

ObjectBuilder.prototype.startObject = function () {
  this.handler = {
    old: this.handler,
    key: null,
    ref: this.handler.add({}),
    add: function (value) {
      if (this.key === null) this.key = value;
      else { this.ref[this.key] = value; this.key = null; }
      return value;
    },
  };
}

ObjectBuilder.prototype.endObject = function () {
  this.handler = this.handler.old;
}

ObjectBuilder.prototype.startArray = function () {
  this.handler = {
    old: this.handler,
    ref: this.handler.add([]),
    add: function (value) {
      this.ref.push(value);
      return value;
    },
  };
}

ObjectBuilder.prototype.endArray = ObjectBuilder.prototype.endObject;

ObjectBuilder.prototype.add = function (value) {
  this.handler.add(value);
}

ObjectBuilder.prototype.handle = function (token) {
  switch (token.type) {
    case '{':
      this.startObject();
      break;
    case '}':
      this.endObject();
      break;
    case '[':
      this.startArray();
      break;
    case ']':
      this.endArray();
      break;
    case 'string':
    case 'number':
    case 'true':
    case 'false':
    case 'null':
      this.add(token.value);
      break;
    case 'error':
      throw new SyntaxError(token.value.message);
  }
}

module.exports = ObjectBuilder;