

const getColorId = (rateType, title, isExtension, isBlackout) => {
    let rateTypeColorIds = [
        "hourly",
        "hourly_Extension",
        "daily",
        "daily_Extension",
        "all_day",
        "all_day_Extension",
        "overnight",
        "monthly",
    ];

    let colorCodes = [
        "#032B44",
        "#4682B4",
        "#E22D6D",
        "#FFC5C9",
        "#235347",
        "#8eb69b",
        "#7A4E9F",
        "#FD9912",
    ];
    if (rateTypeColorIds.includes(rateType)) {
        if (isExtension) {
            return colorCodes[rateTypeColorIds.indexOf(rateType) + 1];
        } else {
            return colorCodes[rateTypeColorIds.indexOf(rateType)];
        }
    } else if (isBlackout) {
        let r, g, b;
        do {
            r = Math.floor(Math.random() * 128) + 128;
            g = Math.floor(Math.random() * 64) + 64;
            b = Math.floor(Math.random() * 32) + 32;
        } while (r + g + b > 600);
        let colorCode = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        while (colorCodes.includes(colorCode)) {
            // regenerate the color if it's already in the array
            do {
                r = Math.floor(Math.random() * 200) + 100;
                g = Math.floor(Math.random() * 100) + 50;
                b = Math.floor(Math.random() * 50) + 32;
            } while (r + g + b > 600);
            colorCode = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
        colorCodes.push(colorCode);
        rateTypeColorIds.push(title);
        return colorCode;
    } else if (rateType === 'custom') {
        let colorCode;
        // Generate a random grey color, but avoid very light shades
        let greyValue;
        do {
            greyValue = Math.floor(Math.random() * 256);
        } while (greyValue > 240); // avoid very light shades (grey value > 240)
        colorCode = `#${greyValue.toString(16).padStart(2, '0')}${greyValue.toString(16).padStart(2, '0')}${greyValue.toString(16).padStart(2, '0')}`;
        while (colorCodes.includes(colorCode)) {
            // regenerate the color if it's already in the array
            do {
                greyValue = Math.floor(Math.random() * 256);
            } while (greyValue > 240);
            colorCode = `#${greyValue.toString(16).padStart(2, '0')}${greyValue.toString(16).padStart(2, '0')}${greyValue.toString(16).padStart(2, '0')}`;
        }
        colorCodes.push(colorCode);
        rateTypeColorIds.push(title);
        return colorCode;
    } else {
        return null; // or some default color
    }
}
module.exports = {
    getColorId
}