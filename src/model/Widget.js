import { v4 as uuid } from 'uuid'

export default class Widget {
  constructor ({
    name,
    type,
    width,
    height,
    top,
    left,
    zIndex
  }) {
    this.widgetId = `widget-${uuid()}`
    this.name = name
    this.type = type
    this.width = width
    this.height = height
    this.top = top
    this.left = left
    this.left = left
    this.zIndex = zIndex
  }
}
