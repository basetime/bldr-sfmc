module.exports = class Column {
    constructor(content, width, paddingLeft, filler) {
        this.width = width;
        this.content = content;
        this.paddingLeft = paddingLeft ? paddingLeft : '';
        this.filler = filler ? filler : '';
    }
};
