/**
 *
 */
class ObjectBuilder {
  /**
   *
   */
  constructor () {
    this.handler = {
      ref: this,
      add (value) { this.ref.value = value; return value; }
    };
  }

  /**
   * @returns {void}
   */
  startObject () {
    this.handler = {
      old: this.handler,
      key: null,
      ref: this.handler.add({}),
      add (value) {
        if (this.key === null) this.key = value;
        else { this.ref[this.key] = value; this.key = null; }
        return value;
      }
    };
  }

  /**
   * @returns {void}
   */
  endObject () {
    this.handler = this.handler.old;
  }

  /**
   * @returns {void}
   */
  startArray () {
    this.handler = {
      old: this.handler,
      ref: this.handler.add([]),
      add (value) {
        this.ref.push(value);
        return value;
      }
    };
  }

  /**
   * @param {JSONValueOrError} value
   * @returns {void}
   */
  add (value) {
    this.handler.add(value);
  }

  /**
   * @param {Token|TokenEnd} token
   * @returns {void}
   */
  handle (token) {
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
    default:
      throw new TypeError('Unexpected token type');
    }
  }
}

ObjectBuilder.prototype.endArray = ObjectBuilder.prototype.endObject;

export default ObjectBuilder;
