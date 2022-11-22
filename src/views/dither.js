var Dither = (function(){

    const defaultParams = {
        greyscaleMethod: true,
        replaceColours: false,
        replaceColourMap: {
            black: {
                r: 0,
                g: 0,
                b: 0,
                a: 0,
            },
            white: {
                r: 255,
                g: 255,
                b: 255,
                a: 255,
            },
        }
    }

    function draw (data) {
        
        if (data.processing.greyscaleMethod === true) {
            greyscale_luminance(data.image);
        }
        
        dither_atkinson(data.image, data.image.width, (data.processing.greyscaleMethod === false));
        
        if (data.processing.replaceColours === true) {
            replace_colours(data.image.data, data.processing.replaceColourMap.black, data.processing.replaceColourMap.white);
        }
        
        return data.image;
    }
    
    // Convert image data to greyscale based on luminance.
    function greyscale_luminance (image) {
    
        for (var i = 0; i <= image.data.length; i += 4) {
    
            image.data[i] = image.data[i + 1] = image.data[i + 2] = parseInt(image.data[i] * 0.21 + image.data[i + 1] * 0.71 + image.data[i + 2] * 0.07, 10);
    
        }
    
        return image;
    }
    
    // Apply Atkinson Dither to Image Data
    function dither_atkinson (image, imageWidth, drawColour) {
        var skipPixels = 4;
    
        if (!drawColour)
            drawColour = false;
    
        if(drawColour == true)
            skipPixels = 1;
    
        var imageLength	= image.data.length;
    
        for (var currentPixel = 0; currentPixel <= imageLength; currentPixel += skipPixels) {
    
            var newPixelColour;

            if (image.data[currentPixel] <= 128) {
    
                newPixelColour = 0;
    
            } else {
    
                newPixelColour = 255;
    
            }
    
            var err = parseInt((image.data[currentPixel] - newPixelColour) / 8, 10);
            image.data[currentPixel] = newPixelColour;
    
            image.data[currentPixel + 4]						+= err;
            image.data[currentPixel + 8]						+= err;
            image.data[currentPixel + (4 * imageWidth) - 4]		+= err;
            image.data[currentPixel + (4 * imageWidth)]			+= err;
            image.data[currentPixel + (4 * imageWidth) + 4]		+= err;
            image.data[currentPixel + (8 * imageWidth)]			+= err;
    
            if (drawColour == false)
                image.data[currentPixel + 1] = image.data[currentPixel + 2] = image.data[currentPixel];
    
        }
    
        return image.data;
    }
    
    // Replace source colours 
    function replace_colours (image, black, white) {
    
        for (var i = 0; i <= image.data.length; i += 4) {
    
            image.data[i]		= (image.data[i] < 127) ? black.r : white.r;
            image.data[i + 1]	= (image.data[i + 1] < 127) ? black.g : white.g;
            image.data[i + 2]	= (image.data[i + 2] < 127) ? black.b : white.b;
            image.data[i + 3]	= (((image.data[i]+image.data[i+1]+image.data[i+2])/3) < 127) ? black.a : white.a;
    
        }
    }

    return {
        filter: function(image, processing){
            if(!Array.isArray(processing) || !processing.length){
                processing = defaultParams;
            }
            try {
                return draw({image,processing});
            } catch (error) {
                console.error(error);
                console.error('Image or processing params are invalide!');
                return null;
            }
        },

        getDefaultParams: function(){
            return defaultParams;
        },

        }
    }
());

export default Dither;