import ColorLerp from 'color-lerp'

class ColorUtil {
  static GetColorBetween(color1, color2, percentage, resolution) {
    resolution = resolution || 16
    percentage = percentage > 1 ? 1 : percentage
    let colorRange = ColorLerp(color1, color2, resolution, 'hex')
    let colorIndex = Math.floor((resolution * percentage) - 1)
    if (colorIndex < 0) colorIndex = 0
    return colorRange[colorIndex]
  }
}

export default ColorUtil
