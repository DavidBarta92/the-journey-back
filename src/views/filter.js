import gameCanvas from '../models/gameCanvas'

var Filter = (function () {
  var r = Math.random

  var dropPos = []

  var render = gameCanvas.getParams()
  const offscreenContext = gameCanvas.getOffscreenContext()

  // Default parameters for image processing filters
  const defaultParams = {
    greyscaleMethod: true,
    replaceColours: false,
    replaceColourMap: {
      black: {
        r: 0,
        g: 0,
        b: 0,
        a: 0
      },
      white: {
        r: 255,
        g: 255,
        b: 255,
        a: 255
      }
    }
  }
  /**
   * Invert colors of an image.
   * @param {ImageData} imageData The image data to be processed.
   * @return {ImageData} The processed image data with inverted colors.
   */
  function invertColors (imageData) {
    for (var i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 255 - imageData.data[i]
      imageData.data[i + 1] = 255 - imageData.data[i + 1]
      imageData.data[i + 2] = 255 - imageData.data[i + 2]
      imageData.data[i + 3] = 255
    }

    return imageData
  }
  /**
   * Apply Atkinson Dither to Image Data.
   * @param {Object} data The data object containing the image and processing parameters.
   * @return {ImageData} The processed image data with Atkinson Dither.
   */
  function drawDither (data) {
    if (data.processing.greyscaleMethod === true) {
      greyscale_luminance(data.image)
    }

    dither_atkinson(
      data.image,
      data.image.width,
      data.processing.greyscaleMethod === false
    )

    if (data.processing.replaceColours === true) {
      replace_colours(
        data.image.data,
        data.processing.replaceColourMap.black,
        data.processing.replaceColourMap.white
      )
    }
    return data.image
  }

  /**
   * Convert image data to greyscale based on luminance.
   * @param {ImageData} image The image data to be processed.
   * @return {ImageData} The processed image data in greyscale.
   */
  function greyscale_luminance (image) {
    for (var i = 0; i <= image.data.length; i += 4) {
      image.data[i] =
        image.data[i + 1] =
        image.data[i + 2] =
          parseInt(
            image.data[i] * 0.21 +
              image.data[i + 1] * 0.71 +
              image.data[i + 2] * 0.07,
            10
          )
    }
    return image
  }

  /**
   * Apply Atkinson Dither to Image Data.
   * @param {ImageData} image The image data to be processed.
   * @param {number} imageWidth The width of the image.
   * @param {boolean} drawColour Whether to draw in color or not.
   * @return {Uint8ClampedArray} The processed image data with dithering.
   */
  function dither_atkinson (image, imageWidth, drawColour) {
    var skipPixels = 4

    if (!drawColour) drawColour = false

    if (drawColour === true) skipPixels = 1

    var imageLength = image.data.length

    for (
      var currentPixel = 0;
      currentPixel <= imageLength;
      currentPixel += skipPixels
    ) {
      var newPixelColour

      if (image.data[currentPixel] <= 128) {
        newPixelColour = 0
      } else {
        newPixelColour = 255
      }

      var err = parseInt((image.data[currentPixel] - newPixelColour) / 8, 10)
      image.data[currentPixel] = newPixelColour

      image.data[currentPixel + 4] += err
      image.data[currentPixel + 8] += err
      image.data[currentPixel + 4 * imageWidth - 4] += err
      image.data[currentPixel + 4 * imageWidth] += err
      image.data[currentPixel + 4 * imageWidth + 4] += err
      image.data[currentPixel + 8 * imageWidth] += err

      if (drawColour === false)
        image.data[currentPixel + 1] = image.data[currentPixel + 2] =
          image.data[currentPixel]
    }

    return image.data
  }

  /**
   * Replace source colors in image data.
   * @param {ImageData} image The image data to be processed.
   * @param {Object} black The replacement color for black.
   * @param {Object} white The replacement color for white.
   */
  function replace_colours (image, black, white) {
    for (var i = 0; i <= image.data.length; i += 4) {
      image.data[i] = image.data[i] < 127 ? black.r : white.r
      image.data[i + 1] = image.data[i + 1] < 127 ? black.g : white.g
      image.data[i + 2] = image.data[i + 2] < 127 ? black.b : white.b
      image.data[i + 3] =
        (image.data[i] + image.data[i + 1] + image.data[i + 2]) / 3 < 127
          ? black.a
          : white.a
    }
  }

  /**
   * Blur image data.
   * @param {ImageData} imageData The image data to be processed.
   * @param {number} radius The blur radius.
   * @param {number} quality The blur quality.
   * @return {ImageData} The processed image data with blur.
   */
  function doBlur (imageData, radius, quality) {
    var pixels = imageData.data
    var width = imageData.width
    var height = imageData.height

    var rsum, gsum, bsum, asum, x, y, i, p, p1, p2, yp, yi, yw
    var wm = width - 1
    var hm = height - 1
    var rad1x = radius + 1
    var divx = radius + rad1x
    var rad1y = radius + 1
    var divy = radius + rad1y
    var div2 = 1 / (divx * divy)

    var r = []
    var g = []
    var b = []
    var a = []

    var vmin = []
    var vmax = []

    while (quality-- > 0) {
      yw = yi = 0

      for (y = 0; y < height; y++) {
        rsum = pixels[yw] * rad1x
        gsum = pixels[yw + 1] * rad1x
        bsum = pixels[yw + 2] * rad1x
        asum = pixels[yw + 3] * rad1x

        for (i = 1; i <= radius; i++) {
          p = yw + ((i > wm ? wm : i) << 2)
          rsum += pixels[p++]
          gsum += pixels[p++]
          bsum += pixels[p++]
          asum += pixels[p]
        }

        for (x = 0; x < width; x++) {
          r[yi] = rsum
          g[yi] = gsum
          b[yi] = bsum
          a[yi] = asum

          if (y === 0) {
            vmin[x] = Math.min(x + rad1x, wm) << 2
            vmax[x] = Math.max(x - radius, 0) << 2
          }

          p1 = yw + vmin[x]
          p2 = yw + vmax[x]

          rsum += pixels[p1++] - pixels[p2++]
          gsum += pixels[p1++] - pixels[p2++]
          bsum += pixels[p1++] - pixels[p2++]
          asum += pixels[p1] - pixels[p2]

          yi++
        }
        yw += width << 2
      }

      for (x = 0; x < width; x++) {
        yp = x
        rsum = r[yp] * rad1y
        gsum = g[yp] * rad1y
        bsum = b[yp] * rad1y
        asum = a[yp] * rad1y

        for (i = 1; i <= radius; i++) {
          yp += i > hm ? 0 : width
          rsum += r[yp]
          gsum += g[yp]
          bsum += b[yp]
          asum += a[yp]
        }

        yi = x << 2
        for (y = 0; y < height; y++) {
          pixels[yi] = (rsum * div2 + 0.5) | 0
          pixels[yi + 1] = (gsum * div2 + 0.5) | 0
          pixels[yi + 2] = (bsum * div2 + 0.5) | 0
          pixels[yi + 3] = (asum * div2 + 0.5) | 0

          if (x === 0) {
            vmin[y] = Math.min(y + rad1y, hm) * width
            vmax[y] = Math.max(y - radius, 0) * width
          }

          p1 = x + vmin[y]
          p2 = x + vmax[y]

          rsum += r[p1] - r[p2]
          gsum += g[p1] - g[p2]
          bsum += b[p1] - b[p2]
          asum += a[p1] - a[p2]

          yi += width << 2
        }
      }
    }
    return imageData
  }
  /**
   * Generate a random number within a specified range.
   * @param {number} min The minimum value of the range.
   * @param {number} max The maximum value of the range.
   * @return {number} The generated random number.
   */
  function randRange (min, max) {
    return Math.random() * (max - min) + min
  }
  /**
   * Draw raindrops on the image.
   * @param {ImageData} image The image data to be processed.
   * @param {Object} dropSize The size range of raindrops.
   * @param {number} intensity The intensity of raindrops.
   * @return {ImageData} The processed image data with raindrops.
   */
  function drawRaindrops (image, dropSize, intensity) {
    offscreenContext.putImageData(image, 0, 0)

    var radius, posX, posY

    if (r() < intensity) {
      posX = Math.round(r() * r() * 1500)
      posY = Math.round((r() / r()) * 150)
      radius = Math.round(r() * 10)
      if (
        posX < image.width &&
        posY < image.height &&
        radius <= dropSize.maxDropSize &&
        radius >= dropSize.minDropSize
      ) {
        dropPos.push({ x: posX, y: posY, rad: radius })
        //console.log(posX + " " + posY);
      }
    }

    dropPos.forEach(drop => {
      // Create gradient
      console.log(drop.rad)
      var grd = offscreenContext.createRadialGradient(
        drop.x,
        drop.y,
        drop.rad,
        drop.x - 10,
        drop.y,
        drop.rad * 0.5
      )
      grd.addColorStop(0, 'transparent')
      grd.addColorStop(1, 'white')

      // Fill with gradient
      offscreenContext.fillStyle = grd
      offscreenContext.beginPath()
      offscreenContext.arc(drop.x, drop.y, drop.rad, 0, 2 * Math.PI)
      offscreenContext.fill()
    })

    var ctxImage = offscreenContext.getImageData(
      0,
      0,
      render.width,
      render.height
    )
    return ctxImage
  }

  return {
    /**
     * Apply the Atkinson Dither filter to an image.
     * @param {ImageData} image The image data to be processed.
     * @param {Array} processing The array of processing parameters.
     * @return {ImageData|null} The processed image data, or null if an error occurs.
     */
    dither: function (image, processing) {
      if (!Array.isArray(processing) || !processing.length) {
        processing = defaultParams
      }
      try {
        return drawDither({ image, processing })
      } catch (error) {
        console.error(error)
        console.error('Image or processing params are invalide!')
        return null
      }
    },
    /**
     * Apply a blur filter to an image.
     * @param {ImageData} image The image data to be processed.
     * @param {number} radius The blur radius.
     * @param {number} quality The blur quality.
     * @return {ImageData|null} The processed image data, or null if an error occurs.
     */
    blur: function (image, radius, quality) {
      if (radius < 0) {
        radius = 0
      }
      try {
        return doBlur(image, radius, quality)
      } catch (error) {
        console.error(error)
        return null
      }
    },
    /**
     * Apply raindrops effect to an image.
     * @param {ImageData} image The image data to be processed.
     * @param {number} minDropSize The minimum size of raindrops.
     * @param {number} maxDropSize The maximum size of raindrops.
     * @param {number} intensity The intensity of raindrops.
     * @return {ImageData|null} The processed image data, or null if an error occurs.
     */
    raindrops: function (image, minDropSize, maxDropSize, intensity) {
      try {
        return drawRaindrops(image, { minDropSize, maxDropSize }, intensity)
      } catch (error) {
        console.error(error)
        return null
      }
    },
    /**
     * Get the default parameters for the Atkinson Dither filter.
     * @return {Object} The default parameters.
     */
    getDitherDefaultParams: function () {
      return defaultParams
    },
    /**
     * Invert colors of an image.
     * @param {ImageData} imageData The image data to be processed.
     * @return {ImageData} The processed image data with inverted colors.
     */
    invertColors: function (imageData) {
      return invertColors(imageData)
    }
  }
})()

export default Filter
