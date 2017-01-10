function ObjectBuilder()
{
  this.handler = {
    ref: this,
    add: function (value) { this.ref.value = value; return value; },
  };
}

ObjectBuilder.prototype.startObject = function ()
{
  this.handler = {
    old: this.handler,
    key: null,
    ref: this.handler.add({}),
    add: function (value) {
      if (this.key === null) this.key = value;
      else { this.ref[this.key] = value; this.key = null; }
      return value;
    },
  }
}

ObjectBuilder.prototype.endObject = function ()
{
  this.handler = this.handler.old;
}

ObjectBuilder.prototype.startArray = function ()
{
  this.handler = {
    old: this.handler,
    ref: this.handler.add([]),
    add: function (value) {
      this.ref.push(value);
      return value;
    },
  }
}

ObjectBuilder.prototype.endArray = ObjectBuilder.prototype.endObject;

ObjectBuilder.prototype.add = function (value)
{
  this.handler.add(value);
}

ObjectBuilder.prototype.handle = function (token)
{
  switch (token.type) {
    case JSONPullParser.StartObject:
      builder.startObject();
      break;
    case JSONPullParser.EndObject:
      builder.endObject();
      break;
    case JSONPullParser.StartArray:
      builder.startArray();
      break;
    case JSONPullParser.EndArray:
      builder.endArray();
      break;
    case JSONPullParser.String:
    case JSONPullParser.Number:
    case JSONPullParser.TrueLiteral:
    case JSONPullParser.FalseLiteral:
    case JSONPullParser.NullLiteral:
      builder.add(token.value);
      break;
    case JSONPullParser.Error:
      throw new SyntaxError(token.value.message);
  }
}

module.exports = ObjectBuilder;