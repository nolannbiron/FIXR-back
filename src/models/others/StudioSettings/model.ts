export const pickerDefaultColors = ['#B80000', '#DB3E00', '#FCCB00', '#008B02', '#006B76', '#1273DE', '#004DCF', '#5300EB'];

const randomColor = () => {
    return pickerDefaultColors[Math.floor(Math.random() * pickerDefaultColors.length)];
};

export default {
    theme: {
        color: {
            type: String,
            default: randomColor(),
        },
    },
};
